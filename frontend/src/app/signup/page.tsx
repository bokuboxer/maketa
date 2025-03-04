"use client";

import { useSignUp } from "@/hooks/useAuth";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Signup() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const router = useRouter();
	const { signUp } = useSignUp();

	const handleSignup = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			await signUp(email, password);
			router.push("/failures");
		} catch (error) {
			console.error("新規登録エラー:", error);
		}
	};

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			if (user) router.push("/failures");
		});
		return () => unsubscribe();
	}, [router]);
	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50">
			<div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
				<h2 className="text-center text-3xl font-bold">新規登録</h2>

				<form onSubmit={handleSignup} className="mt-8 space-y-6">
					<div className="rounded-md shadow-sm -space-y-px">
						<div>
							<input
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
								placeholder="メールアドレス"
								required
							/>
						</div>
						<div>
							<input
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
								placeholder="パスワード"
								required
							/>
						</div>
					</div>

					<div>
						<button
							type="submit"
							className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
						>
							登録
						</button>
					</div>
				</form>

				<div className="text-center mt-4">
					<Link
						href="/signin"
						className="text-indigo-600 hover:text-indigo-500"
					>
						既にアカウントをお持ちの方はこちら
					</Link>
				</div>
			</div>
		</div>
	);
}
