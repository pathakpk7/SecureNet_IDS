import time
import threading
from collections import defaultdict, deque
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import logging
import numpy as np

from schemas import PacketData
from core.config import settings

logger = logging.getLogger(__name__)


class CICIDSFeatureExtractor:
    """Extracts accurate CICIDS2017-compatible flow features from network packets with port-scan tracking."""
    
    def __init__(self, flow_timeout: int = 120):
        """
        Initialize CICIDS feature extractor.
        
        Args:
            flow_timeout: Timeout in seconds for flow expiration
        """
        self.flows: Dict[str, Dict[str, Any]] = {}
        self.src_ip_ports: Dict[str, deque] = defaultdict(lambda: deque(maxlen=50))  # Track recent target ports per src_ip
        self.flow_timeout = flow_timeout
        self.lock = threading.Lock()
        self.last_cleanup = time.time()
        
    def _get_protocol_str(self, protocol_val: Any) -> str:
        """Safely extract protocol string from enum or string."""
        if hasattr(protocol_val, 'value'):
            return str(protocol_val.value).lower()
        return str(protocol_val).lower()
        
    def _get_flow_key(self, packet_data: PacketData) -> str:
        """Generate bidirectional flow key from packet data."""
        src_ip = str(packet_data.source_ip)
        dst_ip = str(packet_data.destination_ip)
        src_port = int(packet_data.source_port or 0)
        dst_port = int(packet_data.destination_port or 0)
        proto_str = self._get_protocol_str(packet_data.protocol)
        
        # Create bidirectional flow key (canonical sorted order)
        if (src_ip, src_port) < (dst_ip, dst_port):
            return f"{src_ip}:{src_port}-{dst_ip}:{dst_port}-{proto_str}"
        else:
            return f"{dst_ip}:{dst_port}-{src_ip}:{src_port}-{proto_str}"
    
    def _cleanup_expired_flows(self):
        """Remove expired flows."""
        current_time = time.time()
        if current_time - self.last_cleanup < 30:  # Cleanup every 30 seconds
            return
        
        expired_keys = []
        for key, flow in self.flows.items():
            if current_time - flow['last_seen'] > self.flow_timeout:
                expired_keys.append(key)
        
        for key in expired_keys:
            del self.flows[key]
            
        # Clean up stale port tracking
        expired_ips = []
        for ip, port_queue in list(self.src_ip_ports.items()):
            # Filter timestamps older than 60s
            recent = [(p, t) for p, t in port_queue if current_time - t < 60]
            if recent:
                self.src_ip_ports[ip] = deque(recent, maxlen=50)
            else:
                expired_ips.append(ip)
        for ip in expired_ips:
            del self.src_ip_ports[ip]
        
        self.last_cleanup = current_time
    
    def extract_cicids_features(self, packet_data: PacketData) -> Dict[str, float]:
        """
        Extract CICIDS2017 flow features from packet data.
        
        Args:
            packet_data: Packet data from capture module
            
        Returns:
            Dictionary with CICIDS2017 features
        """
        try:
            with self.lock:
                self._cleanup_expired_flows()
                
                flow_key = self._get_flow_key(packet_data)
                current_time = time.time()
                proto_str = self._get_protocol_str(packet_data.protocol)
                src_port = int(packet_data.source_port or 0)
                dst_port = int(packet_data.destination_port or 0)
                pkt_len = int(getattr(packet_data, 'packet_length', 64) or 64)
                
                # Track target port accesses for scan detection
                self.src_ip_ports[packet_data.source_ip].append((dst_port, current_time))
                
                if flow_key not in self.flows:
                    # Initialize new bidirectional flow
                    self.flows[flow_key] = {
                        'start_time': current_time,
                        'last_seen': current_time,
                        'forward_packets': 1,
                        'backward_packets': 0,
                        'forward_bytes': pkt_len,
                        'backward_bytes': 0,
                        'src_ip': packet_data.source_ip,
                        'dst_ip': packet_data.destination_ip,
                        'src_port': src_port,
                        'dst_port': dst_port,
                        'protocol': proto_str,
                    }
                    flow = self.flows[flow_key]
                else:
                    flow = self.flows[flow_key]
                    # Determine direction (forward vs backward)
                    is_forward = (packet_data.source_ip == flow['src_ip'] and 
                                 src_port == flow['src_port'])
                    
                    if is_forward:
                        flow['forward_packets'] += 1
                        flow['forward_bytes'] += pkt_len
                    else:
                        flow['backward_packets'] += 1
                        flow['backward_bytes'] += pkt_len
                    
                    flow['last_seen'] = current_time
                
                # Calculate flow duration
                flow_duration = max(0.001, current_time - flow['start_time'])
                
                features = {
                    'Flow Duration': float(flow_duration),
                    'Total Fwd Packets': float(flow['forward_packets']),
                    'Total Backward Packets': float(flow['backward_packets']),
                    'Fwd Packets Length Total': float(flow['forward_bytes']),
                    'Bwd Packets Length Total': float(flow['backward_bytes'])
                }
                
                return self._validate_features(features)
                
        except Exception as e:
            logger.error(f"Error extracting CICIDS features: {str(e)}")
            return self._get_default_features()
    
    def _validate_features(self, features: Dict[str, float]) -> Dict[str, float]:
        """Validate and clean feature values."""
        validated_features = {}
        for feature_name, value in features.items():
            if value is None or np.isnan(value) or np.isinf(value):
                validated_features[feature_name] = 0.0
            else:
                validated_features[feature_name] = float(value)
        return validated_features
    
    def _get_default_features(self) -> Dict[str, float]:
        """Get safe default feature values for single benign packet exchange."""
        return {
            'Flow Duration': 0.5,
            'Total Fwd Packets': 1.0,
            'Total Backward Packets': 1.0,
            'Fwd Packets Length Total': 128.0,
            'Bwd Packets Length Total': 128.0
        }
    
    def get_flow_stats(self) -> Dict[str, Any]:
        """Get flow tracking statistics."""
        with self.lock:
            self._cleanup_expired_flows()
            total_flows = len(self.flows)
            total_packets = sum(flow['forward_packets'] + flow['backward_packets'] 
                             for flow in self.flows.values())
            total_bytes = sum(flow['forward_bytes'] + flow['backward_bytes'] 
                           for flow in self.flows.values())
            
            return {
                'active_flows': total_flows,
                'total_packets': total_packets,
                'total_bytes': total_bytes,
                'memory_usage': len(self.flows)
            }
            
    def get_flow_statistics(self) -> Dict[str, Any]:
        """Alias for get_flow_stats"""
        return self.get_flow_stats()
        
    def get_active_flows(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get active flows list"""
        with self.lock:
            self._cleanup_expired_flows()
            active = []
            for flow_key, flow in list(self.flows.items())[:limit]:
                parts = flow_key.split('-') if isinstance(flow_key, str) else []
                src_ip = parts[0] if len(parts) > 0 else '0.0.0.0'
                src_port = int(parts[1]) if len(parts) > 1 and parts[1].isdigit() else 0
                dst_ip = parts[2] if len(parts) > 2 else '0.0.0.0'
                dst_port = int(parts[3]) if len(parts) > 3 and parts[3].isdigit() else 0
                protocol = parts[4] if len(parts) > 4 else 'tcp'
                duration = max(0.001, flow['last_seen'] - flow['start_time'])
                total_pkts = flow['forward_packets'] + flow['backward_packets']
                total_bytes = flow['forward_bytes'] + flow['backward_bytes']
                active.append({
                    'src_ip': src_ip,
                    'src_port': src_port,
                    'dst_ip': dst_ip,
                    'dst_port': dst_port,
                    'protocol': protocol,
                    'duration_seconds': duration,
                    'total_packets': total_pkts,
                    'total_bytes': total_bytes
                })
            return active
    
    def reset_flows(self):
        """Reset all flow tracking data."""
        with self.lock:
            self.flows.clear()
            self.src_ip_ports.clear()
            logger.info("Reset all flow tracking data")


# Global CICIDS feature extractor instance
cicids_feature_extractor = CICIDSFeatureExtractor()


class FeatureEngineering:
    """Feature engineering wrapper for packet processing"""
    
    def __init__(self):
        self.extractor = cicids_feature_extractor
        logger.info("Feature Engineering initialized")
    
    def extract_features(self, packet_data: PacketData) -> Dict[str, float]:
        """Extract features from packet data"""
        return self.extractor.extract_cicids_features(packet_data)
    
    def get_stats(self) -> Dict[str, Any]:
        """Get feature extraction statistics"""
        return self.extractor.get_flow_stats()
    
    def reset(self):
        """Reset feature extractor state"""
        self.extractor.reset_flows()
