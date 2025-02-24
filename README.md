*poetry addしたらdocker compose buildしなおす

# build
docker compose build

# コンテナ起動
docker compose up -d

# コンテナ停止
docker compose down

# コンテナ再起動
docker compose restart

## ローカルで動かす
# パッケージ更新
poetry update packages

# .venvのパスを指定

# 起動
poetry run python server.py
