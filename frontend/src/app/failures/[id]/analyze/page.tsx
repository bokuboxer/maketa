'use client';

import { useAnalyzeFailureFailuresFailureIdAnalyzePost } from '@/api/generated/default/default';
import { Failure } from '@/api/model/failure';
import { useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';

interface PageParams {
	id: string;
}

export default function AnalyzePage({ params }: { params: Promise<PageParams> }) {
	const [failure, setFailure] = useState<Failure | null>(null)
	const [loading, setLoading] = useState(true);
	const router = useRouter();
	const {mutate: analyzeFailure} = useAnalyzeFailureFailuresFailureIdAnalyzePost()
	const resolvedParams = use(params);

	useEffect(() => {
		const fetchFailure = () => {
			analyzeFailure(
				{ failureId: Number(resolvedParams.id) },
				{
					onSuccess: (data) => {
						setFailure(data);
						setLoading(false);
					},
				}
			);
		};

		fetchFailure();
	}, [resolvedParams.id, analyzeFailure]);

  if (loading) {
    return <div className="p-8">分析中...</div>;
  }

  if (!failure) {
    return <div className="p-8">失敗の分析情報が見つかりませんでした。</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:text-blue-800"
        >
          ← 戻る
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">失敗の分析</h1>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">失敗の内容</h2>
          <p className="text-gray-700">{failure.description}</p>
        </div>

        {failure.elements && failure.elements.length > 0 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">分析要素</h2> 
              <div className="grid gap-4">
                {failure.elements.map((element) => (
                  <div
                    key={element.id}
                    className="border rounded-lg p-4 bg-gray-50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">
                        {element.type === 'internal' && '内部要因'}
                        {element.type === 'external' && '外部要因'}
                        {element.type === 'emotional' && '感情要因'}
                      </span>
                    </div>
                    <p className="text-gray-700">{element.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {failure.conclusion && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">結論</h2>
            <p className="text-gray-700">{failure.conclusion}</p>
          </div>
        )}
      </div>
    </div>
  );
} 