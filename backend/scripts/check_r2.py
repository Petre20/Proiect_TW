from uuid import uuid4

from app.services.storage import (
    StorageError,
    StorageFileNotFoundError,
    delete_file,
    download_file,
    upload_file,
)


def main() -> int:
    key = f"tests/r2-check-{uuid4().hex}.txt"
    content = b"Test de conectare WellTrack R2."
    failed = False

    try:
        upload_file(key, content, "text/plain")
        print("Incarcare: OK")

        received_content = download_file(key)

        if received_content != content:
            raise StorageError(
                "Continutul citit nu corespunde continutului incarcat."
            )

        print("Citire si verificare continut: OK")

    except StorageError as error:
        print(f"Test esuat: {error}")
        failed = True

    finally:
        try:
            delete_file(key)
            print("Operatie de stergere: OK")
        except StorageError as error:
            print(f"Curatarea obiectului a esuat: {error}")
            print(f"Verifica manual obiectul: {key}")
            failed = True

    if failed:
        return 1

    try:
        download_file(key)
    except StorageFileNotFoundError:
        print("Confirmare obiect sters: OK")
        print("Testul R2 a trecut.")
        return 0
    except StorageError as error:
        print(f"Verificarea stergerii a esuat: {error}")
        return 1

    print("Test esuat: obiectul poate fi citit dupa stergere.")
    return 1


if __name__ == "__main__":
    raise SystemExit(main())