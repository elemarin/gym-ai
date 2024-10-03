'use server';
import { OpenAI } from "openai";

interface Exercise {
  name: string;
  sets: number;
  reps: string;
  instructions: string;
}

interface WorkoutPlan {
  mainWorkout: Exercise[];
}

export async function getWorkoutPlan(formData: FormData): Promise<WorkoutPlan> {
  const muscleGroup = formData.get('muscleGroup') as string;
  const goals = (formData.get('goals') as string).split(',');
  const imageFiles = formData.getAll('equipment') as File[];

  // Process images
  const imageDescriptions = await Promise.all(imageFiles.map(async (file) => {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    return { name: file.name, base64 };
  }));

  const imagePrompt = imageDescriptions.length > 0
    ? `The user has uploaded ${imageDescriptions.length} image(s) of their gym equipment.`
    : "The user hasn't uploaded any images of their gym equipment. Assume they have access to basic equipment.";
  
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a knowledgeable fitness coach. Provide a detailed workout plan based on the user's input and the gym equipment shown in their images. Format your response as a JSON object."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Create a detailed workout plan for training ${muscleGroup} with the goals of ${goals.join(', ')}. ${imagePrompt}

                Please format your response as a JSON object with the following structure:
                {
                  "mainWorkout": [
                    {"name": "Exercise Name", "sets": 3, "reps": "8-10", "instructions": "Brief instructions"}
                  ]
                }

                Provide at least 4-5 exercises in the mainWorkout. Use only exercises from our database.`
            },
            ...imageDescriptions.map(({ base64 }) => ({
              type: "image_url",
              image_url: {
                "url": `data:image/jpeg;base64,${base64}`
              }
            }))
          ]
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 1000,
    });

    const workoutPlan = JSON.parse(response.choices[0].message.content || "{}") as WorkoutPlan;
    return workoutPlan;
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    return { mainWorkout: [] };
  }
}
