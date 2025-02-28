'use client';

import { useGetFailureByIdFailureFailureIdGet } from '@/api/generated/default/default';
import { ElementType } from '@/api/model/elementType';
import { IconArrowLeft } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import HypnoticLoader from '@/components/HypnoticLoader';

interface PageParams {
  id: string;
}

export default function FailureDetailPage({ params }: { params: Promise<PageParams> }) {
  const resolvedParams = use(params);
  const { data: failure, isLoading } = useGetFailureByIdFailureFailureIdGet(Number(resolvedParams.id));
  const router = useRouter();

  const steps = [
    { type: ElementType.adversity, label: '逆境' },
    { type: ElementType.belief, label: '信念' },
    { type: ElementType.consequence, label: '結果' },
    { type: ElementType.disputation, label: '反論' },
    { type: ElementType.effect, label: '効果' },
  ];

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
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <button
            onClick={() => router.push('/failures')}
            className="text-black hover:text-gray-600 mr-4 p-2 rounded-full hover:bg-gray-100"
          >
            <IconArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-black">失敗の詳細</h1>
        </div>

        <div className="space-y-6">
          <div className="border rounded-lg p-4 bg-white">
            <h2 className="font-semibold mb-2 text-black">失敗の内容</h2>
            <p className="text-black text-sm whitespace-pre-wrap">{failure.description}</p>
          </div>

          {steps.map((step) => {
            const elements = failure.elements.filter(e => e.type === step.type);
            return (
              <div key={step.type} className="border rounded-lg p-4 bg-white">
                <h2 className="font-semibold mb-2 text-black">{step.label}</h2>
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
        </div>
      </div>
    </div>
  );
}
