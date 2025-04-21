'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle } from "lucide-react";

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
  selectedExerciseId: string;
  onExerciseChange: (id: string) => void;
  currentReps: string;
  onRepsChange: (value: string) => void;
  currentWeight: string;
  onWeightChange: (value: string) => void;
  onAddSet: () => void;
  isAddingSet: boolean;
}

export function AddSetFormComponent({
  exercises,
  isLoadingExercises,
  fetchError,
  selectedExerciseId,
  onExerciseChange,
  currentReps,
  onRepsChange,
  currentWeight,
  onWeightChange,
  onAddSet,
  isAddingSet,
}: AddSetFormComponentProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Add Set</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoadingExercises && <div>Loading exercises...</div>}
        {fetchError && <div className="text-red-500">{fetchError}</div>}
        {!isLoadingExercises && exercises.length === 0 && !fetchError && (
          <div>No exercises found. <a href="/exercises" className="text-blue-500 underline">Manage exercises</a> first.</div>
        )}
        {!isLoadingExercises && exercises.length > 0 && (
          <>
            <Select value={selectedExerciseId} onValueChange={onExerciseChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select exercise" />
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
                placeholder="Reps"
                value={currentReps}
                onChange={(e) => onRepsChange(e.target.value)}
                min="0"
                step="1"
                required
                className="flex-1"
              />
              <Input
                type="number"
                placeholder="Weight (kg)"
                value={currentWeight}
                onChange={(e) => onWeightChange(e.target.value)}
                min="0"
                step="0.5" // Allow .5 increments
                required
                className="flex-1"
              />
            </div>
            <Button onClick={onAddSet} disabled={isAddingSet || !selectedExerciseId} className="w-full">
              <PlusCircle className="mr-2 h-4 w-4" /> {isAddingSet ? 'Adding...' : 'Add Set'}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
