'use client';

import React from 'react';
import { Exercise } from '@/types/exercise';

interface ExerciseProps {
  initialExercises: Exercise[];
  children?: React.ReactNode;
}

export async function Excercises({
  initialExercises,
  children,
}: ExerciseProps): Promise<React.JSX.Element> {


  return (
    <div className="flex flex-col gap-4">
      {initialExercises.map((exercise) => (
        <div key={exercise.id} className="p-4 border rounded-md">
          <h3 className="text-lg font-semibold">{exercise.name}</h3>
          <p>{exercise.description}</p>
          {children}
        </div>
      ))}
    </div>
  );
}

export default Excercises;