from io import BytesIO
from types import SimpleNamespace
from unittest.mock import Mock

import boto3
import pytest
from botocore.exceptions import EndpointConnectionError, ReadTimeoutError
from botocore.httpsession import URLLib3Session
from botocore.response import StreamingBody
from botocore.stub import Stubber
from pydantic import ValidationError

from app.config import Settings
from app.services import storage


@pytest.fixture(autouse=True)
def block_real_storage_requests(monkeypatch):
    def unexpected_request(*args, **kwargs):
        raise AssertionError("Testele de stocare nu trebuie sa acceseze reteaua.")

    monkeypatch.setattr(URLLib3Session, "send", unexpected_request)


@pytest.fixture(autouse=True)
def isolate_storage_client_cache():
    # Pastram functia originala, deoarece unele teste o inlocuiesc temporar.
    get_client = storage.get_storage_client
    get_client.cache_clear()
    yield
    get_client.cache_clear()


@pytest.fixture
def storage_client(monkeypatch):
    client = boto3.client(
        service_name="s3",
        endpoint_url="https://test.r2.cloudflarestorage.com",
        region_name="auto",
        aws_access_key_id="test-key",
        aws_secret_access_key="test-secret",
    )

    monkeypatch.setattr(
        storage,
        "get_settings",
        lambda: SimpleNamespace(r2_bucket_name="test-bucket"),
    )
    monkeypatch.setattr(
        storage,
        "get_storage_client",
        lambda: client,
    )

    try:
        yield client
    finally:
        client.close()


def test_upload_file_sends_expected_content(storage_client):
    expected_params = {
        "Bucket": "test-bucket",
        "Key": "tests/example.txt",
        "Body": b"Test WellTrack",
        "ContentType": "text/plain",
    }

    with Stubber(storage_client) as stub:
        stub.add_response(
            "put_object",
            {},
            expected_params=expected_params,
        )

        result = storage.upload_file(
            key="tests/example.txt",
            content=b"Test WellTrack",
            content_type="text/plain",
        )

        assert result == "tests/example.txt"
        stub.assert_no_pending_responses()


def test_download_file_returns_bytes_and_closes_stream(storage_client):
    content = b"WellTrack\x00\xff"
    stream = BytesIO(content)

    with Stubber(storage_client) as stub:
        stub.add_response(
            "get_object",
            {"Body": StreamingBody(stream, len(content))},
            expected_params={"Bucket": "test-bucket", "Key": "tests/example.bin"},
        )

        assert storage.download_file("tests/example.bin") == content
        assert stream.closed
        stub.assert_no_pending_responses()


def test_download_file_closes_stream_when_response_is_incomplete(storage_client):
    stream = BytesIO(b"partial")

    with Stubber(storage_client) as stub:
        stub.add_response(
            "get_object",
            {"Body": StreamingBody(stream, 100)},
            expected_params={"Bucket": "test-bucket", "Key": "tests/example.txt"},
        )

        with pytest.raises(storage.StorageError) as exception:
            storage.download_file("tests/example.txt")

        assert str(exception.value) == "Fisierul nu a putut fi citit din R2."
        assert stream.closed
        stub.assert_no_pending_responses()


def test_delete_file_sends_expected_object_key(storage_client):
    with Stubber(storage_client) as stub:
        stub.add_response(
            "delete_object",
            {},
            expected_params={"Bucket": "test-bucket", "Key": "tests/example.txt"},
        )

        assert storage.delete_file("tests/example.txt") is None
        stub.assert_no_pending_responses()


@pytest.mark.parametrize("error_code", ["NoSuchKey", "NotFound", "404"])
def test_download_missing_file_raises_specific_error(storage_client, error_code):
    with Stubber(storage_client) as stub:
        stub.add_client_error(
            "get_object",
            service_error_code=error_code,
            service_message="private-provider-details",
            http_status_code=404,
            expected_params={"Bucket": "test-bucket", "Key": "tests/missing.txt"},
        )

        with pytest.raises(storage.StorageFileNotFoundError) as exception:
            storage.download_file("tests/missing.txt")

        assert str(exception.value) == "Fisierul nu exista in R2."
        stub.assert_no_pending_responses()


OPERATIONS = [
    ("upload_file", "put_object", ("tests/example.txt", b"test", "text/plain"),
     "Fisierul nu a putut fi incarcat in R2."),
    ("download_file", "get_object", ("tests/example.txt",),
     "Fisierul nu a putut fi citit din R2."),
    ("delete_file", "delete_object", ("tests/example.txt",),
     "Fisierul nu a putut fi sters din R2."),
]


@pytest.mark.parametrize("function_name,sdk_method,args,message", OPERATIONS)
@pytest.mark.parametrize("error_code,status", [
    ("AccessDenied", 403), ("ServiceUnavailable", 503), ("NoSuchBucket", 404),
])
def test_provider_errors_are_sanitized(
    storage_client, function_name, sdk_method, args, message, error_code, status,
):
    expected_params = {"Bucket": "test-bucket", "Key": args[0]}
    if sdk_method == "put_object":
        expected_params.update(Body=args[1], ContentType=args[2])

    with Stubber(storage_client) as stub:
        stub.add_client_error(
            sdk_method,
            service_error_code=error_code,
            service_message="private-provider-details",
            http_status_code=status,
            expected_params=expected_params,
        )

        with pytest.raises(storage.StorageError) as exception:
            getattr(storage, function_name)(*args)

        # Un bucket inexistent nu trebuie confundat cu un fisier inexistent.
        assert type(exception.value) is storage.StorageError
        assert str(exception.value) == message
        stub.assert_no_pending_responses()


@pytest.mark.parametrize("function_name,sdk_method,args,message", OPERATIONS)
@pytest.mark.parametrize("error_class", [EndpointConnectionError, ReadTimeoutError])
def test_network_errors_are_sanitized(
    storage_client, monkeypatch, function_name, sdk_method, args, message, error_class,
):
    def failed_request(**kwargs):
        raise error_class(endpoint_url="https://private-provider-details.example")

    monkeypatch.setattr(storage_client, sdk_method, failed_request)

    with pytest.raises(storage.StorageError) as exception:
        getattr(storage, function_name)(*args)

    assert str(exception.value) == message


def r2_settings(**overrides):
    return Settings(_env_file=None, **{
        "DATABASE_URL": "", "database_password": "test-only",
        "email_delivery": "local", "google_enabled": False,
        "r2_enabled": True,
        "r2_endpoint_url": "https://test.r2.cloudflarestorage.com",
        "r2_access_key_id": "test-access-key",
        "r2_secret_access_key": "test-secret-key",
        "r2_bucket_name": "test-bucket",
        **overrides,
    })


@pytest.mark.parametrize("field", [
    "r2_endpoint_url", "r2_access_key_id", "r2_secret_access_key", "r2_bucket_name",
])
@pytest.mark.parametrize("value", ["", "   "])
def test_enabled_r2_requires_complete_configuration(field, value):
    with pytest.raises(ValidationError):
        r2_settings(**{field: value})


@pytest.mark.parametrize("endpoint", [
    "http://test.r2.cloudflarestorage.com",
    "https://example.com",
    "https://test.r2.cloudflarestorage.com.evil.example",
    "https://owner:private-password@test.r2.cloudflarestorage.com",
    "https://test.r2.cloudflarestorage.com:invalid",
    "https://test.r2.cloudflarestorage.com:8080",
    "https://test.r2.cloudflarestorage.com/test-bucket",
    "https://test.r2.cloudflarestorage.com?token=private-token",
    "https://test.r2.cloudflarestorage.com#fragment",
])
def test_invalid_r2_endpoint_is_rejected_without_exposing_input(endpoint):
    with pytest.raises(ValidationError) as exception:
        r2_settings(r2_endpoint_url=endpoint)
    assert "private-password" not in str(exception.value)
    assert "private-token" not in str(exception.value)


@pytest.mark.parametrize("bucket", ["UPPERCASE", "with_underscore", "ab", "a" * 64, "-bucket", "bucket-"])
def test_invalid_bucket_name_is_rejected(bucket):
    with pytest.raises(ValidationError):
        r2_settings(r2_bucket_name=bucket)


def test_disabled_storage_allows_empty_configuration_and_does_not_create_client(monkeypatch):
    settings = r2_settings(
        r2_enabled=False, r2_endpoint_url="", r2_access_key_id="",
        r2_secret_access_key="", r2_bucket_name="",
    )
    monkeypatch.setattr(storage, "get_settings", lambda: settings)
    factory = Mock(side_effect=AssertionError("Clientul dezactivat nu trebuie creat."))
    monkeypatch.setattr(storage.boto3, "client", factory)

    with pytest.raises(storage.StorageError, match="Stocarea R2 nu este activata"):
        storage.get_storage_client()
    factory.assert_not_called()


def test_client_uses_r2_endpoint_and_is_reused(monkeypatch):
    settings = r2_settings()
    monkeypatch.setattr(storage, "get_settings", lambda: settings)
    factory = Mock(wraps=boto3.client)
    monkeypatch.setattr(storage.boto3, "client", factory)

    client = storage.get_storage_client()
    try:
        assert storage.get_storage_client() is client
        factory.assert_called_once()
        assert client.meta.endpoint_url == settings.r2_endpoint_url
        assert client.meta.region_name == "auto"
        assert client.meta.config.signature_version == "s3v4"
        assert client.meta.config.connect_timeout > 0
        assert client.meta.config.read_timeout > 0
        assert client.meta.config.retries["total_max_attempts"] == 2
        assert factory.call_args.kwargs["aws_access_key_id"] == "test-access-key"
        assert factory.call_args.kwargs["aws_secret_access_key"] == "test-secret-key"
        assert "test-secret-key" not in repr(settings)
    finally:
        client.close()
