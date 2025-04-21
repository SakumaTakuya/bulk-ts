'use client';

import React, { useState, useEffect } from 'react'; // Removed FormEvent as it's not used
import { useSession, signIn } from 'next-auth/react';
import { useAddSetFormStore } from '@/store/addSetFormStore'; // Import the store
import { Button } from '@/components/ui/button';
// Input, Card, Popover, Calendar, Select, Table are now used within sub-components
import { Toaster, toast } from "sonner";
import { PlusCircle, Trash2 } from "lucide-react"; // Keep icons used directly here
// cn is used by sub-components, not directly here anymore
import dayjs from 'dayjs';
import { DatePickerComponent } from '@/components/home/DatePickerComponent';
import { AddSetFormComponent } from '@/components/home/AddSetFormComponent';
import { CurrentSetsTableComponent } from '@/components/home/CurrentSetsTableComponent';

// Define the Exercise type (matching the one used in exercises page/API)
// This should ideally be moved to a shared types file (e.g., src/types/index.ts)
// For now, AddSetFormComponent defines its own minimal version.
interface Exercise {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// Define the structure for a set being added/managed in the main state
interface WorkoutSet {
  tempId: string; // Temporary ID for list key
  exerciseId: string;
  exerciseName: string; // Store name for display
  reps: number;
  weight: number;
}

export default function HomePage() {
  const { data: session, status } = useSession();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoadingExercises, setIsLoadingExercises] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentSets, setCurrentSets] = useState<WorkoutSet[]>([]);
  // Removed local state for form fields, now managed by Zustand
  const [isAddingSet, setIsAddingSet] = useState(false); // Keep state for AddSet button loading
  const [isSavingWorkout, setIsSavingWorkout] = useState(false);

  // Get form state and actions from Zustand store
  const {
    selectedExerciseId,
    currentReps,
    currentWeight,
    resetForm, // Get the reset action
    // setSelectedExerciseId // Get setter if needed for default setting
  } = useAddSetFormStore();

  // Fetch exercises when authenticated
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
        // Removed setting default selectedExerciseId here - handled by store default or could be set via store setter if needed
        // Example: if (data.length > 0 && !selectedExerciseId) { setSelectedExerciseId(data[0].id); }
      } catch (err: any) {
        console.error("Failed to fetch exercises:", err);
        setFetchError(err.message || 'Failed to load exercises.');
        toast.error(err.message || 'Failed to load exercises.');
      } finally {
        setIsLoadingExercises(false);
      }
    };

    fetchExercises();
  }, [status]); // Re-run when session status changes

  const handleAddSet = () => {
    // Read values directly from Zustand store
    const repsNum = parseInt(currentReps, 10);
    const weightNum = parseFloat(currentWeight);
    const selectedExercise = exercises.find(ex => ex.id === selectedExerciseId);

    if (!selectedExercise || isNaN(repsNum) || repsNum < 0 || isNaN(weightNum) || weightNum < 0) {
      toast.error("Please select an exercise and enter valid reps/weight (non-negative numbers).");
      return;
    }

    setIsAddingSet(true); // Indicate loading state if needed, though usually fast

    const newSet: WorkoutSet = {
      tempId: crypto.randomUUID(), // Simple unique key for the list
      exerciseId: selectedExerciseId,
      exerciseName: selectedExercise.name,
      reps: repsNum,
      weight: weightNum,
    };

    setCurrentSets(prevSets => [...prevSets, newSet]);

    // Reset form fields using the store's action
    resetForm();
    setIsAddingSet(false); // Still manage local button loading state if desired
    toast.success(`Set added: ${selectedExercise.name} ${repsNum} reps @ ${weightNum}kg`);
  };

  const handleRemoveSet = (tempIdToRemove: string) => {
    setCurrentSets(prevSets => prevSets.filter(set => set.tempId !== tempIdToRemove));
    toast.info("Set removed.");
  };

  const handleSaveWorkout = async () => {
    if (!selectedDate) {
      toast.error("Please select a date for the workout.");
      return;
    }
    if (currentSets.length === 0) {
      toast.error("Please add at least one set to save the workout.");
      return;
    }

    setIsSavingWorkout(true);
    setFetchError(null);

    const workoutData = {
      date: selectedDate.toISOString(), // Send as ISO string
      sets: currentSets.map(({ exerciseId, reps, weight }) => ({ // Map to API format
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

      // const savedWorkout = await response.json(); // Contains the saved log with IDs
      toast.success(`Workout for ${dayjs(selectedDate).format('YYYY-MM-DD')} saved successfully!`);
      setCurrentSets([]); // Clear sets after successful save
      // Optionally reset date or other fields

    } catch (err: any) {
      console.error("Failed to save workout:", err);
      setFetchError(err.message || 'Failed to save workout.');
      toast.error(err.message || 'Failed to save workout.');
    } finally {
      setIsSavingWorkout(false);
    }
  };


  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Loading session...</div>;
  }

  if (status === 'unauthenticated') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-3xl font-bold mb-6">Workout Tracker</h1>
        <p className="mb-4">Please sign in to record your workouts.</p>
        <Button onClick={() => signIn('google')}>Sign in with Google</Button>
      </div>
    );
  }

  // Authenticated view
  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <Toaster richColors position="top-center" /> {/* Add Toaster component */}
      <h1 className="text-3xl font-bold mb-6 text-center">Record Workout</h1>

      {/* Date Picker Component */}
      <DatePickerComponent
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />

      {/* Add Set Form Component */}
      <AddSetFormComponent
        exercises={exercises}
        isLoadingExercises={isLoadingExercises}
        fetchError={fetchError}
        // Remove props now handled by Zustand store
        onAddSet={handleAddSet}
        isAddingSet={isAddingSet} // Keep passing this if AddSetFormComponent uses it for its button state
      />

      {/* Current Sets Table Component */}
      <CurrentSetsTableComponent
        currentSets={currentSets}
        selectedDate={selectedDate}
        onRemoveSet={handleRemoveSet}
      />

      {/* Save Workout Button (remains here) */}
      <Button
        onClick={handleSaveWorkout}
        disabled={isSavingWorkout || currentSets.length === 0}
        className="w-full text-lg py-6"
        size="lg"
      >
        {isSavingWorkout ? 'Saving...' : 'Save Workout'}
      </Button>

    </div>
  );
}
