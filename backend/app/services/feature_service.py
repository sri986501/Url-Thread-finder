import math
import re
import ipaddress
from collections import Counter
from urllib.parse import urlparse, parse_qs
from typing import Dict, Any, List, Tuple
import tldextract

class FeatureService:
    SUSPICIOUS_KEYWORDS = [
        "login", "signin", "verify", "verification", "account", "secure",
        "security", "update", "password", "credential", "bank", "payment",
        "wallet", "invoice", "confirm", "authentication", "support",
        "billing", "recover", "webscr", "ebayisapi", "banking", "free",
        "bonus", "gift", "prize", "authorize", "reset"
    ]

    SHORTENING_DOMAINS = {
        "bit.ly", "tinyurl.com", "t.co", "goo.gl", "is.gd", "buff.ly",
        "ow.ly", "rebrand.ly", "cutt.ly", "shorturl.at", "tiny.cc",
        "rb.gy", "bl.ink", "lnkd.in"
    }

    SUSPICIOUS_TLDS = {
        "xyz", "top", "buzz", "club", "work", "loan", "tk", "ml", "ga",
        "cf", "gq", "icu", "cam", "fit", "surf", "date", "racing", "kim",
        "country", "men", "stream", "download"
    }

    @staticmethod
    def calculate_entropy(text: str) -> float:
        if not text:
            return 0.0
        counts = Counter(text)
        length = len(text)
        return -sum((count / length) * math.log2(count / length) for count in counts.values())

    @classmethod
    def extract_features(cls, normalized_url: str) -> Dict[str, Any]:
        parsed = urlparse(normalized_url)
        extracted = tldextract.extract(normalized_url)
        
        hostname = parsed.hostname or ""
        path = parsed.path or ""
        query = parsed.query or ""
        fragment = parsed.fragment or ""
        
        # Check IP address
        has_ip = False
        try:
            ipaddress.ip_address(hostname)
            has_ip = True
        except ValueError:
            has_ip = False

        # Character counts on full URL
        digit_count = sum(c.isdigit() for c in normalized_url)
        letter_count = sum(c.isalpha() for c in normalized_url)
        special_char_count = sum(not c.isalnum() for c in normalized_url)

        # Delimiter counts
        dot_count = normalized_url.count(".")
        hyphen_count = normalized_url.count("-")
        underscore_count = normalized_url.count("_")
        slash_count = normalized_url.count("/")
        question_count = normalized_url.count("?")
        equals_count = normalized_url.count("=")
        amp_count = normalized_url.count("&")
        percent_count = normalized_url.count("%")
        at_count = normalized_url.count("@")

        # Subdomain count
        subdomains = [s for s in extracted.subdomain.split(".") if s]
        subdomain_count = len(subdomains)

        # Query param count
        query_params = parse_qs(query)
        query_param_count = len(query_params)

        # Advanced signals
        url_entropy = cls.calculate_entropy(normalized_url)
        has_https = parsed.scheme.lower() == "https"
        has_punycode = "xn--" in hostname
        
        registered_domain = f"{extracted.domain}.{extracted.suffix}".lower() if extracted.domain and extracted.suffix else hostname
        is_shortened = registered_domain in cls.SHORTENING_DOMAINS or hostname in cls.SHORTENING_DOMAINS
        
        # Suspicious keywords
        lower_url = normalized_url.lower()
        found_keywords = [kw for kw in cls.SUSPICIOUS_KEYWORDS if kw in lower_url]
        suspicious_keyword_count = len(found_keywords)
        
        suffix_clean = extracted.suffix.lower()
        suspicious_tld = suffix_clean in cls.SUSPICIOUS_TLDS

        features = {
            "url_length": len(normalized_url),
            "domain_length": len(hostname),
            "path_length": len(path),
            "query_length": len(query),
            "fragment_length": len(fragment),
            "digit_count": digit_count,
            "letter_count": letter_count,
            "special_character_count": special_char_count,
            "dot_count": dot_count,
            "hyphen_count": hyphen_count,
            "underscore_count": underscore_count,
            "slash_count": slash_count,
            "question_mark_count": question_count,
            "equals_count": equals_count,
            "ampersand_count": amp_count,
            "percent_count": percent_count,
            "at_count": at_count,
            "subdomain_count": subdomain_count,
            "query_param_count": query_param_count,
            "url_entropy": round(url_entropy, 4),
            "has_ip": has_ip,
            "has_https": has_https,
            "has_punycode": has_punycode,
            "is_shortened": is_shortened,
            "suspicious_keyword_count": suspicious_keyword_count,
            "suspicious_tld": suspicious_tld,
            "_found_keywords": found_keywords,
            "_hostname": hostname,
            "_tld": suffix_clean
        }

        return features

    @classmethod
    def get_feature_vector(cls, features: Dict[str, Any]) -> List[float]:
        """Convert extracted feature dict to the ordered numeric feature vector used for ML training/inference."""
        return [
            float(features["url_length"]),
            float(features["domain_length"]),
            float(features["path_length"]),
            float(features["query_length"]),
            float(features["fragment_length"]),
            float(features["digit_count"]),
            float(features["letter_count"]),
            float(features["special_character_count"]),
            float(features["dot_count"]),
            float(features["hyphen_count"]),
            float(features["underscore_count"]),
            float(features["slash_count"]),
            float(features["question_mark_count"]),
            float(features["equals_count"]),
            float(features["ampersand_count"]),
            float(features["percent_count"]),
            float(features["at_count"]),
            float(features["subdomain_count"]),
            float(features["query_param_count"]),
            float(features["url_entropy"]),
            1.0 if features["has_ip"] else 0.0,
            1.0 if features["has_https"] else 0.0,
            1.0 if features["has_punycode"] else 0.0,
            1.0 if features["is_shortened"] else 0.0,
            float(features["suspicious_keyword_count"]),
            1.0 if features["suspicious_tld"] else 0.0
        ]

    @classmethod
    def get_feature_names(cls) -> List[str]:
        return [
            "url_length",
            "domain_length",
            "path_length",
            "query_length",
            "fragment_length",
            "digit_count",
            "letter_count",
            "special_character_count",
            "dot_count",
            "hyphen_count",
            "underscore_count",
            "slash_count",
            "question_mark_count",
            "equals_count",
            "ampersand_count",
            "percent_count",
            "at_count",
            "subdomain_count",
            "query_param_count",
            "url_entropy",
            "has_ip",
            "has_https",
            "has_punycode",
            "is_shortened",
            "suspicious_keyword_count",
            "suspicious_tld"
        ]

    @classmethod
    def explain_feature_evidence(cls, features: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Human-readable evidence generator (Section 13)"""
        evidence = []
        
        if features.get("has_ip"):
            evidence.append({
                "title": "Raw IP Hostname",
                "severity": "CRITICAL",
                "description": "The destination URL directly uses an IP address instead of a verified domain name.",
                "impact_score": 30.0
            })

        if features.get("at_count", 0) > 0:
            evidence.append({
                "title": "Embedded Authentication Delimiter (@)",
                "severity": "HIGH",
                "description": "Contains an '@' symbol, a common tactic used to mask the actual target destination.",
                "impact_score": 25.0
            })

        if features.get("suspicious_keyword_count", 0) > 0:
            kws = ", ".join(f"'{k}'" for k in features.get("_found_keywords", [])[:4])
            severity = "HIGH" if features["suspicious_keyword_count"] >= 2 else "MEDIUM"
            evidence.append({
                "title": "Authentication & Financial Keywords",
                "severity": severity,
                "description": f"URL contains sensitive targeting keywords: {kws}.",
                "impact_score": min(25.0, features["suspicious_keyword_count"] * 10.0)
            })

        if features.get("subdomain_count", 0) >= 3:
            evidence.append({
                "title": "Excessive Subdomains",
                "severity": "HIGH",
                "description": f"URL exhibits {features['subdomain_count']} subdomains, frequently seen in domain spoofing and bulletproof hosting.",
                "impact_score": 15.0
            })

        if features.get("is_shortened"):
            evidence.append({
                "title": "URL Shortener Detected",
                "severity": "MEDIUM",
                "description": "Uses a redirection service that conceals the ultimate destination.",
                "impact_score": 15.0
            })

        if features.get("suspicious_tld"):
            evidence.append({
                "title": "High-Risk Top Level Domain (TLD)",
                "severity": "MEDIUM",
                "description": f"The domain uses .{features.get('_tld')}, a TLD statistically linked with bulk disposable registration.",
                "impact_score": 12.0
            })

        if features.get("url_entropy", 0) > 4.6:
            evidence.append({
                "title": "High Character Randomness (Entropy)",
                "severity": "MEDIUM",
                "description": f"Shannon entropy of {features['url_entropy']} suggests algorithmically generated domains or obfuscated paths.",
                "impact_score": 10.0
            })

        if not features.get("has_https"):
            evidence.append({
                "title": "Unencrypted Transport (HTTP)",
                "severity": "LOW",
                "description": "Transmits data unencrypted without SSL/TLS certificate protection.",
                "impact_score": 8.0
            })

        if features.get("url_length", 0) > 85:
            evidence.append({
                "title": "Abnormally Long URL",
                "severity": "LOW",
                "description": f"Length of {features['url_length']} characters exceeds standard navigation link patterns.",
                "impact_score": 6.0
            })

        return evidence

feature_service = FeatureService()
