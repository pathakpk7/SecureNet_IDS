"""
Capture module for SecureNet IDS
Packet capture and processing
"""

from .capture import PacketCapture, AsyncPacketCapture

# Aliases for backward compatibility
RealTimePacketCapture = AsyncPacketCapture
realtime_capture = AsyncPacketCapture()

__all__ = [
    'PacketCapture',
    'AsyncPacketCapture',
    'RealTimePacketCapture',
    'realtime_capture'
]
