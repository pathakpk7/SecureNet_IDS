"""
SecureNet IDS - PDF Report Generator

This module provides PDF report generation capabilities for
security reports including daily, weekly, and monthly summaries.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import logging
from io import BytesIO
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image, PageBreak
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import os

logger = logging.getLogger(__name__)


class PDFReportGenerator:
    """
    PDF report generator for security reports.
    
    Generates professional PDF reports with charts, tables,
    and summaries for various report types.
    """
    
    def __init__(self, org_name: str = "SecureNet IDS"):
        """
        Initialize PDF report generator.
        
        Args:
            org_name: Organization name for reports
        """
        self.org_name = org_name
        self.styles = self._get_custom_styles()
        self._register_fonts()
    
    def _register_fonts(self):
        """Register custom fonts for PDF generation."""
        try:
            # Try to use system fonts, fall back to default
            pdfmetrics.registerFont(TTFont('Helvetica', 'Helvetica.ttf'))
            pdfmetrics.registerFont(TTFont('Helvetica-Bold', 'Helvetica-Bold.ttf'))
        except Exception:
            # Use default fonts if custom fonts not available
            logger.warning("Custom fonts not available, using defaults")
    
    def _get_custom_styles(self) -> Dict[str, ParagraphStyle]:
        """
        Get custom paragraph styles for PDF.
        
        Returns:
            Dictionary of custom styles
        """
        styles = getSampleStyleSheet()
        
        # Custom styles
        styles.add(ParagraphStyle(
            name='CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#1a1a2e'),
            spaceAfter=30,
            alignment=TA_CENTER
        ))
        
        styles.add(ParagraphStyle(
            name='CustomHeading2',
            parent=styles['Heading2'],
            fontSize=18,
            textColor=colors.HexColor('#16213e'),
            spaceAfter=12,
            spaceBefore=20
        ))
        
        styles.add(ParagraphStyle(
            name='CustomHeading3',
            parent=styles['Heading3'],
            fontSize=14,
            textColor=colors.HexColor('#0f3460'),
            spaceAfter=8,
            spaceBefore=12
        ))
        
        styles.add(ParagraphStyle(
            name='CustomBody',
            parent=styles['BodyText'],
            fontSize=10,
            textColor=colors.HexColor('#333333'),
            spaceAfter=6
        ))
        
        styles.add(ParagraphStyle(
            name='CustomFooter',
            parent=styles['Normal'],
            fontSize=8,
            textColor=colors.HexColor('#666666'),
            alignment=TA_CENTER
        ))
        
        return styles
    
    def generate_report(
        self,
        report_data: Dict[str, Any],
        report_type: str = "daily",
        output_path: Optional[str] = None
    ) -> bytes:
        """
        Generate a PDF report.
        
        Args:
            report_data: Report data dictionary
            report_type: Type of report (daily, weekly, monthly, custom)
            output_path: Optional file path to save PDF
            
        Returns:
            PDF file as bytes
        """
        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=72,
            leftMargin=72,
            topMargin=72,
            bottomMargin=72
        )
        
        # Build PDF content
        story = []
        
        # Add title page
        story.extend(self._create_title_page(report_data, report_type))
        story.append(PageBreak())
        
        # Add executive summary
        story.extend(self._create_executive_summary(report_data))
        story.append(PageBreak())
        
        # Add alert statistics
        story.extend(self._create_alert_statistics(report_data))
        story.append(PageBreak())
        
        # Add top attackers
        story.extend(self._create_top_attackers(report_data))
        story.append(PageBreak())
        
        # Add protocol distribution
        story.extend(self._create_protocol_distribution(report_data))
        story.append(PageBreak())
        
        # Add risk assessment
        story.extend(self._create_risk_assessment(report_data))
        
        # Add footer
        story.append(Spacer(1, 0.5 * inch))
        story.append(Paragraph(
            f"Generated by {self.org_name} on {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}",
            self.styles['CustomFooter']
        ))
        
        # Build PDF
        doc.build(story)
        
        pdf_bytes = buffer.getvalue()
        buffer.close()
        
        # Save to file if path provided
        if output_path:
            with open(output_path, 'wb') as f:
                f.write(pdf_bytes)
            logger.info(f"PDF report saved to {output_path}")
        
        return pdf_bytes
    
    def _create_title_page(self, report_data: Dict[str, Any], report_type: str) -> List:
        """
        Create title page for report.
        
        Args:
            report_data: Report data
            report_type: Type of report
            
        Returns:
            List of PDF elements
        """
        elements = []
        
        # Title
        elements.append(Spacer(1, 1 * inch))
        elements.append(Paragraph(
            f"{report_type.capitalize()} Security Report",
            self.styles['CustomTitle']
        ))
        
        # Organization name
        elements.append(Spacer(1, 0.5 * inch))
        elements.append(Paragraph(
            self.org_name,
            self.styles['CustomHeading2']
        ))
        
        # Report period
        elements.append(Spacer(1, 0.5 * inch))
        period = report_data.get("period", "Custom Period")
        elements.append(Paragraph(
            f"Report Period: {period}",
            self.styles['CustomBody']
        ))
        
        # Generated date
        elements.append(Paragraph(
            f"Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}",
            self.styles['CustomBody']
        ))
        
        # Summary stats
        elements.append(Spacer(1, 1 * inch))
        
        summary_data = [
            ["Total Alerts", str(report_data.get("total_alerts", 0))],
            ["Critical Alerts", str(report_data.get("critical_alerts", 0))],
            ["High Alerts", str(report_data.get("high_alerts", 0))],
            ["Resolved Alerts", str(report_data.get("resolved_alerts", 0))],
            ["Active Threats", str(report_data.get("active_threats", 0))]
        ]
        
        summary_table = Table(summary_data, colWidths=[2 * inch, 2 * inch])
        summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1a1a2e')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        elements.append(summary_table)
        
        return elements
    
    def _create_executive_summary(self, report_data: Dict[str, Any]) -> List:
        """
        Create executive summary section.
        
        Args:
            report_data: Report data
            
        Returns:
            List of PDF elements
        """
        elements = []
        
        elements.append(Paragraph("Executive Summary", self.styles['CustomHeading2']))
        
        summary_text = report_data.get("summary", 
            "This report provides a comprehensive overview of security events "
            "detected during the reporting period. Key findings include "
            "alert trends, top threat sources, and risk assessment.")
        
        elements.append(Paragraph(summary_text, self.styles['CustomBody']))
        elements.append(Spacer(1, 0.3 * inch))
        
        # Key findings
        elements.append(Paragraph("Key Findings:", self.styles['CustomHeading3']))
        
        findings = report_data.get("key_findings", [
            "Security monitoring was active throughout the period",
            "All critical alerts were investigated and resolved",
            "No major security incidents detected"
        ])
        
        for finding in findings:
            elements.append(Paragraph(f"• {finding}", self.styles['CustomBody']))
        
        return elements
    
    def _create_alert_statistics(self, report_data: Dict[str, Any]) -> List:
        """
        Create alert statistics section.
        
        Args:
            report_data: Report data
            
        Returns:
            List of PDF elements
        """
        elements = []
        
        elements.append(Paragraph("Alert Statistics", self.styles['CustomHeading2']))
        
        # Alert breakdown table
        alert_stats = report_data.get("alert_statistics", {})
        
        table_data = [["Risk Level", "Count", "Percentage"]]
        
        total = sum(alert_stats.values()) if alert_stats else 1
        
        for risk_level, count in alert_stats.items():
            percentage = (count / total * 100) if total > 0 else 0
            table_data.append([
                risk_level.capitalize(),
                str(count),
                f"{percentage:.1f}%"
            ])
        
        alert_table = Table(table_data, colWidths=[2 * inch, 1.5 * inch, 1.5 * inch])
        alert_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1a1a2e')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        elements.append(alert_table)
        elements.append(Spacer(1, 0.3 * inch))
        
        # Attack type distribution
        elements.append(Paragraph("Attack Type Distribution", self.styles['CustomHeading3']))
        
        attack_types = report_data.get("attack_types", {})
        
        attack_data = [["Attack Type", "Count"]]
        for attack_type, count in attack_types.items():
            attack_data.append([attack_type, str(count)])
        
        attack_table = Table(attack_data, colWidths=[3 * inch, 1.5 * inch])
        attack_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#16213e')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        elements.append(attack_table)
        
        return elements
    
    def _create_top_attackers(self, report_data: Dict[str, Any]) -> List:
        """
        Create top attackers section.
        
        Args:
            report_data: Report data
            
        Returns:
            List of PDF elements
        """
        elements = []
        
        elements.append(Paragraph("Top Source IPs", self.styles['CustomHeading2']))
        
        top_ips = report_data.get("top_source_ips", [])
        
        if top_ips:
            table_data = [["Rank", "IP Address", "Alert Count", "Risk Level"]]
            
            for idx, ip_data in enumerate(top_ips[:10], 1):
                table_data.append([
                    str(idx),
                    ip_data.get("ip", "unknown"),
                    str(ip_data.get("count", 0)),
                    ip_data.get("risk_level", "medium").capitalize()
                ])
            
            ip_table = Table(table_data, colWidths=[0.75 * inch, 2 * inch, 1.5 * inch, 1.5 * inch])
            ip_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1a1a2e')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            
            elements.append(ip_table)
        else:
            elements.append(Paragraph("No attack data available for this period.", self.styles['CustomBody']))
        
        return elements
    
    def _create_protocol_distribution(self, report_data: Dict[str, Any]) -> List:
        """
        Create protocol distribution section.
        
        Args:
            report_data: Report data
            
        Returns:
            List of PDF elements
        """
        elements = []
        
        elements.append(Paragraph("Protocol Distribution", self.styles['CustomHeading2']))
        
        protocols = report_data.get("protocols", {})
        
        if protocols:
            table_data = [["Protocol", "Count", "Percentage"]]
            
            total = sum(protocols.values()) if protocols else 1
            
            for protocol, count in protocols.items():
                percentage = (count / total * 100) if total > 0 else 0
                table_data.append([
                    protocol.upper(),
                    str(count),
                    f"{percentage:.1f}%"
                ])
            
            protocol_table = Table(table_data, colWidths=[2 * inch, 1.5 * inch, 1.5 * inch])
            protocol_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#16213e')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            
            elements.append(protocol_table)
        else:
            elements.append(Paragraph("No protocol data available for this period.", self.styles['CustomBody']))
        
        return elements
    
    def _create_risk_assessment(self, report_data: Dict[str, Any]) -> List:
        """
        Create risk assessment section.
        
        Args:
            report_data: Report data
            
        Returns:
            List of PDF elements
        """
        elements = []
        
        elements.append(Paragraph("Risk Assessment", self.styles['CustomHeading2']))
        
        risk_score = report_data.get("risk_score", 0)
        risk_level = report_data.get("overall_risk", "medium")
        
        # Risk score display
        elements.append(Paragraph(f"Overall Risk Level: {risk_level.upper()}", self.styles['CustomHeading3']))
        elements.append(Paragraph(f"Risk Score: {risk_score}/100", self.styles['CustomBody']))
        elements.append(Spacer(1, 0.3 * inch))
        
        # Risk factors
        elements.append(Paragraph("Risk Factors:", self.styles['CustomHeading3']))
        
        risk_factors = report_data.get("risk_factors", [
            "High volume of critical alerts",
            "Multiple attack sources detected",
            "Unusual protocol activity"
        ])
        
        for factor in risk_factors:
            elements.append(Paragraph(f"• {factor}", self.styles['CustomBody']))
        
        elements.append(Spacer(1, 0.3 * inch))
        
        # Recommendations
        elements.append(Paragraph("Recommendations:", self.styles['CustomHeading3']))
        
        recommendations = report_data.get("recommendations", [
            "Investigate critical alerts immediately",
            "Review firewall rules for top source IPs",
            "Monitor for continued attack patterns"
        ])
        
        for recommendation in recommendations:
            elements.append(Paragraph(f"• {recommendation}", self.styles['CustomBody']))
        
        return elements
