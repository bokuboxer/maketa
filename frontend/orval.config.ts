import { defineConfig } from "orval";

export default defineConfig({
	api: {
		input: {
			target: "http://localhost:8000/openapi.json",
		},
		output: {
			mode: "tags-split",
			target: "./src/api/generated",
			schemas: "./src/api/model",
			client: "react-query",
			override: {
				mutator: {
					path: "./src/api/mutator.ts",
					name: "customAxios",
				},
				query: {
					useQuery: true,
					useInfinite: true,
					useInfiniteQueryParam: "offset",
				},
			},
		},
	},
});
