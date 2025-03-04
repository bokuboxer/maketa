import { useCreateUserUsersPost } from "@/api/generated";
import { auth } from "@/lib/firebase";
import {
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
} from "firebase/auth";

export const useSignUp = () => {
	const { mutate: createUser } = useCreateUserUsersPost();

	const signUp = async (email: string, password: string) => {
		try {
			const result = await createUserWithEmailAndPassword(
				auth,
				email,
				password,
			);
			try {
				await createUser({
					data: {
						firebase_uid: result.user.uid,
						email: result.user.email!,
					},
				});
			} catch (error) {
				await result.user.delete();
				console.error("バックエンドエラー:", error);
				throw error;
			}
		} catch (error) {
			console.error("Firebase認証エラー:", error);
			throw error;
		}
	};

	return { signUp };
};

export const useSignIn = () => {
	const signIn = async (email: string, password: string) => {
		try {
			await signInWithEmailAndPassword(auth, email, password);
		} catch (error) {
			console.error("ログインエラー:", error);
			throw error;
		}
	};

	return { signIn };
};
