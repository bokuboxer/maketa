import os

import pymysql
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

load_dotenv()

pymysql.install_as_MySQLdb()

DATABASE_URL = os.getenv(
    "DATABASE_URL"+"?ssl=true",
    "mysql+pymysql://root:root@localhost:3306/app?ssl=true",  # ローカ開発用のデフォルト値
)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db() -> Session:
    db = SessionLocal()
    try:
        return db
    except Exception as e:
        print(e)
        db.rollback()
        raise e
    finally:
        db.close()


# データベースの初期化関数
def init_db():
    Base.metadata.create_all(bind=engine)
