"""
FitTrack Pro — EmailJS mailer
Sends email via the EmailJS REST API over HTTPS (port 443). EmailJS connects
the user's Gmail (e.g. fittrackpro.noreply@gmail.com) through their own OAuth
bridge, so the mail genuinely comes from that Gmail account — no Google Cloud
setup needed.

Render blocks outbound SMTP (25/465/587), but 443 works, so the EmailJS HTTPS
API is a reliable production path.

Requires env vars:
  EMAILJS_PUBLIC_KEY  — EmailJS "API/Public Key" (aka user_id)
  EMAILJS_SERVICE_ID  — email service ID (connected Gmail)
  EMAILJS_TEMPLATE_ID — password reset template ID
  EMAILJS_PRIVATE_KEY — optional; needed if "Use Private Key (recommended)" is
                        enabled in EmailJS Account > Security (sent as accessToken)
"""

import json
import logging
import os
import urllib.request

logger = logging.getLogger("store.email")

EMAILJS_SEND_URL = "https://api.emailjs.com/api/v1.0/email/send"


def emailjs_configured():
    return bool(
        os.environ.get("EMAILJS_PUBLIC_KEY", "").strip()
        and os.environ.get("EMAILJS_SERVICE_ID", "").strip()
        and os.environ.get("EMAILJS_TEMPLATE_ID", "").strip()
    )


def send_via_emailjs(template_params, template_id=None):
    """
    Send an EmailJS template.
    template_params: dict passed into the EmailJS template (e.g. reset_url,
    user_name, user_email, subject).
    Returns True on success, False otherwise.
    """
    try:
        public_key = os.environ.get("EMAILJS_PUBLIC_KEY", "").strip()
        service_id = os.environ.get("EMAILJS_SERVICE_ID", "").strip()
        template_id = template_id or os.environ.get("EMAILJS_TEMPLATE_ID", "").strip()
        private_key = os.environ.get("EMAILJS_PRIVATE_KEY", "").strip()
        if not (public_key and service_id and template_id):
            logger.warning("EmailJS credentials not configured")
            return False

        payload = {
            "service_id": service_id,
            "template_id": template_id,
            "user_id": public_key,
            "template_params": template_params,
        }
        if private_key:
            payload["accessToken"] = private_key

        req = urllib.request.Request(
            EMAILJS_SEND_URL,
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Content-Type": "application/json",
                # EmailJS API Cloudflare ke peeche hai; default urllib UA (Python-urllib)
                # blocked hota hai (403 error code: 1010). Browser-like UA zaroori hai.
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
            },
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=25) as resp:
            body = resp.read().decode("utf-8")
            logger.info(f"EmailJS send response {resp.status}: {body}")
            return resp.status == 200
    except Exception as e:
        logger.error(f"EmailJS send error: {e}")
        return False