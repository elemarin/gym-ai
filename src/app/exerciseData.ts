import exercisesData from './exercises.json';

export interface Exercise {
  name: string;
  force: string | null;
  level: string;
  mechanic: string | null;
  equipment: string | null;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
  category: string;
}

export const exercises: Exercise[] = exercisesData.exercises;

export function getExerciseByName(name: string): Exercise | undefined {
  return exercises.find(exercise => 
    exercise.name.toLowerCase() === name.toLowerCase()
  );
}

export function getExercisesByMuscleGroup(muscleGroup: string): Exercise[] {
  return exercises.filter(exercise => 
    exercise.primaryMuscles.includes(muscleGroup.toLowerCase()) ||
    exercise.secondaryMuscles.includes(muscleGroup.toLowerCase())
  );
}