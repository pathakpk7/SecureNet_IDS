"""
SecureNet IDS - Report Templates

This module provides report data templates and aggregation logic
for generating different types of security reports.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


class ReportTemplate:
    """
    Base class for report templates.
    
    Provides common functionality for aggregating data
    for different report types.
    """
    
    def __init__(self, org_id: str):
        """
        Initialize report template.
        
        Args:
            org_id: Organization ID
        """
        self.org_id = org_id
    
    def get_period(self, report_type: str) -> Dict[str, datetime]:
        """
        Get time period for report type.
        
        Args:
            report_type: Type of report (daily, weekly, monthly)
            
        Returns:
            Dictionary with start and end dates
        """
        now = datetime.utcnow()
        
        if report_type == "daily":
            start = now - timedelta(days=1)
            end = now
        elif report_type == "weekly":
            start = now - timedelta(weeks=1)
            end = now
        elif report_type == "monthly":
            start = now - timedelta(days=30)
            end = now
        else:
            start = now - timedelta(days=1)
            end = now
        
        return {
            "start": start,
            "end": end,
            "start_iso": start.isoformat(),
            "end_iso": end.isoformat()
        }
    
    def format_period_string(self, report_type: str) -> str:
        """
        Format period as readable string.
        
        Args:
            report_type: Type of report
            
        Returns:
            Formatted period string
        """
        period = self.get_period(report_type)
        start = period["start"]
        end = period["end"]
        
        return f"{start.strftime('%Y-%m-%d')} to {end.strftime('%Y-%m-%d')}"


class DailyReportTemplate(ReportTemplate):
    """
    Template for daily security reports.
    """
    
    def generate_report_data(self, alerts: List[Dict[str, Any]], stats: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate daily report data.
        
        Args:
            alerts: List of alerts for the day
            stats: Statistics data
            
        Returns:
            Report data dictionary
        """
        period = self.get_period("daily")
        
        # Calculate statistics
        total_alerts = len(alerts)
        critical_alerts = len([a for a in alerts if a.get("risk_level") == "critical"])
        high_alerts = len([a for a in alerts if a.get("risk_level") == "high"])
        medium_alerts = len([a for a in alerts if a.get("risk_level") == "medium"])
        low_alerts = len([a for a in alerts if a.get("risk_level") == "low"])
        resolved_alerts = len([a for a in alerts if a.get("status") == "resolved"])
        active_threats = len([a for a in alerts if a.get("status") == "open"])
        
        # Calculate risk score
        risk_score = self._calculate_risk_score(alerts)
        overall_risk = self._determine_risk_level(risk_score)
        
        # Get top source IPs
        top_ips = self._get_top_source_ips(alerts, limit=10)
        
        # Get protocol distribution
        protocols = self._get_protocol_distribution(alerts)
        
        # Get attack types
        attack_types = self._get_attack_types(alerts)
        
        # Generate summary
        summary = (
            f"During the reporting period ({self.format_period_string('daily')}), "
            f"the system detected {total_alerts} security events. "
            f"Of these, {critical_alerts} were critical and {high_alerts} were high severity. "
            f"{resolved_alerts} alerts have been resolved, while {active_threats} remain active."
        )
        
        # Generate key findings
        key_findings = []
        if critical_alerts > 0:
            key_findings.append(f"{critical_alerts} critical alerts detected requiring immediate attention")
        if high_alerts > 5:
            key_findings.append(f"High volume of high-severity alerts ({high_alerts})")
        if resolved_alerts > total_alerts * 0.8:
            key_findings.append("High alert resolution rate achieved")
        if active_threats > 10:
            key_findings.append(f"{active_threats} active threats require investigation")
        
        if not key_findings:
            key_findings.append("Normal security activity with no critical incidents")
        
        # Generate risk factors
        risk_factors = []
        if critical_alerts > 0:
            risk_factors.append(f"Critical alerts present: {critical_alerts}")
        if len(top_ips) > 0 and top_ips[0].get("count", 0) > 10:
            risk_factors.append(f"High frequency attacks from single source: {top_ips[0].get('ip')}")
        if "ddos" in attack_types:
            risk_factors.append("DDoS attack patterns detected")
        
        if not risk_factors:
            risk_factors.append("No significant risk factors identified")
        
        # Generate recommendations
        recommendations = []
        if critical_alerts > 0:
            recommendations.append("Investigate and resolve all critical alerts immediately")
        if high_alerts > 5:
            recommendations.append("Review and address high-severity alerts")
        if active_threats > 5:
            recommendations.append("Assign active threats to security analysts for investigation")
        if len(top_ips) > 0:
            recommendations.append(f"Consider blocking top attacking IPs: {top_ips[0].get('ip')}")
        
        if not recommendations:
            recommendations.append("Continue normal monitoring operations")
        
        return {
            "period": self.format_period_string("daily"),
            "report_type": "daily",
            "total_alerts": total_alerts,
            "critical_alerts": critical_alerts,
            "high_alerts": high_alerts,
            "medium_alerts": medium_alerts,
            "low_alerts": low_alerts,
            "resolved_alerts": resolved_alerts,
            "active_threats": active_threats,
            "risk_score": risk_score,
            "overall_risk": overall_risk,
            "top_source_ips": top_ips,
            "protocols": protocols,
            "attack_types": attack_types,
            "alert_statistics": {
                "critical": critical_alerts,
                "high": high_alerts,
                "medium": medium_alerts,
                "low": low_alerts
            },
            "summary": summary,
            "key_findings": key_findings,
            "risk_factors": risk_factors,
            "recommendations": recommendations,
            "generated_at": datetime.utcnow().isoformat()
        }
    
    def _calculate_risk_score(self, alerts: List[Dict[str, Any]]) -> int:
        """Calculate overall risk score from alerts."""
        if not alerts:
            return 0
        
        risk_weights = {"critical": 25, "high": 15, "medium": 8, "low": 3}
        total_score = 0
        
        for alert in alerts:
            risk_level = alert.get("risk_level", "low").lower()
            total_score += risk_weights.get(risk_level, 3)
        
        # Normalize to 0-100
        max_possible = len(alerts) * 25
        return min(100, int((total_score / max_possible) * 100)) if max_possible > 0 else 0
    
    def _determine_risk_level(self, score: int) -> str:
        """Determine risk level from score."""
        if score >= 75:
            return "critical"
        elif score >= 50:
            return "high"
        elif score >= 25:
            return "medium"
        else:
            return "low"
    
    def _get_top_source_ips(self, alerts: List[Dict[str, Any]], limit: int = 10) -> List[Dict[str, Any]]:
        """Get top source IPs by alert count."""
        ip_counts = {}
        ip_risk_levels = {}
        
        for alert in alerts:
            ip = alert.get("source_ip")
            if ip:
                ip_counts[ip] = ip_counts.get(ip, 0) + 1
                if ip not in ip_risk_levels or alert.get("severity_score", 0) > ip_risk_levels[ip]:
                    ip_risk_levels[ip] = alert.get("severity_score", 0)
        
        sorted_ips = sorted(ip_counts.items(), key=lambda x: x[1], reverse=True)[:limit]
        
        return [
            {
                "ip": ip,
                "count": count,
                "risk_level": self._determine_risk_level(ip_risk_levels[ip])
            }
            for ip, count in sorted_ips
        ]
    
    def _get_protocol_distribution(self, alerts: List[Dict[str, Any]]) -> Dict[str, int]:
        """Get protocol distribution."""
        protocols = {}
        for alert in alerts:
            protocol = alert.get("protocol", "unknown")
            protocols[protocol] = protocols.get(protocol, 0) + 1
        return protocols
    
    def _get_attack_types(self, alerts: List[Dict[str, Any]]) -> Dict[str, int]:
        """Get attack type distribution."""
        attack_types = {}
        for alert in alerts:
            attack_type = alert.get("attack_type", "unknown")
            attack_types[attack_type] = attack_types.get(attack_type, 0) + 1
        return attack_types


class WeeklyReportTemplate(ReportTemplate):
    """
    Template for weekly security reports.
    """
    
    def generate_report_data(self, alerts: List[Dict[str, Any]], stats: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate weekly report data.
        
        Args:
            alerts: List of alerts for the week
            stats: Statistics data
            
        Returns:
            Report data dictionary
        """
        # Use daily template logic but with weekly aggregation
        daily_template = DailyReportTemplate(self.org_id)
        base_data = daily_template.generate_report_data(alerts, stats)
        
        # Update for weekly context
        base_data["period"] = self.format_period_string("weekly")
        base_data["report_type"] = "weekly"
        
        # Add weekly-specific analysis
        base_data["summary"] = (
            f"Weekly security report covering {self.format_period_string('weekly')}. "
            f"The system detected {base_data['total_alerts']} security events this week. "
            f"Trend analysis shows {'increasing' if base_data['total_alerts'] > 100 else 'stable'} "
            f"threat activity levels."
        )
        
        # Add trend analysis
        base_data["trend_analysis"] = self._analyze_trends(alerts)
        
        return base_data
    
    def _analyze_trends(self, alerts: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze trends in alert data."""
        # Group alerts by day
        daily_counts = {}
        for alert in alerts:
            date = alert.get("timestamp", "")[:10]  # Extract date
            daily_counts[date] = daily_counts.get(date, 0) + 1
        
        # Calculate trend
        if len(daily_counts) >= 2:
            dates = sorted(daily_counts.keys())
            first_half = sum(daily_counts[d] for d in dates[:len(dates)//2])
            second_half = sum(daily_counts[d] for d in dates[len(dates)//2:])
            
            if second_half > first_half * 1.2:
                trend = "increasing"
            elif second_half < first_half * 0.8:
                trend = "decreasing"
            else:
                trend = "stable"
        else:
            trend = "insufficient_data"
        
        return {
            "trend": trend,
            "daily_counts": daily_counts,
            "peak_day": max(daily_counts.items(), key=lambda x: x[1])[0] if daily_counts else None
        }


class MonthlyReportTemplate(ReportTemplate):
    """
    Template for monthly security reports.
    """
    
    def generate_report_data(self, alerts: List[Dict[str, Any]], stats: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate monthly report data.
        
        Args:
            alerts: List of alerts for the month
            stats: Statistics data
            
        Returns:
            Report data dictionary
        """
        # Use weekly template logic but with monthly aggregation
        weekly_template = WeeklyReportTemplate(self.org_id)
        base_data = weekly_template.generate_report_data(alerts, stats)
        
        # Update for monthly context
        base_data["period"] = self.format_period_string("monthly")
        base_data["report_type"] = "monthly"
        
        # Add monthly-specific analysis
        base_data["summary"] = (
            f"Monthly security report for {self.format_period_string('monthly')}. "
            f"This comprehensive analysis covers {base_data['total_alerts']} security events. "
            f"Key performance indicators and long-term trends are included."
        )
        
        # Add monthly KPIs
        base_data["kpis"] = self._calculate_kpis(alerts, stats)
        
        return base_data
    
    def _calculate_kpis(self, alerts: List[Dict[str, Any]], stats: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate monthly KPIs."""
        total_alerts = len(alerts)
        resolved = len([a for a in alerts if a.get("status") == "resolved"])
        
        return {
            "alert_resolution_rate": (resolved / total_alerts * 100) if total_alerts > 0 else 0,
            "avg_alerts_per_day": total_alerts / 30,
            "critical_alert_percentage": (
                len([a for a in alerts if a.get("risk_level") == "critical"]) / total_alerts * 100
            ) if total_alerts > 0 else 0,
            "unique_source_ips": len(set(a.get("source_ip") for a in alerts))
        }
