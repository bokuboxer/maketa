'use client';

import { Failure } from '@/api/model/failure';
import { User } from '@/api/model/user';
import { auth } from '@/lib/firebase';
import { Modal, Slider } from '@mantine/core';
import '@mantine/core/styles.css';
import { useDisclosure } from '@mantine/hooks';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useCreateFailureFailuresPost, useGetUserByFirebaseUidUserFirebaseUidGet } from '../../api/generated/default/default';

export default function Failures() {
  const [user, setUser] = useState<User | null>(null);
  const [uid, setUid] = useState<string | null>(null);
  const [failures, setFailures] = useState<Failure[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [opened, { close, open }] = useDisclosure(false);
  const [description, setDescription] = useState('');
  const [selfScore, setSelfScore] = useState(4);

  const { mutate: createFailure } = useCreateFailureFailuresPost();
  const { data: usr, refetch } = useGetUserByFirebaseUidUserFirebaseUidGet(
    uid ?? '', // 空文字列を渡すのではなく
    { 
      query: {
        enabled: !!uid // uidが存在する場合のみクエリを実行
      }
    }
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!usr?.id) return;

    createFailure({
      data: {
        description,
        self_score: selfScore,
        user_id: usr.id
      } as any
    }, {
      onSuccess: async () => {
        setDescription('');
        setSelfScore(4);
        await refetch();
        close();
      }
    });
  };

  useEffect(() => {
    console.log(failures);
  }, [failures]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push('/signin');
      } else {
        setUid(user.uid);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (usr) {
      setUser(usr);
      setFailures(usr?.failures || []);
    }
  }, [usr]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Modal
        opened={opened} 
        onClose={close} 
        size="lg"
        centered
      >
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4 text-gray-900">新しい失敗カードを作成</h1>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                失敗の内容
              </label>
              <textarea
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                rows={4}
                placeholder="失敗の詳細を記入してください"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                自己評価スコア
              </label>
              <Slider
                color="indigo"
                size="lg"
                value={selfScore}
                onChange={setSelfScore}
                min={1}
                max={7}
                step={1}
                marks={[
                  { value: 1, label: '1' },
                  { value: 2, label: '2' },
                  { value: 3, label: '3' },
                  { value: 4, label: '4' },
                  { value: 5, label: '5' },
                  { value: 6, label: '6' },
                  { value: 7, label: '7' },
                ]}
                className=""
              />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={close}
                className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-100"
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                保存
              </button>
            </div>
          </form>
        </div>
      </Modal>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">失敗カード一覧</h1>
          <button
            onClick={open}
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
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {failures.map((failure) => (
              <div
                key={failure.id}
                className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-grow">
                      <p className="text-gray-600 break-words">{failure.description}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/failures/${failure.id}/analyze`);
                      }}
                      className="shrink-0 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 whitespace-nowrap"
                    >
                      分析
                    </button>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-sm text-gray-500">
                      スコア: {failure.self_score}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(failure.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}