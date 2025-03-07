"use client";

import { useAuth } from "@/hooks/useAuth";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AuthPage() {
	const [isSignUp, setIsSignUp] = useState(false);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const { signIn, signUp } = useAuth();
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			if (isSignUp) {
				await signUp(email, password);
			} else {
				await signIn(email, password);
			}
			router.push("/failures");
		} catch (error) {
			if (error instanceof Error) {
				alert(error.message);
			}
		}
	};

	// useEffect(() => {
	// 	const unsubscribe = onAuthStateChanged(auth, (user) => {
	// 		if (user) router.push("/failures");
	// 	});
	// 	return () => unsubscribe();
	// }, [router]);

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50">
			<div className="w-full max-w-md mx-4 space-y-8">
				<div className="text-center space-y-2">
					<h1 className="text-5xl font-bold tracking-tight">Maketa</h1>
					<p className="text-base text-gray-600">
						失敗から学び、成長するためのアプリ
					</p>
				</div>

				<div className="space-y-6 p-6 pt-2 bg-white rounded-lg shadow-lg">
					<form onSubmit={handleSubmit} className="mt-6 space-y-4">
						<div className="rounded-md shadow-sm -space-y-px">
							<div>
								<input
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									className="appearance-none rounded-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-black focus:border-black focus:z-10"
									placeholder="メールアドレス"
									required
								/>
							</div>
							<div>
								<input
									type="password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									className="appearance-none rounded-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-black focus:border-black focus:z-10"
									placeholder="パスワード"
									required
								/>
							</div>
						</div>

						<div>
							<button
								type="submit"
								className="w-full flex justify-center py-3 px-4 border border-transparent text-base font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors"
							>
								{isSignUp ? "登録" : "ログイン"}
							</button>
						</div>
					</form>

					<div className="text-center mt-4">
						<button
							onClick={() => setIsSignUp(!isSignUp)}
							className="text-gray-600 hover:text-black transition-colors"
						>
							{isSignUp
								? "既にアカウントをお持ちの方はこちら"
								: "新規登録はこちら"}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
