export const recipeCategories = ['All recipes', 'Quick & easy', 'Vegetarian', 'Comfort food', 'Sweet treats'] as const;
export type RecipeCategory = typeof recipeCategories[number];
export type RecipeSummary = { _id: string; title: string; createdAt: string };
export type RecipePage = {
  success: boolean;
  data: RecipeSummary[];
  pagination: { nextCursor: string | null; hasMore: boolean; limit: number };
  message?: string;
};
