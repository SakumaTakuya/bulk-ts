import { z } from 'zod';

export const exerciseSchema = z.object({
  id: z.string().cuid(), // Unique identifier for the exercise
  name: z.string().min(1), // Exercise name must be a non-empty string
});

export const createExerciseSchema = exerciseSchema.omit({
  id: true, // Omit id for creation
});

export const workoutSetSchema = z.object({
  id: z.string().cuid(), // Unique identifier for the set
  workoutLogId: z.string().cuid(), // Reference to the WorkoutLog
  reps: z.number().int().min(0), // Reps must be a non-negative integer
  weight: z.number().min(0), // Weight must be non-negative
});

export const createWorkoutSetSchema = workoutSetSchema.omit({
  id: true, // Omit id for creation
});

export const workoutLogSchema = z.object({
  id: z.string().cuid(), // Unique identifier for the workout log
  exerciseId: z.string().cuid(), // ExerciseId is now at the WorkoutLog level
  date: z.string().datetime(), // Expect ISO 8601 date string
  sets: z.array(workoutSetSchema).min(1), // Must have at least one set
});

export const createWorkoutLogSchema = workoutLogSchema.omit({
  id: true, // Omit id for creation
})

export const clientExerciseSchema = exerciseSchema.extend({
  clientId: z.string().cuid(), // Client ID for the exercise
})

export const clientWorkoutSetSchema = createWorkoutSetSchema.extend({
  clientId: z.string().cuid(), // Client ID for the set
})

export const clientWorkoutLogSchema = createWorkoutLogSchema.extend({
  clientId: z.string().cuid(), // Client ID for the workout log
  sets: z.array(clientWorkoutSetSchema), // Client sets
  exercise: clientExerciseSchema
}).omit({
  exerciseId: true, // Omit exerciseId for client sets
});