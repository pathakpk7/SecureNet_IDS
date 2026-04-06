#!/usr/bin/env python3
"""
SecureNet IDS - CSV Logger Module
Local CSV logging system for real-time intrusion detection logs.
Provides hybrid logging alongside Supabase storage for redundancy.
"""

import csv
import os
import threading
from pathlib import Path
from datetime import datetime, timezone
from typing import Dict, Any, Optional
import logging
from concurrent.futures import ThreadPoolExecutor
import queue

logger = logging.getLogger(__name__)


class CSVLogger:
    """
    High-performance CSV logger for SecureNet IDS.
    Features:
    - Thread-safe async logging
    - Daily file rotation
    - Separate alert logging
    - Non-blocking writes
    - Error resilience
    """
    
    def __init__(self, database_dir: str = "database"):
        """
        Initialize CSV Logger
        
        Args:
            database_dir: Directory to store CSV files
        """
        self.database_dir = Path(database_dir)
        self.database_dir.mkdir(exist_ok=True)
        
        # Thread-safe queue for async logging
        self.log_queue = queue.Queue(maxsize=1000)
        self.alert_queue = queue.Queue(maxsize=1000)
        
        # Thread pool for background writing
        self.executor = ThreadPoolExecutor(max_workers=2, thread_name_prefix="csv_logger")
        
        # File locks for thread safety
        self.log_lock = threading.Lock()
        self.alert_lock = threading.Lock()
        
        # Start background workers
        self._start_background_workers()
        
        logger.info(f"🗂️  CSV Logger initialized - Database dir: {self.database_dir}")
    
    def _start_background_workers(self):
        """Start background threads for writing logs"""
        # Log writer worker
        self.executor.submit(self._log_writer_worker)
        # Alert writer worker  
        self.executor.submit(self._alert_writer_worker)
    
    def _get_daily_filename(self, prefix: str = "logs") -> str:
        """
        Generate daily filename
        
        Args:
            prefix: File prefix (logs/alerts)
            
        Returns:
            Daily filename: logs_YYYY-MM-DD.csv
        """
        today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        return f"{prefix}_{today}.csv"
    
    def _initialize_csv_file(self, filename: str, headers: list) -> bool:
        """
        Initialize CSV file with headers if it doesn't exist
        
        Args:
            filename: CSV filename
            headers: Column headers
            
        Returns:
            True if file ready, False on error
        """
        file_path = self.database_dir / filename
        
        try:
            # Create file with headers if it doesn't exist
            if not file_path.exists():
                with open(file_path, 'w', newline='', encoding='utf-8') as csvfile:
                    writer = csv.writer(csvfile)
                    writer.writerow(headers)
                logger.info(f"📄 Created new CSV file: {filename}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize CSV file {filename}: {e}")
            return False
    
    def initialize_csv(self) -> bool:
        """
        Initialize all CSV files with proper headers
        
        Returns:
            True if all files initialized successfully
        """
        success = True
        
        # Main logs CSV headers
        log_headers = [
            'timestamp',
            'ip_address', 
            'prediction',
            'attack_type',
            'risk_level',
            'confidence',
            'protocol',
            'source_ip',
            'destination_ip',
            'packet_length',
            'threat_intel_score'
        ]
        
        # Alerts CSV headers (for HIGH/CRITICAL only)
        alert_headers = [
            'timestamp',
            'ip_address',
            'attack_type', 
            'risk_level',
            'confidence',
            'threat_intel_data',
            'description',
            'source_ip',
            'destination_ip'
        ]
        
        # Initialize daily log file
        log_filename = self._get_daily_filename("logs")
        if not self._initialize_csv_file(log_filename, log_headers):
            success = False
        
        # Initialize daily alert file
        alert_filename = self._get_daily_filename("alerts")
        if not self._initialize_csv_file(alert_filename, alert_headers):
            success = False
        
        return success
    
    def write_log(self, log_data: Dict[str, Any]) -> bool:
        """
        Queue log entry for writing to CSV
        
        Args:
            log_data: Log entry data
            
        Returns:
            True if queued successfully
        """
        try:
            # Validate required fields
            required_fields = ['timestamp', 'ip_address', 'prediction', 'attack_type', 'risk_level']
            for field in required_fields:
                if field not in log_data:
                    logger.warning(f"⚠️  Missing required field '{field}' in log data")
                    return False
            
            # Add to queue (non-blocking)
            try:
                self.log_queue.put_nowait(log_data)
            except queue.Full:
                logger.warning("⚠️  Log queue full, dropping log entry")
                return False
            
            # Also queue as alert if high risk
            if log_data.get('risk_level') in ['HIGH', 'CRITICAL']:
                try:
                    self.alert_queue.put_nowait(log_data)
                except queue.Full:
                    logger.warning("⚠️  Alert queue full, dropping alert entry")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to queue log entry: {e}")
            return False
    
    def _log_writer_worker(self):
        """Background worker for writing logs to CSV"""
        while True:
            try:
                # Get log entry from queue
                log_data = self.log_queue.get(timeout=1.0)
                
                # Get daily filename
                filename = self._get_daily_filename("logs")
                file_path = self.database_dir / filename
                
                # Ensure file exists with headers
                if not file_path.exists():
                    headers = [
                        'timestamp', 'ip_address', 'prediction', 'attack_type', 
                        'risk_level', 'confidence', 'protocol', 'source_ip',
                        'destination_ip', 'packet_length', 'threat_intel_score'
                    ]
                    self._initialize_csv_file(filename, headers)
                
                # Write log entry
                with self.log_lock:
                    with open(file_path, 'a', newline='', encoding='utf-8') as csvfile:
                        writer = csv.writer(csvfile)
                        row = [
                            log_data.get('timestamp', ''),
                            log_data.get('ip_address', ''),
                            log_data.get('prediction', ''),
                            log_data.get('attack_type', ''),
                            log_data.get('risk_level', ''),
                            log_data.get('confidence', ''),
                            log_data.get('protocol', ''),
                            log_data.get('source_ip', ''),
                            log_data.get('destination_ip', ''),
                            log_data.get('packet_length', ''),
                            log_data.get('threat_intel_score', '')
                        ]
                        writer.writerow(row)
                
                self.log_queue.task_done()
                
            except queue.Empty:
                continue
            except Exception as e:
                logger.error(f"❌ Log writer error: {e}")
    
    def _alert_writer_worker(self):
        """Background worker for writing alerts to CSV"""
        while True:
            try:
                # Get alert entry from queue
                alert_data = self.alert_queue.get(timeout=1.0)
                
                # Get daily filename
                filename = self._get_daily_filename("alerts")
                file_path = self.database_dir / filename
                
                # Ensure file exists with headers
                if not file_path.exists():
                    headers = [
                        'timestamp', 'ip_address', 'attack_type', 'risk_level',
                        'confidence', 'threat_intel_data', 'description',
                        'source_ip', 'destination_ip'
                    ]
                    self._initialize_csv_file(filename, headers)
                
                # Write alert entry
                with self.alert_lock:
                    with open(file_path, 'a', newline='', encoding='utf-8') as csvfile:
                        writer = csv.writer(csvfile)
                        row = [
                            alert_data.get('timestamp', ''),
                            alert_data.get('ip_address', ''),
                            alert_data.get('attack_type', ''),
                            alert_data.get('risk_level', ''),
                            alert_data.get('confidence', ''),
                            str(alert_data.get('threat_intel_data', '')),
                            alert_data.get('description', ''),
                            alert_data.get('source_ip', ''),
                            alert_data.get('destination_ip', '')
                        ]
                        writer.writerow(row)
                
                self.alert_queue.task_done()
                
            except queue.Empty:
                continue
            except Exception as e:
                logger.error(f"❌ Alert writer error: {e}")
    
    def get_log_stats(self) -> Dict[str, Any]:
        """
        Get logging statistics
        
        Returns:
            Dictionary with logging stats
        """
        stats = {
            'log_queue_size': self.log_queue.qsize(),
            'alert_queue_size': self.alert_queue.qsize(),
            'database_dir': str(self.database_dir),
            'log_files': [],
            'alert_files': []
        }
        
        # List existing files
        try:
            for file_path in self.database_dir.glob("logs_*.csv"):
                stats['log_files'].append({
                    'name': file_path.name,
                    'size': file_path.stat().st_size,
                    'modified': file_path.stat().st_mtime
                })
            
            for file_path in self.database_dir.glob("alerts_*.csv"):
                stats['alert_files'].append({
                    'name': file_path.name,
                    'size': file_path.stat().st_size,
                    'modified': file_path.stat().st_mtime
                })
        except Exception as e:
            logger.error(f"❌ Failed to get file stats: {e}")
        
        return stats
    
    def shutdown(self):
        """Shutdown the CSV logger gracefully"""
        logger.info("🔄 Shutting down CSV logger...")
        
        # Wait for queues to empty
        self.log_queue.join()
        self.alert_queue.join()
        
        # Shutdown executor
        self.executor.shutdown(wait=True)
        
        logger.info("✅ CSV logger shutdown complete")


# Global CSV logger instance
csv_logger = CSVLogger()


def initialize_csv_logging() -> bool:
    """
    Initialize CSV logging system
    
    Returns:
        True if initialization successful
    """
    return csv_logger.initialize_csv()


def write_log_entry(log_data: Dict[str, Any]) -> bool:
    """
    Write log entry to CSV
    
    Args:
        log_data: Log entry data
        
    Returns:
        True if logged successfully
    """
    return csv_logger.write_log(log_data)


def get_csv_logger_stats() -> Dict[str, Any]:
    """
    Get CSV logger statistics
    
    Returns:
        Logger statistics
    """
    return csv_logger.get_log_stats()


def shutdown_csv_logger():
    """Shutdown CSV logger"""
    csv_logger.shutdown()
