"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Check,
  ChefHat,
  Loader2,
  Minus,
  Plus,
  ShoppingBasket,
  X,
} from "lucide-react";
import {
  formatIngredient,
  progressKey,
  type RecipeContent,
} from "@/types/recipeContent";
export default function RecipeCooking({
  recipe,
  recipeId,
}: {
  recipe: RecipeContent;
  recipeId: string;
}) {
  const { status } = useSession();
  const [servings, setServings] = useState(recipe.servings),
    [cooking, setCooking] = useState(false),
    [checked, setChecked] = useState<number[]>([]);
  const [persistent, setPersistent] = useState(true);
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [error, setError] = useState("");
  const startButton = useRef<HTMLButtonElement>(null),
    closeButton = useRef<HTMLButtonElement>(null);
  const key = progressKey(recipeId, recipe.steps);
  useEffect(() => {
    try {
      const saved: unknown = JSON.parse(localStorage.getItem(key) || "[]");
      setChecked(
        Array.isArray(saved)
          ? [
              ...new Set(
                saved.filter(
                  (value) =>
                    Number.isInteger(value) &&
                    value >= 0 &&
                    value < recipe.steps.length,
                ),
              ),
            ]
          : [],
      );
    } catch {
      setChecked([]);
      setPersistent(false);
    }
  }, [key, recipe.steps.length]);
  useEffect(() => {
    if (!cooking) return;
    const trigger = startButton.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setCooking(false);
    };
    document.addEventListener("keydown", escape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", escape);
      trigger?.focus();
    };
  }, [cooking]);
  const updateChecked = (next: number[]) => {
    setChecked(next);
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      setPersistent(false);
    }
  };
  const toggle = (index: number) =>
    updateChecked(
      checked.includes(index)
        ? checked.filter((i) => i !== index)
        : [...checked, index],
    );
  const addToList = async () => {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/shopping-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeId, servings }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      setMessage(result.message);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Unable to update shopping list.",
      );
    } finally {
      setBusy(false);
    }
  };
  const controls = (
    <div className="recipe-serving-control">
      <span>Serves</span>
      <button
        aria-label="Fewer servings"
        disabled={servings <= 1}
        onClick={() => setServings((n) => n - 1)}
      >
        <Minus size={15} />
      </button>
      <output aria-live="polite">{servings}</output>
      <button
        aria-label="More servings"
        disabled={servings >= 100}
        onClick={() => setServings((n) => n + 1)}
      >
        <Plus size={15} />
      </button>
    </div>
  );
  const ingredients = (
    <ul className="cooking-ingredients">
      {recipe.ingredients.map((item, index) => (
        <li key={index}>{formatIngredient(item, recipe.servings, servings)}</li>
      ))}
    </ul>
  );
  const stepList = (
    <ol className="checkable-steps">
      {recipe.steps.map((step, index) => (
        <li className={checked.includes(index) ? "complete" : ""} key={index}>
          <label>
            <input
              type="checkbox"
              checked={checked.includes(index)}
              onChange={() => toggle(index)}
            />
            <span className="cooking-step-number">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span>{step}</span>
          </label>
        </li>
      ))}
    </ol>
  );
  return (
    <>
      <div className="recipe-cooking-toolbar">
        {controls}
        <button
          ref={startButton}
          className="pill-button"
          onClick={() => setCooking(true)}
        >
          <ChefHat size={18} />
          Start cooking
        </button>
      </div>
      <div className="structured-recipe-grid">
        <section className="surface ingredient-panel">
          <div className="editor-section-title">
            <h2>On the counter</h2>
            <ShoppingBasket size={20} />
          </div>
          {ingredients}
          <p className="field-hint">
            Quantities scale from the author’s {recipe.servings} servings.
            Seasoning and cooking time may need a little judgment.
          </p>
          {status === "authenticated" ? (
            <button
              disabled={busy}
              className="outline-button"
              onClick={() => void addToList()}
            >
              {busy ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <ShoppingBasket size={16} />
              )}
              Add / update shopping list
            </button>
          ) : (
            <Link href="/sign-in" className="text-link">
              Sign in to make a shopping list →
            </Link>
          )}
          {message && (
            <p className="kitchen-notice" role="status">
              {message} <Link href="/shopping-list">Open list →</Link>
            </p>
          )}
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <p className="field-hint">
            Adding again replaces this recipe’s quantities and resets its
            shopping checks.
          </p>
        </section>
        <section className="recipe-step-panel">
          <div className="editor-section-title">
            <h2>Let’s get cooking</h2>
            <button
              className="text-link"
              disabled={!checked.length}
              onClick={() => updateChecked([])}
            >
              Reset checks
            </button>
          </div>
          {stepList}
          <p className="field-hint" role="status">
            {checked.length} of {recipe.steps.length} steps complete ·{" "}
            {persistent
              ? "progress stays on this device."
              : "progress lasts for this visit."}
          </p>
        </section>
      </div>
      {cooking && (
        <div
          className="cooking-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Cooking mode"
          onKeyDown={(event) => {
            if (event.key !== "Tab") return;
            const focusable = Array.from(
              event.currentTarget.querySelectorAll<HTMLElement>(
                "button:not(:disabled), input:not(:disabled), a[href]",
              ),
            );
            const first = focusable[0],
              last = focusable.at(-1);
            if (event.shiftKey && document.activeElement === first) {
              event.preventDefault();
              last?.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
              event.preventDefault();
              first?.focus();
            }
          }}
        >
          <div className="cooking-mode">
            <header>
              <div>
                <span className="eyebrow">ONE STEP AT A TIME</span>
                <h2>Let’s make something good.</h2>
              </div>
              <button
                ref={closeButton}
                className="icon-button"
                aria-label="Close cooking mode"
                onClick={() => setCooking(false)}
              >
                <X />
              </button>
            </header>
            <div className="cooking-mode-progress">
              <progress
                aria-label="Cooking progress"
                value={checked.length}
                max={recipe.steps.length}
              />
              <span>
                {checked.length === recipe.steps.length ? (
                  <>
                    <Check size={17} />
                    Ready for the table.
                  </>
                ) : (
                  `${checked.length} of ${recipe.steps.length} steps complete`
                )}
              </span>
            </div>
            <div className="cooking-mode-columns">
              <aside>
                <h3>Your ingredients</h3>
                {controls}
                {ingredients}
              </aside>
              <section>
                {stepList}
                <button
                  className="text-link"
                  disabled={!checked.length}
                  onClick={() => updateChecked([])}
                >
                  Start the steps again
                </button>
              </section>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
