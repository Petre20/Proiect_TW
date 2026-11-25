import json
import os
from urllib.parse import urlencode
from uuid import uuid4

import httpx

from app.config import Settings


class EmailDeliveryError(Exception):
    pass


def send_verification_email(email: str, token: str, settings: Settings) -> None:
    verification_url = (
        settings.frontend_url.rstrip("/") + "/verify-email?" + urlencode({"token": token})
    )
    message = {
        "to": [email],
        "subject": "Verifica adresa de email - WellTrack",
        "text": (
            "Pentru verificarea contului WellTrack, acceseaza linkul:\n"
            f"{verification_url}\n\n"
            f"Linkul expira in {settings.verification_ttl_minutes} minute."
        ),
    }
    try:
        if settings.email_delivery == "local":
            directory = settings.local_email_directory
            directory.mkdir(parents=True, exist_ok=True, mode=0o700)
            path = directory / f"{uuid4().hex}.json"
            descriptor = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
            with os.fdopen(descriptor, "w", encoding="utf-8") as stream:
                json.dump({**message, "verification_url": verification_url}, stream, indent=2)
            return
        response = httpx.post(
            "https://api.resend.com/emails",
            headers={"Authorization": f"Bearer {settings.resend_api_key.get_secret_value()}"},
            json={**message, "from": settings.email_from},
            timeout=10,
        )
        response.raise_for_status()
    except (OSError, httpx.HTTPError):
        raise EmailDeliveryError("Emailul nu a putut fi trimis.") from None
