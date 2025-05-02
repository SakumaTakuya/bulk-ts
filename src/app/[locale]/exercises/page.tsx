'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';

// Exercise型の定義
interface Exercise {
    id: string;
    name: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
}

// エラー型の定義
interface FetchError extends Error {
    message: string;
}

export default function ExercisesPage() {
    const { status } = useSession();
    // フックは条件付きで呼び出せないため、常に呼び出す
    const t = useTranslations('exercises');
    const common = useTranslations('common');

    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [newExerciseName, setNewExerciseName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // セッションが認証されたときにエクササイズを取得
    useEffect(() => {
        const fetchExercises = async () => {
            if (status !== 'authenticated') return;

            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch('/api/exercises');
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
                }
                const data: Exercise[] = await response.json();
                setExercises(data);
            } catch (err: unknown) {
                console.error("Failed to fetch exercises:", err);
                const fetchError = err as FetchError;
                setError(fetchError.message || 'Failed to load exercises.');
            } finally {
                setIsLoading(false);
            }
        };

        if (status === 'authenticated') {
            fetchExercises();
        }
        // ユーザーがログアウトした場合、状態をリセット
        if (status === 'unauthenticated') {
            setExercises([]);
            setError(null);
            setNewExerciseName('');
        }
    }, [status]);

    const handleCreateExercise = async (e: FormEvent) => {
        e.preventDefault();
        if (!newExerciseName.trim()) {
            return;
        }
        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch('/api/exercises', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: newExerciseName }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const createdExercise: Exercise = await response.json();
            setExercises((prev) => [...prev, createdExercise].sort((a, b) => a.name.localeCompare(b.name)));
            setNewExerciseName(''); // 入力をクリア
        } catch (err: unknown) {
            console.error("Failed to create exercise:", err);
            const fetchError = err as FetchError;
            setError(fetchError.message || 'Failed to create exercise.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (status === 'loading') {
        return <div>Loading session...</div>;
    }

    if (status === 'unauthenticated') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <p className="mb-4">Please sign in to manage exercises.</p>
                <Button onClick={() => signIn('google')}>Sign in with Google</Button>
            </div>
        );
    }

    // 認証済みビュー
    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">{t('title')}</h1>
                <Button variant="outline" onClick={() => signOut()}>{common('signOut')}</Button>
            </div>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>{t('addExercise')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleCreateExercise} className="flex gap-2">
                        <Input
                            type="text"
                            placeholder={t('name')}
                            value={newExerciseName}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewExerciseName(e.target.value)}
                            disabled={isSubmitting}
                            required
                        />
                        <Button type="submit" disabled={isSubmitting || !newExerciseName.trim()}>
                            {isSubmitting ? `${t('adding')}...` : t('addExercise')}
                        </Button>
                    </form>
                </CardContent>
                {error && <CardFooter className="text-red-500">{error}</CardFooter>}
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t('yourExercises')}</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading && <div>{t('loading')}...</div>}
                    {!isLoading && exercises.length === 0 && !error && (
                        <div>{t('noExercises')}</div>
                    )}
                    {!isLoading && exercises.length > 0 && (
                        <ul>
                            {exercises.map((exercise) => (
                                <li key={exercise.id} className="border-b py-2">
                                    {exercise.name}
                                </li>
                            ))}
                        </ul>
                    )}
                    {!isLoading && error && <div className="text-red-500 mt-4">{error}</div>}
                </CardContent>
            </Card>
        </div>
    );
}