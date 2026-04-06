import asyncio
import threading
import time
from datetime import datetime
from typing import Optional, Callable, Dict, Any
from queue import Queue, Empty
import pyshark
import scapy.all as scapy
from .config import settings, PROTOCOL_MAPPING
from .schemas import PacketData, ProtocolType
import logging


class PacketCapture:
    def __init__(self, interface: str = None, packet_callback: Optional[Callable] = None):
        self.interface = interface or settings.network_interface
        self.packet_callback = packet_callback
        self.is_capturing = False
        self.capture_thread = None
        self.packet_queue = Queue(maxsize=1000)
        self.stats = {
            "total_packets": 0,
            "tcp_packets": 0,
            "udp_packets": 0,
            "icmp_packets": 0,
            "other_packets": 0,
            "start_time": None,
            "last_packet_time": None
        }
        
        # Setup logging
        self.logger = logging.getLogger(__name__)
        
        # Try to use PyShark first, fallback to Scapy
        self.use_pyshark = self._check_pyshark_availability()
        
    def _check_pyshark_availability(self) -> bool:
        """Check if PyShark is available and working"""
        try:
            # Test if we can create a capture object
            test_capture = pyshark.LiveCapture(interface=self.interface, timeout=1)
            return True
        except Exception as e:
            self.logger.warning(f"PyShark not available, falling back to Scapy: {e}")
            return False
    
    def _extract_packet_data_pyshark(self, packet) -> Optional[PacketData]:
        """Extract packet data using PyShark"""
        try:
            # Basic packet info
            timestamp = datetime.fromtimestamp(float(packet.sniff_timestamp))
            
            # Extract IP layer
            if hasattr(packet, 'ip'):
                src_ip = packet.ip.src
                dst_ip = packet.ip.dst
            elif hasattr(packet, 'ipv6'):
                src_ip = packet.ipv6.src
                dst_ip = packet.ipv6.dst
            else:
                return None
            
            # Extract protocol
            protocol = "other"
            src_port = None
            dst_port = None
            tcp_flags = None
            
            if hasattr(packet, 'tcp'):
                protocol = "tcp"
                src_port = int(packet.tcp.srcport)
                dst_port = int(packet.tcp.dstport)
                tcp_flags = self._extract_tcp_flags_pyshark(packet.tcp)
            elif hasattr(packet, 'udp'):
                protocol = "udp"
                src_port = int(packet.udp.srcport)
                dst_port = int(packet.udp.dstport)
            elif hasattr(packet, 'icmp'):
                protocol = "icmp"
            
            # Packet length
            packet_length = int(packet.length) if hasattr(packet, 'length') else 0
            
            # Payload size
            payload_size = 0
            if hasattr(packet, 'data'):
                payload_size = len(packet.data.data) if packet.data.data else 0
            
            return PacketData(
                source_ip=src_ip,
                destination_ip=dst_ip,
                source_port=src_port,
                destination_port=dst_port,
                protocol=ProtocolType(protocol.lower()),
                packet_length=packet_length,
                timestamp=timestamp,
                tcp_flags=tcp_flags,
                payload_size=payload_size
            )
            
        except Exception as e:
            self.logger.error(f"Error extracting packet data with PyShark: {e}")
            return None
    
    def _extract_tcp_flags_pyshark(self, tcp_layer) -> str:
        """Extract TCP flags from PyShark TCP layer"""
        flags = []
        try:
            if hasattr(tcp_layer, 'flags_ack') and int(tcp_layer.flags_ack) == 1:
                flags.append('ACK')
            if hasattr(tcp_layer, 'flags_syn') and int(tcp_layer.flags_syn) == 1:
                flags.append('SYN')
            if hasattr(tcp_layer, 'flags_fin') and int(tcp_layer.flags_fin) == 1:
                flags.append('FIN')
            if hasattr(tcp_layer, 'flags_rst') and int(tcp_layer.flags_rst) == 1:
                flags.append('RST')
            if hasattr(tcp_layer, 'flags_psh') and int(tcp_layer.flags_psh) == 1:
                flags.append('PSH')
            if hasattr(tcp_layer, 'flags_urg') and int(tcp_layer.flags_urg) == 1:
                flags.append('URG')
        except:
            pass
        
        return ','.join(flags) if flags else None
    
    def _extract_packet_data_scapy(self, packet) -> Optional[PacketData]:
        """Extract packet data using Scapy"""
        try:
            timestamp = datetime.fromtimestamp(packet.time)
            
            # Extract IP layer
            if packet.haslayer(scapy.IP):
                src_ip = packet[scapy.IP].src
                dst_ip = packet[scapy.IP].dst
            elif packet.haslayer(scapy.IPv6):
                src_ip = packet[scapy.IPv6].src
                dst_ip = packet[scapy.IPv6].dst
            else:
                return None
            
            # Extract protocol and ports
            protocol = "other"
            src_port = None
            dst_port = None
            tcp_flags = None
            
            if packet.haslayer(scapy.TCP):
                protocol = "tcp"
                src_port = packet[scapy.TCP].sport
                dst_port = packet[scapy.TCP].dport
                tcp_flags = self._extract_tcp_flags_scapy(packet[scapy.TCP])
            elif packet.haslayer(scapy.UDP):
                protocol = "udp"
                src_port = packet[scapy.UDP].sport
                dst_port = packet[scapy.UDP].dport
            elif packet.haslayer(scapy.ICMP):
                protocol = "icmp"
            
            # Packet length
            packet_length = len(packet)
            
            # Payload size
            payload_size = 0
            if packet.haslayer(scapy.Raw):
                payload_size = len(packet[scapy.Raw].load)
            
            return PacketData(
                source_ip=src_ip,
                destination_ip=dst_ip,
                source_port=src_port,
                destination_port=dst_port,
                protocol=ProtocolType(protocol.lower()),
                packet_length=packet_length,
                timestamp=timestamp,
                tcp_flags=tcp_flags,
                payload_size=payload_size
            )
            
        except Exception as e:
            self.logger.error(f"Error extracting packet data with Scapy: {e}")
            return None
    
    def _extract_tcp_flags_scapy(self, tcp_layer) -> str:
        """Extract TCP flags from Scapy TCP layer"""
        flags = []
        try:
            if tcp_layer.flags & 0x10:  # ACK
                flags.append('ACK')
            if tcp_layer.flags & 0x02:  # SYN
                flags.append('SYN')
            if tcp_layer.flags & 0x01:  # FIN
                flags.append('FIN')
            if tcp_layer.flags & 0x04:  # RST
                flags.append('RST')
            if tcp_layer.flags & 0x08:  # PSH
                flags.append('PSH')
            if tcp_layer.flags & 0x20:  # URG
                flags.append('URG')
        except:
            pass
        
        return ','.join(flags) if flags else None
    
    def _pyshark_capture_worker(self):
        """Worker thread for PyShark packet capture"""
        try:
            capture = pyshark.LiveCapture(
                interface=self.interface,
                display_filter="",  # Capture all packets
                timeout=None
            )
            
            for packet in capture.sniff_continuously():
                if not self.is_capturing:
                    break
                
                packet_data = self._extract_packet_data_pyshark(packet)
                if packet_data:
                    self._process_packet(packet_data)
                    
        except Exception as e:
            self.logger.error(f"PyShark capture error: {e}")
    
    def _scapy_capture_worker(self):
        """Worker thread for Scapy packet capture"""
        try:
            def packet_handler(packet):
                if not self.is_capturing:
                    return
                
                packet_data = self._extract_packet_data_scapy(packet)
                if packet_data:
                    self._process_packet(packet_data)
            
            scapy.sniff(iface=self.interface, prn=packet_handler, store=False, stop_filter=lambda x: not self.is_capturing)
            
        except Exception as e:
            self.logger.error(f"Scapy capture error: {e}")
    
    def _process_packet(self, packet_data: PacketData):
        """Process captured packet"""
        try:
            # Update stats
            self.stats["total_packets"] += 1
            self.stats["last_packet_time"] = packet_data.timestamp
            
            if packet_data.protocol == ProtocolType.TCP:
                self.stats["tcp_packets"] += 1
            elif packet_data.protocol == ProtocolType.UDP:
                self.stats["udp_packets"] += 1
            elif packet_data.protocol == ProtocolType.ICMP:
                self.stats["icmp_packets"] += 1
            else:
                self.stats["other_packets"] += 1
            
            # Add to queue (non-blocking)
            try:
                self.packet_queue.put_nowait(packet_data)
            except:
                # Queue is full, remove oldest packet
                try:
                    self.packet_queue.get_nowait()
                    self.packet_queue.put_nowait(packet_data)
                except:
                    pass
            
            # Call callback if provided
            if self.packet_callback:
                self.packet_callback(packet_data)
                
        except Exception as e:
            self.logger.error(f"Error processing packet: {e}")
    
    def start_capture(self):
        """Start packet capture"""
        if self.is_capturing:
            self.logger.warning("Capture already running")
            return
        
        self.is_capturing = True
        self.stats["start_time"] = datetime.now()
        
        if self.use_pyshark:
            self.capture_thread = threading.Thread(target=self._pyshark_capture_worker, daemon=True)
        else:
            self.capture_thread = threading.Thread(target=self._scapy_capture_worker, daemon=True)
        
        self.capture_thread.start()
        self.logger.info(f"Started packet capture on interface {self.interface}")
    
    def stop_capture(self):
        """Stop packet capture"""
        if not self.is_capturing:
            self.logger.warning("Capture not running")
            return
        
        self.is_capturing = False
        
        if self.capture_thread and self.capture_thread.is_alive():
            self.capture_thread.join(timeout=5)
        
        self.logger.info("Stopped packet capture")
    
    def get_packet(self, timeout: float = 1.0) -> Optional[PacketData]:
        """Get a packet from the queue"""
        try:
            return self.packet_queue.get(timeout=timeout)
        except Empty:
            return None
    
    def get_stats(self) -> Dict[str, Any]:
        """Get capture statistics"""
        stats = self.stats.copy()
        if stats["start_time"]:
            stats["uptime_seconds"] = (datetime.now() - stats["start_time"]).total_seconds()
        return stats
    
    def clear_stats(self):
        """Clear capture statistics"""
        self.stats = {
            "total_packets": 0,
            "tcp_packets": 0,
            "udp_packets": 0,
            "icmp_packets": 0,
            "other_packets": 0,
            "start_time": datetime.now() if self.is_capturing else None,
            "last_packet_time": None
        }
    
    def get_available_interfaces(self) -> list:
        """Get list of available network interfaces"""
        try:
            if self.use_pyshark:
                # PyShark doesn't have a direct way to list interfaces
                # Use Scapy for this
                return scapy.get_if_list()
            else:
                return scapy.get_if_list()
        except Exception as e:
            self.logger.error(f"Error getting interfaces: {e}")
            return []


class AsyncPacketCapture:
    """Async wrapper for PacketCapture"""
    
    def __init__(self, interface: str = None, packet_callback: Optional[Callable] = None):
        self.capture = PacketCapture(interface, packet_callback)
        self.packet_queue = asyncio.Queue(maxsize=1000)
        self._queue_worker_task = None
        
    async def _queue_worker(self):
        """Worker to move packets from sync queue to async queue"""
        while self.capture.is_capturing:
            packet = self.capture.get_packet(timeout=0.1)
            if packet:
                try:
                    await self.packet_queue.put(packet)
                except asyncio.QueueFull:
                    # Remove oldest packet if queue is full
                    try:
                        await self.packet_queue.get()
                        await self.packet_queue.put(packet)
                    except:
                        pass
            await asyncio.sleep(0.01)
    
    async def start_capture(self):
        """Start async packet capture"""
        self.capture.start_capture()
        self._queue_worker_task = asyncio.create_task(self._queue_worker())
    
    async def stop_capture(self):
        """Stop async packet capture"""
        self.capture.stop_capture()
        if self._queue_worker_task:
            self._queue_worker_task.cancel()
            try:
                await self._queue_worker_task
            except asyncio.CancelledError:
                pass
    
    async def get_packet(self, timeout: float = 1.0) -> Optional[PacketData]:
        """Get a packet from the async queue"""
        try:
            return await asyncio.wait_for(self.packet_queue.get(), timeout=timeout)
        except asyncio.TimeoutError:
            return None
    
    def get_stats(self) -> Dict[str, Any]:
        """Get capture statistics"""
        return self.capture.get_stats()
