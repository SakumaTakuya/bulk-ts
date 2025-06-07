'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useFormatter } from 'use-intl';
import { Exercise, useWorkoutStore } from '@/lib/stores/workout-store';
import { DatePickerComponent } from '@/components/home/date-picker-component';
import { Button } from '@/components/ui/button';
import { WorkoutCardComponent } from '@/components/home/workout-card-component';
import { Input } from '@/components/ui/input';
import { clientExerciseSchema, createExerciseSchema } from '@/lib/schemas/workout-schemas';

interface WorkoutClientProps {
  initialExerciseData: Exercise[] | null;
  initialDataFetchError: boolean;
}

export default function WorkoutClient({
  initialExerciseData,
  initialDataFetchError,
}: WorkoutClientProps): React.JSX.Element {
  const [exercises, setExercises] = useState<Exercise[]>(initialExerciseData || []);
  const updateExercise = useWorkoutStore((state) => state.updateExercise);

  const { status } = useSession();
  const t = useTranslations();
  const format = useFormatter();
  const logs = useWorkoutStore((state) => state.logs);
  const addLog = useWorkoutStore((state) => state.addLog);
  const updateLog = useWorkoutStore((state) => state.updateLog);

  // ワークアウト追加用
  const [exerciseInput, setExerciseInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const postExercises = async (name: string, clientId: string): Promise<void> => {
    if (status !== 'authenticated') {
      return;
    }

    try {
      const res = await fetch('/api/exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: createExerciseSchema.parse({ name }).toString(),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
      }
      const result = clientExerciseSchema.safeParse({
        ...(await res.json()),
        clientId,
      });

      if (!result.success) {
        throw new Error(result.error.message);
      }

      setExercises((prev) => [...prev, result.data]);
      updateExercise(result.data);
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
      postExercises(trimmedInput, exerciseClientId);
    }

    // 既に同じエクササイズのワークアウトが存在する場合は追加しない
    if (logs.some((val) => val.exercise.clientId === exerciseClientId)) {
      setExerciseInput('');
      return;
    }

    addLog({
      clientId: crypto.randomUUID(),
      date: new Date().toISOString(),
      sets: [],
      exercise: {
        id: exerciseClientId,
        name: trimmedInput,
        clientId: exerciseClientId,
      },
    });
  }

  return (
    <></>
  )

}