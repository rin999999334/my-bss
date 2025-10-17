'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '@/lib/firebase';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    try {
      setLoading(true);
      await signInWithPopup(auth, provider);
      router.push('/');
    } catch (error) {
      console.error('Failed to sign in with Google', error);
      alert('ログインに失敗しました。時間をおいて再度お試しください。');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-md">
        <h1 className="text-3xl font-bold text-gray-900">Game BBS</h1>
        <p className="mt-3 text-sm text-gray-600">プレイヤー報告専用掲示板です。</p>
        <button
          type="button"
          onClick={handleLogin}
          disabled={loading}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 text-base font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? 'ログイン中...' : 'Googleでログイン'}
        </button>
        <div className="mt-6 text-sm text-gray-500">
          <Link
            href="/terms"
            className="underline underline-offset-2 hover:text-gray-700"
          >
            利用規約を見る
          </Link>
        </div>
      </div>
    </div>
  );
}
