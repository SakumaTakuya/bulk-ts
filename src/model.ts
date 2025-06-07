type Exercise = {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

type WorkoutSet = {
  id: string | null;
  reps: number;
  weight: number;
}

type WoprkoutLog = {
  id: string | null;
  date: Date;
  sets: {
    [key: string]: WorkoutSet;
  };
  exercise: Exercise;
}

export type { Exercise, WorkoutSet, WoprkoutLog };