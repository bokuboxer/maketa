FROM python:3.11-slim

WORKDIR /app

# アプリケーションのコードをコピー
COPY . .

# 依存関係のインストール
RUN pip install poetry && \
    poetry config virtualenvs.create false && \
    poetry install --only main

# ビルド引数を環境変数として設定
ARG DATABASE_URL
ARG AZURE_OPENAI_KEY
ARG AZURE_OPENAI_ENDPOINT
ARG FRONTEND_URL
ARG OPENAI_API_KEY

# 環境変数を設定
ENV ENVIRONMENT=production
ENV DATABASE_URL=${DATABASE_URL}
ENV AZURE_OPENAI_KEY=${AZURE_OPENAI_KEY}
ENV AZURE_OPENAI_ENDPOINT=${AZURE_OPENAI_ENDPOINT}
ENV FRONTEND_URL=${FRONTEND_URL}
ENV OPENAI_API_KEY=${OPENAI_API_KEY}

# ヘルスチェック用のポートを公開
EXPOSE 8000

# 本番環境で実行
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4", "--log-level", "info"] 