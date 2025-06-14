import { create } from 'zustand';
import { z } from 'zod';
import { clientExerciseSchema, clientWorkoutLogSchema, clientWorkoutSetSchema, createExerciseSchema, createWorkoutLogSchema, workoutLogSchema } from '../schemas/workout-schemas';

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
  addSetToLog: (log: WorkoutLog, addSet: WorkoutSet) => void;
  removeSetFromLog: (log: WorkoutLog, removeSet: WorkoutSet) => void;
  updateSetInLog: (log: WorkoutLog, updatedSet: WorkoutSet) => void;
  updateExercise: (exercise: Exercise) => void;

  postExercises: (name: string, clientId: string) => Promise<Exercise>;
  postWorkoutLogs: () => Promise<void>;
}

// Create the store
export const useWorkoutStore = create<State & Actions>((set, get) => ({
  logs: [],

  removeLog: (log) => set((state) => ({
    ...state,
    logs: state.logs.filter((l) => l.clientId !== log.clientId),
  })),

  updateLog: (log) => set((state) => ({
    ...state,
    logs: state.logs.map((l) => (l.clientId === log.clientId ? log : l)),
  })),

  addLog: (log) => set((state) => ({
    ...state,
    logs: [...state.logs, log],
  })),

  clearLogs: () => set((state) => ({ ...state, logs: [] })),

  setLogs: (logs) => set((state) => ({ ...state, logs })),

  addSetToLog: (log, addSet) => set((state) => ({
    ...state,
    logs: state.logs.map((l) =>
      l.clientId === log.clientId
        ? { ...l, sets: [...l.sets, addSet] }
        : l
    ),
  })),

  removeSetFromLog: (log, removeSet) => set((state) => ({
    ...state,
    logs: state.logs.map((l) =>
      l.clientId === log.clientId
        ? { ...l, sets: l.sets.filter((s) => s.clientId !== removeSet.clientId) }
        : l
    ),
  })),

  updateSetInLog: (log, updatedSet) => set((state) => ({
    ...state,
    logs: state.logs.map((l) =>
      l.clientId === log.clientId
        ? {
          ...l,
          sets: l.sets.map((s) => (s.clientId === updatedSet.clientId ? updatedSet : s)),
        }
        : l
    ),
  })),

  updateExercise: (exercise) => set((state) => ({
    ...state,
    logs: state.logs.map((l) =>
      l.exercise.clientId === exercise.clientId
        ? {
          ...l,
          exercise: exercise,
        }
        : l
    ),
  })),

  postExercises: async (name, clientId) => {
    const res = await fetch('/api/exercises', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: createExerciseSchema.parse({ name }).toString(),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
    }
    const result = clientExerciseSchema.safeParse({
      ...(await res.json()),
      clientId,
    });

    if (!result.success) {
      throw new Error(result.error.message);
    }

    const exercise = result.data;
    get().updateExercise(exercise)
    return exercise;
  },

  postWorkoutLogs: async () => {
    const errors: any[] = [];
    const resultLogs = get().logs.map(async log => {
      if (log.id) {
        return log; // Skip logs that already have an ID
      }

      let exercise = log.exercise;
      // まだサーバー側で作成されていないので先に作成する
      if (!exercise.id) {
        const clientExercise = await get().postExercises(exercise.name, exercise.clientId);
        exercise = clientExercise;
      }

      const req = createWorkoutLogSchema.parse({
        ...log,
        exerciseId: exercise.id, // Ensure exerciseId is set
      });

      const res = await fetch('/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: req.toString(),
      });

      if (!res.ok) {
        const errorData = await res.json();
        errors.push(errorData.error || `HTTP error! status: ${res.status}`);
        return log;
      }

      const result = clientWorkoutLogSchema.safeParse({
        ...(await res.json()),
        clientId: log.clientId,
      });

      if (!result.success) {
        errors.push(result.error.message);
        return log;
      }

      return result.data;
    });

    const logs = await Promise.all(resultLogs);
    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }
    // すべての logs に対して処理を行ったので完全に差し替える
    set((state) => ({ ...state, logs }));
  }
}));
