import type { NextConfig } from "next";
import dotenv from "dotenv";

// `.env.production` を読み込む
dotenv.config({ path: ".env.production" });

const nextConfig: NextConfig = {
	devIndicators: {
		buildActivity: false,
	},
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "maketastorage.blob.core.windows.net",
				port: "",
				pathname: "/uploads/**",
			},
		],
	},
	env: {
		NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
		NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:
			process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
		NEXT_PUBLIC_FIREBASE_PROJECT_ID:
			process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
		NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:
			process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
		NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
		NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
	},
};

export default nextConfig;
