import { create } from 'zustand';
import { z } from 'zod';
import { clientExerciseSchema, clientWorkoutLogSchema, clientWorkoutSetSchema } from '../schemas/workout-schemas';

// Define TypeScript types based on Zod schemas
export type WorkoutSet = z.infer<typeof clientWorkoutSetSchema>;
export type WorkoutLog = z.infer<typeof clientWorkoutLogSchema>;
export type Exercise = z.infer<typeof clientExerciseSchema>;

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
  removeSetFromLog: (log: WorkoutLog, removeSet: WorkoutSet) => void;
  updateSetInLog: (log: WorkoutLog, updatedSet: WorkoutSet) => void;
  updateExerciseInLog: (log: WorkoutLog, updatedExercise: Exercise) => void;
}

// Create the store
export const useWorkoutStore = create<State & Actions>((set) => ({
  logs: [],

  removeLog: (log) => set((state) => ({
    logs: state.logs.filter((l) => l.clientId !== log.clientId),
  })),

  updateLog: (log) => set((state) => ({
    logs: state.logs.map((l) => (l.clientId === log.clientId ? log : l)),
  })),

  addLog: (log) => set((state) => ({
    logs: [...state.logs, log],
  })),

  clearLogs: () => set(() => ({ logs: [] })),

  setLogs: (logs) => set(() => ({ logs })),

  removeSetFromLog: (log, removeSet) => set((state) => ({
    logs: state.logs.map((l) =>
      l.clientId === log.clientId
        ? { ...l, sets: l.sets.filter((s) => s.clientId !== removeSet.clientId) }
        : l
    ),
  })),

  updateSetInLog: (log, updatedSet) => set((state) => ({
    logs: state.logs.map((l) =>
      l.clientId === log.clientId
        ? {
          ...l,
          sets: l.sets.map((s) => (s.clientId === updatedSet.clientId ? updatedSet : s)),
        }
        : l
    ),
  })),

  updateExerciseInLog: (log, updatedExercise) => set((state) => ({
    logs: state.logs.map((l) =>
      l.clientId === log.clientId
        ? {
          ...l,
          exercise: updatedExercise,
        }
        : l
    ),
  })),
}));
