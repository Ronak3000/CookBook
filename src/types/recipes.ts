import type { RecipeContent } from './recipeContent';
export const recipeCategories = ['All recipes', 'Quick & easy', 'Vegetarian', 'Comfort food', 'Sweet treats'] as const;
export type RecipeCategory = typeof recipeCategories[number];
export type RecipeSummary = { _id: string; title: string; createdAt: string; recipe?: Pick<RecipeContent, 'servings' | 'prepMinutes' | 'cookMinutes' | 'cuisine' | 'dietaryTags'> };
export type RecipePage = {
  success: boolean;
  data: RecipeSummary[];
  pagination: { nextCursor: string | null; hasMore: boolean; limit: number };
  message?: string;
};
