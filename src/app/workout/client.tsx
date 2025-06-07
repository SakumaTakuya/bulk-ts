'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useFormatter } from 'use-intl';
import { useWorkoutLogStore } from '@/store/workout';
import { Exercise } from '@/model';
import { DatePickerComponent } from '@/components/home/DatePickerComponent';
import { Button } from '@/components/ui/button';
import { WorkoutCardComponent } from '@/components/home/WorkoutCardComponent';
import { Input } from '@/components/ui/input';

interface WorkoutClientProps {
  initialExerciseData: Exercise[] | null;
  initialDataFetchError: boolean;
}


export default function WorkoutClient({
  initialExerciseData,
  initialDataFetchError,
}: WorkoutClientProps): React.JSX.Element {
  const [exercises, setExercises] = useState<Exercise[]>(initialExerciseData || []);

  const { status } = useSession();
  const t = useTranslations();
  const format = useFormatter();
  const logs = useWorkoutLogStore((state) => state.logs);
  const addLog = useWorkoutLogStore((state) => state.addLog);

  // ワークアウト追加用
  const [exerciseInput, setExerciseInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleAddWorkout = async (): Promise<void> => {
    const trimmedInput = exerciseInput.trim();
    if (!trimmedInput) {
      return;
    }

    // 既存エクササイズ検索（大文字小文字区別なし完全一致）
    const exercise = exercises.find((ex) => ex.name.toLowerCase() === trimmedInput.toLowerCase());
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
        setExercises((prev) => [...prev, newExercise]);
      } catch (err: unknown) {
        return;
      }
    }

    // 既に同じエクササイズのワークアウトが存在する場合は追加しない
    if (Object.values(logs).some((val) => val.exercise.id === exerciseId)) {
      setExerciseInput('');
      return;
    }





    setWorkouts((prev) => [
      ...prev,
      {
        exerciseId: exerciseId!,
        exerciseName,
        sets: [],
      },
    ]);
    setExerciseInput('');
    toast.success(t('home.workoutAdded', { name: exerciseName }));
  };

  return (
    <>
      <div className="container mx-auto p-4 max-w-3xl pb-32">
        <div className="flex flex-row items-end gap-4 mb-4">
          <div className="flex-1">
            <DatePickerComponent selectedDate={selectedDate} onSelectDate={setSelectedDate} />
          </div>
          <Button
            onClick={handleSaveWorkout}
            disabled={isSavingWorkout || workouts.flatMap((w) => w.sets).length === 0}
          >
            {t('save')}
          </Button>
        </div>

        {/* ワークアウトカードリスト */}
        {workouts.map((w) => (
          <WorkoutCardComponent
            key={w.exerciseId}
            exerciseId={w.exerciseId}
            exerciseName={w.exerciseName}
            sets={w.sets}
            onAddSet={handleAddSet}
            onRemoveSet={handleRemoveSet}
            onRemoveWorkout={handleRemoveWorkout}
            onEditSet={(exerciseId, tempId, reps, weight) => {
              setWorkouts((prev) =>
                prev.map((wo) =>
                  wo.exerciseId === exerciseId
                    ? {
                      ...wo,
                      sets: wo.sets.map((set) =>
                        set.tempId === tempId ? { ...set, reps, weight } : set
                      ),
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
                placeholder={t('home.exerciseName')}
                value={exerciseInput}
                onChange={(e) => setExerciseInput(e.target.value)}
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
                      onMouseDown={(e) => e.preventDefault()}
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
              <PlusCircle className="mr-2 h-4 w-4" /> {t('home.addWorkout')}
            </Button>
            {isLoadingExercises && <div className="mt-2">{t('home.loadingExercises')}</div>}
            {fetchError && <div className="mt-2 text-red-500">{fetchError}</div>}
            {!isLoadingExercises && exercises.length === 0 && !fetchError && (
              <div className="mt-2">{t('home.noExercisesFound')}</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
