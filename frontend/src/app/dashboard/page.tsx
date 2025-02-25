'use client';

import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type Failure = {
  id: number;
  description: string;
  self_score: number;
  created_at: string;
};

export default function Dashboard() {
  const [failures, setFailures] = useState<Failure[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push('/signin');
      } else {
        fetchFailures();
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const fetchFailures = async () => {
    try {
      // const response = await fetch('http://localhost:8000/failures');
      // const data = await response.json();
      // setFailures(data);
    } catch (error) {
      console.error('失敗の取得エラー:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">失敗カード一覧</h1>
        <button
          onClick={() => router.push('/failures/new')}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          新規作成
        </button>
      </div>

			{failures.length === 0 ? (
				<div className="text-center py-10">
					<p className="text-gray-500 text-lg">
						まだ失敗記録がありません。
						<br />
						「失敗を記録する」ボタンから新しい記録を追加してください。
					</p>
					<Link 
						href="/failures/new" 
						className="mt-4 inline-block bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
					>
						失敗を記録する
					</Link>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{failures.map((failure) => (
						<div
							key={failure.id}
							className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
							onClick={() => router.push(`/failures/${failure.id}`)}
						>
							<p className="text-gray-600 mb-4">{failure.description}</p>
							<div className="flex justify-between items-center">
								<span className="text-sm text-gray-500">
									スコア: {failure.self_score}
								</span>
								<span className="text-sm text-gray-500">
									{new Date(failure.created_at).toLocaleDateString()}
								</span>
							</div>
						</div>
					))}
				</div>
				)
			}

      {failures.length === 0 && (
        <div className="text-center text-gray-500 mt-8">
          失敗カードがありません。新規作成ボタンから追加してください。
        </div>
      )}
    </div>
  );
} 