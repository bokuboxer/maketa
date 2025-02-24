import { defineConfig } from 'orval';

export default defineConfig({
  api: {
    input: 'http://localhost:8000/openapi.json', // OpenAPI の YAML または JSON ファイルのパス
    output: {
      target: './src/api/generated.ts', // 生成されるファイルの出力先
      client: 'react-query', // または 'axios' など
      override: {
        mutator: {
          path: './src/api/mutator.ts', // カスタム API クライアント（オプション）
          name: 'customAxios', // 使用するメソッド名
        },
      },
    },
  },
});
