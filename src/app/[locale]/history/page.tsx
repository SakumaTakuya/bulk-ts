'use client';

import React, { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Calendar } from "@/components/ui/calendar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import dayjs from 'dayjs';
import { useFormatter } from 'next-intl';

// エクササイズを含むセットの型定義
interface SetWithExercise {
    id: string;
    reps: number;
    weight: number;
    exercise: {
        id: string;
        name: string;
    };
}

// セットを含むワークアウトログの型定義
interface WorkoutLogWithSets {
    id: string;
    date: string; // ISO string from API
    sets: SetWithExercise[];
}

// エラー型の定義
interface FetchError extends Error {
    message: string;
}

export default function HistoryPage() {
    const { status } = useSession();
    const format = useFormatter();
    const t = useTranslations('history');
    const home = useTranslations('home');
    const common = useTranslations('common');

    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [workoutLogs, setWorkoutLogs] = useState<WorkoutLogWithSets[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // fetchWorkoutLogs関数をuseEffect内に移動し、依存関係を簡素化
    useEffect(() => {
        const fetchWorkoutLogs = async () => {
            if (!selectedDate || status !== 'authenticated') {
                setWorkoutLogs([]);
                return;
            }

            setIsLoading(true);
            setError(null);
            const formattedDate = dayjs(selectedDate).format('YYYY-MM-DD');

            try {
                const response = await fetch(`/api/workouts?date=${formattedDate}`);
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
                }
                const data: WorkoutLogWithSets[] = await response.json();
                setWorkoutLogs(data);
            } catch (err: unknown) {
                console.error("Failed to fetch workout logs:", err);
                const fetchError = err as FetchError;
                setError(fetchError.message || t("failedToLoad"));
            } finally {
                setIsLoading(false);
            }
        };

        if (status === 'authenticated') {
            fetchWorkoutLogs();
        }
    }, [selectedDate, status, t]);

    if (status === 'loading') {
        return <div className="flex items-center justify-center min-h-screen">{common('loading')}</div>;
    }

    if (status === 'unauthenticated') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <h1 className="text-3xl font-bold mb-6">{t('title')}</h1>
                <Button onClick={() => signIn('google')}>{common('signIn')}</Button>
            </div>
        );
    }

    // 認証済みビュー
    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <div className="flex flex-col md:flex-row gap-6">
                {/* カレンダー */}
                <div className="flex justify-center md:justify-start">
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => {
                            setSelectedDate(date);
                        }}
                        className="rounded-md border"
                    />
                </div>

                {/* ワークアウトログの表示 */}
                <div className="flex-1">
                    <h2 className="text-2xl font-semibold mb-4">
                        {selectedDate ? format.dateTime(selectedDate) : t('selectDate')}
                    </h2>
                    {isLoading && <div>{common("loading")}</div>}
                    {error && <div className="text-red-500">{error}</div>}
                    {!isLoading && !error && workoutLogs.length === 0 && (
                        <div>{t('noWorkouts')}</div>
                    )}
                    {!isLoading && !error && workoutLogs.length > 0 && (
                        <div className="space-y-4">
                            {workoutLogs.map((log) => (
                                <Card key={log.id}>
                                    <CardHeader>
                                        <CardTitle>{t("title")}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>{home('exercise')}</TableHead>
                                                    <TableHead className="text-right">{home('reps')}</TableHead>
                                                    <TableHead className="text-right">{home('weight')} (kg)</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {log.sets.map((set) => (
                                                    <TableRow key={set.id}>
                                                        <TableCell>{set.exercise.name}</TableCell>
                                                        <TableCell className="text-right">{set.reps}</TableCell>
                                                        <TableCell className="text-right">{set.weight}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}