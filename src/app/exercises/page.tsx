'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button'; // Assuming shadcn Button is installed
import { Input } from '@/components/ui/input'; // Assuming shadcn Input is installed
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'; // Assuming shadcn Card is installed
import { toast } from "sonner"; // Assuming sonner (toast) is installed via shadcn

// Define the Exercise type based on Prisma schema
interface Exercise {
  id: string;
  name: string;
  userId: string;
  createdAt: string; // Dates are typically strings when serialized
  updatedAt: string;
}

export default function ExercisesPage() {
  const { data: session, status } = useSession();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchExercises = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/exercises');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      const data: Exercise[] = await response.json();
      setExercises(data);
    } catch (err: any) {
      console.error("Failed to fetch exercises:", err);
      setError(err.message || 'Failed to load exercises.');
      // toast.error(err.message || 'Failed to load exercises.'); // Use toast for user feedback
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch exercises when the session is loaded and authenticated
  useEffect(() => {
    if (status === 'authenticated') {
      fetchExercises();
    }
    // Reset state if user logs out
    if (status === 'unauthenticated') {
        setExercises([]);
        setError(null);
        setNewExerciseName('');
    }
  }, [status]); // Re-run when session status changes

  const handleCreateExercise = async (e: FormEvent) => {
    e.preventDefault();
    if (!newExerciseName.trim()) {
      // toast.warning("Exercise name cannot be empty.");
      return;
    }
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/exercises', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newExerciseName }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const createdExercise: Exercise = await response.json();
      setExercises((prev) => [...prev, createdExercise].sort((a, b) => a.name.localeCompare(b.name))); // Add and sort
      setNewExerciseName(''); // Clear input
      // toast.success(`Exercise "${createdExercise.name}" created!`);
    } catch (err: any) {
      console.error("Failed to create exercise:", err);
      setError(err.message || 'Failed to create exercise.');
      // toast.error(err.message || 'Failed to create exercise.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'loading') {
    return <div>Loading session...</div>;
  }

  if (status === 'unauthenticated') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="mb-4">Please sign in to manage exercises.</p>
        <Button onClick={() => signIn('google')}>Sign in with Google</Button>
      </div>
    );
  }

  // Authenticated view
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Manage Exercises</h1>
        <Button variant="outline" onClick={() => signOut()}>Sign Out</Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Add New Exercise</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateExercise} className="flex gap-2">
            <Input
              type="text"
              placeholder="E.g., Bench Press"
              value={newExerciseName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewExerciseName(e.target.value)}
              disabled={isSubmitting}
              required
            />
            <Button type="submit" disabled={isSubmitting || !newExerciseName.trim()}>
              {isSubmitting ? 'Adding...' : 'Add Exercise'}
            </Button>
          </form>
        </CardContent>
        {error && <CardFooter className="text-red-500">{error}</CardFooter>}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Exercises</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && <div>Loading exercises...</div>}
          {!isLoading && exercises.length === 0 && !error && (
            <div>No exercises found. Add one above!</div>
          )}
          {!isLoading && exercises.length > 0 && (
            <ul>
              {exercises.map((exercise) => (
                <li key={exercise.id} className="border-b py-2">
                  {exercise.name}
                  {/* Add Edit/Delete buttons later */}
                </li>
              ))}
            </ul>
          )}
           {/* Display fetch error here as well */}
           {!isLoading && error && <div className="text-red-500 mt-4">{error}</div>}
        </CardContent>
      </Card>
       {/* Add Toaster component here later for toast notifications */}
       {/* <Toaster /> */}
    </div>
  );
}
