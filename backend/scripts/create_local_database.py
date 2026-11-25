"""Creeaza rolul si baza locala folosind configurarea din backend/.env."""
import argparse
import getpass
from pathlib import Path
import sys

import psycopg
from psycopg import sql

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.config import get_settings


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--admin-user", default=getpass.getuser())
    args = parser.parse_args()
    settings = get_settings()

    with psycopg.connect(
        host=settings.database_host,
        port=settings.database_port,
        dbname="postgres",
        user=args.admin_user,
        connect_timeout=3,
        autocommit=True,
    ) as connection:
        role = connection.execute(
            "SELECT rolcanlogin, rolsuper, rolcreatedb, rolcreaterole, rolreplication, rolbypassrls "
            "FROM pg_roles WHERE rolname = %s",
            (settings.database_user,),
        ).fetchone()
        database = connection.execute(
            "SELECT pg_get_userbyid(datdba) FROM pg_database WHERE datname = %s",
            (settings.database_name,),
        ).fetchone()
        if role is not None and (not role[0] or any(role[1:])):
            raise SystemExit("Rolul existent are alte privilegii decat cele asteptate; nu a fost modificat.")
        if database is not None and database[0] != settings.database_user:
            raise SystemExit("Baza existenta are alt proprietar; nu a fost modificata.")

        if role is None:
            connection.execute(
                sql.SQL(
                    "CREATE ROLE {} LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE "
                    "NOREPLICATION NOBYPASSRLS PASSWORD {}"
                ).format(
                    sql.Identifier(settings.database_user),
                    sql.Literal(settings.database_password.get_secret_value()),
                )
            )
            print(f"Rol creat: {settings.database_user}")
        else:
            print(f"Rol existent, pastrat: {settings.database_user}")

        if database is None:
            connection.execute(
                sql.SQL("CREATE DATABASE {} OWNER {}").format(
                    sql.Identifier(settings.database_name),
                    sql.Identifier(settings.database_user),
                )
            )
            print(f"Baza creata: {settings.database_name}")
        else:
            print(f"Baza existenta, pastrata: {settings.database_name}")


if __name__ == "__main__":
    main()
