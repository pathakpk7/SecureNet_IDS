import logging
import json
import asyncio
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Union
from pathlib import Path
import ipaddress
import hashlib
import re
from .config import settings


def tcp_flags_dict_to_string(tcp_flags_dict: Dict[str, bool]) -> str:
    """
    Convert TCP flags dictionary to string format.
    
    Args:
        tcp_flags_dict: Dictionary of TCP flags (e.g., {'syn': True, 'ack': True})
        
    Returns:
        String representation of TCP flags (e.g., "SYN,ACK")
    """
    if not tcp_flags_dict or not isinstance(tcp_flags_dict, dict):
        return ""
    
    flag_names = []
    for flag, value in tcp_flags_dict.items():
        if value:
            flag_names.append(flag.upper())
    
    return ",".join(flag_names)


def tcp_flags_string_to_dict(tcp_flags_string: str) -> Dict[str, bool]:
    """
    Convert TCP flags string to dictionary format.
    
    Args:
        tcp_flags_string: String representation of TCP flags (e.g., "SYN,ACK")
        
    Returns:
        Dictionary of TCP flags (e.g., {'syn': True, 'ack': True})
    """
    if not tcp_flags_string:
        return {}
    
    flags = {}
    for flag_name in tcp_flags_string.split(","):
        flag_name = flag_name.strip().upper()
        if flag_name:
            flags[flag_name.lower()] = True
    
    return flags


def setup_logging(log_file: str = None, log_level: str = None):
    """
    Setup logging configuration
    
    Args:
        log_file: Path to log file
        log_level: Logging level
    """
    log_file = log_file or settings.log_file
    log_level = log_level or settings.log_level
    
    # Create logs directory if it doesn't exist
    log_path = Path(log_file)
    log_path.parent.mkdir(parents=True, exist_ok=True)
    
    # Configure logging
    logging.basicConfig(
        level=getattr(logging, log_level.upper()),
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler(log_file),
            logging.StreamHandler()
        ]
    )


def validate_ip_address(ip: str) -> bool:
    """
    Validate if a string is a valid IP address
    
    Args:
        ip: IP address string
        
    Returns:
        True if valid IP address, False otherwise
    """
    try:
        ipaddress.ip_address(ip)
        return True
    except ValueError:
        return False


def validate_port(port: Union[str, int]) -> bool:
    """
    Validate if a port number is valid
    
    Args:
        port: Port number
        
    Returns:
        True if valid port, False otherwise
    """
    try:
        port_num = int(port)
        return 0 <= port_num <= 65535
    except (ValueError, TypeError):
        return False


def is_private_ip(ip: str) -> bool:
    """
    Check if an IP address is private
    
    Args:
        ip: IP address string
        
    Returns:
        True if private IP, False otherwise
    """
    try:
        ip_obj = ipaddress.ip_address(ip)
        return ip_obj.is_private
    except ValueError:
        return False


def get_ip_geolocation_info(ip: str) -> Dict[str, Any]:
    """
    Get basic geolocation information for an IP
    Note: This is a placeholder. In production, you'd use a geolocation API
    
    Args:
        ip: IP address string
        
    Returns:
        Dictionary with geolocation info
    """
    # Placeholder implementation
    return {
        'ip': ip,
        'country': 'Unknown',
        'city': 'Unknown',
        'latitude': 0.0,
        'longitude': 0.0,
        'asn': 'Unknown',
        'organization': 'Unknown'
    }


def calculate_packet_hash(packet_data: Dict[str, Any]) -> str:
    """
    Calculate a hash for packet data for deduplication
    
    Args:
        packet_data: Packet data dictionary
        
    Returns:
        SHA256 hash string
    """
    try:
        # Create a normalized string representation
        normalized_data = json.dumps(packet_data, sort_keys=True)
        return hashlib.sha256(normalized_data.encode()).hexdigest()
    except Exception:
        return hashlib.sha256(str(packet_data).encode()).hexdigest()


def format_bytes(bytes_count: int) -> str:
    """
    Format bytes into human-readable format
    
    Args:
        bytes_count: Number of bytes
        
    Returns:
        Formatted string
    """
    if bytes_count == 0:
        return "0 B"
    
    units = ['B', 'KB', 'MB', 'GB', 'TB']
    unit_index = 0
    
    while bytes_count >= 1024 and unit_index < len(units) - 1:
        bytes_count /= 1024
        unit_index += 1
    
    return f"{bytes_count:.2f} {units[unit_index]}"


def format_duration(seconds: float) -> str:
    """
    Format duration in seconds to human-readable format
    
    Args:
        seconds: Duration in seconds
        
    Returns:
        Formatted duration string
    """
    if seconds < 1:
        return f"{seconds*1000:.0f}ms"
    elif seconds < 60:
        return f"{seconds:.2f}s"
    elif seconds < 3600:
        minutes = int(seconds // 60)
        remaining_seconds = seconds % 60
        return f"{minutes}m {remaining_seconds:.0f}s"
    else:
        hours = int(seconds // 3600)
        remaining_minutes = int((seconds % 3600) // 60)
        return f"{hours}h {remaining_minutes}m"


def extract_urls_from_text(text: str) -> List[str]:
    """
    Extract URLs from text using regex
    
    Args:
        text: Input text
        
    Returns:
        List of URLs found in text
    """
    url_pattern = re.compile(
        r'https?://(?:[-\w.])+(?:[:\d]+)?(?:/(?:[\w/_.])*(?:\?(?:[\w&=%.])*)?(?:#(?:\w*))?)?',
        re.IGNORECASE
    )
    return url_pattern.findall(text)


def is_suspicious_domain(domain: str) -> bool:
    """
    Check if a domain looks suspicious based on common patterns
    
    Args:
        domain: Domain name
        
    Returns:
        True if domain looks suspicious
    """
    suspicious_patterns = [
        r'.*[0-9]{5,}.*',  # Domains with many numbers
        r'.*[a-z]{20,}.*',  # Very long letter sequences
        r'.*\.tk$',  # Free TLDs commonly abused
        r'.*\.ml$',
        r'.*\.ga$',
        r'.*\.cf$',
        r'.*bit\.ly.*',  # URL shorteners
        r'.*tinyurl\.com.*',
        r'.*goo\.gl.*',
    ]
    
    for pattern in suspicious_patterns:
        if re.match(pattern, domain, re.IGNORECASE):
            return True
    
    return False


def calculate_risk_score(ml_confidence: float, threat_intel_score: float,
                        ml_weight: float = None, intel_weight: float = None) -> float:
    """
    Calculate combined risk score from ML and threat intelligence
    
    Args:
        ml_confidence: ML model confidence (0-1)
        threat_intel_score: Threat intelligence score (0-1)
        ml_weight: Weight for ML confidence
        intel_weight: Weight for threat intelligence
        
    Returns:
        Combined risk score (0-1)
    """
    ml_weight = ml_weight or settings.ml_weight
    intel_weight = intel_weight or settings.threat_intel_weight
    
    # Normalize weights
    total_weight = ml_weight + intel_weight
    ml_weight = ml_weight / total_weight
    intel_weight = intel_weight / total_weight
    
    return (ml_confidence * ml_weight) + (threat_intel_score * intel_weight)


def create_alert_description(packet_data: Dict[str, Any], prediction_result: Dict[str, Any]) -> str:
    """
    Create a human-readable alert description
    
    Args:
        packet_data: Packet information
        prediction_result: ML prediction results
        
    Returns:
        Alert description string
    """
    try:
        src_ip = packet_data.get('source_ip', 'Unknown')
        dst_ip = packet_data.get('destination_ip', 'Unknown')
        protocol = packet_data.get('protocol', 'Unknown')
        attack_type = prediction_result.get('attack_type', 'unknown')
        confidence = prediction_result.get('confidence', 0)
        
        description = f"Suspicious network activity detected: {attack_type.upper()} attack "
        description += f"from {src_ip} to {dst_ip} using {protocol.upper()} protocol. "
        description += f"Confidence: {confidence:.2f}"
        
        # Add threat intelligence info if available
        threat_results = prediction_result.get('threat_intel_results', [])
        if threat_results:
            malicious_sources = [r['source'] for r in threat_results if r.get('is_malicious')]
            if malicious_sources:
                description += f". Confirmed malicious by: {', '.join(malicious_sources)}"
        
        return description
        
    except Exception as e:
        logging.error(f"Error creating alert description: {e}")
        return f"Suspicious network activity detected (Error: {str(e)})"


def get_time_range_stats(timestamps: List[datetime]) -> Dict[str, Any]:
    """
    Calculate statistics for a list of timestamps
    
    Args:
        timestamps: List of datetime objects
        
    Returns:
        Dictionary with time-based statistics
    """
    if not timestamps:
        return {}
    
    now = datetime.now()
    time_ranges = {
        'last_minute': 0,
        'last_hour': 0,
        'last_24h': 0,
        'last_week': 0
    }
    
    for ts in timestamps:
        if now - ts <= timedelta(minutes=1):
            time_ranges['last_minute'] += 1
        if now - ts <= timedelta(hours=1):
            time_ranges['last_hour'] += 1
        if now - ts <= timedelta(hours=24):
            time_ranges['last_24h'] += 1
        if now - ts <= timedelta(days=7):
            time_ranges['last_week'] += 1
    
    return time_ranges


def sanitize_filename(filename: str) -> str:
    """
    Sanitize filename for safe file system usage
    
    Args:
        filename: Original filename
        
    Returns:
        Sanitized filename
    """
    # Remove or replace unsafe characters
    sanitized = re.sub(r'[<>:"/\\|?*]', '_', filename)
    # Remove leading/trailing spaces and dots
    sanitized = sanitized.strip('. ')
    # Limit length
    if len(sanitized) > 255:
        sanitized = sanitized[:255]
    
    return sanitized or 'unnamed'


async def retry_async(func, max_retries: int = 3, delay: float = 1.0, backoff: float = 2.0):
    """
    Retry an async function with exponential backoff
    
    Args:
        func: Async function to retry
        max_retries: Maximum number of retries
        delay: Initial delay between retries
        backoff: Backoff multiplier
        
    Returns:
        Function result
    """
    last_exception = None
    
    for attempt in range(max_retries + 1):
        try:
            return await func()
        except Exception as e:
            last_exception = e
            if attempt < max_retries:
                await asyncio.sleep(delay * (backoff ** attempt))
            else:
                raise last_exception


def create_response(success: bool, message: str, data: Any = None, error: str = None) -> Dict[str, Any]:
    """
    Create a standardized API response
    
    Args:
        success: Whether the operation was successful
        message: Response message
        data: Optional response data
        error: Optional error message
        
    Returns:
        Standardized response dictionary
    """
    response = {
        'success': success,
        'message': message,
        'timestamp': datetime.now().isoformat()
    }
    
    if data is not None:
        response['data'] = data
    
    if error:
        response['error'] = error
    
    return response


def validate_api_key(api_key: str, expected_key: str = None) -> bool:
    """
    Validate API key (simple implementation)
    
    Args:
        api_key: API key to validate
        expected_key: Expected API key (if None, uses settings)
        
    Returns:
        True if valid
    """
    expected = expected_key or getattr(settings, 'api_key', None)
    if not expected:
        return True  # No key required if not set
    
    return api_key == expected


def get_network_interfaces() -> List[Dict[str, str]]:
    """
    Get available network interfaces
    Note: This is a simplified implementation
    
    Returns:
        List of network interface information
    """
    # Placeholder implementation
    # In production, you'd use platform-specific code to get actual interfaces
    return [
        {'name': 'Wi-Fi', 'description': 'Wireless Network Interface'},
        {'name': 'Ethernet', 'description': 'Ethernet Network Interface'},
        {'name': 'Loopback', 'description': 'Loopback Interface'}
    ]


def export_data_to_csv(data: List[Dict[str, Any]], filename: str, fieldnames: List[str] = None):
    """
    Export data to CSV file
    
    Args:
        data: List of dictionaries to export
        filename: Output filename
        fieldnames: List of field names (columns)
    """
    import csv
    
    if not data:
        return
    
    # Determine fieldnames if not provided
    if fieldnames is None:
        fieldnames = list(data[0].keys())
    
    # Ensure filename has .csv extension
    if not filename.endswith('.csv'):
        filename += '.csv'
    
    # Write to CSV
    with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(data)


def get_system_info() -> Dict[str, Any]:
    """
    Get system information for monitoring
    
    Returns:
        Dictionary with system info
    """
    import platform
    import psutil
    
    return {
        'platform': platform.platform(),
        'python_version': platform.python_version(),
        'cpu_count': psutil.cpu_count(),
        'memory_total': format_bytes(psutil.virtual_memory().total),
        'memory_available': format_bytes(psutil.virtual_memory().available),
        'disk_usage': format_bytes(psutil.disk_usage('/').free),
        'uptime': format_duration(time.time() - psutil.boot_time())
    }


class RateLimiter:
    """Simple in-memory rate limiter"""
    
    def __init__(self, max_requests: int, time_window: int):
        self.max_requests = max_requests
        self.time_window = time_window
        self.requests = {}
    
    def is_allowed(self, identifier: str) -> bool:
        """
        Check if request is allowed for identifier
        
        Args:
            identifier: Unique identifier (IP, API key, etc.)
            
        Returns:
            True if request is allowed
        """
        now = time.time()
        
        if identifier not in self.requests:
            self.requests[identifier] = []
        
        # Remove old requests
        self.requests[identifier] = [
            req_time for req_time in self.requests[identifier]
            if now - req_time < self.time_window
        ]
        
        # Check if under limit
        if len(self.requests[identifier]) < self.max_requests:
            self.requests[identifier].append(now)
            return True
        
        return False


# Import time at the end to avoid circular imports
import time
