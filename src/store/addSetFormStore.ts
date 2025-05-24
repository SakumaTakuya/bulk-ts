import { create } from 'zustand';

interface AddSetFormState {
  selectedExerciseId: string;
  currentReps: string;
  currentWeight: string;
  setSelectedExerciseId: (id: string) => void;
  setCurrentReps: (reps: string) => void;
  setCurrentWeight: (weight: string) => void;
  resetForm: () => void; // Action to clear the form after adding a set
}

export const useAddSetFormStore = create<AddSetFormState>((set) => ({
  selectedExerciseId: '',
  currentReps: '',
  currentWeight: '',
  setSelectedExerciseId: (id) => set({ selectedExerciseId: id }),
  setCurrentReps: (reps) => set({ currentReps: reps }),
  setCurrentWeight: (weight) => set({ currentWeight: weight }),
  resetForm: () => set({ selectedExerciseId: '', currentReps: '', currentWeight: '' }),
}));
