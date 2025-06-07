import { z } from 'zod';

// Define validation schema for a single set
export const setSchema = z.object({
  reps: z.number().int().min(0), // Reps must be a non-negative integer
  weight: z.number().min(0), // Weight must be non-negative
});

// Define validation schema for the workout log request body
export const workoutLogSchema = z.object({
  exerciseId: z.string().cuid(), // ExerciseId is now at the WorkoutLog level
  date: z.string().datetime(), // Expect ISO 8601 date string
  sets: z.array(setSchema).min(1), // Must have at least one set
});
