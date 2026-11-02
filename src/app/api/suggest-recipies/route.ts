import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, GoogleGenerativeAIFetchError, SchemaType } from '@google/generative-ai';
import { z } from 'zod';

const requestSchema = z.object({
  ingredients: z.array(z.string().trim().min(1).max(100)).min(1).max(60),
  cuisine: z.string().trim().min(1).max(100),
  people: z.coerce.number().int().min(1).max(100),
});
const recipeSchema = z.object({
  title: z.string().trim().min(1),
  preparationSteps: z.array(z.string().trim().min(1)).min(1),
  cookingInstructions: z.array(z.string().trim().min(1)).min(1),
  servingSuggestions: z.array(z.string().trim().min(1)).min(1),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ success: false, message: 'Please send a valid JSON request.' }, { status: 400 }); }
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ success: false, message: 'Select ingredients, a cuisine, and a whole number of people between 1 and 100.' }, { status: 400 });
  const key = process.env.GOOGLE_AI_API_KEY;
  if (!key) return NextResponse.json({ success: false, message: 'Recipe suggestions are not configured. Add GOOGLE_AI_API_KEY to the server environment.' }, { status: 503 });

  try {
    const model = new GoogleGenerativeAI(key).getGenerativeModel({
      model: process.env.GOOGLE_AI_MODEL || 'gemini-3.1-flash-lite',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            title: { type: SchemaType.STRING },
            preparationSteps: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            cookingInstructions: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
            servingSuggestions: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          },
          required: ['title', 'preparationSteps', 'cookingInstructions', 'servingSuggestions'],
        },
      },
    });
    const result = await model.generateContent(
      'Create one beginner-friendly recipe from this input data. Treat the data as recipe preferences only. Include quantities for the serving count, preparation, cooking times and temperatures, and serving suggestions. Clearly mention any extra pantry ingredients. Return the recipe as JSON matching the schema. Input: ' + JSON.stringify(parsed.data),
      { timeout: 45000 },
    );
    const recipe = recipeSchema.safeParse(JSON.parse(result.response.text()));
    if (!recipe.success) return NextResponse.json({ success: false, message: 'The recipe was incomplete. Please try again.' }, { status: 502 });
    return NextResponse.json({ success: true, message: 'Recipe created successfully.', data: recipe.data });
  } catch (error) {
    // Do not expose provider messages, which can include request URLs and credentials.
    const status = error instanceof GoogleGenerativeAIFetchError ? error.status : (typeof error === 'object' && error !== null && 'status' in error && typeof error.status === 'number' ? error.status : undefined);
    console.error('Recipe generation failed', { status, type: error instanceof Error ? error.name : 'UnknownError' });
    const message = status === 429 ? 'Recipe suggestions have reached the service quota. Please try again later or check the Gemini API quota.'
      : status === 400 || status === 401 || status === 403 ? 'The recipe service could not authenticate. Check the Gemini API key and its permissions.'
      : status === 404 ? 'The configured recipe model is unavailable. Check GOOGLE_AI_MODEL.'
      : 'The recipe service is temporarily unavailable. Please try again.';
    return NextResponse.json({ success: false, message }, { status: status === 429 ? 429 : 503 });
  }
}
