'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

type Post = {
  id: string;
  title: string;
  body: string;
  playerName: string;
  createdAt: Date | null;
};

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const postsQuery = query(
      collection(db, 'posts'),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc'),
      limit(50),
    );

    const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
      setPosts(
        snapshot.docs.map((doc) => {
          const data = doc.data() as any;
          return {
            id: doc.id,
            title: data.title ?? '',
            body: data.body ?? '',
            playerName: data.playerName ?? 'NoName',
            createdAt:
              data.createdAt && typeof data.createdAt.toDate === 'function'
                ? data.createdAt.toDate()
                : null,
          };
        }),
      );
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const emptyStateMessage = useMemo(() => {
    if (isLoading) {
      return '読み込み中です…';
    }
    return 'まだ投稿がありません。最初の報告を投稿しましょう！';
  }, [isLoading]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-4xl flex-col gap-3 px-4 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Game BBS
            </h1>
            <p className="text-sm text-gray-600">
              プレイヤー報告専用掲示板です。最新50件の投稿が時系列で表示されます。
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-100"
            >
              ログイン
            </Link>
            <Link
              href="/new"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              新規投稿
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10">
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          {posts.length === 0 ? (
            <p className="text-sm text-gray-500">{emptyStateMessage}</p>
          ) : (
            <ul className="space-y-6">
              {posts.map((post) => (
                <li
                  key={post.id}
                  className="border-b border-gray-100 pb-6 last:border-none last:pb-0"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {post.title}
                    </h2>
                    <span className="text-xs text-gray-400">
                      {post.createdAt
                        ? post.createdAt.toLocaleString('ja-JP', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '記録中…'}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-medium text-gray-600">
                    投稿者: {post.playerName}
                  </p>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
                    {post.body}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
