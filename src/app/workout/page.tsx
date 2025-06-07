import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import WorkoutClient from './client';
import { Exercise } from '@/model';


async function getExercises(): Promise<Exercise[]> {
  const apiBaseUrl = process.env.NEXT_PUBLIC_VERCEL_URL || 'http://localhost:3000';

  const res = await fetch(`${apiBaseUrl}/api/exercises`, {
    cache: 'no-store',
    next: { revalidate: 60 }
  });

  if (!res.ok) {
    const errorBody = await res.text();
    console.error(`API fetch failed: ${res.status} - ${errorBody}`);
    throw new Error(`Failed to fetch user specific data: ${res.status}`);
  }
  return res.json();
}

export default async function WorkoutPage() {
  // 1. Server Componentでセッション情報を取得
  const session = await getServerSession(authOptions);

  let initialExerciseData: Exercise[] | null = null;
  let hasErrorFetchingData = false;

  // 2. セッション情報が存在する場合のみ、`/api/`エンドポイントからデータをフェッチ
  if (session && session.user?.id) { // セッションがあり、ユーザーIDが存在する場合
    try {
      initialExerciseData = await getExercises();
    } catch (error) {
      console.error("Error fetching user data in Server Component:", error);
      hasErrorFetchingData = true;
      // エラーが発生した場合でも、Client Componentにnullを渡すなどして対応
    }
  } else {
    // 認証されていない場合はログインページへリダイレクト
  }

  return (
    <WorkoutClient
      initialExerciseData={initialExerciseData}
      initialDataFetchError={hasErrorFetchingData}
    />
  );
}