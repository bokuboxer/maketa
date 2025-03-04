FROM python:3.12-slim

WORKDIR /app

# 依存関係のインストール
COPY pyproject.toml poetry.lock ./
COPY app ./app
RUN pip install poetry && \
    poetry config virtualenvs.create false && \
    poetry install --only main

# アプリケーションのコードをコピー
COPY migrations ./migrations
COPY alembic.ini ./

# ビルド時の環境変数を設定
ENV ENVIRONMENT=production

ARG DATABASE_URL
ARG AZURE_OPENAI_KEY
ARG AZURE_OPENAI_ENDPOINT
ARG FRONTEND_URL

EXPOSE 8000

# 本番環境で実行
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"] 