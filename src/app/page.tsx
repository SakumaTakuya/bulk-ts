import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import WorkoutClient from './client';
import { Exercise } from '@/lib/stores/workout-store';
import SignInButton from '@/components/signIn';
import prisma from '@/lib/prisma';
import { clientExerciseSchema } from '@/lib/schemas/workout-schemas';


async function getExercises(): Promise<Exercise[]> {
  const session = await getServerSession(authOptions);

  // Ensure user is authenticated and we have the user ID
  if (!session?.user?.id) {
    throw Error("Unauthorized");
  }
  const userId = session.user.id;

  const exercises = await prisma.exercise.findMany({
    where: {
      userId: userId,
    },
    orderBy: {
      name: 'asc',
    },
  });

  return exercises.map((exercise) => {
    const result = clientExerciseSchema.safeParse({
      ...exercise,
      clientId: exercise.id,
    });

    if (!result.success) {
      throw new Error(result.error.message);
    }

    return result.data
  });
}

export default async function HomePage() {
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
    return <>
      <SignInButton />
    </>
  }

  return (
    <WorkoutClient
      initialExerciseData={initialExerciseData}
      initialDataFetchError={hasErrorFetchingData}
    />
  );
}