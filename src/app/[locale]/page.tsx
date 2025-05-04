'use client';

import React, { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useAddSetFormStore } from '@/store/addSetFormStore';
import { Button } from '@/components/ui/button';
import { toast } from "sonner";
import { useTranslations } from 'next-intl';
import { DatePickerComponent } from '@/components/home/DatePickerComponent';
import { AddSetFormComponent } from '@/components/home/AddSetFormComponent';
import { CurrentSetsTableComponent } from '@/components/home/CurrentSetsTableComponent';
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
    exerciseId: string;
    exerciseName: string;
    reps: number;
    weight: number;
}

interface FetchError extends Error {
    message: string;
}

export default function HomePage() {
    const { status } = useSession();
    // フックは常に同じ順序で呼び出す
    const t = useTranslations('home');
    const common = useTranslations('common');
    const format = useFormatter();

    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [isLoadingExercises, setIsLoadingExercises] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);

    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [currentSets, setCurrentSets] = useState<WorkoutSet[]>([]);
    const [isAddingSet, setIsAddingSet] = useState(false);
    const [isSavingWorkout, setIsSavingWorkout] = useState(false);

    const {
        selectedExerciseId,
        currentReps,
        currentWeight,
        resetForm,
    } = useAddSetFormStore();

    // ステート更新用の関数をuseEffectの中に移動
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

    const handleAddSet = () => {
        const repsNum = parseInt(currentReps, 10);
        const weightNum = parseFloat(currentWeight);
        const selectedExercise = exercises.find(ex => ex.id === selectedExerciseId);

        if (!selectedExercise || isNaN(repsNum) || repsNum < 0 || isNaN(weightNum) || weightNum < 0) {
            toast.error(t('invalidSetInput'));
            return;
        }

        setIsAddingSet(true);

        const newSet: WorkoutSet = {
            tempId: crypto.randomUUID(),
            exerciseId: selectedExerciseId,
            exerciseName: selectedExercise.name,
            reps: repsNum,
            weight: weightNum,
        };

        setCurrentSets(prevSets => [...prevSets, newSet]);

        resetForm();
        setIsAddingSet(false);
        toast.success(t('setAdded', { name: selectedExercise.name, reps: repsNum, weight: weightNum }));
    };

    const handleRemoveSet = (tempIdToRemove: string) => {
        setCurrentSets(prevSets => prevSets.filter(set => set.tempId !== tempIdToRemove));
        toast.info(t('setRemoved'));
    };

    const handleSaveWorkout = async () => {
        if (!selectedDate) {
            toast.error(t('pleaseSelectDate'));
            return;
        }
        if (currentSets.length === 0) {
            toast.error(t('pleaseAddSet'));
            return;
        }

        setIsSavingWorkout(true);
        setFetchError(null);

        const workoutData = {
            date: selectedDate.toISOString(),
            sets: currentSets.map(({ exerciseId, reps, weight }) => ({
                exerciseId,
                reps,
                weight,
            })),
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
            setCurrentSets([]);

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
                        disabled={isSavingWorkout || currentSets.length === 0}
                    >
                        {common('save')}
                    </Button>
                </div>

                <CurrentSetsTableComponent
                    currentSets={currentSets}
                    selectedDate={selectedDate}
                    onRemoveSet={handleRemoveSet}
                />
            </div>
            <div className="fixed bottom-16 left-0 w-full z-10">
                <div className="container mx-auto max-w-3xl px-4">
                    <AddSetFormComponent
                        exercises={exercises}
                        isLoadingExercises={isLoadingExercises}
                        fetchError={fetchError}
                        onAddSet={handleAddSet}
                        isAddingSet={isAddingSet}
                    />
                </div>
            </div>
        </>
    );
}
