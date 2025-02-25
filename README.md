*poetry addしたらdocker compose buildしなおす

# build

docker compose build

# コンテナ起動

docker compose up -d

# コンテナ停止

docker compose down

# コンテナ再起動

docker compose restart

# テーブル修正

docker compose exec backend sh -c "cd /app && PYTHONPATH=/app alembic revision --autogenerate -m 'add models'"

作成されたマイグレーションファイルに追記

docker compose exec backend alembic upgrade head

# マイグレーション

docker compose exec backend alembic upgrade head

## ローカルで動かす

# パッケージ更新

poetry update packages

# .venvのパスを指定

# 起動

poetry run python server.py
