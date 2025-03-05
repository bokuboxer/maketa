import os
import ssl
import platform

import pymysql
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

load_dotenv()

pymysql.install_as_MySQLdb()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "mysql+pymysql://root:root@localhost:3306/app",  # ローカル開発用のデフォルト値
)


# SSL contextの設定
def get_ssl_context():
    if os.getenv("ENVIRONMENT") == "production":
        # 本番環境用のSSL設定
        ssl_context = ssl.create_default_context(
            cafile="/etc/ssl/certs/ca-certificates.crt"
        )
        ssl_context.verify_mode = ssl.CERT_REQUIRED
        return ssl_context
    else:
        # 開発環境用のSSL設定
        if platform.system() == "Darwin":  # MacOS
            return ssl.create_default_context()
        else:
            return ssl.create_default_context(
                cafile="/etc/ssl/certs/ca-certificates.crt"
            )


def get_db():
    engine = create_engine(
        DATABASE_URL,
        connect_args={"ssl": get_ssl_context()}
        if "localhost" not in DATABASE_URL
        else {},
    )
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    try:
        return db
    except Exception as e:
        print(e)
        db.rollback()
        raise e
    finally:
        db.close()


class Base(DeclarativeBase):
    pass


# データベースの初期化関数
def init_db():
    engine = create_engine(
        DATABASE_URL,
        connect_args={"ssl": get_ssl_context()}
        if "localhost" not in DATABASE_URL
        else {},
    )
    Base.metadata.create_all(bind=engine)
