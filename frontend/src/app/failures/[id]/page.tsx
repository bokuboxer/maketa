"use client";

import { useGetFailureByIdFailureFailureIdGet } from "@/api/generated/default/default";
import { ElementType } from "@/api/model/elementType";
import { Hero } from "@/api/model/hero";
import { IconArrowLeft } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import HypnoticLoader from "@/components/HypnoticLoader";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Element } from "@/api/model/element";

interface PageParams {
	id: string;
}

// クライアントサイドでのみレンダリング
const FailureDetailPage = dynamic(
	() =>
		Promise.resolve(({ params }: { params: Promise<PageParams> }) => {
			const resolvedParams = use(params);
			const { data: failure, isLoading } = useGetFailureByIdFailureFailureIdGet(
				Number(resolvedParams.id),
			);
			const router = useRouter();
			const [opened, { open, close }] = useDisclosure(false);

			if (isLoading || !failure) {
				return (
					<div className="min-h-screen bg-white flex items-center justify-center">
						<HypnoticLoader
							size={250}
							color="black"
							secondaryColor="gray"
							text="読み込み中"
							isLoading={isLoading}
							ringCount={5}
						/>
					</div>
				);
			}

			return (
				<>
					<Modal
						opened={opened}
						onClose={close}
						size="lg"
						centered
						title={
							<span className="text-xl font-bold">
								{failure.hero_name}の失敗
							</span>
						}
					>
						<div className="space-y-4">
							<div className="flex items-center justify-center">
								<Image
									src={failure.hero_image_url || ""}
									alt={failure.hero_name || "偉人の画像"}
									width={300}
									height={300}
									className="rounded-lg"
								/>
							</div>
							<div className="space-y-2">
								<div className="flex justify-between items-center">
									<div className="text-base font-medium text-black">
										{failure.hero_description}
									</div>
									<div className="text-sm text-gray-500">
										類似度:{" "}
										{Math.round((failure.hero_failure_certainty ?? 0) * 100)}%
									</div>
								</div>
								<p className="text-base text-gray-600 whitespace-pre-wrap">
									{failure.hero_failure}
								</p>
								<p className="text-sm text-gray-400">
									出典: {failure.hero_failure_source}
								</p>
								<div className="pt-2 border-t">
									<h3 className="font-medium mb-1">類似点</h3>
									<p className="text-sm text-gray-600 whitespace-pre-wrap">
										{failure.explain_certainty}
									</p>
								</div>
							</div>
						</div>
					</Modal>

					<div className="min-h-screen bg-white">
						<div className="container mx-auto px-4 py-4">
							<div className="flex items-center pb-4">
								<button
									onClick={() => router.push("/failures")}
									className="text-black hover:text-gray-600 mr-4 p-2 rounded-full hover:bg-gray-100"
								>
									<IconArrowLeft size={20} />
								</button>
								<h1 className="text-2xl font-bold text-black">失敗の詳細</h1>
							</div>

							<div className="space-y-6">
								<div className="border rounded-lg p-4 bg-white">
									<h2 className="font-semibold mb-2 text-black">失敗の内容</h2>
									<p className="text-black text-sm whitespace-pre-wrap mb-4">
										{failure.detail}
									</p>

									<h2 className="font-semibold mb-2 text-black">失敗の原因</h2>
									<p className="text-black text-sm whitespace-pre-wrap">
										{failure.reason}
									</p>
								</div>
								<button
									onClick={open}
									className="w-full border border-gray-800 rounded-lg p-3 bg-gray-50 hover:bg-gray-100 active:bg-gray-200 transition-colors text-left group relative overflow-hidden shadow-sm hover:shadow-md"
								>
									<div className="flex items-center justify-between">
										<div className="flex items-center space-x-3">
											<div className="bg-gray-200 p-1.5 rounded-full">
												<svg
													className="w-5 h-5 text-gray-800 group-hover:text-black transition-colors"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
													xmlns="http://www.w3.org/2000/svg"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z"
													/>
												</svg>
											</div>
											<div className="space-y-0.5">
												<p className="text-sm font-medium text-gray-800 group-hover:text-black">
													似ている偉人の失敗を見る
												</p>
												<p className="text-xs text-gray-600">
													クリックして詳細を表示
												</p>
											</div>
										</div>
										<div className="text-xs font-medium text-gray-700 group-hover:text-black bg-gray-200 px-2 py-1 rounded-full">
											類似度:{" "}
											{Math.round((failure.hero_failure_certainty ?? 0) * 100)}%
										</div>
									</div>
								</button>
							</div>
						</div>
					</div>
				</>
			);
		}),
	{ ssr: false },
);

export default FailureDetailPage;
