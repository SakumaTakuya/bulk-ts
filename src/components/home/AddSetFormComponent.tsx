'use client';

import React from 'react';
import { useAddSetFormStore } from '@/store/addSetFormStore'; // Import the store
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { PlusCircle } from "lucide-react";
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useState, useMemo } from "react";
// Define the Exercise type locally or import if shared
interface Exercise {
  id: string;
  name: string;
}

interface AddSetFormComponentProps {
  exercises: Exercise[];
  isLoadingExercises: boolean;
  fetchError: string | null;
  onAddSet: () => void;
  isAddingSet: boolean;
  exerciseInput: string;
  setExerciseInput: (value: string) => void;
}

export function AddSetFormComponent({
  exercises,
  isLoadingExercises,
  fetchError,
  onAddSet,
  isAddingSet,
  exerciseInput,
  setExerciseInput,
}: AddSetFormComponentProps) {
  const t = useTranslations('home');

  const {
    setSelectedExerciseId,
    currentReps,
    currentWeight,
    setCurrentReps,
    setCurrentWeight,
  } = useAddSetFormStore();

  // サジェスト候補
  const filteredExercises = useMemo(
    () =>
      exercises.filter((ex) =>
        ex.name.toLowerCase().includes(exerciseInput.toLowerCase())
      ),
    [exercises, exerciseInput]
  );

  // Input focus状態
  const [isFocused, setIsFocused] = useState(false);

  // サジェスト選択時
  const handleSelectSuggestion = (exercise: Exercise) => {
    setExerciseInput(exercise.name);
    setSelectedExerciseId(exercise.id);
  };

  // 入力変更時
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExerciseInput(e.target.value);
    // 候補に完全一致するものがあればidセット、なければ空
    const found = exercises.find(
      (ex) => ex.name.toLowerCase() === e.target.value.toLowerCase()
    );
    setSelectedExerciseId(found ? found.id : '');
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{t("addSet")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoadingExercises && <div>{t('loadingExercises')}</div>}
        {fetchError && <div className="text-red-500">{fetchError}</div>}
        {!isLoadingExercises && exercises.length === 0 && !fetchError && (
          <div>{t('noExercisesFound')} <Link href="/exercises" className="text-blue-500 underline">{t('manageExercises')}</Link></div>
        )}
        {!isLoadingExercises && (
          <>
            {/* エクササイズ名入力＋サジェスト */}
            <div className="relative">
              <Input
                type="text"
                placeholder={t('exerciseName')}
                value={exerciseInput}
                onChange={(e) => {
                  setExerciseInput(e.target.value);
                  handleInputChange(e);
                }}
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
                      onClick={() => handleSelectSuggestion(ex)}
                    >
                      {ex.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex gap-4">
              <div className="flex items-center flex-1">
                <Input
                  type="number"
                  placeholder={t('reps')}
                  value={currentReps}
                  onChange={(e) => setCurrentReps(e.target.value)}
                  min="0"
                  step="1"
                  required
                  className="flex-1"
                />
                <span className="ml-2 text-muted-foreground select-none pointer-events-none">回</span>
              </div>
              <div className="flex items-center flex-1">
                <Input
                  type="number"
                  placeholder={t('weight')}
                  value={currentWeight}
                  onChange={(e) => setCurrentWeight(e.target.value)}
                  min="0"
                  step="0.5"
                  required
                  className="flex-1"
                />
                <span className="ml-2 text-muted-foreground select-none pointer-events-none">kg</span>
              </div>
            </div>
            <Button
              onClick={onAddSet}
              disabled={isAddingSet || !exerciseInput.trim()}
              className="w-full"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> {isAddingSet ? t("adding") : t("addSet")}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
