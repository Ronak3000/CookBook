"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Loader2, Plus, Trash2 } from "lucide-react";
import PageShell from "./PageShell";
import { BlogVerificationSchema } from "@/schemas/blogVerificationSchema";
import {
  cuisines,
  dietaryTags,
  type RecipeContent,
} from "@/types/recipeContent";

type IngredientDraft = { name: string; quantity: string; unit: string };
const emptyIngredient = (): IngredientDraft => ({
  name: "",
  quantity: "",
  unit: "",
});
export default function RecipeEditor({ id }: { id?: string }) {
  const { status } = useSession();
  const router = useRouter();
  const [title, setTitle] = useState(""),
    [body, setBody] = useState("");
  const [ingredients, setIngredients] = useState<IngredientDraft[]>([
    emptyIngredient(),
  ]);
  const [steps, setSteps] = useState([""]);
  const [prep, setPrep] = useState("10"),
    [cook, setCook] = useState("20"),
    [servings, setServings] = useState("2");
  const [cuisine, setCuisine] = useState<RecipeContent["cuisine"]>("Indian");
  const [tags, setTags] = useState<RecipeContent["dietaryTags"]>([]);
  const [category, setCategory] =
    useState<RecipeContent["category"]>("Everyday");
  const [structured, setStructured] = useState(!id);
  const [loading, setLoading] = useState(Boolean(id)),
    [loaded, setLoaded] = useState(!id);
  const [saving, setSaving] = useState(false),
    [error, setError] = useState(""),
    [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!id || status !== "authenticated") return;
    const controller = new AbortController();
    setLoading(true);
    setLoaded(false);
    setError("");
    void (async () => {
      try {
        const response = await fetch(
          `/api/get-individual-blogs?id=${encodeURIComponent(id)}`,
          { signal: controller.signal },
        );
        const result = await response.json();
        if (!response.ok)
          throw new Error(result.message || "Unable to load recipe.");
        setTitle(result.data.title);
        setBody(result.data.bodyOfBlog || "");
        const recipe: RecipeContent | undefined = result.data.recipe;
        setStructured(Boolean(recipe));
        if (recipe) {
          setIngredients(
            recipe.ingredients.map((item) => ({
              ...item,
              quantity: item.quantity === null ? "" : String(item.quantity),
            })),
          );
          setSteps(recipe.steps);
          setPrep(String(recipe.prepMinutes));
          setCook(String(recipe.cookMinutes));
          setServings(String(recipe.servings));
          setCuisine(recipe.cuisine);
          setTags(recipe.dietaryTags);
          setCategory(recipe.category);
        }
        setLoaded(true);
      } catch (e) {
        if (!controller.signal.aborted)
          setError(e instanceof Error ? e.message : "Unable to load recipe.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [id, status, attempt]);
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    const data = {
      title,
      bodyOfBlog: body,
      ...(structured
        ? {
            recipe: {
              ingredients: ingredients.map((item) => ({
                ...item,
                quantity: item.quantity.trim() ? Number(item.quantity) : null,
              })),
              steps,
              prepMinutes: Number(prep),
              cookMinutes: Number(cook),
              servings: Number(servings),
              cuisine,
              dietaryTags: tags,
              category,
            },
          }
        : {}),
    };
    const parsed = BlogVerificationSchema.safeParse(data);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    setSaving(true);
    try {
      const response = await fetch(
        id ? `/api/update-blog?id=${encodeURIComponent(id)}` : "/api/post-blog",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsed.data),
        },
      );
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || "Unable to save recipe.");
      router.push(`/get-individual-blog/${id || result.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save recipe.");
    } finally {
      setSaving(false);
    }
  };
  const updateIngredient = (
    index: number,
    key: keyof IngredientDraft,
    value: string,
  ) =>
    setIngredients((old) =>
      old.map((item, i) => (i === index ? { ...item, [key]: value } : item)),
    );
  return (
    <PageShell
      eyebrow="FROM YOUR KITCHEN, WITH LOVE"
      title={id ? "Refine your recipe." : "Every dish has a story."}
      description="The ingredients, the little details, and the steps that make it yours."
    >
      <div className="editor-layout">
        <form className="surface editor-form" onSubmit={save}>
          {status === "loading" || (loading && status === "authenticated") ? (
            <p>Opening your kitchen…</p>
          ) : status === "unauthenticated" ? (
            <p>
              Please <a href="/sign-in">sign in</a> to share a recipe.
            </p>
          ) : !loaded ? (
            <button
              className="outline-button"
              type="button"
              onClick={() => setAttempt((value) => value + 1)}
            >
              Try loading again
            </button>
          ) : (
            <>
              <label>
                Give it a name
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Grandma’s Sunday pasta…"
                  required
                  maxLength={200}
                />
              </label>
              <label>
                {structured
                  ? "The story behind the dish (optional)"
                  : "The recipe & its story"}
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="A memory, a favorite swap, or a tip from your kitchen…"
                  required={!structured}
                  rows={4}
                />
              </label>
              {!structured ? (
                <div className="upgrade-recipe">
                  <h2>Make this recipe easier to cook.</h2>
                  <p>
                    Add ingredient quantities, timings, and steps to enable
                    serving adjustments and shopping lists.
                  </p>
                  <button
                    className="text-link"
                    type="button"
                    onClick={() => setStructured(true)}
                  >
                    <Plus size={17} />
                    Add cooking details
                  </button>
                </div>
              ) : (
                <>
                  <div className="editor-section-title">
                    <span className="eyebrow">01 · THE BASICS</span>
                  </div>
                  <div className="recipe-basics-grid">
                    <label>
                      Prep time (minutes)
                      <input
                        type="number"
                        min="0"
                        max="1440"
                        required
                        value={prep}
                        onChange={(e) => setPrep(e.target.value)}
                      />
                    </label>
                    <label>
                      Cooking time (minutes)
                      <input
                        type="number"
                        min="0"
                        max="1440"
                        required
                        value={cook}
                        onChange={(e) => setCook(e.target.value)}
                      />
                    </label>
                    <label>
                      Servings
                      <input
                        type="number"
                        min="1"
                        max="100"
                        required
                        value={servings}
                        onChange={(e) => setServings(e.target.value)}
                      />
                    </label>
                  </div>
                  <div className="field-pair">
                    <label>
                      Cuisine
                      <select
                        value={cuisine}
                        onChange={(e) =>
                          setCuisine(e.target.value as RecipeContent["cuisine"])
                        }
                      >
                        {cuisines.map((item) => (
                          <option key={item}>{item}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Recipe collection
                      <select
                        value={category}
                        onChange={(e) =>
                          setCategory(
                            e.target.value as RecipeContent["category"],
                          )
                        }
                      >
                        {["Everyday", "Comfort food", "Sweet treats"].map(
                          (item) => (
                            <option key={item}>{item}</option>
                          ),
                        )}
                      </select>
                    </label>
                  </div>
                  <fieldset className="dietary-fieldset">
                    <legend>Dietary tags</legend>
                    <p className="field-hint">
                      Choose only the tags that fit your ingredients and
                      preparation.
                    </p>
                    <div className="pantry-chips">
                      {dietaryTags.map((tag) => (
                        <label
                          key={tag}
                          className={
                            tags.includes(tag)
                              ? "diet-chip chosen"
                              : "diet-chip"
                          }
                        >
                          <input
                            type="checkbox"
                            checked={tags.includes(tag)}
                            onChange={(e) =>
                              setTags((old) =>
                                e.target.checked
                                  ? [...old, tag]
                                  : old.filter((item) => item !== tag),
                              )
                            }
                          />
                          {tag}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  <div className="editor-section-title">
                    <span className="eyebrow">02 · ON THE COUNTER</span>
                    <span className="field-hint">
                      Leave quantity blank for “as needed”.
                    </span>
                  </div>
                  <div className="ingredient-editor">
                    {ingredients.map((item, index) => (
                      <div className="ingredient-row" key={index}>
                        <label>
                          Ingredient {index + 1}
                          <input
                            aria-label={`Ingredient ${index + 1} name`}
                            required
                            maxLength={100}
                            value={item.name}
                            onChange={(e) =>
                              updateIngredient(index, "name", e.target.value)
                            }
                            placeholder="Chickpeas"
                          />
                        </label>
                        <label>
                          Quantity
                          <input
                            aria-label={`Ingredient ${index + 1} quantity`}
                            type="number"
                            min="0.001"
                            max="100000"
                            step="any"
                            value={item.quantity}
                            onChange={(e) =>
                              updateIngredient(
                                index,
                                "quantity",
                                e.target.value,
                              )
                            }
                            placeholder="As needed"
                          />
                        </label>
                        <label>
                          Unit
                          <input
                            aria-label={`Ingredient ${index + 1} unit`}
                            maxLength={30}
                            value={item.unit}
                            onChange={(e) =>
                              updateIngredient(index, "unit", e.target.value)
                            }
                            placeholder="g, cup, tsp…"
                          />
                        </label>
                        <button
                          type="button"
                          className="icon-button"
                          disabled={ingredients.length === 1}
                          aria-label={`Remove ingredient ${index + 1}`}
                          onClick={() =>
                            setIngredients((old) =>
                              old.filter((_, i) => i !== index),
                            )
                          }
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    className="text-link"
                    type="button"
                    disabled={ingredients.length >= 100}
                    onClick={() =>
                      setIngredients((old) => [...old, emptyIngredient()])
                    }
                  >
                    <Plus size={17} />
                    Add ingredient
                  </button>
                  <div className="editor-section-title">
                    <span className="eyebrow">03 · LET’S GET COOKING</span>
                  </div>
                  <div className="step-editor">
                    {steps.map((step, index) => (
                      <div key={index}>
                        <label>
                          Step {index + 1}
                          <textarea
                            required
                            maxLength={3000}
                            rows={3}
                            value={step}
                            onChange={(e) =>
                              setSteps((old) =>
                                old.map((item, i) =>
                                  i === index ? e.target.value : item,
                                ),
                              )
                            }
                            placeholder="Describe one clear step, including time and temperature…"
                          />
                        </label>
                        <button
                          className="icon-button"
                          type="button"
                          disabled={steps.length === 1}
                          aria-label={`Remove step ${index + 1}`}
                          onClick={() =>
                            setSteps((old) => old.filter((_, i) => i !== index))
                          }
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    className="text-link"
                    type="button"
                    disabled={steps.length >= 100}
                    onClick={() => setSteps((old) => [...old, ""])}
                  >
                    <Plus size={17} />
                    Add step
                  </button>
                </>
              )}
              <div className="editor-bottom">
                <span className="field-hint">Made by you. Ready to share.</span>
                <button className="pill-button" disabled={saving}>
                  {saving ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <>
                      {id ? "Save changes" : "Share your recipe"}
                      <ArrowUpRight size={17} />
                    </>
                  )}
                </button>
              </div>
            </>
          )}
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
        </form>
        <aside className="editor-notes">
          <span className="eyebrow">A RECIPE WORTH KEEPING</span>
          <h2>
            The little details
            <br />
            make the dish.
          </h2>
          <p>
            Use numeric quantities and consistent units so your ingredients can
            scale with the table.
          </p>
          <p>
            Write one clear action per step. A little timing detail makes
            cooking easier.
          </p>
          <p>
            Dietary tags are provided by the recipe’s author. Check the
            ingredients and labels that matter to you.
          </p>
          <span className="notes-signature">
            A little love goes a long way.
          </span>
        </aside>
      </div>
    </PageShell>
  );
}
