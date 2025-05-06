'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { toast } from "sonner";
import { useTranslations } from 'next-intl';
import { DatePickerComponent } from '@/components/home/DatePickerComponent';
import { WorkoutCardComponent } from '@/components/home/WorkoutCardComponent';
import { Input } from '@/components/ui/input';
import { PlusCircle } from "lucide-react";
import { useFormatter } from 'use-intl';

interface Exercise {
    id: string;
    name: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
}

interface WorkoutSet {
    tempId: string;
    reps: number;
    weight: number;
}

interface Workout {
    exerciseId: string;
    exerciseName: string;
    sets: WorkoutSet[];
}

interface FetchError extends Error {
    message: string;
}

export default function HomePage() {
    const { status } = useSession();
    const t = useTranslations('home');
    const common = useTranslations('common');
    const format = useFormatter();

    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [isLoadingExercises, setIsLoadingExercises] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);

    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const [isSavingWorkout, setIsSavingWorkout] = useState(false);

    // ワークアウト追加用
    const [exerciseInput, setExerciseInput] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    // サジェスト候補
    const filteredExercises = useMemo(
        () =>
            exercises.filter((ex) =>
                ex.name.toLowerCase().includes(exerciseInput.toLowerCase())
            ),
        [exercises, exerciseInput]
    );

    useEffect(() => {
        const fetchExercises = async () => {
            if (status !== 'authenticated') return;

            setIsLoadingExercises(true);
            setFetchError(null);
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
                setFetchError(fetchError.message || 'Failed to load exercises.');
                toast.error(fetchError.message || 'Failed to load exercises.');
            } finally {
                setIsLoadingExercises(false);
            }
        };

        if (status === 'authenticated') {
            fetchExercises();
        }
    }, [status]);

    // ワークアウト追加
    const handleAddWorkout = async () => {
        const trimmedInput = exerciseInput.trim();
        if (!trimmedInput) {
            toast.error(t('invalidSetInput'));
            return;
        }
        // 既存エクササイズ検索（大文字小文字区別なし完全一致）
        const exercise = exercises.find(
            ex => ex.name.toLowerCase() === trimmedInput.toLowerCase()
        );
        let exerciseId = exercise?.id;
        let exerciseName = trimmedInput;

        // 未登録なら新規作成
        if (!exercise) {
            try {
                const res = await fetch('/api/exercises', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: trimmedInput }),
                });
                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
                }
                const newExercise: Exercise = await res.json();
                exerciseId = newExercise.id;
                exerciseName = newExercise.name;
                setExercises(prev => [...prev, newExercise]);
            } catch (err: unknown) {
                if (err && typeof err === "object" && "message" in err) {
                    toast.error((err as { message?: string }).message || t('failedToAddExercise'));
                } else {
                    toast.error(t('failedToAddExercise'));
                }
                return;
            }
        }

        // 既に同じエクササイズのワークアウトが存在する場合は追加しない
        if (workouts.some(w => w.exerciseId === exerciseId)) {
            toast.info(t('alreadyAddedWorkout'));
            setExerciseInput('');
            return;
        }

        setWorkouts(prev => [
            ...prev,
            {
                exerciseId: exerciseId!,
                exerciseName,
                sets: [],
            }
        ]);
        setExerciseInput('');
        toast.success(t('workoutAdded', { name: exerciseName }));
    };

    // 各ワークアウト内でセット追加
    const handleAddSet = (exerciseId: string, reps: number, weight: number) => {
        setWorkouts(prev =>
            prev.map(w =>
                w.exerciseId === exerciseId
                    ? {
                        ...w,
                        sets: [
                            ...w.sets,
                            {
                                tempId: crypto.randomUUID(),
                                reps,
                                weight,
                            }
                        ]
                    }
                    : w
            )
        );
    };

    // 各ワークアウト内でセット削除
    const handleRemoveSet = (exerciseId: string, tempId: string) => {
        setWorkouts(prev =>
            prev.map(w =>
                w.exerciseId === exerciseId
                    ? { ...w, sets: w.sets.filter(set => set.tempId !== tempId) }
                    : w
            )
        );
    };

    // ワークアウト削除
    const handleRemoveWorkout = (exerciseId: string) => {
        setWorkouts(prev => prev.filter(w => w.exerciseId !== exerciseId));
    };

    // 保存
    const handleSaveWorkout = async () => {
        if (!selectedDate) {
            toast.error(t('pleaseSelectDate'));
            return;
        }
        const allSets = workouts.flatMap(w =>
            w.sets.map(set => ({
                exerciseId: w.exerciseId,
                reps: set.reps,
                weight: set.weight,
            }))
        );
        if (allSets.length === 0) {
            toast.error(t('pleaseAddSet'));
            return;
        }

        setIsSavingWorkout(true);
        setFetchError(null);

        const workoutData = {
            date: selectedDate.toISOString(),
            sets: allSets,
        };

        try {
            const response = await fetch('/api/workouts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(workoutData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            toast.success(t('workoutSaved', { date: format.dateTime(selectedDate) }));
            setWorkouts([]);

        } catch (err: unknown) {
            console.error("Failed to save workout:", err);
            const fetchError = err as FetchError;
            setFetchError(fetchError.message || t('failedToSaveWorkout'));
            toast.error(fetchError.message || t('failedToSaveWorkout'));
        } finally {
            setIsSavingWorkout(false);
        }
    };

    if (status === 'loading') {
        return <div className="flex items-center justify-center min-h-screen">{common("loading")}</div>;
    }

    if (status === 'unauthenticated') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <h1 className="text-3xl font-bold mb-6">{t('title')}</h1>
                <Button onClick={() => signIn('google')}>{common('signIn')}</Button>
            </div>
        );
    }

    return (
        <>
            <div className="container mx-auto p-4 max-w-3xl pb-32">
                <div className="flex flex-row items-end gap-4 mb-4">
                    <div className="flex-1">
                        <DatePickerComponent
                            selectedDate={selectedDate}
                            onSelectDate={setSelectedDate}
                        />
                    </div>
                    <Button
                        onClick={handleSaveWorkout}
                        disabled={isSavingWorkout || workouts.flatMap(w => w.sets).length === 0}
                    >
                        {common('save')}
                    </Button>
                </div>

                {/* ワークアウトカードリスト */}
                {workouts.map(w => (
                    <WorkoutCardComponent
                        key={w.exerciseId}
                        exerciseId={w.exerciseId}
                        exerciseName={w.exerciseName}
                        sets={w.sets}
                        onAddSet={handleAddSet}
                        onRemoveSet={handleRemoveSet}
                        onRemoveWorkout={handleRemoveWorkout}
                        onEditSet={(exerciseId, tempId, reps, weight) => {
                            setWorkouts(prev =>
                                prev.map(wo =>
                                    wo.exerciseId === exerciseId
                                        ? {
                                            ...wo,
                                            sets: wo.sets.map(set =>
                                                set.tempId === tempId
                                                    ? { ...set, reps, weight }
                                                    : set
                                            )
                                        }
                                        : wo
                                )
                            );
                        }}
                    />
                ))}
            </div>
            {/* ワークアウト追加フォーム */}
            <div className="fixed bottom-16 left-0 w-full z-10">
                <div className="container mx-auto max-w-3xl px-4">
                    <div className="mb-6">
                        <div className="relative">
                            <Input
                                type="text"
                                placeholder={t('exerciseName')}
                                value={exerciseInput}
                                onChange={e => setExerciseInput(e.target.value)}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                                autoComplete="off"
                                className="w-full"
                                data-testid="exercise-input"
                            />
                            {isFocused && exerciseInput && filteredExercises.length > 0 && (
                                <ul className="absolute z-20 bg-accent border-collapse w-full mt-1 max-h-40 overflow-auto rounded shadow">
                                    {filteredExercises.map((ex) => (
                                        <li
                                            key={ex.id}
                                            className="relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm select-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                            onMouseDown={e => e.preventDefault()}
                                            onClick={() => {
                                                setExerciseInput(ex.name);
                                                setIsFocused(false);
                                            }}
                                        >
                                            {ex.name}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <Button
                            onClick={handleAddWorkout}
                            disabled={isLoadingExercises || !exerciseInput.trim()}
                            className="w-full mt-2"
                        >
                            <PlusCircle className="mr-2 h-4 w-4" /> {t("addWorkout")}
                        </Button>
                        {isLoadingExercises && <div className="mt-2">{t('loadingExercises')}</div>}
                        {fetchError && <div className="mt-2 text-red-500">{fetchError}</div>}
                        {!isLoadingExercises && exercises.length === 0 && !fetchError && (
                            <div className="mt-2">{t('noExercisesFound')}</div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
