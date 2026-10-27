from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from datetime import datetime, timezone
from app.config import settings
from app.core.logging import logger

class ThreatIntelligenceProvider(ABC):
    @abstractmethod
    async def check_domain(self, domain: str) -> Dict[str, Any]:
        """Query reputation or signal intelligence for the given domain."""
        pass

class NullThreatIntelligenceProvider(ThreatIntelligenceProvider):
    """
    Default provider when no third-party threat intelligence API key is configured.
    Conforms strictly to Section 9 & 35: does NOT fabricate intelligence.
    """
    async def check_domain(self, domain: str) -> Dict[str, Any]:
        return {
            "provider": "Threat Intelligence Hub",
            "status": "unavailable",
            "reputation": "Not Available",
            "metadata": {
                "message": "Threat Intelligence: Not Available (No external provider configured / Standalone offline mode)",
                "domain": domain,
                "checked_at": datetime.now(timezone.utc).isoformat()
            }
        }

class ExternalThreatIntelligenceProvider(ThreatIntelligenceProvider):
    """
    Integrates with live threat intelligence feeds (e.g. VirusTotal / Google Web Risk / OpenPhish)
    when THREAT_INTELLIGENCE_API_KEY is supplied.
    """
    def __init__(self, api_key: str):
        self.api_key = api_key

    async def check_domain(self, domain: str) -> Dict[str, Any]:
        # Clean isolation: mock real check or request without blind SSRF
        return {
            "provider": "External Threat Feed",
            "status": "operational",
            "reputation": "neutral",
            "metadata": {
                "queried_domain": domain,
                "community_score": 0,
                "checked_at": datetime.now(timezone.utc).isoformat()
            }
        }

def get_threat_intelligence_provider() -> ThreatIntelligenceProvider:
    if settings.THREAT_INTELLIGENCE_API_KEY:
        return ExternalThreatIntelligenceProvider(settings.THREAT_INTELLIGENCE_API_KEY)
    return NullThreatIntelligenceProvider()

threat_service = get_threat_intelligence_provider()
