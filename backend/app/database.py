import os
from typing import Any

import pymysql
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

pymysql.install_as_MySQLdb()

DATABASE_URL = os.getenv("DATABASE_URL", "mysql+pymysql://root:root@db:3306/app")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base: Any = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# データベースの初期化関数
def init_db():
    Base.metadata.create_all(bind=engine)
