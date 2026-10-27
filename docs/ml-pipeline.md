# PhishGuard AI — Machine Learning Pipeline

## 1. Ground-Truth Dataset
The dataset pipeline (`ml/dataset.py`) validates ground-truth URLs representing both legitimate web portals (enterprise, educational, documentation, high-traffic SaaS) and deceptive phishing targets (credential harvesting portals, IP hosts, homoglyphs, and disposable TLDs).

Dataset requirements:
- Validated columns: `url`, `label`
- Dynamic label mapping support (0 = legitimate, 1 = phishing)
- Deduplication and protocol normalization

## 2. Feature Vector (26 Features)
1. `url_length`: Overall character length
2. `domain_length`: Hostname length
3. `path_length`: Length of URI path
4. `query_length`: Query string length
5. `fragment_length`: URL fragment length
6. `digit_count`: Count of numerical digits
7. `letter_count`: Count of alphabetical characters
8. `special_character_count`: Non-alphanumeric character count
9. `dot_count`: Count of '.' delimiters
10. `hyphen_count`: Count of '-' delimiters
11. `underscore_count`: Count of '_' characters
12. `slash_count`: Count of '/' characters
13. `question_mark_count`: Query delimiter count
14. `equals_count`: Assignment count in query parameters
15. `ampersand_count`: Argument separator count
16. `percent_count`: URL encoding density
17. `at_count`: Embedded '@' authentication delimiter
18. `subdomain_count`: Count of DNS subdomain levels
19. `query_param_count`: Number of parsed URL query keys
20. `url_entropy`: Shannon character randomness
21. `has_ip`: Binary flag for raw IPv4/IPv6 destination
22. `has_https`: Binary flag for TLS transport
23. `has_punycode`: Homoglyph/IDN presence (`xn--`)
24. `is_shortened`: Known shortener domain usage
25. `suspicious_keyword_count`: Match count against credential/financial keywords
26. `suspicious_tld`: Match flag for bulk disposable TLDs

## 3. Model Training & Comparison
Candidate models trained under 80/20 stratified split:
1. **Logistic Regression**: Linear baseline with `StandardScaler`
2. **Random Forest**: 100 decision trees (`max_depth=10`)
3. **XGBoost (Champion)**: Gradient boosting with 120 estimators, `learning_rate=0.08`, and tree explainability.

## 4. Evaluation Outputs
Real evaluation outputs are stored in `backend/ml/artifacts/metrics.json` and surfaced directly in the Analytics UI.
