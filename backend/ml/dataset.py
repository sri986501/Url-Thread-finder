import pandas as pd
import numpy as np
from typing import Tuple, Dict, Any, List

def generate_benchmark_dataset() -> pd.DataFrame:
    """
    Generates a realistic, diverse dataset of legitimate and phishing URLs
    for benchmark model training and cross-validation evaluation.
    """
    legitimate_urls = [
        "https://www.google.com/search?q=cybersecurity+research",
        "https://github.com/torvalds/linux/commit/8e7e1f",
        "https://en.wikipedia.org/wiki/Phishing",
        "https://www.microsoft.com/en-us/security/business",
        "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers",
        "https://www.amazon.com/dp/B08N5WRWNW",
        "https://stackoverflow.com/questions/52187559/fastapi-with-pydantic",
        "https://www.nytimes.com/section/technology",
        "https://apple.com/iphone-15-pro/specs/",
        "https://news.ycombinator.com/item?id=38910231",
        "https://www.linkedin.com/in/security-engineer-sample",
        "https://docs.python.org/3/library/urllib.parse.html",
        "https://www.cloudflare.com/learning/security/threats/phishing/",
        "https://www.reddit.com/r/netsec/",
        "https://www.mit.edu/research/",
        "https://www.stanford.edu/academics/",
        "https://aws.amazon.com/ec2/instance-types/",
        "https://netflix.com/browse/genre/83",
        "https://slack.com/pricing",
        "https://spotify.com/us/premium/",
        "https://paypal.com/us/home",
        "https://dropbox.com/business",
        "https://hub.docker.com/_/python",
        "https://pypi.org/project/fastapi/",
        "https://fastapi.tiangolo.com/tutorial/first-steps/",
        "https://scikit-learn.org/stable/modules/ensemble.html",
        "https://bbc.com/news/world",
        "https://medium.com/@infosec/modern-threat-detection",
        "https://cnn.com/world",
        "https://quora.com/topic/Computer-Security",
        "https://vimeo.com/channels/staffpicks",
        "https://gitlab.com/gitlab-org/gitlab",
        "https://khanacademy.org/math",
        "https://coursera.org/learn/machine-learning",
        "https://kaggle.com/datasets",
        "https://nature.com/articles/s41586-024-00123-x",
        "https://arxiv.org/abs/2301.00001",
        "https://bloomberg.com/markets",
        "https://reuters.com/business",
        "https://techcrunch.com/startups/",
        "https://openai.com/research/overview",
        "https://anthropic.com/claude",
        "https://stripe.com/docs/api",
        "https://zoom.us/join",
        "https://salesforce.com/products/platform/overview/",
        "https://shopify.com/online-store",
        "https://wordpress.org/plugins/",
        "https://w3.org/Protocols/",
        "http://info.cern.ch/hypertext/WWW/TheProject.html",
        "http://example.com/index.html",
        "http://httpbin.org/get?user=test",
        "http://legacy-documentation.org/manual/v1.0/intro.html",
        "http://archive.ubuntu.com/ubuntu/dists/",
        "https://apache.org/licenses/LICENSE-2.0",
        "https://kernel.org/pub/linux/kernel/"
    ]

    # Additional legit URLs variations
    for i in range(1, 41):
        legitimate_urls.append(f"https://service-{i}.internal-docs.organization.net/wiki/page?id={i}&tab=overview")
        legitimate_urls.append(f"http://portal.university-academics.edu/courses/syllabus/2026/course-{i}.html")
        legitimate_urls.append(f"https://cdn.enterprise-cloud.org/assets/v{i}.0/style.min.css?cache=bust{i}")

    phishing_urls = [
        "https://paypal-security-verification-alert.account-update.xyz/login.php?client_id=892",
        "http://192.168.1.104/secure-banking/chase/sign_in.htm?auth=token87123",
        "https://appleid.apple.com.manage-security-checkpoint.top/verify?session=98a7sd",
        "https://wellsfargo.account-billing-alert.club/signin/account_id=98712",
        "http://netflix-billing-update-suspicious.buzz/update-payment-info.php",
        "https://microsoft-outlook-office365-verify.com-login-portal.work/login.aspx",
        "https://secure-login-bankofamerica.cf/verify-identity.html?id=23891",
        "http://instagram-copyright-infringement-appeal.ga/verify-account.php",
        "https://coinbase-wallet-security-recovery.icu/claim-airdrop/?phrase=backup",
        "https://metamask-io.wallet-validation-portal.racing/seed-recovery/",
        "http://amazon-prime-account-suspended.date/resolve-billing?ref=mail",
        "https://dhl-express-package-redelivery-fee.top/track/payment.php?tracking=9812",
        "https://usps-tracking-package-address-confirm.xyz/redelivery/confirm.jsp",
        "http://172.67.18.91/webscr?cmd=_login-run&dispatch=5885d80a13c0db1f",
        "https://secure.account-update.google.com.user-auth-checker.stream/login",
        "https://binance-kyc-verification-center.loan/auth/two-factor?code=verify",
        "http://facebook-security-checkup-checkpoint.kim/confirm-identity.php",
        "http://ebayisapi.dll-sign-in-ssl-session.men/ws/eBayISAPI.dll",
        "https://chase-bank-online-alert-notice.cf/auth/verify_credentials.php",
        "https://steamcommunity-trade-giftcard-bonus.xyz/claim-free-skins/",
        "http://adobe-document-cloud-pdf-view.top/shared-file/login.html",
        "https://chase-online-access-locked-update.icu/auth/login.htm",
        "https://citi-cards-fraud-prevention-alert.buzz/verify?ref=sms_alert",
        "http://fedex-express-delivery-hold.gq/pay-customs-fee.php",
        "https://irs-tax-refund-portal-claim.loan/direct-deposit-update/"
    ]

    # Additional phishing URL variations with realistic spoofing mechanisms
    for i in range(1, 41):
        scheme = "https" if i % 2 == 0 else "http"
        phishing_urls.append(f"{scheme}://secure-login-{i}.bank-auth-verify.xyz/account/login?token={i}&step=verify_password")
        phishing_urls.append(f"{scheme}://portal-{i}.apple-id-cloud-checkpoint.top/auth/credentials.php?session_id=fake{i * 99}")
        phishing_urls.append(f"http://185.193.12.{i % 250}/webscr/login?cmd=_express-checkout&id={i}")

    data = []
    for u in legitimate_urls:
        data.append({"url": u, "label": 0})
    for u in phishing_urls:
        data.append({"url": u, "label": 1})

    df = pd.DataFrame(data)
    # Shuffle
    df = df.sample(frac=1.0, random_state=42).reset_index(drop=True)
    return df

def validate_dataset(df: pd.DataFrame, label_map: Dict[Any, int] = None) -> pd.DataFrame:
    """
    Validates dataset format (Section 7), removes duplicates, handles missing values,
    and maps labels to 0 (legitimate) and 1 (phishing).
    """
    if "url" not in df.columns or "label" not in df.columns:
        raise ValueError("Dataset must contain 'url' and 'label' columns.")

    cleaned = df.dropna(subset=["url", "label"]).copy()
    cleaned["url"] = cleaned["url"].astype(str).str.strip()
    cleaned = cleaned[cleaned["url"].str.len() > 3]
    cleaned = cleaned.drop_duplicates(subset=["url"])

    if label_map:
        cleaned["label"] = cleaned["label"].map(label_map)
    else:
        cleaned["label"] = cleaned["label"].astype(int)

    # Validate label domain is {0, 1}
    valid_labels = {0, 1}
    if not set(cleaned["label"].unique()).issubset(valid_labels):
        raise ValueError(f"Dataset labels after mapping must be 0 (legitimate) or 1 (phishing). Found: {cleaned['label'].unique()}")

    return cleaned
