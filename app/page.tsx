'use client';

import Link from 'next/link';
import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import { User, onAuthStateChanged } from 'firebase/auth';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { auth, db, storage } from '@/lib/firebase';

type Post = {
  id: string;
  title: string;
  body: string;
  playerName: string;
  createdAt: Date | null;
  imageUrl?: string | null;
};

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const unsubscribePosts = onSnapshot(
      query(
        collection(db, 'posts'),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc'),
      ),
      (snapshot) => {
        setPosts(
          snapshot.docs.map((doc) => {
            const data = doc.data() as any;
            return {
              id: doc.id,
              title: data.title ?? '',
              body: data.body ?? '',
              playerName: data.playerName ?? 'NoName',
              imageUrl: data.imageUrl ?? null,
              createdAt:
                data.createdAt && typeof data.createdAt.toDate === 'function'
                  ? data.createdAt.toDate()
                  : null,
            };
          }),
        );
        setIsLoading(false);
      },
      () => setIsLoading(false),
    );

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => {
      unsubscribePosts();
      unsubscribeAuth();
    };
  }, []);

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      setImageFile(null);
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
      setImagePreview(null);
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('画像ファイルを選択してください。');
      event.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('画像サイズは5MB以下にしてください。');
      event.target.value = '';
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

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

      let uploadedImageUrl: string | null = null;
      if (imageFile) {
        const fileRef = ref(
          storage,
          `posts/${user.uid}/${Date.now()}-${imageFile.name}`,
        );
        await uploadBytes(fileRef, imageFile);
        uploadedImageUrl = await getDownloadURL(fileRef);
      }

      await addDoc(collection(db, 'posts'), {
        title: title.trim(),
        body: body.trim(),
        playerId: user.uid,
        playerName: user.displayName || user.email || 'NoName',
        status: 'active',
        imageUrl: uploadedImageUrl,
        createdAt: serverTimestamp(),
      });

      setTitle('');
      setBody('');
      setImageFile(null);
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
        setImagePreview(null);
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Failed to add a new post', error);
      alert('投稿に失敗しました。時間をおいて再度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  }

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
              プレイヤー報告専用掲示板です。すべての投稿が新着順に表示されます。
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-100"
            >
              {user ? '別アカウントでログイン' : 'ログイン'}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10">
        <section className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">投稿フォーム</h2>
            <p className="mt-1 text-sm text-gray-600">
              {user
                ? `ログイン中：${user.displayName ?? user.email ?? user.uid}`
                : '投稿するにはログインが必要です。'}
            </p>
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
              />
              <p className="mt-2 text-xs text-gray-400">残り {1000 - body.length} 文字</p>
            </div>

            <div>
              <label htmlFor="image" className="mb-2 block text-sm font-semibold text-gray-700">
                画像（任意・5MBまで）
              </label>
              <input
                id="image"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-600 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
                disabled={isSubmitting}
              />
              {imagePreview ? (
                <div className="mt-3 overflow-hidden rounded-lg border border-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview}
                    alt="選択した画像のプレビュー"
                    className="h-48 w-full object-cover"
                  />
                </div>
              ) : null}
            </div>

            <button
              type="submit"
              disabled={!user || isSubmitting}
              className="w-full rounded-lg bg-blue-600 py-3 text-base font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? '投稿中…' : '投稿する'}
            </button>
          </form>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-xl font-semibold text-gray-900">投稿一覧</h2>
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
                    <h3 className="text-lg font-semibold text-gray-900">{post.title}</h3>
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
                  <p className="mt-2 text-sm font-medium text-gray-600">投稿者: {post.playerName}</p>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
                    {post.body}
                  </p>
                  {post.imageUrl ? (
                    <div className="mt-4 overflow-hidden rounded-lg border border-gray-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={post.imageUrl}
                        alt={`${post.title} の投稿画像`}
                        className="w-full object-cover"
                      />
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
