'use client';

import { useState, useRef, useEffect } from "react";
import { getWorkoutPlan } from "./getWorkoutPlan";

const muscleGroups = [
  { value: "Back", emoji: "🏋️" },
  { value: "Shoulders", emoji: "🤷‍♀️" },
  { value: "Abs", emoji: "🏆" },
  { value: "Glutes", emoji: "🍑" },
  { value: "Legs", emoji: "🦵" },
  { value: "Arms", emoji: "💪" },
  { value: "Chest", emoji: "🫁" },
];

const goals = [
  { value: "Burn fat", emoji: "🔥" },
  { value: "Build muscle", emoji: "🏗️" },
  { value: "Boost strength", emoji: "🦾" },
  { value: "Enhance flexibility", emoji: "🤸" },
];

interface Exercise {
  name: string;
  sets: number;
  reps: string;
  instructions: string;
}

interface WorkoutPlan {
  mainWorkout: Exercise[];
}

export default function Home() {
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>("");
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState<boolean>(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (carouselRef.current) {
        e.preventDefault();
        carouselRef.current.scrollLeft += e.deltaY;
      }
    };

    const carousel = carouselRef.current;
    if (carousel) {
      carousel.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      if (carousel) {
        carousel.removeEventListener('wheel', handleWheel);
      }
    };
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    const formData = new FormData(event.currentTarget);
    formData.set('muscleGroup', selectedMuscleGroup);
    formData.set('goals', selectedGoals.join(','));
    try {
      const plan = await getWorkoutPlan(formData);
      setWorkoutPlan(plan);
      setIsBottomSheetOpen(true);
    } catch (error) {
      console.error('Error getting workout plan:', error);
      setWorkoutPlan(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-between min-h-screen bg-white text-gray-800">
      <main className="flex flex-col items-center w-full max-w-md p-6">
        <h1 className="text-3xl font-bold mb-6 text-blue-600">AI Gym Coach 🏋️‍♀️</h1>
        
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
          <div className="w-full">
            <h2 className="text-lg font-semibold mb-3 text-gray-700">Target muscle group:</h2>
            <div className="flex flex-wrap gap-2">
              {muscleGroups.map((group) => (
                <button
                  key={group.value}
                  type="button"
                  onClick={() => setSelectedMuscleGroup(group.value)}
                  className={`px-3 py-2 rounded-full text-sm ${
                    selectedMuscleGroup === group.value
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-700"
                  } transition-colors duration-200`}
                >
                  {group.emoji} {group.value}
                </button>
              ))}
            </div>
          </div>

          <div className="w-full">
            <h2 className="text-lg font-semibold mb-3 text-gray-700">Fitness objectives:</h2>
            <div className="flex flex-wrap gap-2">
              {goals.map((goal) => (
                <button
                  key={goal.value}
                  type="button"
                  onClick={() => setSelectedGoals(prev => 
                    prev.includes(goal.value)
                      ? prev.filter(g => g !== goal.value)
                      : [...prev, goal.value]
                  )}
                  className={`px-3 py-2 rounded-full text-sm ${
                    selectedGoals.includes(goal.value)
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-700"
                  } transition-colors duration-200`}
                >
                  {goal.emoji} {goal.value}
                </button>
              ))}
            </div>
          </div>

          <div className="w-full">
            <h2 className="text-lg font-semibold mb-3 text-gray-700">Snap your gym setup 📸</h2>
            <input type="file" name="equipment" accept="image/*" multiple className="w-full p-2 border rounded text-sm" />
          </div>

          <button 
            type="submit" 
            className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-200 disabled:bg-gray-400 text-lg font-semibold mt-2"
            disabled={isLoading}
          >
            {isLoading ? 'Crafting Your Workout...' : 'Generate Custom Workout 💪'}
          </button>
        </form>
      </main>

      {isBottomSheetOpen && workoutPlan && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsBottomSheetOpen(false)} />
          <div className="fixed inset-x-0 bottom-0 bg-white shadow-lg rounded-t-3xl p-6 z-50 transition-transform duration-300 ease-in-out transform translate-y-0 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-blue-600">Your Tailored Workout Plan</h2>
              <button 
                onClick={() => setIsBottomSheetOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
            </div>
            <div ref={carouselRef} className="overflow-x-auto pb-4 -mx-6 px-6">
              <div className="flex space-x-4" style={{ width: `${workoutPlan.mainWorkout.length * 280}px` }}>
                {workoutPlan.mainWorkout.map((exercise, index) => (
                  <div key={index} className="flex-shrink-0 w-64 border rounded-lg p-4 bg-gray-50 shadow">
                    <h3 className="font-semibold text-lg mb-2 text-blue-600">{exercise.name}</h3>
                    <p className="text-sm mb-1"><span className="font-semibold">Sets:</span> {exercise.sets}</p>
                    <p className="text-sm mb-2"><span className="font-semibold">Reps:</span> {exercise.reps}</p>
                    <p className="text-sm h-40 overflow-y-auto">{exercise.instructions}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      <footer className="w-full p-4 text-center text-sm text-gray-600 bg-gray-100">
        <p>AI Gym Coach - Your personal fitness architect 🏋️‍♂️</p>
      </footer>
    </div>
  );
}