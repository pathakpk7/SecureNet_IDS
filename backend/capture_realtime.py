#!/usr/bin/env python3
"""
SecureNet IDS - Real-time Packet Capture
Live packet capture using PyShark with real-time processing pipeline.
"""

import asyncio
import threading
import time
import logging
from typing import Callable, Optional, Dict, Any
from datetime import datetime
import queue

try:
    import pyshark
    PYSHARK_AVAILABLE = True
except ImportError:
    PYSHARK_AVAILABLE = False
    logging.warning("PyShark not available, falling back to Scapy")

try:
    from scapy.all import sniff, IP, TCP, UDP, ICMP
    SCAPY_AVAILABLE = True
except ImportError:
    SCAPY_AVAILABLE = False
    logging.warning("Scapy not available")

from .schemas import PacketData, ProtocolType

logger = logging.getLogger(__name__)

class RealTimePacketCapture:
    """Real-time packet capture with live processing pipeline."""
    
    def __init__(self, interface: str = "Wi-Fi", callback: Optional[Callable] = None):
        """
        Initialize real-time packet capture.
        
        Args:
            interface: Network interface to capture from
            callback: Callback function for processed packets
        """
        self.interface = interface
        self.callback = callback
        self.is_capturing = False
        self.capture_thread = None
        self.packet_queue = queue.Queue(maxsize=1000)
        self.stats = {
            'packets_captured': 0,
            'packets_processed': 0,
            'packets_dropped': 0,
            'start_time': None,
            'last_packet_time': None
        }
        
        # Choose capture method
        self.capture_method = self._choose_capture_method()
        logger.info(f"🔌 Using capture method: {self.capture_method}")
    
    def _choose_capture_method(self) -> str:
        """Choose the best available capture method."""
        if PYSHARK_AVAILABLE:
            return "pyshark"
        elif SCAPY_AVAILABLE:
            return "scapy"
        else:
            raise ImportError("Neither PyShark nor Scapy is available")
    
    async def start_capture(self) -> bool:
        """
        Start real-time packet capture.
        
        Returns:
            True if capture started successfully, False otherwise
        """
        if self.is_capturing:
            logger.warning("Capture is already running")
            return False
        
        try:
            self.is_capturing = True
            self.stats['start_time'] = datetime.now()
            
            if self.capture_method == "pyshark":
                self.capture_thread = threading.Thread(
                    target=self._pyshark_capture_loop,
                    daemon=True
                )
            else:
                self.capture_thread = threading.Thread(
                    target=self._scapy_capture_loop,
                    daemon=True
                )
            
            self.capture_thread.start()
            
            # Start packet processing
            asyncio.create_task(self._process_packet_queue())
            
            logger.info(f"🔍 Started real-time packet capture on {self.interface}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to start packet capture: {str(e)}")
            self.is_capturing = False
            return False
    
    async def stop_capture(self) -> bool:
        """
        Stop real-time packet capture.
        
        Returns:
            True if capture stopped successfully, False otherwise
        """
        if not self.is_capturing:
            logger.warning("Capture is not running")
            return False
        
        try:
            self.is_capturing = False
            
            if self.capture_thread and self.capture_thread.is_alive():
                self.capture_thread.join(timeout=5)
            
            logger.info(f"⏹ Stopped packet capture")
            logger.info(f"📊 Capture Statistics: {self.get_stats()}")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to stop packet capture: {str(e)}")
            return False
    
    def _pyshark_capture_loop(self):
        """PyShark-based packet capture loop."""
        try:
            live_capture = pyshark.LiveCapture(
                interface=self.interface,
                display_filter="ip",  # Only IP packets
                output_file=None,
                use_json=True
            )
            
            logger.info("🔌 PyShark live capture started")
            
            for packet in live_capture.sniff_continuously():
                if not self.is_capturing:
                    break
                
                try:
                    packet_data = self._extract_pyshark_packet(packet)
                    if packet_data:
                        self._queue_packet(packet_data)
                except Exception as e:
                    logger.error(f"Error processing PyShark packet: {str(e)}")
                    continue
                    
        except Exception as e:
            logger.error(f"PyShark capture error: {str(e)}")
            # Fallback to Scapy if available
            if SCAPY_AVAILABLE:
                logger.info("🔄 Falling back to Scapy capture")
                self.capture_method = "scapy"
                self._scapy_capture_loop()
    
    def _scapy_capture_loop(self):
        """Scapy-based packet capture loop."""
        try:
            def packet_handler(packet):
                if not self.is_capturing:
                    return
                
                try:
                    packet_data = self._extract_scapy_packet(packet)
                    if packet_data:
                        self._queue_packet(packet_data)
                except Exception as e:
                    logger.error(f"Error processing Scapy packet: {str(e)}")
                    return
            
            logger.info("🔌 Scapy live capture started")
            sniff(
                iface=self.interface,
                prn=packet_handler,
                filter="ip",
                store=False,
                stop_filter=lambda x: not self.is_capturing
            )
            
        except Exception as e:
            logger.error(f"Scapy capture error: {str(e)}")
    
    def _extract_pyshark_packet(self, packet) -> Optional[PacketData]:
        """Extract packet data from PyShark packet."""
        try:
            if not hasattr(packet, 'ip'):
                return None
            
            # Extract IP layer
            src_ip = packet.ip.src
            dst_ip = packet.ip.dst
            
            # Extract protocol
            protocol = ProtocolType.TCP
            packet_length = int(packet.length) if hasattr(packet, 'length') else 0
            
            # Extract transport layer info
            src_port = 0
            dst_port = 0
            payload_size = 0
            
            if hasattr(packet, 'tcp'):
                protocol = ProtocolType.TCP
                src_port = int(packet.tcp.srcport) if hasattr(packet.tcp, 'srcport') else 0
                dst_port = int(packet.tcp.dstport) if hasattr(packet.tcp, 'dstport') else 0
                payload_size = int(packet.tcp.len) if hasattr(packet.tcp, 'len') else 0
            elif hasattr(packet, 'udp'):
                protocol = ProtocolType.UDP
                src_port = int(packet.udp.srcport) if hasattr(packet.udp, 'srcport') else 0
                dst_port = int(packet.udp.dstport) if hasattr(packet.udp, 'dstport') else 0
                payload_size = int(packet.udp.len) if hasattr(packet.udp, 'len') else 0
            elif hasattr(packet, 'icmp'):
                protocol = ProtocolType.ICMP
            
            # Extract TCP flags if available
            tcp_flags = {}
            if hasattr(packet, 'tcp'):
                if hasattr(packet.tcp, 'flags'):
                    tcp_flags = {
                        'syn': bool(int(packet.tcp.flags_syn)) if hasattr(packet.tcp, 'flags_syn') else False,
                        'ack': bool(int(packet.tcp.flags_ack)) if hasattr(packet.tcp, 'flags_ack') else False,
                        'fin': bool(int(packet.tcp.flags_fin)) if hasattr(packet.tcp, 'flags_fin') else False,
                        'rst': bool(int(packet.tcp.flags_rst)) if hasattr(packet.tcp, 'flags_rst') else False,
                        'psh': bool(int(packet.tcp.flags_psh)) if hasattr(packet.tcp, 'flags_psh') else False,
                        'urg': bool(int(packet.tcp.flags_urg)) if hasattr(packet.tcp, 'flags_urg') else False,
                    }
            
            timestamp = float(packet.sniff_timestamp) if hasattr(packet, 'sniff_timestamp') else time.time()
            
            packet_data = PacketData(
                source_ip=src_ip,
                destination_ip=dst_ip,
                source_port=src_port,
                destination_port=dst_port,
                protocol=protocol,
                packet_length=packet_length,
                timestamp=timestamp,
                tcp_flags=tcp_flags,
                payload_size=payload_size
            )
            
            self.stats['packets_captured'] += 1
            self.stats['last_packet_time'] = datetime.now()
            
            return packet_data
            
        except Exception as e:
            logger.error(f"Error extracting PyShark packet: {str(e)}")
            return None
    
    def _extract_scapy_packet(self, packet) -> Optional[PacketData]:
        """Extract packet data from Scapy packet."""
        try:
            if not packet.haslayer(IP):
                return None
            
            ip_layer = packet[IP]
            
            # Extract basic IP info
            src_ip = ip_layer.src
            dst_ip = ip_layer.dst
            packet_length = len(packet)
            timestamp = float(packet.time)
            
            # Extract protocol and ports
            protocol = ProtocolType.TCP
            src_port = 0
            dst_port = 0
            payload_size = 0
            tcp_flags = {}
            
            if packet.haslayer(TCP):
                protocol = ProtocolType.TCP
                tcp_layer = packet[TCP]
                src_port = tcp_layer.sport
                dst_port = tcp_layer.dport
                payload_size = len(tcp_layer.payload) if tcp_layer.payload else 0
                
                # Extract TCP flags
                tcp_flags = {
                    'syn': bool(tcp_layer.flags & 0x02),
                    'ack': bool(tcp_layer.flags & 0x10),
                    'fin': bool(tcp_layer.flags & 0x01),
                    'rst': bool(tcp_layer.flags & 0x04),
                    'psh': bool(tcp_layer.flags & 0x08),
                    'urg': bool(tcp_layer.flags & 0x20),
                }
                
            elif packet.haslayer(UDP):
                protocol = ProtocolType.UDP
                udp_layer = packet[UDP]
                src_port = udp_layer.sport
                dst_port = udp_layer.dport
                payload_size = len(udp_layer.payload) if udp_layer.payload else 0
                
            elif packet.haslayer(ICMP):
                protocol = ProtocolType.ICMP
            
            packet_data = PacketData(
                source_ip=src_ip,
                destination_ip=dst_ip,
                source_port=src_port,
                destination_port=dst_port,
                protocol=protocol,
                packet_length=packet_length,
                timestamp=timestamp,
                tcp_flags=tcp_flags,
                payload_size=payload_size
            )
            
            self.stats['packets_captured'] += 1
            self.stats['last_packet_time'] = datetime.now()
            
            return packet_data
            
        except Exception as e:
            logger.error(f"Error extracting Scapy packet: {str(e)}")
            return None
    
    def _queue_packet(self, packet_data: PacketData):
        """Queue packet for processing."""
        try:
            self.packet_queue.put(packet_data, timeout=0.1)
        except queue.Full:
            self.stats['packets_dropped'] += 1
            logger.warning("Packet queue full, dropping packet")
    
    async def _process_packet_queue(self):
        """Process packets from the queue."""
        while self.is_capturing:
            try:
                packet_data = self.packet_queue.get(timeout=0.1)
                
                if self.callback:
                    await self.callback(packet_data)
                
                self.stats['packets_processed'] += 1
                
            except queue.Empty:
                continue
            except Exception as e:
                logger.error(f"Error processing packet: {str(e)}")
                continue
    
    def get_stats(self) -> Dict[str, Any]:
        """Get capture statistics."""
        stats = self.stats.copy()
        
        if stats['start_time']:
            uptime = (datetime.now() - stats['start_time']).total_seconds()
            stats['uptime_seconds'] = uptime
            stats['packets_per_second'] = stats['packets_captured'] / uptime if uptime > 0 else 0
        else:
            stats['uptime_seconds'] = 0
            stats['packets_per_second'] = 0
        
        stats['queue_size'] = self.packet_queue.qsize()
        stats['is_capturing'] = self.is_capturing
        stats['capture_method'] = self.capture_method
        
        return stats
    
    def is_active(self) -> bool:
        """Check if capture is active."""
        return self.is_capturing
    
    def get_interface_info(self) -> Dict[str, Any]:
        """Get network interface information."""
        try:
            import psutil
            interfaces = psutil.net_if_addrs()
            
            interface_info = {
                'selected_interface': self.interface,
                'available_interfaces': list(interfaces.keys()),
                'interface_exists': self.interface in interfaces
            }
            
            return interface_info
            
        except ImportError:
            return {
                'selected_interface': self.interface,
                'available_interfaces': ['Unknown (psutil not available)'],
                'interface_exists': True
            }

# Global real-time capture instance
realtime_capture = RealTimePacketCapture()
