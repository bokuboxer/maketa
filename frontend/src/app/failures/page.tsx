"use client";

import { auth } from "@/lib/firebase";
import { Loader, Modal } from "@mantine/core";
import "@mantine/core/styles.css";
import { useDisclosure } from "@mantine/hooks";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
	PlusIcon,
	ArrowRightStartOnRectangleIcon,
} from "@heroicons/react/24/outline";
import {
	useCreateFailureFailuresPost,
	useGetUserByFirebaseUidUserFirebaseUidGet,
} from "../../api/generated/default/default";

export default function Failures() {
	const [uid, setUid] = useState<string | null>(null);
	const router = useRouter();

	const [opened, { close, open }] = useDisclosure(false);
	const [description, setDescription] = useState("");

	const { mutate: createFailure } = useCreateFailureFailuresPost();
	const {
		data: user,
		refetch,
		isLoading,
		error,
	} = useGetUserByFirebaseUidUserFirebaseUidGet(uid ?? "", {
		query: {
			enabled: !!uid,
		},
	});

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!user?.id) return;

		createFailure(
			{
				data: {
					description,
					user_id: user.id,
				} as any,
			},
			{
				onSuccess: async () => {
					setDescription("");
					await refetch();
					close();
				},
			},
		);
	};

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			if (!user) {
				router.push("/");
			} else {
				setUid(user.uid);
			}
		});
		return () => unsubscribe();
	}, [router]);

	useEffect(() => {
		if (error) {
			router.push("/");
			auth.signOut();
		}
	}, [error, router]);

	if (isLoading) {
		return (
			<div className="min-h-screen bg-white flex items-center justify-center">
				<Loader color="black" size="lg" variant="dots" />
			</div>
		);
	}

	if (!user || error) {
		return null;
	}

	return (
		<>
			<Modal
				opened={opened}
				onClose={close}
				size="lg"
				centered
				classNames={{
					content: "p-0 bg-white rounded-lg mx-4",
					header: "hidden",
				}}
			>
				<div className="">
					<div className="flex justify-between items-center mb-4">
						<h1 className="text-xl font-bold text-black">
							新しい失敗カードを作成
						</h1>
					</div>
					<form className="space-y-4" onSubmit={handleSubmit}>
						<div>
							<label className="block text-sm font-medium text-black mb-1">
								失敗の内容
							</label>
							<textarea
								className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-black text-black bg-white text-base leading-relaxed"
								rows={5}
								placeholder="失敗の概要を記入してください"
								value={description}
								onChange={(e) => setDescription(e.target.value)}
							/>
						</div>
						<div className="flex justify-end space-x-3">
							<button
								type="button"
								onClick={close}
								className="px-3 py-1.5 text-black border border-black rounded-lg hover:bg-gray-100 text-sm"
							>
								キャンセル
							</button>
							<button
								type="submit"
								className="px-3 py-1.5 bg-black text-white rounded-lg hover:bg-gray-800 text-sm"
							>
								保存
							</button>
						</div>
					</form>
				</div>
			</Modal>
			<div className="min-h-screen bg-white">
				<header className="bg-white border-b border-gray-200 py-3 px-6 sticky top-0 z-50 shadow-sm backdrop-blur-sm bg-white/80">
					<div className="container mx-auto flex justify-between items-center max-w-5xl">
						<h1 className="text-2xl font-bold tracking-tight text-black">
							Maketa
						</h1>
						<button
							onClick={() => auth.signOut()}
							className="hover:bg-gray-100 rounded-full transition-all duration-200"
							title="ログアウト"
						>
							<ArrowRightStartOnRectangleIcon className="w-5 h-5" />
						</button>
					</div>
				</header>
				<div className="p-4 pb-24">
					<div className="container mx-auto max-w-5xl">
						{user?.failures.length === 0 ? (
							<div className="text-center py-10">
								<p className="text-black text-lg">
									まだ失敗記録がありません。
									<br />
									右下の「＋」ボタンから新しい記録を追加してください。
								</p>
							</div>
						) : (
							<div className="grid grid-cols-1 gap-4">
								{user?.failures.map((failure) => (
									<div
										key={failure.id}
										className="bg-white p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
									>
										<div className="flex flex-col">
											<div className="flex justify-between items-start gap-3">
												<div className="flex-grow">
													<p className="text-sm text-black leading-relaxed line-clamp-3 w-fit">
														{failure.description}
													</p>
												</div>
												<div className="flex flex-col items-end gap-2">
													<button
														onClick={() =>
															router.push(
																failure.has_analyzed
																	? `/failures/${failure.id}`
																	: `/failures/${failure.id}/analyze`,
															)
														}
														className="w-[60px] py-2 bg-black text-white rounded hover:bg-gray-800"
													>
														{failure.has_analyzed ? "詳細" : "分析"}
													</button>
													<span className="text-sm text-gray-500">
														{new Date(failure.created_at).toLocaleDateString()}
													</span>
												</div>
											</div>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				</div>

				{/* Floating Action Button */}
				<button
					onClick={open}
					className="fixed bottom-6 right-6 w-14 h-14 bg-black text-white rounded-full shadow-lg hover:bg-gray-800 transition-all hover:scale-110 flex items-center justify-center"
					title="新しい失敗を記録"
				>
					<PlusIcon className="w-6 h-6" />
				</button>
			</div>
		</>
	);
}
