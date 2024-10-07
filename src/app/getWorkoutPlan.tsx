'use server';
import { OpenAI } from "openai";
import { WorkoutPlan } from './types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getWorkoutPlan(formData: FormData): Promise<WorkoutPlan> {
  const muscleGroups = formData.get('muscleGroups') as string;
  const goals = formData.get('goals') as string;
  const workoutType = formData.get('workoutType') as string;
  const trainingDays = parseInt(formData.get('trainingDays') as string);
  const equipment = formData.get('equipment') as File | null;

  let equipmentDescription = "No equipment specified.";
  if (equipment) {
    // Here you would typically upload the image to a service like AWS S3 or Cloudinary
    // and get a URL to pass to the AI. For now, we'll just use the file name.
    equipmentDescription = `Equipment photo provided: ${equipment.name}`;
  }

  const prompt = `Create a ${trainingDays}-day workout plan with the following details:
  Muscle groups: ${muscleGroups}
  Goals: ${goals}
  Workout type: ${workoutType}
  Equipment: ${equipmentDescription}

  For each day, provide 5-6 exercises. Each exercise should include:
  - Name
  - Number of sets
  - Number of repetitions or duration
  - Brief instructions

  Format the response as a JSON object with the following structure:
  {
    "days": {
      "1": [
        {
          "name": "Exercise Name",
          "sets": 3,
          "reps": "8-12",
          "instructions": "Brief instructions"
        },
        ...
      ],
      "2": [...],
      ...
    }
  }`;

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-16k",
    messages: [
      { role: "system", content: "You are a professional fitness trainer creating personalized workout plans." },
      { role: "user", content: prompt }
    ],
    temperature: 0.7,
    max_tokens: 2000,
  });

  const workoutPlan: WorkoutPlan = JSON.parse(response.choices[0].message.content || '{}');

  return workoutPlan;
}
