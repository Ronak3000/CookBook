import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
    try {
        // Parse JSON body from the request
        const body = await request.json();
        const { ingredients, cuisine, people } = body;

        // Validate request parameters
        if (!ingredients || ingredients.length === 0) {
            return NextResponse.json({
                success: false,
                message: 'Missing or invalid ingredients. It must be a non-empty array.',
            }, { status: 400 });
        }

        if (!cuisine || typeof cuisine !== 'string') {
            return NextResponse.json({
                success: false,
                message: 'Missing or invalid cuisine. It must be a string.',
            }, { status: 400 });
        }

        if (parseInt(people) <= 0) {
            return NextResponse.json({
                success: false,
                message: 'Missing or invalid numberOfPeople. It must be a positive number.',
            }, { status: 400 });
        }

        // Construct the AI prompt
        const prompt = `
            Prepare a recipe using the following details:
            Ingredients: ${ingredients}
            Cuisine: ${cuisine}
            Number of People: ${people}

            Provide the recipe in this format:
            - Title: Recipe title.
            - Preparation Steps: How to prepare the ingredients in list format (e.g., chopping, marinating).
            - Cooking Instructions: Step-by-step instructions, including time and temperature in list format.
            - Serving Suggestions: Final touches and presentation tips in list format.

            Ensure the recipe is clear, beginner-friendly, and fully detailed.
            
            ensure that the response doesnot contain any other text other than the recipe.
            if there is no such recipie just assume some more or less ingredients and give response with respect to that.
            but donot give any other response other than the recipe.
            Example:
            title 
            "step1 || step2 || step3" 
            "instruction1 || instruction2 || instruction3" 
            "suggest1, suggest2, suggest3" 
            response must be exactly in this format wihtout any - or number for steps .
            donot put any heading like Title or CookingStrps in response.

            
            
        `;

        // Initialize Google Generative AI
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        // Generate recipe content
        const result = await model.generateContent(prompt);
        const text =  result.response.text();



        if (!text || text.trim().length === 0) {
            return NextResponse.json({
                success: false,
                message: 'The AI model returned an empty response.',
            }, { status: 400 });
        }

        const lines = text.split("\n\n")
        const title = lines[0]
        const preparationSteps = lines[1].split(" || ")
        const cookingInstructions = lines[2].split(" || ")
        const servingSuggestions = lines[3].split(" || ")

        return NextResponse.json({
            success: true,
            message: 'Recipe created successfully.',
            data: {
                title,
                preparationSteps,
                cookingInstructions,
                servingSuggestions,
            },
        }, { status: 200 });

    } catch (error: any) {
        console.error('Error in generating recipe:', error);
        return NextResponse.json({
            success: false,
            message: error.message || 'An unexpected error occurred.',
        }, { status: 500 });
    }
}
