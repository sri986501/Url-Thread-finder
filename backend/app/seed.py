import os
import sys

backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.db.database import SessionLocal, Base, engine
from app.db.models import User, Scan
from app.core.security import hash_password
from app.api.scans import create_scan, ScanRequest
from starlette.requests import Request
import asyncio

sample_urls = [
    # Phishing / High Risk
    "http://paypal-security-verification-alert.account-update.xyz/login.php?client_id=892",
    "http://192.168.1.104/secure-banking/chase/sign_in.htm?auth=token87123",
    "https://appleid.apple.com.manage-security-checkpoint.top/verify?session=98a7sd",
    "https://wellsfargo.account-billing-alert.club/signin/account_id=98712",
    "http://netflix-billing-update-suspicious.buzz/update-payment-info.php",
    "https://microsoft-outlook-office365-verify.com-login-portal.work/login.aspx",
    "https://secure-login-bankofamerica.cf/verify-identity.html?id=23891",
    "https://coinbase-wallet-security-recovery.icu/claim-airdrop/?phrase=backup",
    "https://metamask-io.wallet-validation-portal.racing/seed-recovery/",
    "https://dhl-express-package-redelivery-fee.top/track/payment.php?tracking=9812",
    "https://usps-tracking-package-address-confirm.xyz/redelivery/confirm.jsp",
    "http://172.67.18.91/webscr?cmd=_login-run&dispatch=5885d80a13c0db1f",
    "https://binance-kyc-verification-center.loan/auth/two-factor?code=verify",
    "https://chase-bank-online-alert-notice.cf/auth/verify_credentials.php",
    # Legitimate / Safe
    "https://www.google.com/search?q=cybersecurity+research",
    "https://github.com/torvalds/linux/commit/8e7e1f",
    "https://en.wikipedia.org/wiki/Phishing",
    "https://www.microsoft.com/en-us/security/business",
    "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers",
    "https://www.amazon.com/dp/B08N5WRWNW",
    "https://stackoverflow.com/questions/52187559/fastapi-with-pydantic",
    "https://apple.com/iphone-15-pro/specs/",
    "https://docs.python.org/3/library/urllib.parse.html",
    "https://www.cloudflare.com/learning/security/threats/phishing/",
    "https://aws.amazon.com/ec2/instance-types/",
    "https://slack.com/pricing",
    "https://spotify.com/us/premium/",
    "https://stripe.com/docs/api"
]

async def seed_data():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Check if already seeded
        existing_count = db.query(Scan).count()
        if existing_count >= 10:
            print(f"Database already contains {existing_count} scans. Skipping seeding.")
            return

        # Seed admin
        admin = db.query(User).filter(User.email == "admin@phishguard.ai").first()
        if not admin:
            admin = User(
                name="Security Administrator",
                email="admin@phishguard.ai",
                password_hash=hash_password("AdminSecurePass2026!"),
                role="ADMIN"
            )
            db.add(admin)
            db.commit()
            db.refresh(admin)

        # Mock request object for create_scan
        scope = {"type": "http", "client": ("127.0.0.1", 12345)}
        mock_req = Request(scope)

        print(f"Seeding {len(sample_urls)} realistic scans into PhishGuard AI database...")
        for url in sample_urls:
            try:
                await create_scan(ScanRequest(url=url), mock_req, db, admin)
                print(f"  [+] Scanned and saved: {url}")
            except Exception as e:
                print(f"  [-] Error scanning {url}: {e}")

        total = db.query(Scan).count()
        print(f"\nDatabase successfully seeded with {total} initial scans.")
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(seed_data())
