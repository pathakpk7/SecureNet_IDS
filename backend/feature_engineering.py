import time
import threading
from collections import defaultdict, deque
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import logging
import numpy as np

from .schemas import PacketData
from .config import settings

logger = logging.getLogger(__name__)

class CICIDSFeatureExtractor:
    """Extracts CICIDS2017-compatible features from network packets."""
    
    def __init__(self, flow_timeout: int = 120):
        """
        Initialize CICIDS feature extractor.
        
        Args:
            flow_timeout: Timeout in seconds for flow expiration
        """
        self.flows = {}
        self.flow_timeout = flow_timeout
        self.lock = threading.Lock()
        self.last_cleanup = time.time()
        
    def _get_flow_key(self, packet_data: PacketData) -> str:
        """Generate bidirectional flow key from packet data."""
        # Create bidirectional flow key (src<->dst)
        if packet_data.source_ip < packet_data.destination_ip:
            return f"{packet_data.source_ip}:{packet_data.source_port}-{packet_data.destination_ip}:{packet_data.destination_port}-{packet_data.protocol.value}"
        else:
            return f"{packet_data.destination_ip}:{packet_data.destination_port}-{packet_data.source_ip}:{packet_data.source_port}-{packet_data.protocol.value}"
    
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
        
        self.last_cleanup = current_time
        
        if expired_keys:
            logger.debug(f"Cleaned up {len(expired_keys)} expired flows")
    
    def extract_cicids_features(self, packet_data: PacketData) -> Dict[str, float]:
        """
        Extract CICIDS2017 features from packet data.
        
        Args:
            packet_data: Packet data from capture module
            
        Returns:
            Dictionary with CICIDS2017 features
        """
        try:
            with self.lock:
                # Cleanup expired flows periodically
                self._cleanup_expired_flows()
                
                flow_key = self._get_flow_key(packet_data)
                current_time = time.time()
                
                if flow_key not in self.flows:
                    # Initialize new flow
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
                    }
                
                flow = self.flows[flow_key]
                
                # Determine direction (forward vs backward)
                is_forward = (packet_data.source_ip == flow['src_ip'] and 
                             packet_data.source_port == flow['src_port'])
                
                # Update flow statistics
                if is_forward:
                    flow['forward_packets'] += 1
                    flow['forward_bytes'] += packet_data.packet_length
                else:
                    flow['backward_packets'] += 1
                    flow['backward_bytes'] += packet_data.packet_length
                
                flow['last_seen'] = current_time
                
                # Calculate CICIDS2017 features
                flow_duration = current_time - flow['start_time']
                
                features = {
                    'Flow Duration': float(flow_duration),
                    'Total Fwd Packets': float(flow['forward_packets']),
                    'Total Backward Packets': float(flow['backward_packets']),
                    'Fwd Packets Length Total': float(flow['forward_bytes']),
                    'Bwd Packets Length Total': float(flow['backward_bytes'])
                }
                
                # Validate features
                features = self._validate_features(features)
                
                return features
                
        except Exception as e:
            logger.error(f"Error extracting CICIDS features: {str(e)}")
            return self._get_default_features()
    
    def _validate_features(self, features: Dict[str, float]) -> Dict[str, float]:
        """Validate and clean feature values."""
        validated_features = {}
        
        for feature_name, value in features.items():
            # Handle invalid values
            if value is None or np.isnan(value) or np.isinf(value):
                validated_features[feature_name] = 0.0
            else:
                validated_features[feature_name] = float(value)
        
        return validated_features
    
    def _get_default_features(self) -> Dict[str, float]:
        """Get default feature values when no flow data is available."""
        return {
            'Flow Duration': 0.0,
            'Total Fwd Packets': 1.0,  # Current packet
            'Total Backward Packets': 0.0,
            'Fwd Packets Length Total': 64.0,  # Average packet size
            'Bwd Packets Length Total': 0.0
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
    
    def reset_flows(self):
        """Reset all flow tracking data."""
        with self.lock:
            self.flows.clear()
            logger.info("Reset all flow tracking data")

# Global CICIDS feature extractor instance
cicids_feature_extractor = CICIDSFeatureExtractor()
