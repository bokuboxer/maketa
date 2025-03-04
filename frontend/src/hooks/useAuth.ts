import { useCreateUserUsersPost } from "@/api/generated";
import { auth } from "@/lib/firebase";
import {
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
} from "firebase/auth";

export const useAuth = () => {
	const { mutate: createUser } = useCreateUserUsersPost({
		mutation: {
			onError: async (error) => {
				try {
					const currentUser = auth.currentUser;
					if (currentUser) {
						await auth.signOut();
						await currentUser.delete();
					}
				} catch (deleteError) {
					console.error("Firebaseユーザーのクリーンアップに失敗:", deleteError);
				}
				throw new Error("ユーザー登録に失敗しました。もう一度お試しください。");
			},
		},
	});

	return {
		signIn: async (email: string, password: string) => {
			await signInWithEmailAndPassword(auth, email, password);
		},
		signUp: async (email: string, password: string) => {
			const result = await createUserWithEmailAndPassword(
				auth,
				email,
				password,
			);
			await createUser({
				data: {
					firebase_uid: result.user.uid,
					email: result.user.email!,
				},
			});
		},
	};
};
