# Maketa

## backend/.env を作成

```bash
cp backend/.env.example backend/.env
```

## build

```bash
docker compose build
```

poetry addしたらdocker compose buildしなおす

## コンテナ起動

```bash
docker compose up -d
```

## コンテナ停止

```bash
docker compose down
```

## コンテナ再起動

```bash
docker compose restart
```

## テーブル修正

```bash
# マイグレーションファイルの作成
docker compose exec backend sh -c "cd /app && PYTHONPATH=/app alembic revision --autogenerate -m '<migration_name>'"

# 作成されたマイグレーションファイルに追記後、マイグレーションを実行
docker compose exec backend alembic upgrade head
```

## マイグレーション

```bash
docker compose exec backend alembic upgrade head
```

### ローカルで動かす

## パッケージ更新

```bash
poetry update packages
```

## .venvのパスを指定

## 起動

```bash
poetry run python server.py
```
