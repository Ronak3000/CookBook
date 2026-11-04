export const cuisines = [
  "Indian",
  "Italian",
  "Chinese",
  "Mexican",
  "Japanese",
  "French",
  "Greek",
  "Thai",
  "Mediterranean",
  "Middle Eastern",
  "Korean",
  "Spanish",
  "Vietnamese",
  "American",
  "African",
  "Caribbean",
  "Other",
] as const;
export const dietaryTags = [
  "Vegetarian",
  "Vegan",
  "Gluten-free",
  "Dairy-free",
  "Nut-free",
] as const;
export type Ingredient = {
  name: string;
  quantity: number | null;
  unit: string;
};
export type RecipeContent = {
  ingredients: Ingredient[];
  steps: string[];
  prepMinutes: number;
  cookMinutes: number;
  servings: number;
  cuisine: (typeof cuisines)[number];
  dietaryTags: (typeof dietaryTags)[number][];
  category: "Everyday" | "Comfort food" | "Sweet treats";
};
export type RecipeDetail = {
  _id: string;
  title: string;
  bodyOfBlog: string;
  createdAt: string;
  recipe?: RecipeContent;
};
export type ShoppingGroup = {
  _id: string;
  recipeId: string;
  title: string;
  servings: number;
  items: (Ingredient & { _id: string; checked: boolean })[];
};
export function scaleQuantity(
  quantity: number | null,
  base: number,
  target: number,
): number | null {
  if (quantity === null) return null;
  return Math.round(((quantity * target) / base) * 1000000) / 1000000;
}
export function formatIngredient(ingredient: Ingredient, base = 1, target = 1) {
  const quantity = scaleQuantity(ingredient.quantity, base, target);
  return `${quantity === null ? "As needed" : new Intl.NumberFormat("en", { maximumFractionDigits: 6 }).format(quantity)}${ingredient.unit ? ` ${ingredient.unit}` : ""} ${ingredient.name}`;
}
export function progressKey(id: string, steps: string[]) {
  let hash = 2166136261;
  for (const character of JSON.stringify(steps))
    hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  return `cookbook-progress:${id}:${hash >>> 0}`;
}
