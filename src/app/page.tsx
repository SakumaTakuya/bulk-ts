'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Toaster, toast } from "sonner"; // Import Toaster and toast
import { Calendar as CalendarIcon, PlusCircle, Trash2 } from "lucide-react"; // Icons
import { cn } from "@/lib/utils";
import dayjs from 'dayjs'; // Import dayjs

// Define the Exercise type (matching the one used in exercises page/API)
interface Exercise {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// Define the structure for a set being added to the log
interface WorkoutSet {
  tempId: string; // Temporary ID for list key before saving
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
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('');
  const [currentReps, setCurrentReps] = useState('');
  const [currentWeight, setCurrentWeight] = useState('');
  const [isAddingSet, setIsAddingSet] = useState(false);
  const [isSavingWorkout, setIsSavingWorkout] = useState(false);

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
        if (data.length > 0 && !selectedExerciseId) {
          setSelectedExerciseId(data[0].id); // Default to first exercise
        }
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

    // Reset form fields (optional: maybe keep exercise selected?)
    // setSelectedExerciseId(''); // Keep selected?
    setCurrentReps('');
    setCurrentWeight('');
    setIsAddingSet(false);
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

      {/* Date Picker */}
      <div className="mb-6">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !selectedDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? dayjs(selectedDate).format('YYYY-MM-DD') : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Add Set Form */}
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
              <Select value={selectedExerciseId} onValueChange={setSelectedExerciseId}>
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
                  onChange={(e) => setCurrentReps(e.target.value)}
                  min="0"
                  step="1"
                  required
                  className="flex-1"
                />
                <Input
                  type="number"
                  placeholder="Weight (kg)"
                  value={currentWeight}
                  onChange={(e) => setCurrentWeight(e.target.value)}
                  min="0"
                  step="0.5" // Allow .5 increments
                  required
                  className="flex-1"
                />
              </div>
              <Button onClick={handleAddSet} disabled={isAddingSet || !selectedExerciseId} className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" /> {isAddingSet ? 'Adding...' : 'Add Set'}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Current Sets Table */}
      {currentSets.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Current Workout Sets ({dayjs(selectedDate).format('YYYY-MM-DD')})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Exercise</TableHead>
                  <TableHead className="text-right">Reps</TableHead>
                  <TableHead className="text-right">Weight (kg)</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentSets.map((set) => (
                  <TableRow key={set.tempId}>
                    <TableCell>{set.exerciseName}</TableCell>
                    <TableCell className="text-right">{set.reps}</TableCell>
                    <TableCell className="text-right">{set.weight}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveSet(set.tempId)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Save Workout Button */}
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
