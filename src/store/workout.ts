import { create } from 'zustand';
import { WoprkoutLog, WorkoutSet, Exercise } from '../model';

type Actions = {
  removeLog: (log: WoprkoutLog) => void;
  updateLog: (log: WoprkoutLog) => void;
  addLog: (log: WoprkoutLog) => void;

  // Action to clear all logs. Use this if compliting a workout.
  clearLogs: () => void;
  // Action to set logs directly. Use this for initializing or replacing logs.
  setLogs: (logs: WoprkoutLog[]) => void;

  removeSetFromLog: (log: WoprkoutLog, setId: string) => void;
  updateSetInLog: (log: WoprkoutLog, updatedSet: WorkoutSet) => void;

  updateExerciseInLog: (log: WoprkoutLog, updatedExercise: Exercise) => void;
}

type State = {
  logs: WoprkoutLog[];
}

export const useWorkoutLogStore = create<State & Actions>((set) => ({
  logs: [],

  removeLog: (log) => set((state) => {
    const remainingLogs = state.logs.filter(l => l.date !== log.date);
    if (remainingLogs.length === state.logs.length) {
      console.warn(`Log with id ${log.id} not found in the store.`);
      return state;
    }
    return { logs: remainingLogs };
  }),
  updateLog: (log) => set((state) => ({
    logs: state.logs.map(l => l.date === log.date ? log : l)
  })),
  addLog: (log) => set((state) => ({
    logs: [...state.logs, log]
  })),

  clearLogs: () => set({ logs: {} }), // Clear all logs
  setLogs: (logs) => set({
    logs: logs.reduce((acc, log) => {
      acc[log.id] = log;
      return acc;
    }, {} as { [key: string]: WoprkoutLog })
  }),

  removeSetFromLog: (logId, setId) => set((state) => {
    const log = state.logs[logId];
    if (!log) return state; // Log not found

    const { sets } = log;
    if (!sets || !sets[setId]) return state; // Set not found in log
    const { [setId]: _, ...remainingSets } = sets; // Remove the set by ID

    return {
      logs: {
        ...state.logs,
        [logId]: {
          ...log,
          sets: remainingSets,
        }
      }
    };
  }),

  updateSetInLog: (logId, updatedSet) => set((state) => {
    const log = state.logs[logId];
    if (!log) return state; // Log not found

    const sets = log.sets || {};
    return {
      logs: {
        ...state.logs,
        [logId]: {
          ...log,
          sets: {
            ...sets,
            [updatedSet.id]: updatedSet, // Update or add the set
          }
        }
      }
    };
  }),

  updateExerciseInLog: (logId, updatedExercise) => set((state) => {
    const log = state.logs[logId];
    if (!log) return state; // Log not found

    return {
      logs: {
        ...state.logs,
        [logId]: {
          ...log,
          exercise: updatedExercise, // Update the exercise
        }
      }
    };
  }),
}));