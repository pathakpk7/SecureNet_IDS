"""
SecureNet IDS - ELK Stack SIEM Connector

This module provides integration with ELK Stack (Elasticsearch, Logstash, Kibana)
for exporting alerts and logs in Elasticsearch-compatible formats.
"""

from typing import Dict, Any, List
from datetime import datetime
import logging
import json
from elasticsearch import Elasticsearch
from .base_connector import BaseSIEMConnector, SIEMFormat

logger = logging.getLogger(__name__)


class ELKConnector(BaseSIEMConnector):
    """
    ELK Stack connector.
    
    Supports exporting alerts to Elasticsearch with proper indexing
    and mapping for Kibana visualization.
    """
    
    def __init__(self, config: Dict[str, Any], demo_mode: bool = False):
        """
        Initialize ELK connector.
        
        Args:
            config: Configuration dictionary with:
                - hosts: Elasticsearch hosts (list or single string)
                - username: Elasticsearch username
                - password: Elasticsearch password
                - index_pattern: Index name pattern (e.g., securenet-alerts-*)
                - api_key: Optional API key for authentication
            demo_mode: If True, use mock/demo mode
        """
        super().__init__(config, demo_mode)
        self.hosts = config.get("hosts", ["http://localhost:9200"])
        self.username = config.get("username")
        self.password = config.get("password")
        self.api_key = config.get("api_key")
        self.index_pattern = config.get("index_pattern", "securenet-alerts")
        self.client = None
    
    async def connect(self) -> bool:
        """
        Establish connection to Elasticsearch.
        
        Returns:
            True if connection successful, False otherwise
        """
        if self.demo_mode:
            self.is_connected = True
            logger.info("ELK connector: Demo mode - connection simulated")
            return True
        
        try:
            # Initialize Elasticsearch client
            if self.api_key:
                self.client = Elasticsearch(
                    hosts=self.hosts,
                    api_key=self.api_key,
                    verify_certs=False,
                    ssl_show_warn=False
                )
            elif self.username and self.password:
                self.client = Elasticsearch(
                    hosts=self.hosts,
                    basic_auth=(self.username, self.password),
                    verify_certs=False,
                    ssl_show_warn=False
                )
            else:
                self.client = Elasticsearch(
                    hosts=self.hosts,
                    verify_certs=False,
                    ssl_show_warn=False
                )
            
            # Test connection
            if self.client.ping():
                self.is_connected = True
                logger.info("Elasticsearch connection successful")
                
                # Create index template if it doesn't exist
                await self._create_index_template()
                
                return True
            else:
                logger.error("Elasticsearch connection failed: ping failed")
                return False
                
        except Exception as e:
            logger.error(f"Elasticsearch connection error: {e}")
            return False
    
    async def disconnect(self) -> bool:
        """
        Disconnect from Elasticsearch.
        
        Returns:
            True if disconnection successful
        """
        if self.client:
            self.client.close()
            self.client = None
        self.is_connected = False
        logger.info("ELK connector disconnected")
        return True
    
    async def export_alert(self, alert: Dict[str, Any]) -> bool:
        """
        Export a single alert to Elasticsearch.
        
        Args:
            alert: Alert data dictionary
            
        Returns:
            True if export successful, False otherwise
        """
        if self.demo_mode:
            self._log_export(True, 1)
            logger.info(f"Demo mode: Simulated export of alert {alert.get('id')}")
            return True
        
        try:
            index_name = self._get_index_name()
            formatted_doc = self._format_elasticsearch_doc(alert)
            
            response = self.client.index(
                index=index_name,
                id=alert.get("id"),
                document=formatted_doc
            )
            
            if response.get("result") in ["created", "updated"]:
                self._log_export(True, 1)
                return True
            else:
                logger.error(f"Elasticsearch index failed: {response}")
                return False
                
        except Exception as e:
            logger.error(f"Error exporting alert to Elasticsearch: {e}")
            return False
    
    async def export_alerts_batch(self, alerts: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Export multiple alerts to Elasticsearch in batch.
        
        Args:
            alerts: List of alert data dictionaries
            
        Returns:
            Export result dictionary
        """
        if self.demo_mode:
            self._log_export(True, len(alerts))
            logger.info(f"Demo mode: Simulated batch export of {len(alerts)} alerts")
            return {
                "success": True,
                "total": len(alerts),
                "exported": len(alerts),
                "failed": 0,
                "demo_mode": True
            }
        
        try:
            index_name = self._get_index_name()
            bulk_data = []
            
            for alert in alerts:
                formatted_doc = self._format_elasticsearch_doc(alert)
                bulk_data.append({
                    "index": {
                        "_index": index_name,
                        "_id": alert.get("id")
                    }
                })
                bulk_data.append(formatted_doc)
            
            response = self.client.bulk(operations=bulk_data)
            
            # Count successful and failed operations
            success_count = 0
            failed_count = 0
            
            for item in response.get("items", []):
                if item.get("index", {}).get("status") in [200, 201]:
                    success_count += 1
                else:
                    failed_count += 1
            
            self._log_export(success_count > 0, success_count)
            
            return {
                "success": success_count > 0,
                "total": len(alerts),
                "exported": success_count,
                "failed": failed_count,
                "demo_mode": False
            }
            
        except Exception as e:
            logger.error(f"Error batch exporting alerts to Elasticsearch: {e}")
            return {
                "success": False,
                "total": len(alerts),
                "exported": 0,
                "failed": len(alerts),
                "demo_mode": False,
                "error": str(e)
            }
    
    def format_alert(self, alert: Dict[str, Any], format: str = SIEMFormat.JSON) -> str:
        """
        Format alert data for Elasticsearch.
        
        Args:
            alert: Alert data dictionary
            format: Target format (json, elk)
            
        Returns:
            Formatted alert string
        """
        if format == SIEMFormat.ELK:
            doc = self._format_elasticsearch_doc(alert)
            return json.dumps(doc, default=str)
        else:
            return json.dumps(alert, default=str)
    
    def _format_elasticsearch_doc(self, alert: Dict[str, Any]) -> Dict[str, Any]:
        """
        Format alert as Elasticsearch document.
        
        Args:
            alert: Alert data dictionary
            
        Returns:
            Elasticsearch-formatted document
        """
        return {
            "@timestamp": self._parse_timestamp(alert.get("timestamp")),
            "alert": {
                "id": alert.get("id"),
                "type": alert.get("attack_type"),
                "risk_level": alert.get("risk_level"),
                "confidence": alert.get("confidence"),
                "severity_score": alert.get("severity_score"),
                "status": alert.get("status"),
                "description": alert.get("description")
            },
            "network": {
                "source": {
                    "ip": alert.get("source_ip"),
                    "port": alert.get("packet_data", {}).get("source_port")
                },
                "destination": {
                    "ip": alert.get("destination_ip"),
                    "port": alert.get("packet_data", {}).get("destination_port")
                },
                "protocol": alert.get("protocol"),
                "transport": alert.get("protocol").lower() if alert.get("protocol") else "unknown"
            },
            "organization": {
                "id": alert.get("org_id")
            },
            "threat_intel": alert.get("threat_intel_data", {}),
            "ml_prediction": alert.get("prediction_result", {}),
            "tags": alert.get("tags", []),
            "metadata": {
                "assigned_to": alert.get("assigned_to"),
                "resolved_by": alert.get("resolved_by"),
                "resolved_at": alert.get("resolved_at"),
                "investigation_notes": alert.get("investigation_notes")
            }
        }
    
    def _get_index_name(self) -> str:
        """
        Get index name for current date.
        
        Returns:
            Index name with date suffix
        """
        date_str = datetime.utcnow().strftime("%Y.%m.%d")
        return f"{self.index_pattern}-{date_str}"
    
    async def _create_index_template(self):
        """
        Create Elasticsearch index template for proper mapping.
        """
        try:
            template_name = f"{self.index_pattern}-template"
            
            template = {
                "index_patterns": [f"{self.index_pattern}-*"],
                "template": {
                    "settings": {
                        "number_of_shards": 1,
                        "number_of_replicas": 1,
                        "index.refresh_interval": "5s"
                    },
                    "mappings": {
                        "properties": {
                            "@timestamp": {"type": "date"},
                            "alert": {
                                "properties": {
                                    "id": {"type": "keyword"},
                                    "type": {"type": "keyword"},
                                    "risk_level": {"type": "keyword"},
                                    "confidence": {"type": "float"},
                                    "severity_score": {"type": "integer"},
                                    "status": {"type": "keyword"},
                                    "description": {"type": "text"}
                                }
                            },
                            "network": {
                                "properties": {
                                    "source": {
                                        "properties": {
                                            "ip": {"type": "ip"},
                                            "port": {"type": "integer"}
                                        }
                                    },
                                    "destination": {
                                        "properties": {
                                            "ip": {"type": "ip"},
                                            "port": {"type": "integer"}
                                        }
                                    },
                                    "protocol": {"type": "keyword"},
                                    "transport": {"type": "keyword"}
                                }
                            },
                            "organization": {
                                "properties": {
                                    "id": {"type": "keyword"}
                                }
                            },
                            "threat_intel": {"type": "object"},
                            "ml_prediction": {"type": "object"},
                            "tags": {"type": "keyword"},
                            "metadata": {
                                "properties": {
                                    "assigned_to": {"type": "keyword"},
                                    "resolved_by": {"type": "keyword"},
                                    "resolved_at": {"type": "date"},
                                    "investigation_notes": {"type": "text"}
                                }
                            }
                        }
                    }
                }
            }
            
            self.client.indices.put_index_template(name=template_name, body=template)
            logger.info(f"Created index template: {template_name}")
            
        except Exception as e:
            logger.warning(f"Could not create index template: {e}")
    
    def _parse_timestamp(self, timestamp_str: str) -> str:
        """
        Parse timestamp to ISO format for Elasticsearch.
        
        Args:
            timestamp_str: ISO format timestamp
            
        Returns:
            ISO formatted timestamp
        """
        try:
            if timestamp_str:
                dt = datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))
                return dt.isoformat()
            return datetime.utcnow().isoformat()
        except Exception:
            return datetime.utcnow().isoformat()
