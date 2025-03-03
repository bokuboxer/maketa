# ビルド用ステージ
FROM node:20-slim AS builder

WORKDIR /app

# 依存関係ファイルをコピー
COPY package.json package-lock.json* ./

# 依存関係のインストール
RUN npm install

# アプリケーションのコードをコピー
COPY . .

# ビルド時の環境変数を設定
ARG NEXT_PUBLIC_FIREBASE_API_KEY
ARG NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ARG NEXT_PUBLIC_FIREBASE_PROJECT_ID
ARG NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
ARG NEXT_PUBLIC_FIREBASE_APP_ID

# ビルド
RUN npm run build

# 実行用ステージ
FROM node:20-slim

WORKDIR /app

# ビルド済みのファイルをコピー
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json

# 本番用の依存関係のみインストール
RUN npm install --production

# ポートの公開
EXPOSE 3000

# 本番環境で実行
CMD ["npm", "start"] 