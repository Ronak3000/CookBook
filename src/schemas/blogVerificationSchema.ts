import { z } from "zod";
import { cuisines, dietaryTags } from "@/types/recipeContent";
export const recipeContentSchema = z.object({
  ingredients: z
    .array(
      z.object({
        name: z.string().trim().min(1, "Name every ingredient.").max(100),
        quantity: z
          .number()
          .min(
            0.001,
            "Ingredient quantities must be at least 0.001, or left as needed.",
          )
          .max(100000)
          .nullable(),
        unit: z.string().trim().max(30).default(""),
      }),
    )
    .min(1, "Add at least one ingredient.")
    .max(100),
  steps: z
    .array(z.string().trim().min(1, "Write each cooking step.").max(3000))
    .min(1, "Add a cooking step.")
    .max(100),
  prepMinutes: z.number().int().min(0).max(1440),
  cookMinutes: z.number().int().min(0).max(1440),
  servings: z.number().int().min(1).max(100),
  cuisine: z.enum(cuisines),
  dietaryTags: z
    .array(z.enum(dietaryTags))
    .max(dietaryTags.length)
    .transform((tags) => [...new Set(tags)]),
  category: z.enum(["Everyday", "Comfort food", "Sweet treats"]),
});
export const BlogVerificationSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Give your recipe a title of at least 3 characters.")
      .max(200),
    bodyOfBlog: z.string().trim().max(50000).default(""),
    recipe: recipeContentSchema.optional(),
  })
  .superRefine((data, context) => {
    if (!data.recipe && data.bodyOfBlog.length < 10)
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["bodyOfBlog"],
        message:
          "Write at least 10 characters, or add structured recipe details.",
      });
  });
