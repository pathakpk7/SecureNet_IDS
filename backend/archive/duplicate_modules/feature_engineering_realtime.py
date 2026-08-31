#!/usr/bin/env python3
"""
SecureNet IDS - Real-time Feature Engineering
Live CICIDS-compatible feature extraction from packet streams.
"""

import time
import threading
from collections import defaultdict, deque
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import logging
import numpy as np

from .schemas import PacketData

logger = logging.getLogger(__name__)

class RealTimeFeatureExtractor:
    """Real-time CICIDS feature extraction from live packet streams."""
    
    def __init__(self, flow_timeout: int = 120, max_flows: int = 10000):
        """
        Initialize real-time feature extractor.
        
        Args:
            flow_timeout: Flow inactivity timeout in seconds
            max_flows: Maximum number of flows to track
        """
        self.flows = {}
        self.flow_timeout = flow_timeout
        self.max_flows = max_flows
        self.lock = threading.Lock()
        self.last_cleanup = time.time()
        self.cleanup_interval = 30  # Cleanup every 30 seconds
        
        # Statistics
        self.stats = {
            'active_flows': 0,
            'total_flows_created': 0,
            'total_flows_expired': 0,
            'total_packets_processed': 0,
            'last_cleanup_time': None,
            'memory_usage': 0
        }
        
        logger.info(f"🔧 Real-time feature extractor initialized")
        logger.info(f"   - Flow timeout: {flow_timeout}s")
        logger.info(f"   - Max flows: {max_flows}")
        logger.info(f"   - Cleanup interval: {self.cleanup_interval}s")
    
    def _get_flow_key(self, packet_data: PacketData) -> str:
        """
        Generate bidirectional flow key from packet data.
        
        Args:
            packet_data: Packet data
            
        Returns:
            Flow key string
        """
        # Create bidirectional flow key (src<->dst)
        if packet_data.source_ip < packet_data.destination_ip:
            return f"{packet_data.source_ip}:{packet_data.source_port}-{packet_data.destination_ip}:{packet_data.destination_port}-{packet_data.protocol.value}"
        else:
            return f"{packet_data.destination_ip}:{packet_data.destination_port}-{packet_data.source_ip}:{packet_data.source_port}-{packet_data.protocol.value}"
    
    def _cleanup_expired_flows(self):
        """Remove expired flows and prevent memory overflow."""
        current_time = time.time()
        
        if current_time - self.last_cleanup < self.cleanup_interval:
            return
        
        with self.lock:
            expired_keys = []
            current_time = time.time()
            
            for key, flow in self.flows.items():
                if current_time - flow['last_seen'] > self.flow_timeout:
                    expired_keys.append(key)
            
            # Remove expired flows
            for key in expired_keys:
                del self.flows[key]
                self.stats['total_flows_expired'] += 1
            
            # Enforce maximum flow limit
            if len(self.flows) > self.max_flows:
                # Remove oldest flows
                flows_by_time = sorted(
                    self.flows.items(),
                    key=lambda x: x[1]['start_time']
                )
                excess = len(self.flows) - self.max_flows
                
                for i in range(excess):
                    key = flows_by_time[i][0]
                    del self.flows[key]
                    self.stats['total_flows_expired'] += 1
            
            self.last_cleanup = current_time
            self.stats['last_cleanup_time'] = datetime.now()
            self.stats['active_flows'] = len(self.flows)
            self.stats['memory_usage'] = len(self.flows)
            
            if expired_keys:
                logger.debug(f"🧹 Cleaned up {len(expired_keys)} expired flows")
    
    def extract_cicids_features(self, packet_data: PacketData) -> Dict[str, float]:
        """
        Extract CICIDS2017 features from live packet data.
        
        Args:
            packet_data: Live packet data from capture
            
        Returns:
            Dictionary with CICIDS2017 features
        """
        try:
            with self.lock:
                # Periodic cleanup
                self._cleanup_expired_flows()
                
                flow_key = self._get_flow_key(packet_data)
                current_time = time.time()
                
                # Initialize new flow if needed
                if flow_key not in self.flows:
                    self.flows[flow_key] = {
                        'start_time': current_time,
                        'last_seen': current_time,
                        'forward_packets': 0,
                        'backward_packets': 0,
                        'forward_bytes': 0,
                        'backward_bytes': 0,
                        'src_ip': packet_data.source_ip,
                        'dst_ip': packet_data.destination_ip,
                        'src_port': packet_data.source_port,
                        'dst_port': packet_data.destination_port,
                        'protocol': packet_data.protocol.value,
                        'tcp_flags': set(),
                        'first_packet_timestamp': packet_data.timestamp,
                        'last_packet_timestamp': packet_data.timestamp
                    }
                    self.stats['total_flows_created'] += 1
                
                flow = self.flows[flow_key]
                
                # Determine packet direction (forward vs backward)
                is_forward = (packet_data.source_ip == flow['src_ip'] and 
                             packet_data.source_port == flow['src_port'])
                
                # Update flow statistics
                if is_forward:
                    flow['forward_packets'] += 1
                    flow['forward_bytes'] += packet_data.packet_length
                else:
                    flow['backward_packets'] += 1
                    flow['backward_bytes'] += packet_data.packet_length
                
                # Update timing
                flow['last_seen'] = current_time
                flow['last_packet_timestamp'] = packet_data.timestamp
                
                # Track TCP flags
                if packet_data.tcp_flags:
                    for flag, value in packet_data.tcp_flags.items():
                        if value:
                            flow['tcp_flags'].add(flag)
                
                # Calculate CICIDS2017 features
                flow_duration = current_time - flow['start_time']
                
                features = {
                    'Flow Duration': float(flow_duration),
                    'Total Fwd Packets': float(flow['forward_packets']),
                    'Total Backward Packets': float(flow['backward_packets']),
                    'Fwd Packets Length Total': float(flow['forward_bytes']),
                    'Bwd Packets Length Total': float(flow['backward_bytes'])
                }
                
                # Validate and clean features
                features = self._validate_features(features)
                
                self.stats['total_packets_processed'] += 1
                
                return features
                
        except Exception as e:
            logger.error(f"Error extracting CICIDS features: {str(e)}")
            return self._get_default_features()
    
    def _validate_features(self, features: Dict[str, float]) -> Dict[str, float]:
        """
        Validate and clean feature values.
        
        Args:
            features: Raw feature dictionary
            
        Returns:
            Validated feature dictionary
        """
        validated_features = {}
        
        for feature_name, value in features.items():
            # Handle invalid values
            if value is None or np.isnan(value) or np.isinf(value):
                validated_features[feature_name] = 0.0
            else:
                validated_features[feature_name] = float(max(0, value))  # Ensure non-negative
        
        return validated_features
    
    def _get_default_features(self) -> Dict[str, float]:
        """
        Get default feature values when extraction fails.
        
        Returns:
            Default feature dictionary
        """
        return {
            'Flow Duration': 0.0,
            'Total Fwd Packets': 1.0,  # Current packet
            'Total Backward Packets': 0.0,
            'Fwd Packets Length Total': 64.0,  # Average packet size
            'Bwd Packets Length Total': 0.0
        }
    
    def get_flow_info(self, flow_key: str) -> Optional[Dict[str, Any]]:
        """
        Get detailed information about a specific flow.
        
        Args:
            flow_key: Flow identifier
            
        Returns:
            Flow information dictionary or None if not found
        """
        with self.lock:
            if flow_key in self.flows:
                flow = self.flows[flow_key].copy()
                
                # Calculate additional metrics
                total_packets = flow['forward_packets'] + flow['backward_packets']
                total_bytes = flow['forward_bytes'] + flow['backward_bytes']
                current_time = time.time()
                duration = current_time - flow['start_time']
                
                flow_info = {
                    'flow_key': flow_key,
                    'src_ip': flow['src_ip'],
                    'dst_ip': flow['dst_ip'],
                    'src_port': flow['src_port'],
                    'dst_port': flow['dst_port'],
                    'protocol': flow['protocol'],
                    'start_time': flow['start_time'],
                    'last_seen': flow['last_seen'],
                    'duration_seconds': duration,
                    'forward_packets': flow['forward_packets'],
                    'backward_packets': flow['backward_packets'],
                    'total_packets': total_packets,
                    'forward_bytes': flow['forward_bytes'],
                    'backward_bytes': flow['backward_bytes'],
                    'total_bytes': total_bytes,
                    'tcp_flags': list(flow['tcp_flags']),
                    'packets_per_second': total_packets / duration if duration > 0 else 0,
                    'bytes_per_second': total_bytes / duration if duration > 0 else 0,
                    'avg_packet_size': total_bytes / total_packets if total_packets > 0 else 0
                }
                
                return flow_info
        
        return None
    
    def get_active_flows(self, limit: int = 100) -> List[Dict[str, Any]]:
        """
        Get information about active flows.
        
        Args:
            limit: Maximum number of flows to return
            
        Returns:
            List of flow information dictionaries
        """
        with self.lock:
            active_flows = []
            
            for flow_key in list(self.flows.keys())[:limit]:
                flow_info = self.get_flow_info(flow_key)
                if flow_info:
                    active_flows.append(flow_info)
            
            # Sort by last seen time (most recent first)
            active_flows.sort(key=lambda x: x['last_seen'], reverse=True)
            
            return active_flows
    
    def get_flows_by_ip(self, ip_address: str) -> List[Dict[str, Any]]:
        """
        Get flows involving a specific IP address.
        
        Args:
            ip_address: IP address to search for
            
        Returns:
            List of flow information dictionaries
        """
        matching_flows = []
        
        with self.lock:
            for flow_key, flow in self.flows.items():
                if (flow['src_ip'] == ip_address or flow['dst_ip'] == ip_address):
                    flow_info = self.get_flow_info(flow_key)
                    if flow_info:
                        matching_flows.append(flow_info)
        
        return matching_flows
    
    def get_flow_statistics(self) -> Dict[str, Any]:
        """
        Get comprehensive flow statistics.
        
        Returns:
            Flow statistics dictionary
        """
        with self.lock:
            self._cleanup_expired_flows()
            
            # Calculate additional statistics
            total_flows = len(self.flows)
            total_packets = sum(flow['forward_packets'] + flow['backward_packets'] 
                             for flow in self.flows.values())
            total_bytes = sum(flow['forward_bytes'] + flow['backward_bytes'] 
                           for flow in self.flows.values())
            
            # Protocol distribution
            protocol_counts = defaultdict(int)
            for flow in self.flows.values():
                protocol_counts[flow['protocol']] += 1
            
            # Flow duration distribution
            current_time = time.time()
            durations = [current_time - flow['start_time'] for flow in self.flows.values()]
            avg_duration = sum(durations) / len(durations) if durations else 0
            
            # Packets per flow distribution
            packets_per_flow = [flow['forward_packets'] + flow['backward_packets'] 
                              for flow in self.flows.values()]
            avg_packets_per_flow = sum(packets_per_flow) / len(packets_per_flow) if packets_per_flow else 0
            
            stats = {
                'active_flows': total_flows,
                'total_packets_processed': self.stats['total_packets_processed'],
                'total_flows_created': self.stats['total_flows_created'],
                'total_flows_expired': self.stats['total_flows_expired'],
                'total_bytes_processed': total_bytes,
                'average_flow_duration': avg_duration,
                'average_packets_per_flow': avg_packets_per_flow,
                'protocol_distribution': dict(protocol_counts),
                'memory_usage': total_flows,
                'max_flows': self.max_flows,
                'flow_timeout': self.flow_timeout,
                'last_cleanup_time': self.stats['last_cleanup_time'],
                'cleanup_interval': self.cleanup_interval
            }
            
            return stats
    
    def reset_flows(self):
        """Reset all flow tracking data."""
        with self.lock:
            old_count = len(self.flows)
            self.flows.clear()
            self.stats['total_flows_expired'] += old_count
            self.stats['active_flows'] = 0
            logger.info(f"🔄 Reset {old_count} flows")
    
    def force_cleanup(self):
        """Force cleanup of expired flows."""
        with self.lock:
            self.last_cleanup = 0  # Reset to force cleanup
            self._cleanup_expired_flows()
    
    def get_memory_usage(self) -> Dict[str, Any]:
        """
        Get memory usage information.
        
        Returns:
            Memory usage statistics
        """
        with self.lock:
            # Estimate memory usage
            avg_flow_size = 200  # Estimated bytes per flow
            estimated_memory = len(self.flows) * avg_flow_size
            
            return {
                'active_flows': len(self.flows),
                'estimated_memory_bytes': estimated_memory,
                'estimated_memory_mb': estimated_memory / (1024 * 1024),
                'max_flows': self.max_flows,
                'memory_usage_percent': (len(self.flows) / self.max_flows) * 100
            }

# Global real-time feature extractor instance
realtime_feature_extractor = RealTimeFeatureExtractor()
