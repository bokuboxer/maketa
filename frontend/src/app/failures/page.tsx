'use client';

export const dynamic = 'force-dynamic';

import { auth } from '@/lib/firebase';
import { Loader, Modal } from '@mantine/core';
import '@mantine/core/styles.css';
import { useDisclosure } from '@mantine/hooks';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useCreateFailureFailuresPost, useGetUserByFirebaseUidUserFirebaseUidGet } from '../../api/generated/default/default';

export default function Failures() {
  const [uid, setUid] = useState<string | null>(null);
  const router = useRouter();

  const [opened, { close, open }] = useDisclosure(false);
  const [description, setDescription] = useState('');

  const { mutate: createFailure } = useCreateFailureFailuresPost();
  const { data: user, refetch, isLoading } = useGetUserByFirebaseUidUserFirebaseUidGet(
    uid ?? '', // 空文字列を渡すのではなく
    { 
      query: {
        enabled: !!uid // uidが存在する場合のみクエリを実行
      }
    }
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user?.id) return;

    createFailure({
      data: {
        description,
        user_id: user.id
      } as any
    }, {
      onSuccess: async () => {
        setDescription('');
        await refetch();
        close();
      }
    });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push('/signin');
      } else {
        setUid(user.uid);
      }
    });
    return () => unsubscribe();
  }, [router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader color="black" size="lg" variant="dots" />
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
        classNames={{
          content: "p-0 bg-white rounded-lg mx-4",
          header: "hidden",
        }}
      >
        <div className="">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold text-black">新しい失敗カードを作成</h1>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                失敗の内容
              </label>
              <textarea
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-black text-black bg-white text-base leading-relaxed"
                rows={5}
                placeholder="失敗の詳細を記入してください"
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
      <div className="min-h-screen bg-white p-4 py-8">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-black">失敗カード一覧</h1>
            <button
              onClick={open}
              className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
            >
              新規作成
            </button>
          </div>

          {user?.failures.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-black text-lg">
                まだ失敗記録がありません。
                <br />
                「失敗を記録する」ボタンから新しい記録を追加してください。
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
                        <p className="text-sm text-black leading-relaxed line-clamp-3">{failure.description}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <button
                          onClick={() => router.push(
                            failure.has_analyzed 
                              ? `/failures/${failure.id}`
                              : `/failures/${failure.id}/analyze`
                          )}
                          className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
                        >
                          {failure.has_analyzed ? '詳細' : '分析'}
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
    </>
  );
}