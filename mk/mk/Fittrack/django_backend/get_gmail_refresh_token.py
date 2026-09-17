"""
FitTrack Pro — Gmail OAuth refresh token helper

Ek baar chalao, fittrackpro.noreply@gmail.com ko authorize karo, aur printed
refresh token Render Dashboard me GMAIL_REFRESH_TOKEN env var me daal do.

Pehle Google Cloud console me:
  1. Project banao ya select karo
  2. "APIs & Services > Library" -> "Gmail API" -> Enable
  3. "APIs & Services > OAuth consent screen" -> External -> fill app name + apna
     email (save).
  4. "APIs & Services > Credentials" -> "Create Credentials > OAuth client ID"
     -> Application type: "Web application"
     -> Authorized redirect URIs me add karo:  http://127.0.0.1:8765/oauth2callback
  5. Created client ke "Download JSON" ya copy client_id + client_secret.

Run:
  set GMAIL_CLIENT_ID=....json-secret-j...
  set GMAIL_CLIENT_SECRET=GOOGOA_...
  python get_gmail_refresh_token.py

Ya:
  python get_gmail_refresh_token.py --client-id XXX --client-secret YYY
"""

import argparse
import base64
import json
import os
import sys
import threading
import time
import urllib.parse
import urllib.request
import webbrowser
from http.server import BaseHTTPRequestHandler, HTTPServer

PORT = 8765
REDIRECT_URI = f"http://127.0.0.1:{PORT}/oauth2callback"
SCOPES = "https://www.googleapis.com/auth/gmail.send"
TOKEN_URL = "https://oauth2.googleapis.com/token"
AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"

captured_code = {"code": None}


def load_dotenv():
    """Minimal .env parser (same dir ya parent dir) — bech ke inline daalna bhi chalega."""
    for path in (".env", os.path.join(os.path.dirname(__file__), ".env")):
        if not os.path.exists(path):
            continue
        with open(path, "r", encoding="utf-8") as fh:
            for line in fh:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                key, _, value = line.partition("=")
                key = key.strip()
                value = value.strip().strip('"').strip("'")
                if value and key not in os.environ:
                    os.environ[key] = value


def exchange_code_for_tokens(client_id, client_secret, code):
    body = urllib.parse.urlencode(
        {
            "client_id": client_id,
            "client_secret": client_secret,
            "code": code,
            "redirect_uri": REDIRECT_URI,
            "grant_type": "authorization_code",
        }
    ).encode("utf-8")
    req = urllib.request.Request(TOKEN_URL, data=body, method="POST")
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8"))


def main():
    parser = argparse.ArgumentParser(description="Gmail OAuth refresh token helper")
    parser.add_argument("--client-id", default=os.environ.get("GMAIL_CLIENT_ID", ""))
    parser.add_argument("--client-secret", default=os.environ.get("GMAIL_CLIENT_SECRET", ""))
    args = parser.parse_args()

    load_dotenv()
    client_id = args.client_id or os.environ.get("GMAIL_CLIENT_ID", "")
    client_secret = args.client_secret or os.environ.get("GMAIL_CLIENT_SECRET", "")

    if not (client_id and client_secret):
        print("ERROR: GMAIL_CLIENT_ID / GMAIL_CLIENT_SECRET zaroori hain.")
        print("Use --client-id / --client-secret, ya env vars set karke chalao.")
        sys.exit(1)

    class Handler(BaseHTTPRequestHandler):
        def do_GET(self):
            parsed = urllib.parse.urlparse(self.path)
            if parsed.path != "/oauth2callback":
                self.send_response(404)
                self.end_headers()
                return
            query = urllib.parse.parse_qs(parsed.query)
            if "error" in query:
                message = f"Authorization failed: {query['error'][0]}"
            else:
                captured_code["code"] = query.get("code", [None])[0]
                message = "Authorization successful! Ab is window ko band kar sakte ho."
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            self.wfile.write(f"<h3>{message}</h3>".encode("utf-8"))

        def log_message(self, *args):
            pass

    server = HTTPServer(("127.0.0.1", PORT), Handler)
    threading.Thread(target=server.serve_forever, daemon=True).start()

    params = urllib.parse.urlencode(
        {
            "client_id": client_id,
            "redirect_uri": REDIRECT_URI,
            "response_type": "code",
            "scope": SCOPES,
            "access_type": "offline",
            "prompt": "consent",
        }
    )
    auth_url = f"{AUTH_URL}?{params}"
    print("Apni browser me yeh URL khulega (fittrackpro.noreply@gmail.com se sign in karna):")
    print()
    print(auth_url)
    print()
    try:
        webbrowser.open(auth_url)
    except Exception:
        pass
    print("Authorize karne ke baad is script ko chhod do...")

    try:
        while captured_code["code"] is None:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nCancelled.")
        sys.exit(1)
    finally:
        server.shutdown()

    tokens = exchange_code_for_tokens(client_id, client_secret, captured_code["code"])
    refresh_token = tokens.get("refresh_token", "")
    access_token = tokens.get("access_token", "")
    if not refresh_token:
        print("ERROR: refresh_token nahi mila. Response:")
        print(json.dumps(tokens, indent=2))
        print("\nTip: OAuth consent screen par External mode me 'Test user' add karna padega,")
        print("aur refresh token abhi bhi na aaye to Google Cloud me apps ka publish/verify karke dekho.")
        sys.exit(1)

    print()
    print("=" * 60)
    print("ENV VARIABLES:")
    print(f'GMAIL_CLIENT_ID="{client_id}"')
    print(f'GMAIL_CLIENT_SECRET="{client_secret}"')
    print(f'GMAIL_REFRESH_TOKEN="{refresh_token}"')
    print("=" * 60)
    print()
    print("NEXT STEPS:")
    print("  1. Yihi values django_backend/.env me daal do (local test ke liye):")
    print("     GMAIL_CLIENT_ID=...")
    print("     GMAIL_CLIENT_SECRET=...")
    print("     GMAIL_REFRESH_TOKEN=...")
    print("  2. Render Dashboard -> backend service -> Environment:")
    print("     GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN add kar do.")
    print("  3. Deploy ho jaye to password-reset email ab fittrackpro.noreply@gmail.com se jayegi.")


if __name__ == "__main__":
    main()