#!/usr/bin/env python3
"""
SecureNet IDS - Fixed Feature Engineering Module
Fixed CICIDS2017-compatible feature extraction with exact feature matching.
"""

import time
import threading
import pandas as pd
import numpy as np
from collections import defaultdict
from datetime import datetime
from typing import Dict, List, Optional, Any
import pickle
import logging
from pathlib import Path

from .schemas import PacketData, ProtocolType
from .utils import tcp_flags_dict_to_string

logger = logging.getLogger(__name__)

class FixedFeatureExtractor:
    """Fixed feature extractor with exact CICIDS2017 feature matching."""
    
    def __init__(self, flow_timeout: int = 120, max_flows: int = 10000):
        """
        Initialize fixed feature extractor.
        
        Args:
            flow_timeout: Flow inactivity timeout in seconds
            max_flows: Maximum number of flows to track
        """
        self.flows = {}
        self.flow_timeout = flow_timeout
        self.max_flows = max_flows
        self.lock = threading.Lock()
        self.last_cleanup = time.time()
        self.cleanup_interval = 30
        
        # Load CICIDS features to ensure exact matching
        self.cicids_features = self._load_cicids_features()
        self.scaler = self._load_cicids_scaler()
        
        logger.info(f"🔧 Fixed Feature Extractor initialized")
        logger.info(f"   - CICIDS Features: {len(self.cicids_features)} loaded")
        logger.info(f"   - Flow timeout: {flow_timeout}s")
        logger.info(f"   - Max flows: {max_flows}")
    
    def _load_cicids_features(self) -> List[str]:
        """Load CICIDS2017 feature names from pickle file."""
        try:
            features_path = Path("model/cicids_features.pkl")
            if features_path.exists():
                with open(features_path, 'rb') as f:
                    features = pickle.load(f)
                logger.info(f"✅ Loaded CICIDS features: {features}")
                return features
            else:
                logger.warning("CICIDS features file not found, using defaults")
                return [
                    'Flow Duration', 'Total Fwd Packets', 'Total Backward Packets',
                    'Fwd Packets Length Total', 'Bwd Packets Length Total'
                ]
        except Exception as e:
            logger.error(f"Error loading CICIDS features: {str(e)}")
            return [
                'Flow Duration', 'Total Fwd Packets', 'Total Backward Packets',
                'Fwd Packets Length Total', 'Bwd Packets Length Total'
            ]
    
    def _load_cicids_scaler(self):
        """Load CICIDS2017 feature scaler."""
        try:
            scaler_path = Path("model/cicids_scaler.pkl")
            if scaler_path.exists():
                with open(scaler_path, 'rb') as f:
                    scaler = pickle.load(f)
                logger.info("✅ Loaded CICIDS scaler")
                return scaler
            else:
                logger.warning("CICIDS scaler file not found")
                return None
        except Exception as e:
            logger.error(f"Error loading CICIDS scaler: {str(e)}")
            return None
    
    def _get_flow_key(self, packet_data: PacketData) -> str:
        """Generate bidirectional flow key from packet data."""
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
            
            # Enforce maximum flow limit
            if len(self.flows) > self.max_flows:
                flows_by_time = sorted(
                    self.flows.items(),
                    key=lambda x: x[1]['start_time']
                )
                excess = len(self.flows) - self.max_flows
                
                for i in range(excess):
                    key = flows_by_time[i][0]
                    del self.flows[key]
            
            self.last_cleanup = current_time
    
    def extract_cicids_features(self, packet_data: PacketData) -> Optional[Dict[str, float]]:
        """
        Extract CICIDS2017 features with exact feature matching.
        
        Args:
            packet_data: Live packet data from capture
            
        Returns:
            Dictionary with exact CICIDS2017 features or None if failed
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
                        'tcp_flags': set()
                    }
                
                flow = self.flows[flow_key]
                
                # Determine packet direction
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
                
                # Track TCP flags
                if packet_data.tcp_flags:
                    if isinstance(packet_data.tcp_flags, str):
                        # Convert string to set
                        flags = set(packet_data.tcp_flags.split(','))
                    elif isinstance(packet_data.tcp_flags, dict):
                        # Convert dict to set
                        flags = set(tcp_flags_dict_to_string(packet_data.tcp_flags).split(','))
                    else:
                        flags = set()
                    
                    flow['tcp_flags'].update(flags)
                
                # Calculate CICIDS2017 features with exact feature names
                flow_duration = current_time - flow['start_time']
                
                # Create feature dictionary with exact CICIDS feature names
                features = {
                    'Flow Duration': float(flow_duration),
                    'Total Fwd Packets': float(flow['forward_packets']),
                    'Total Backward Packets': float(flow['backward_packets']),
                    'Fwd Packets Length Total': float(flow['forward_bytes']),
                    'Bwd Packets Length Total': float(flow['backward_bytes'])
                }
                
                # Validate and clean features
                features = self._validate_features(features)
                
                logger.debug(f"Extracted CICIDS features: {features}")
                return features
                
        except Exception as e:
            logger.error(f"Error extracting CICIDS features: {str(e)}")
            return None
    
    def _validate_features(self, features: Dict[str, float]) -> Dict[str, float]:
        """Validate and clean feature values."""
        validated_features = {}
        
        for feature_name, value in features.items():
            # Handle invalid values
            if value is None or np.isnan(value) or np.isinf(value):
                validated_features[feature_name] = 0.0
            else:
                validated_features[feature_name] = float(max(0, value))  # Ensure non-negative
        
        return validated_features
    
    def extract_features_for_ml(self, packet_data: PacketData) -> Optional[pd.DataFrame]:
        """
        Extract features formatted for ML prediction.
        
        Args:
            packet_data: Live packet data from capture
            
        Returns:
            DataFrame with features ready for ML prediction or None if failed
        """
        try:
            # Extract CICIDS features
            features_dict = self.extract_cicids_features(packet_data)
            
            if not features_dict:
                logger.error("Failed to extract features")
                return None
            
            # Create DataFrame with exact CICIDS feature order
            features_df = pd.DataFrame([features_dict])
            
            # Ensure all required features are present
            for feature in self.cicids_features:
                if feature not in features_df.columns:
                    features_df[feature] = 0.0
            
            # Reorder columns to match CICIDS model
            features_df = features_df[self.cicids_features]
            
            # Apply scaler if available
            if self.scaler:
                try:
                    features_scaled = self.scaler.transform(features_df)
                    features_df = pd.DataFrame(features_scaled, columns=self.cicids_features)
                    logger.debug("Applied CICIDS scaler to features")
                except Exception as e:
                    logger.warning(f"Failed to apply scaler: {str(e)}")
            
            logger.debug(f"ML-ready features shape: {features_df.shape}")
            return features_df
            
        except Exception as e:
            logger.error(f"Error preparing features for ML: {str(e)}")
            return None
    
    def get_flow_statistics(self) -> Dict[str, Any]:
        """Get comprehensive flow statistics."""
        with self.lock:
            self._cleanup_expired_flows()
            
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
            
            return {
                'active_flows': total_flows,
                'total_packets_processed': total_packets,
                'total_bytes_processed': total_bytes,
                'average_flow_duration': avg_duration,
                'protocol_distribution': dict(protocol_counts),
                'memory_usage': total_flows,
                'max_flows': self.max_flows,
                'cicids_features': self.cicids_features,
                'scaler_available': self.scaler is not None
            }
    
    def get_active_flows(self, limit: int = 100) -> List[Dict[str, Any]]:
        """Get information about active flows."""
        with self.lock:
            active_flows = []
            
            for flow_key in list(self.flows.keys())[:limit]:
                flow = self.flows[flow_key]
                current_time = time.time()
                
                flow_info = {
                    'flow_key': flow_key,
                    'src_ip': flow['src_ip'],
                    'dst_ip': flow['dst_ip'],
                    'src_port': flow['src_port'],
                    'dst_port': flow['dst_port'],
                    'protocol': flow['protocol'],
                    'duration_seconds': current_time - flow['start_time'],
                    'forward_packets': flow['forward_packets'],
                    'backward_packets': flow['backward_packets'],
                    'total_packets': flow['forward_packets'] + flow['backward_packets'],
                    'forward_bytes': flow['forward_bytes'],
                    'backward_bytes': flow['backward_bytes'],
                    'total_bytes': flow['forward_bytes'] + flow['backward_bytes'],
                    'tcp_flags': list(flow['tcp_flags'])
                }
                
                active_flows.append(flow_info)
            
            # Sort by duration (longest first)
            active_flows.sort(key=lambda x: x['duration_seconds'], reverse=True)
            
            return active_flows
    
    def reset_flows(self):
        """Reset all flow tracking data."""
        with self.lock:
            old_count = len(self.flows)
            self.flows.clear()
            logger.info(f"🔄 Reset {old_count} flows")

# Global fixed feature extractor instance
fixed_feature_extractor = FixedFeatureExtractor()
