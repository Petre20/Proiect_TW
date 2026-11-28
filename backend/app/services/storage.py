from functools import lru_cache
from contextlib import closing


import boto3
from botocore.client import BaseClient
from botocore.config import Config
from botocore.exceptions import BotoCoreError, ClientError

from app.config import get_settings

class StorageError(Exception):
    pass

class StorageFileNotFoundError(StorageError):
    pass

@lru_cache
def get_storage_client() -> BaseClient:
    settings = get_settings()

    if not settings.r2_enabled:
        raise StorageError("Stocarea R2 nu este activata.")

    return boto3.client(
        service_name="s3",
        endpoint_url=settings.r2_endpoint_url,
        aws_access_key_id=settings.r2_access_key_id.get_secret_value(),
        aws_secret_access_key=settings.r2_secret_access_key.get_secret_value(),
        region_name="auto",
        config=Config(
            signature_version="s3v4",
            connect_timeout=5,
            read_timeout=10,
            retries={
                "mode": "standard",
                "total_max_attempts": 2,
            },
        ),
    )

def upload_file(
    key: str,
    content: bytes,
    content_type: str,
) -> str:
    settings = get_settings()
    client = get_storage_client()

    try:
        client.put_object(
            Bucket=settings.r2_bucket_name,
            Key=key,
            Body=content,
            ContentType=content_type,
        )
    except (BotoCoreError, ClientError):
        raise StorageError("Fisierul nu a putut fi incarcat in R2.") from None

    return key

def download_file(key: str) -> bytes:
    settings = get_settings()
    client = get_storage_client()

    try:
        response = client.get_object(
            Bucket=settings.r2_bucket_name,
            Key=key,
        )
        with closing(response["Body"]) as body:
            return body.read()

    except ClientError as error:
        error_code = error.response.get("Error", {}).get("Code")

        if error_code in {"NoSuchKey", "NotFound", "404"}:
            raise StorageFileNotFoundError("Fisierul nu exista in R2.") from None

        raise StorageError("Fisierul nu a putut fi citit din R2.") from None

    except BotoCoreError:
        raise StorageError(
            "Fisierul nu a putut fi citit din R2.") from None

def delete_file(key: str) -> None:
    settings = get_settings()
    client = get_storage_client()

    try:
        client.delete_object(
            Bucket=settings.r2_bucket_name,
            Key=key,
        )
    except (BotoCoreError, ClientError):
        raise StorageError(
            "Fisierul nu a putut fi sters din R2.") from None