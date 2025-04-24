'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Calendar } from "@/components/ui/calendar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Toaster, toast } from "sonner";
import dayjs from 'dayjs';

// Define types based on API response (including nested structures)
interface SetWithExercise {
    id: string;
    reps: number;
    weight: number;
    exercise: {
        id: string;
        name: string;
    };
    // Add other Set fields if needed
}

interface WorkoutLogWithSets {
    id: string;
    date: string; // ISO string from API
    sets: SetWithExercise[];
    // Add other WorkoutLog fields if needed
}

// エラー型を定義
interface FetchError extends Error {
    message: string;
}

export default function HistoryPage() {
    const { status } = useSession();
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [workoutLogs, setWorkoutLogs] = useState<WorkoutLogWithSets[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchWorkoutLogs = useCallback(async (date: Date | undefined) => {
        if (!date || status !== 'authenticated') {
            setWorkoutLogs([]); // Clear logs if no date or not authenticated
            return;
        }

        setIsLoading(true);
        setError(null);
        const formattedDate = dayjs(date).format('YYYY-MM-DD');

        try {
            const response = await fetch(`/api/workouts?date=${formattedDate}`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }
            const data: WorkoutLogWithSets[] = await response.json();
            setWorkoutLogs(data);
            if (data.length === 0) {
                toast.info(`No workouts recorded on ${formattedDate}.`);
            }
        } catch (err: unknown) {
            console.error("Failed to fetch workout logs:", err);
            const fetchError = err as FetchError;
            setError(fetchError.message || 'Failed to load workout logs.');
            toast.error(fetchError.message || 'Failed to load workout logs.');
        } finally {
            setIsLoading(false);
        }
    }, [status]);

    // Fetch logs when the selected date or session status changes
    useEffect(() => {
        fetchWorkoutLogs(selectedDate);
    }, [selectedDate, status, fetchWorkoutLogs]);

    if (status === 'loading') {
        return <div className="flex items-center justify-center min-h-screen">Loading session...</div>;
    }

    if (status === 'unauthenticated') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <h1 className="text-3xl font-bold mb-6">Workout History</h1>
                <p className="mb-4">Please sign in to view your workout history.</p>
                <Button onClick={() => signIn('google')}>Sign in with Google</Button>
            </div>
        );
    }

    // Authenticated view
    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <Toaster richColors position="top-center" />
            <h1 className="text-3xl font-bold mb-6 text-center">Workout History</h1>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Calendar */}
                <div className="flex justify-center md:justify-start">
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => {
                            setSelectedDate(date); // Update selected date
                            // Fetching is handled by useEffect
                        }}
                        className="rounded-md border"
                    />
                </div>

                {/* Workout Logs Display */}
                <div className="flex-1">
                    <h2 className="text-2xl font-semibold mb-4">
                        Workouts for {selectedDate ? dayjs(selectedDate).format('YYYY-MM-DD') : 'selected date'}
                    </h2>
                    {isLoading && <div>Loading workouts...</div>}
                    {error && <div className="text-red-500">Error: {error}</div>}
                    {!isLoading && !error && workoutLogs.length === 0 && (
                        <div>No workouts found for this date.</div>
                    )}
                    {!isLoading && !error && workoutLogs.length > 0 && (
                        <div className="space-y-4">
                            {workoutLogs.map((log) => (
                                <Card key={log.id}>
                                    <CardHeader>
                                        {/* Display time if needed, requires storing more precise time */}
                                        <CardTitle>Workout Log</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Exercise</TableHead>
                                                    <TableHead className="text-right">Reps</TableHead>
                                                    <TableHead className="text-right">Weight (kg)</TableHead>
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
