"""
FitTrack Pro — Gmail API mailer
Send emails from fittrackpro.noreply@gmail.com via the Google Gmail REST API
over HTTPS (port 443). Render blocks outbound SMTP (25/465/587), but 443 works,
so this is the reliable production path for sending as the normal Gmail account.

Requires env vars:
  GMAIL_CLIENT_ID      — Google Cloud OAuth Client ID
  GMAIL_CLIENT_SECRET  — Google Cloud OAuth Client Secret
  GMAIL_REFRESH_TOKEN  — one-time refresh token (see get_gmail_refresh_token.py)
"""

import base64
import json
import logging
import os
import urllib.parse
import urllib.request

from email.message import EmailMessage

logger = logging.getLogger("store.email")

TOKEN_URL = "https://oauth2.googleapis.com/token"
GMAIL_SEND_URL = "https://gmail.googleapis.com/gmail/v1/users/me/messages/send"

DEFAULT_FROM = "FitTrack Pro <fittrackpro.noreply@gmail.com>"


def _gmail_creds():
    return (
        os.environ.get("GMAIL_CLIENT_ID", "").strip(),
        os.environ.get("GMAIL_CLIENT_SECRET", "").strip(),
        os.environ.get("GMAIL_REFRESH_TOKEN", "").strip(),
    )


def gmail_api_configured():
    client_id, client_secret, refresh_token = _gmail_creds()
    return bool(client_id and client_secret and refresh_token)


def _refresh_access_token(client_id, client_secret, refresh_token):
    """Exchange the refresh token for a fresh access token."""
    body = urllib.parse.urlencode(
        {
            "client_id": client_id,
            "client_secret": client_secret,
            "refresh_token": refresh_token,
            "grant_type": "refresh_token",
        }
    ).encode("utf-8")
    req = urllib.request.Request(TOKEN_URL, data=body, method="POST")
    with urllib.request.urlopen(req, timeout=20) as resp:
        data = json.loads(resp.read().decode("utf-8"))
    token = data.get("access_token")
    if not token:
        raise RuntimeError(f"OAuth token response missing access_token: {data}")
    return token


def _send_raw(access_token, raw):
    payload = json.dumps({"raw": raw}).encode("utf-8")
    req = urllib.request.Request(
        GMAIL_SEND_URL,
        data=payload,
        headers={
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=25) as resp:
        body = resp.read().decode("utf-8")
        logger.info(f"Gmail API send response {resp.status}: {body}")
        return resp.status == 200


def send_gmail_api(subject, html, to_list, from_email=None, text_body=""):
    """
    Send a HTML email as <from_email> via the Gmail API.
    Returns True on success, False otherwise.
    """
    try:
        client_id, client_secret, refresh_token = _gmail_creds()
        if not (client_id and client_secret and refresh_token):
            logger.warning("Gmail API credentials not configured")
            return False

        from_addr = from_email or DEFAULT_FROM

        msg = EmailMessage()
        msg["From"] = from_addr
        msg["To"] = ", ".join(to_list)
        msg["Subject"] = subject
        msg.set_content(text_body or "Please view this email in a HTML-capable client.")
        msg.add_alternative(html, subtype="html")

        raw = base64.urlsafe_b64encode(msg.as_bytes()).decode("ascii")

        # Try with an existing access token; on 401/403 refresh and retry once.
        try:
            token = _refresh_access_token(client_id, client_secret, refresh_token)
            if _send_raw(token, raw):
                return True
        except Exception as e:
            logger.warning(f"Gmail API first attempt failed: {e}")

        # Second attempt with a freshly refreshed token (handles expiry race).
        try:
            token = _refresh_access_token(client_id, client_secret, refresh_token)
            return _send_raw(token, raw)
        except Exception as e:
            logger.error(f"Gmail API send failed: {e}")
            return False
    except Exception as e:
        logger.error(f"Gmail API send error: {e}")
        return False