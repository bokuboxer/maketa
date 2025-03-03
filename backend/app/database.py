import os

import pymysql
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

pymysql.install_as_MySQLdb()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "mysql+pymysql://root:root@localhost:3306/app",  # ローカル開発用のデフォルト値
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
