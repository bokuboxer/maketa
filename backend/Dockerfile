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
COPY server.py ./

# ビルド時の環境変数を設定
ENV ENVIRONMENT=production

# ビルド引数を環境変数として設定
ARG DATABASE_URL
ARG AZURE_OPENAI_KEY
ARG AZURE_OPENAI_ENDPOINT
ARG FRONTEND_URL

ENV DATABASE_URL=${DATABASE_URL}
ENV AZURE_OPENAI_KEY=${AZURE_OPENAI_KEY}
ENV AZURE_OPENAI_ENDPOINT=${AZURE_OPENAI_ENDPOINT}
ENV FRONTEND_URL=${FRONTEND_URL}

EXPOSE 8000

# 本番環境で実行
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"] 