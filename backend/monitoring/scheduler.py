"""
SecureNet IDS - Background Jobs Scheduler

This module provides a scheduler for automated background tasks
including report generation, data cleanup, and health checks.
"""

import asyncio
import logging
from typing import Dict, Any, Callable, Optional
from datetime import datetime, timedelta
from dataclasses import dataclass
import json

logger = logging.getLogger(__name__)


@dataclass
class ScheduledJob:
    """Scheduled job configuration."""
    name: str
    func: Callable
    interval_seconds: int
    enabled: bool = True
    last_run: Optional[datetime] = None
    next_run: Optional[datetime] = None
    run_count: int = 0
    error_count: int = 0
    last_error: Optional[str] = None


class BackgroundJobScheduler:
    """
    Scheduler for background jobs.
    
    Manages periodic tasks such as report generation,
    data cleanup, and health monitoring.
    """
    
    def __init__(self):
        """Initialize background job scheduler."""
        self.jobs: Dict[str, ScheduledJob] = {}
        self.is_running = False
        self.scheduler_task: Optional[asyncio.Task] = None
    
    def register_job(
        self,
        name: str,
        func: Callable,
        interval_seconds: int,
        enabled: bool = True
    ) -> bool:
        """
        Register a background job.
        
        Args:
            name: Job name/identifier
            func: Async function to execute
            interval_seconds: Interval between runs in seconds
            enabled: Whether job is enabled
            
        Returns:
            True if registration successful
        """
        try:
            job = ScheduledJob(
                name=name,
                func=func,
                interval_seconds=interval_seconds,
                enabled=enabled,
                next_run=datetime.utcnow() + timedelta(seconds=interval_seconds)
            )
            self.jobs[name] = job
            logger.info(f"Registered background job: {name} (interval: {interval_seconds}s)")
            return True
        except Exception as e:
            logger.error(f"Failed to register job {name}: {e}")
            return False
    
    def unregister_job(self, name: str) -> bool:
        """
        Unregister a background job.
        
        Args:
            name: Job name
            
        Returns:
            True if unregistration successful
        """
        if name in self.jobs:
            del self.jobs[name]
            logger.info(f"Unregistered background job: {name}")
            return True
        return False
    
    def enable_job(self, name: str) -> bool:
        """
        Enable a background job.
        
        Args:
            name: Job name
            
        Returns:
            True if successful
        """
        if name in self.jobs:
            self.jobs[name].enabled = True
            logger.info(f"Enabled background job: {name}")
            return True
        return False
    
    def disable_job(self, name: str) -> bool:
        """
        Disable a background job.
        
        Args:
            name: Job name
            
        Returns:
            True if successful
        """
        if name in self.jobs:
            self.jobs[name].enabled = False
            logger.info(f"Disabled background job: {name}")
            return True
        return False
    
    async def start(self):
        """Start the background job scheduler."""
        if self.is_running:
            logger.warning("Scheduler is already running")
            return
        
        self.is_running = True
        self.scheduler_task = asyncio.create_task(self._scheduler_loop())
        logger.info("Background job scheduler started")
    
    async def stop(self):
        """Stop the background job scheduler."""
        if not self.is_running:
            return
        
        self.is_running = False
        if self.scheduler_task:
            self.scheduler_task.cancel()
            try:
                await self.scheduler_task
            except asyncio.CancelledError:
                pass
        
        logger.info("Background job scheduler stopped")
    
    async def _scheduler_loop(self):
        """Main scheduler loop."""
        while self.is_running:
            try:
                now = datetime.utcnow()
                
                for job_name, job in self.jobs.items():
                    if not job.enabled:
                        continue
                    
                    if job.next_run and now >= job.next_run:
                        await self._run_job(job)
                
                # Sleep for 1 second before next check
                await asyncio.sleep(1)
                
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error in scheduler loop: {e}")
                await asyncio.sleep(5)
    
    async def _run_job(self, job: ScheduledJob):
        """
        Execute a scheduled job.
        
        Args:
            job: Job to execute
        """
        try:
            logger.info(f"Running job: {job.name}")
            
            # Execute job function
            await job.func()
            
            # Update job statistics
            job.last_run = datetime.utcnow()
            job.next_run = datetime.utcnow() + timedelta(seconds=job.interval_seconds)
            job.run_count += 1
            job.last_error = None
            
            logger.info(f"Job completed: {job.name} (run #{job.run_count})")
            
        except Exception as e:
            logger.error(f"Job failed: {job.name} - {e}")
            job.error_count += 1
            job.last_error = str(e)
            # Schedule retry
            job.next_run = datetime.utcnow() + timedelta(seconds=job.interval_seconds)
    
    def get_job_status(self, name: str) -> Optional[Dict[str, Any]]:
        """
        Get status of a specific job.
        
        Args:
            name: Job name
            
        Returns:
            Job status dictionary
        """
        if name in self.jobs:
            job = self.jobs[name]
            return {
                "name": job.name,
                "enabled": job.enabled,
                "interval_seconds": job.interval_seconds,
                "last_run": job.last_run.isoformat() if job.last_run else None,
                "next_run": job.next_run.isoformat() if job.next_run else None,
                "run_count": job.run_count,
                "error_count": job.error_count,
                "last_error": job.last_error
            }
        return None
    
    def get_all_job_statuses(self) -> Dict[str, Dict[str, Any]]:
        """
        Get status of all jobs.
        
        Returns:
            Dictionary of job statuses
        """
        return {
            name: self.get_job_status(name)
            for name in self.jobs.keys()
        }
    
    def get_scheduler_status(self) -> Dict[str, Any]:
        """
        Get overall scheduler status.
        
        Returns:
            Scheduler status dictionary
        """
        return {
            "is_running": self.is_running,
            "total_jobs": len(self.jobs),
            "enabled_jobs": sum(1 for job in self.jobs.values() if job.enabled),
            "disabled_jobs": sum(1 for job in self.jobs.values() if not job.enabled),
            "total_runs": sum(job.run_count for job in self.jobs.values()),
            "total_errors": sum(job.error_count for job in self.jobs.values())
        }


# Alias for backward compatibility
Scheduler = BackgroundJobScheduler

# Global scheduler instance
scheduler = BackgroundJobScheduler()
