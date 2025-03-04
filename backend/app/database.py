import os
import ssl

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

# Azure MySQL用のSSL設定
ssl_context = ssl.create_default_context(cafile="/etc/ssl/certs/ca-certificates.crt")
ssl_context.verify_mode = ssl.CERT_REQUIRED


def get_db():
    engine = create_engine(DATABASE_URL, connect_args={"ssl": ssl_context})
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
    engine = create_engine(DATABASE_URL, connect_args={"ssl": ssl_context})
    Base.metadata.create_all(bind=engine)
