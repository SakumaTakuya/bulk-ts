'use client';

import React, { useMemo, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useFormatter } from 'use-intl';
import { Exercise, useWorkoutStore, WorkoutLog, WorkoutSet } from '@/lib/stores/workout-store';
import { Button } from '@/components/ui/button';
import { DatePickerComponent } from '@/components/home/date-picker-component';
import { WorkoutCardComponent } from '@/components/home/workout-card-component';
import { Input } from '@/components/ui/input';
import { PlusCircle } from 'lucide-react';

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
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const saveDebug = (date: Date | undefined) => {
    console.log(date);
    setSelectedDate(date);
  };

  const { status } = useSession();
  const t = useTranslations();
  const format = useFormatter();
  const logs = useWorkoutStore((state) => state.logs);
  const addLog = useWorkoutStore((state) => state.addLog);
  const postLogs = useWorkoutStore((state) => state.postWorkoutLogs);

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

  const saveLogs = async (): Promise<void> => {
    if (status !== 'authenticated') {
      return;
    }

    try {
      await postLogs();
    } catch (err: unknown) {
      return;
    }
  }

  const handleAddWorkout = (): void => {
    const date = selectedDate;
    if (!date) {
      return;
    }

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
      date: date.toISOString(),
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

  const handleRemoveSet = (logId: string, set: WorkoutSet): void => {
    const log = logs.find((l) => l.clientId === logId);
    if (!log) {
      return;
    }

    useWorkoutStore.getState().removeSetFromLog(log, set);
  }

  // suggestion
  const filteredExercises = useMemo(
    () => exercises.filter((exercise) => exercise.name.toLowerCase().includes(exerciseInput.toLowerCase())),
    [exercises, exerciseInput]
  );

  if (status === 'loading') {
    return <></>
  }

  if (status === 'unauthenticated') {
    return (<>
      <Button onClick={() => signIn('google')}>{t('signIn')}</Button>
    </>);
  }

  return (
    <article>
      <section className="container mx-auto max-w-3xl">
        <div className="flex flex-row items-end gap-4 mb-4">
          <div className="flex-1">
            <DatePickerComponent selectedDate={selectedDate} onSelectDate={saveDebug} />
          </div>
          <Button
            onClick={saveLogs}
            disabled={!selectedDate || logs.flatMap((w) => w.sets).length === 0}
          >
            {t('save')}
          </Button>
        </div>
        {logs.map((log) => (
          <WorkoutCardComponent
            key={log.clientId}
            exerciseId={log.exercise.clientId}
            onAddSet={handleAddSet}
            onRemoveSet={(id, set) => { }}
            onRemoveWorkout={(id) => useWorkoutStore.getState().removeLog(log)}
            onEditSet={(id, set) => { }}
            exerciseName={log.exercise.name}
            sets={[]}
          />
        ))}
      </section>
      <section className="fixed bottom-16 left-0 w-full z-10">
        <div className="container mx-auto max-w-3xl px-4">
          <div className="relative">
            <Input
              type="text"
              placeholder={t('exerciseName')}
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
            disabled={!exerciseInput.trim()}
            className="w-full mt-2"
          >
            <PlusCircle className="mr-2 h-4 w-4" /> {t('add')}
          </Button>
        </div>
      </section>
    </article>
  )

}