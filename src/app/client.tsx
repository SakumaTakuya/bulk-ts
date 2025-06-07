'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useFormatter } from 'use-intl';
import { Exercise, useWorkoutStore, WorkoutLog } from '@/lib/stores/workout-store';
import { DatePickerComponent } from '@/components/home/date-picker-component';
import { Button } from '@/components/ui/button';
import { WorkoutCardComponent } from '@/components/home/workout-card-component';
import { Input } from '@/components/ui/input';
import { clientExerciseSchema, createExerciseSchema, createWorkoutLogSchema } from '@/lib/schemas/workout-schemas';

interface WorkoutClientProps {
  initialExerciseData: Exercise[] | null;
  initialDataFetchError: boolean;
}

export default function WorkoutClient({
  initialExerciseData,
  initialDataFetchError,
}: WorkoutClientProps): React.JSX.Element {
  const [exercises, setExercises] = useState<Exercise[]>(initialExerciseData || []);
  const postExercises = useWorkoutStore((state) => state.postExercises);

  const { status } = useSession();
  const t = useTranslations();
  const format = useFormatter();
  const logs = useWorkoutStore((state) => state.logs);
  const addLog = useWorkoutStore((state) => state.addLog);

  const addSet = useWorkoutStore((state) => state.addSetToLog);

  // ワークアウト追加用
  const [exerciseInput, setExerciseInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const saveExercise = async (name: string, clientId: string): Promise<void> => {
    if (status !== 'authenticated') {
      return;
    }

    try {
      const exercise = await postExercises(name, clientId);
      setExercises((prev) => [...prev, exercise]);
    } catch (err: unknown) {
      return;
    }
  }

  const postWorkoutLog = async (log: WorkoutLog): Promise<void> => {
    if (status !== 'authenticated') {
      return;
    }

    const result = createWorkoutLogSchema.parse(log);

    try {



      // addLog(result.data);
    } catch (err: unknown) {
      return;
    }
  }

  const handleAddWorkout = (): void => {
    const trimmedInput = exerciseInput.trim();
    if (!trimmedInput) {
      return;
    }

    // 既存エクササイズ検索（大文字小文字区別なし完全一致）
    const exist = exercises.find((ex) => ex.name.toLowerCase() === trimmedInput.toLowerCase());
    const exerciseClientId = exist ? exist.clientId : crypto.randomUUID();

    // 未登録なら新規作成
    if (!exist) {
      saveExercise(trimmedInput, exerciseClientId);
    }

    // 既に同じエクササイズのワークアウトが存在する場合は追加しない
    if (logs.some((val) => val.exercise.clientId === exerciseClientId)) {
      setExerciseInput('');
      return;
    }

    const workoutClientId = crypto.randomUUID();
    addLog({
      clientId: workoutClientId,
      date: new Date().toISOString(),
      sets: [],
      exercise: exist ?? {
        name: trimmedInput,
        clientId: exerciseClientId,
      },
    });
  }

  const handleAddSet = (logId: string): void => {
    const log = logs.find((l) => l.clientId === logId);
    if (!log) {
      return;
    }

    const newSet = {
      id: crypto.randomUUID(),
      clientId: crypto.randomUUID(),
      workoutLogId: log.clientId,
      reps: 0,
      weight: 0,
    };

    addSet(log, newSet);
  }

  return (
    <></>
  )

}