'use client';

import { useState, useRef, useEffect } from "react";
import { getWorkoutPlan } from "./getWorkoutPlan";
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"

const muscleGroups = [
  { value: "Espalda", emoji: "🏋️" },
  { value: "Hombros", emoji: "🤷‍♀️" },
  { value: "Abdominales", emoji: "🏆" },
  { value: "Glúteos", emoji: "🍑" },
  { value: "Piernas", emoji: "🦵" },
  { value: "Brazos", emoji: "💪" },
  { value: "Pecho", emoji: "🫁" },
];

const goals = [
  { value: "Quemar grasa", emoji: "🔥" },
  { value: "Ganar músculo", emoji: "🏗️" },
  { value: "Aumentar fuerza", emoji: "🦾" },
  { value: "Mejorar flexibilidad", emoji: "🤸" },
];

const workoutTypes = [
  { value: "Crossfit", emoji: "💪" },
  { value: "Gym", emoji: "🏋️‍♀️" },
  { value: "Home Gym", emoji: "🏠" },
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
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState<string[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedWorkoutType, setSelectedWorkoutType] = useState<string>("");
  const [trainingDays, setTrainingDays] = useState<number>(3);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState<boolean>(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
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

  const handleSubmit = async () => {
    setIsLoading(true);
    const formData = new FormData();
    formData.set('muscleGroups', selectedMuscleGroups.join(','));
    formData.set('goals', selectedGoals.join(','));
    formData.set('workoutType', selectedWorkoutType);
    formData.set('trainingDays', trainingDays.toString());
    if (photoFile) {
      formData.set('equipment', photoFile);
    }
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

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setPhotoFile(file);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 text-gray-800 overflow-hidden">
      <header className="bg-cyan-700 text-white py-4 px-6">
        <h1 className="text-2xl font-bold">Coach AI 🏋️‍♀️</h1>
      </header>
      
      <main className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <Label htmlFor="training-days" className="text-lg font-semibold mb-2 text-gray-700 block">
              Días de entrenamiento por semana
            </Label>
            <div className="text-4xl font-bold text-blue-600 mb-2 text-center">{trainingDays}</div>
            <Slider
              id="training-days"
              min={1}
              max={7}
              step={1}
              value={[trainingDays]}
              onValueChange={(value) => setTrainingDays(value[0])}
              className="w-full"
            />
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <Label className="text-lg font-semibold mb-2 text-gray-700 block">
              Tipo de entrenamiento:
            </Label>
            <div className="flex flex-wrap gap-2">
              {workoutTypes.map((type) => (
                <Button
                  key={type.value}
                  type="button"
                  onClick={() => setSelectedWorkoutType(type.value)}
                  variant={selectedWorkoutType === type.value ? "default" : "outline"}
                  className="px-3 py-1 text-sm rounded-full"
                >
                  {type.emoji} {type.value}
                </Button>
              ))}
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <Label className="text-lg font-semibold mb-2 text-gray-700 block">Grupos Musculares:</Label>
            <div className="flex flex-wrap gap-2">
              {muscleGroups.map((group) => (
                <Button
                  key={group.value}
                  type="button"
                  onClick={() => setSelectedMuscleGroups(prev => 
                    prev.includes(group.value)
                      ? prev.filter(g => g !== group.value)
                      : [...prev, group.value]
                  )}
                  variant={selectedMuscleGroups.includes(group.value) ? "default" : "outline"}
                  className="px-3 py-1 text-sm rounded-full"
                >
                  {group.emoji} {group.value}
                </Button>
              ))}
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <Label className="text-lg font-semibold mb-2 text-gray-700 block">Objetivos de fitness:</Label>
            <div className="flex flex-wrap gap-2">
              {goals.map((goal) => (
                <Button
                  key={goal.value}
                  type="button"
                  onClick={() => setSelectedGoals(prev => 
                    prev.includes(goal.value)
                      ? prev.filter(g => g !== goal.value)
                      : [...prev, goal.value]
                  )}
                  variant={selectedGoals.includes(goal.value) ? "default" : "outline"}
                  className="px-3 py-1 text-sm rounded-full"
                >
                  {goal.emoji} {goal.value}
                </Button>
              ))}
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <Label htmlFor="equipment-photo" className="text-lg font-semibold mb-2 text-gray-700 block">
              Foto de tu equipo (opcional) 📸
            </Label>
            <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 transition-colors">
              <input
                id="equipment-photo"
                type="file"
                name="equipment"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center justify-center">
                <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <p className="text-sm text-gray-500">
                  {photoFile ? photoFile.name : "Haz clic para subir una foto o arrastra y suelta aquí"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className="sticky bottom-0 p-4 bg-white border-t mt-auto">
        <Button 
          onClick={handleSubmit}
          className="w-full py-4 text-lg font-bold bg-cyan-700 hover:bg-cyan-800 transition-colors"
          disabled={isLoading}
        >
          {isLoading ? 'Creando tu entrenamiento...' : 'Generar entrenamiento 💪'}
        </Button>
      </div>

      <Sheet open={isBottomSheetOpen} onOpenChange={setIsBottomSheetOpen}>
        <SheetContent side="bottom" className="h-[80vh]">
          <SheetHeader>
            <SheetTitle className="text-2xl font-bold text-blue-600 mb-4">Tu Plan de Entrenamiento Personalizado</SheetTitle>
          </SheetHeader>
          <SheetDescription>
            <div ref={carouselRef} className="overflow-x-auto pb-4 -mx-6 px-6">
              <div className="flex space-x-4" style={{ width: `${workoutPlan?.mainWorkout.length ?? 0 * 280}px` }}>
                {workoutPlan?.mainWorkout.map((exercise, index) => (
                  <div key={index} className="flex-shrink-0 w-64 border rounded-lg p-4 bg-white shadow-md">
                    <h3 className="font-semibold text-lg mb-2 text-blue-600">{exercise.name}</h3>
                    <p className="text-sm mb-1"><span className="font-semibold">Series:</span> {exercise.sets}</p>
                    <p className="text-sm mb-2"><span className="font-semibold">Repeticiones:</span> {exercise.reps}</p>
                    <p className="text-sm h-40 overflow-y-auto">{exercise.instructions}</p>
                  </div>
                ))}
              </div>
            </div>
          </SheetDescription>
        </SheetContent>
      </Sheet>
    </div>
  );
}