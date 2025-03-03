FROM python:3.12-slim

WORKDIR /app

# 依存関係のインストール
COPY pyproject.toml poetry.lock ./
RUN pip install poetry && \
    poetry config virtualenvs.create false && \
    poetry install --only main

# アプリケーションのコードをコピー
COPY . .

EXPOSE 8000

# 本番環境で実行
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"] 