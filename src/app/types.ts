export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  instructions: string;
}

export interface WorkoutPlan {
  days: {
    [key: number]: Exercise[];
  };
}