import { create } from 'zustand';
import { z } from 'zod';
import { workoutLogSchema, setSchema } from '../schemas/workout-schemas';

// Define TypeScript types based on Zod schemas
export type WorkoutSet = z.infer<typeof setSchema>;
export type WorkoutLog = z.infer<typeof workoutLogSchema>;
export type Exercise = { id: string; name: string; }; // Example Exercise type

// Define State and Actions
interface State {
  logs: WorkoutLog[];
}

interface Actions {
  removeLog: (log: WorkoutLog) => void;
  updateLog: (log: WorkoutLog) => void;
  addLog: (log: WorkoutLog) => void;
  clearLogs: () => void;
  setLogs: (logs: WorkoutLog[]) => void;
  removeSetFromLog: (log: WorkoutLog, setId: string) => void;
  updateSetInLog: (log: WorkoutLog, updatedSet: WorkoutSet) => void;
  updateExerciseInLog: (log: WorkoutLog, updatedExercise: Exercise) => void;
}

// Create the store
export const useWorkoutStore = create<State & Actions>((set) => ({
  logs: [],

  removeLog: (log) => set((state) => ({
    logs: state.logs.filter((l) => l !== log),
  })),

  updateLog: (log) => set((state) => ({
    logs: state.logs.map((l) => (l === log ? log : l)),
  })),

  addLog: (log) => set((state) => ({
    logs: [...state.logs, log],
  })),

  clearLogs: () => set(() => ({ logs: [] })),

  setLogs: (logs) => set(() => ({ logs })),

  removeSetFromLog: (log, setId) => set((state) => ({
    logs: state.logs.map((l) =>
      l === log
        ? { ...l, sets: l.sets.filter((set) => set.id !== setId) }
        : l
    ),
  })),

  updateSetInLog: (log, updatedSet) => set((state) => ({
    logs: state.logs.map((l) =>
      l === log
        ? {
          ...l,
          sets: l.sets.map((set) => (set.id === updatedSet.id ? updatedSet : set)),
        }
        : l
    ),
  })),

  updateExerciseInLog: (log, updatedExercise) => set((state) => ({
    logs: state.logs.map((l) =>
      l === log
        ? {
          ...l,
          exerciseId: updatedExercise.id,
        }
        : l
    ),
  })),
}));
