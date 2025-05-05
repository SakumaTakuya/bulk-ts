'use client';

import React from 'react';
import { useAddSetFormStore } from '@/store/addSetFormStore'; // Import the store
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle } from "lucide-react";
import { useTranslations } from 'next-intl';
import Link from 'next/link';
// Define the Exercise type locally or import if shared
interface Exercise {
  id: string;
  name: string;
  // Add other fields if needed by this component, otherwise keep minimal
}

interface AddSetFormComponentProps {
  exercises: Exercise[];
  isLoadingExercises: boolean;
  fetchError: string | null;
  onAddSet: () => void;
  isAddingSet: boolean;
}

export function AddSetFormComponent({
  exercises,
  isLoadingExercises,
  fetchError,
  onAddSet,
  isAddingSet,
}: AddSetFormComponentProps) {
  const t = useTranslations('home');

  const {
    selectedExerciseId,
    currentReps,
    currentWeight,
    setSelectedExerciseId,
    setCurrentReps,
    setCurrentWeight,
  } = useAddSetFormStore();

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
        {!isLoadingExercises && exercises.length > 0 && (
          <>
            {/* Use state and setters from the store */}
            <Select value={selectedExerciseId} onValueChange={setSelectedExerciseId}>
              <SelectTrigger>
                <SelectValue placeholder={t('selectExercise')} />
              </SelectTrigger>
              <SelectContent>
                {exercises.map((exercise) => (
                  <SelectItem key={exercise.id} value={exercise.id}>
                    {exercise.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-4">
              <Input
                type="number"
                placeholder={t('reps')}
                value={currentReps}
                onChange={(e) => setCurrentReps(e.target.value)} // Use store setter
                min="0"
                step="1"
                required
                className="flex-1"
              />
              <Input
                type="number"
                placeholder={`${t('weight')} (kg)`}
                value={currentWeight}
                onChange={(e) => setCurrentWeight(e.target.value)} // Use store setter
                min="0"
                step="0.5" // Allow .5 increments
                required
                className="flex-1"
              />
            </div>
            <Button onClick={onAddSet} disabled={isAddingSet || !selectedExerciseId} className="w-full">
              <PlusCircle className="mr-2 h-4 w-4" /> {isAddingSet ? t("adding") : t("addSet")}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
