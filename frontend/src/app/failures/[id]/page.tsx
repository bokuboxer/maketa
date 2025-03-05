"use client";

import {
	useGetFailureByIdFailureFailureIdGet,
	useGetHeroesHeroesPost,
} from "@/api/generated/default/default";
import { ElementType } from "@/api/model/elementType";
import { Hero } from "@/api/model/hero";
import { IconArrowLeft } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import HypnoticLoader from "@/components/HypnoticLoader";
import dynamic from "next/dynamic";

interface PageParams {
	id: string;
}

// クライアントサイドでのみレンダリング
const FailureDetailPage = dynamic(
	() =>
		Promise.resolve(({ params }: { params: Promise<PageParams> }) => {
			const [heros, setHeroes] = useState<Hero[] | null>(null);
			const [isHeroLoading, setIsHeroLoading] = useState(false);

			const resolvedParams = use(params);
			const { data: failure, isLoading } = useGetFailureByIdFailureFailureIdGet(
				Number(resolvedParams.id),
			);
			const { mutate: getHeroes } = useGetHeroesHeroesPost();
			const router = useRouter();

			const steps = [
				{ type: ElementType.adversity, label: "逆境" },
				{ type: ElementType.belief, label: "信念" },
				{ type: ElementType.disputation, label: "反論" },
			];

			useEffect(() => {
				if (failure) {
					setIsHeroLoading(true);
					getHeroes({
						data: {
							query: failure.description ?? "",
						},
					}, {
						onSuccess: (data) => {
							setHeroes(data);
							setIsHeroLoading(false);
						},
					});
				}
			}, [failure]);

			if (isLoading || isHeroLoading || !failure) {
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
				<div className="min-h-screen bg-white">
					<div className="container mx-auto px-4 py-8">
						<div className="flex items-center mb-6">
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
								<p className="text-black text-sm whitespace-pre-wrap">
									{failure.description}
								</p>
							</div>

							{steps.map((step) => {
								const elements = failure.elements.filter(
									(e) => e.type === step.type,
								);
								return (
									<div
										key={step.type}
										className="border rounded-lg p-4 bg-white"
									>
										<h2 className="font-semibold mb-2 text-black">
											{step.label}
										</h2>
										{elements.length > 0 ? (
											<div className="space-y-2">
												{elements.map((element) => (
													<div key={element.id} className="text-sm text-black">
														{element.description}
													</div>
												))}
											</div>
										) : (
											<p className="text-sm text-gray-500">要素がありません</p>
										)}
									</div>
								);
							})}

							{/* 似ている偉人の失敗 */}
							{heros && heros.length > 0 && (
								<div className="border rounded-lg p-4 bg-white">
									<h2 className="font-semibold mb-2 text-black">
										似ている偉人の失敗
									</h2>
									{heros.map((hero) => (
										<div key={hero.name} className="space-y-2">
											<div className="flex justify-between items-center">
												<div className="text-sm font-medium text-black">
													{hero.name} - {hero.description}
												</div>
												<div className="text-sm text-gray-500">
													類似度: {Math.round(hero.certainty * 100)}%
												</div>
											</div>
											<p className="text-sm text-gray-600">{hero.failure}</p>
											<p className="text-xs text-gray-400">
												出典: {hero.source}
											</p>
										</div>
									))}
								</div>
							)}
						</div>
					</div>
				</div>
			);
		}),
	{ ssr: false },
);

export default FailureDetailPage;
