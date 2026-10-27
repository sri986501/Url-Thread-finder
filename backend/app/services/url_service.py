import re
import ipaddress
from urllib.parse import urlparse, urlunparse

class URLValidationError(Exception):
    def __init__(self, message: str, code: str = "INVALID_URL"):
        super().__init__(message)
        self.message = message
        self.code = code

class URLService:
    DISALLOWED_SCHEMES = {"javascript", "data", "file", "ftp", "ldap", "dict", "gopher", "mailto"}
    ALLOWED_SCHEMES = {"http", "https"}
    
    # Private / local IP ranges for SSRF prevention
    PRIVATE_NETWORKS = [
        ipaddress.ip_network("127.0.0.0/8"),
        ipaddress.ip_network("10.0.0.0/8"),
        ipaddress.ip_network("172.16.0.0/12"),
        ipaddress.ip_network("192.168.0.0/16"),
        ipaddress.ip_network("169.254.0.0/16"),  # Link-local / Cloud metadata (169.254.169.254)
        ipaddress.ip_network("::1/128"),
        ipaddress.ip_network("fc00::/7"),
        ipaddress.ip_network("fe80::/10"),
    ]

    @classmethod
    def validate_and_normalize(cls, raw_url: str) -> str:
        if not raw_url or not isinstance(raw_url, str):
            raise URLValidationError("URL cannot be empty.", "EMPTY_URL")

        cleaned = raw_url.strip()
        if len(cleaned) > 2048:
            raise URLValidationError("URL exceeds maximum length of 2048 characters.", "URL_TOO_LONG")

        # Check for disallowed schemes early
        for bad_scheme in cls.DISALLOWED_SCHEMES:
            if cleaned.lower().startswith(f"{bad_scheme}:"):
                raise URLValidationError(f"Protocol '{bad_scheme}:' is not permitted for security analysis.", "FORBIDDEN_PROTOCOL")

        # Auto-prepend https:// if missing scheme
        if not re.match(r"^[a-zA-Z][a-zA-Z0-9+.-]*://", cleaned):
            cleaned = "https://" + cleaned

        try:
            parsed = urlparse(cleaned)
        except Exception as e:
            raise URLValidationError(f"Malformed URL: {str(e)}", "MALFORMED_URL")

        scheme = parsed.scheme.lower()
        if scheme not in cls.ALLOWED_SCHEMES:
            raise URLValidationError(f"Unsupported protocol '{scheme}'. Only HTTP and HTTPS are permitted.", "UNSUPPORTED_PROTOCOL")

        hostname = parsed.hostname
        if not hostname:
            raise URLValidationError("URL must include a valid hostname.", "MISSING_HOSTNAME")

        hostname = hostname.lower()

        # SSRF Check: Check if hostname is a private/local IP or localhost
        if hostname == "localhost" or hostname.endswith(".localhost") or hostname.endswith(".local"):
            raise URLValidationError("Scanning localhost or local network destinations is blocked for security.", "SSRF_BLOCKED")

        try:
            ip = ipaddress.ip_address(hostname)
            for network in cls.PRIVATE_NETWORKS:
                if ip in network:
                    raise URLValidationError("Scanning private, loopback, or cloud-metadata IP addresses is blocked.", "SSRF_BLOCKED")
        except ValueError:
            # Hostname is a domain name, not a raw IP address
            pass

        # Normalize components
        path = parsed.path or "/"
        # Ensure path begins with /
        if not path.startswith("/"):
            path = "/" + path

        normalized = urlunparse((
            scheme,
            parsed.netloc.lower(),
            path,
            parsed.params,
            parsed.query,
            parsed.fragment
        ))

        return normalized

url_service = URLService()
