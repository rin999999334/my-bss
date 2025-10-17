'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';

export default function NewPostPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) {
      alert('投稿するにはログインが必要です。/login からログインしてください。');
      return;
    }

    if (!title.trim() || !body.trim()) {
      alert('タイトルと本文を入力してください。');
      return;
    }

    try {
      setIsSubmitting(true);
      await addDoc(collection(db, 'posts'), {
        title: title.trim(),
        body: body.trim(),
        playerId: user.uid,
        playerName: user.displayName || 'NoName',
        status: 'active',
        createdAt: serverTimestamp(),
      });

      setTitle('');
      setBody('');
      router.push('/');
    } catch (error) {
      console.error('Failed to add a new post', error);
      alert('投稿に失敗しました。時間をおいて再度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-6 flex items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="underline underline-offset-2 hover:text-gray-700">
            トップに戻る
          </Link>
          <span>›</span>
          <span>新規投稿</span>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">新規投稿</h1>
            <p className="mt-2 text-sm text-gray-600">
              プレイヤー報告を作成して掲示板に共有しましょう。
            </p>
          </div>

          <div className="mb-6 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            {user
              ? `ログイン中：${user.displayName ?? user.email ?? user.uid}`
              : (
                <span>
                  未ログインです。{' '}
                  <Link href="/login" className="underline underline-offset-2 hover:text-blue-800">
                    こちらからログイン
                  </Link>
                  してください。
                </span>
              )}
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="title" className="mb-2 block text-sm font-semibold text-gray-700">
                タイトル
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="例：レイドボスの状況を報告"
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                maxLength={100}
              />
            </div>

            <div>
              <label htmlFor="body" className="mb-2 block text-sm font-semibold text-gray-700">
                本文
              </label>
              <textarea
                id="body"
                value={body}
                onChange={(event) => setBody(event.target.value)}
                placeholder="詳細な状況、対応済みかどうか等を入力してください。"
                rows={6}
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                maxLength={1000}
              />
              <p className="mt-2 text-xs text-gray-400">
                残り {1000 - body.length} 文字
              </p>
            </div>

            <button
              type="submit"
              disabled={!user || isSubmitting}
              className="w-full rounded-lg bg-blue-600 py-3 text-base font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? '投稿中…' : '投稿する'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
