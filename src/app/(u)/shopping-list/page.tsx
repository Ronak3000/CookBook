"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check, Copy, Loader2, ShoppingBasket, Trash2 } from "lucide-react";
import PageShell from "@/components/PageShell";
import { formatIngredient, type ShoppingGroup } from "@/types/recipeContent";
export default function ShoppingList() {
  const [groups, setGroups] = useState<ShoppingGroup[]>([]),
    [loading, setLoading] = useState(true),
    [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false),
    [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [mutating, setMutating] = useState("");
  const cursor = useRef<string | null>(null),
    pending = useRef(false),
    controller = useRef<AbortController | null>(null);
  const load = useCallback(async (append = false) => {
    if (
      pending.current ||
      !controller.current ||
      controller.current.signal.aborted
    )
      return;
    const signal = controller.current.signal;
    pending.current = true;
    setError("");
    if (append) setLoadingMore(true);
    else setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "12" });
      if (append && cursor.current) params.set("cursor", cursor.current);
      const response = await fetch(`/api/shopping-list?${params}`, { signal });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || "Unable to open your shopping list.");
      if (signal.aborted) return;
      cursor.current = result.pagination.nextCursor;
      setHasMore(result.pagination.hasMore);
      setGroups(
        (old) =>
          Array.from(
            new Map(
              (append ? [...old, ...result.data] : result.data).map(
                (group: ShoppingGroup) => [group._id, group],
              ),
            ).values(),
          ) as ShoppingGroup[],
      );
    } catch (e) {
      if (!signal.aborted)
        setError(
          e instanceof Error ? e.message : "Unable to load shopping list.",
        );
    } finally {
      if (!signal.aborted) {
        pending.current = false;
        setLoading(false);
        setLoadingMore(false);
      }
    }
  }, []);
  useEffect(() => {
    controller.current = new AbortController();
    pending.current = false;
    void load();
    return () => controller.current?.abort();
  }, [load]);
  const mutate = async (
    groupId: string,
    itemId?: string,
    checked?: boolean,
  ) => {
    setMutating(itemId || groupId);
    setError("");
    setMessage("");
    try {
      const response = await fetch(
        itemId ? "/api/shopping-list" : `/api/shopping-list?id=${groupId}`,
        {
          method: itemId ? "PATCH" : "DELETE",
          headers: { "Content-Type": "application/json" },
          ...(itemId
            ? { body: JSON.stringify({ groupId, itemId, checked }) }
            : {}),
        },
      );
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      setGroups((old) =>
        itemId
          ? old.map((group) =>
              group._id === groupId
                ? {
                    ...group,
                    items: group.items.map((item) =>
                      item._id === itemId
                        ? { ...item, checked: Boolean(checked) }
                        : item,
                    ),
                  }
                : group,
            )
          : old.filter((group) => group._id !== groupId),
      );
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Unable to update shopping list.",
      );
    } finally {
      setMutating("");
    }
  };
  const copy = async () => {
    try {
      const text = groups
        .map((group) => {
          const items = group.items.filter((item) => !item.checked);
          return items.length
            ? `${group.title} · ${group.servings} servings\n${items.map((item) => `☐ ${formatIngredient(item)}`).join("\n")}`
            : "";
        })
        .filter(Boolean)
        .join("\n\n");
      await navigator.clipboard.writeText(text);
      setMessage("Unchecked ingredients copied.");
    } catch {
      setError("Unable to copy. You can select and copy the list text.");
    }
  };
  const itemCount = groups.reduce((sum, group) => sum + group.items.length, 0),
    completedCount = groups.reduce(
      (sum, group) => sum + group.items.filter((item) => item.checked).length,
      0,
    );
  return (
    <PageShell
      eyebrow="A LITTLE PLANNING, A LOT OF GOOD FOOD"
      title="From your kitchen to your basket."
      description="Ingredients for the recipes you’re planning, with the quantities you chose."
    >
      <div className="kitchen-page-tabs">
        <Link href="/saved-recipes">Saved recipes</Link>
        <Link className="active" href="/shopping-list">
          Shopping list
        </Link>
        <Link href="/get-user-blogs">My recipes</Link>
      </div>
      <div className="shopping-summary">
        <span>
          {completedCount} of {itemCount} loaded items checked
        </span>
        <button
          className="outline-button"
          disabled={hasMore || !itemCount || itemCount === completedCount}
          onClick={() => void copy()}
        >
          <Copy size={16} />
          Copy unchecked ingredients
        </button>
      </div>
      {hasMore && (
        <p className="field-hint">
          Load the remaining recipes to copy your complete shopping list.
        </p>
      )}
      {message && (
        <p className="kitchen-notice" role="status">
          {message}
        </p>
      )}
      {error && (
        <div className="form-error" role="alert">
          {error}
          {!groups.length && (
            <button className="text-link" onClick={() => void load()}>
              Try again
            </button>
          )}
        </div>
      )}
      {loading ? (
        <div
          className="recipe-skeleton"
          aria-label="Loading your shopping list"
        />
      ) : groups.length ? (
        <div className="shopping-grid">
          {groups.map((group) => (
            <section className="surface shopping-group" key={group._id}>
              <header>
                <div>
                  <span className="eyebrow">SERVES {group.servings}</span>
                  <h2>
                    <Link href={`/get-individual-blog/${group.recipeId}`}>
                      {group.title}
                    </Link>
                  </h2>
                </div>
                <button
                  className="icon-button"
                  disabled={Boolean(mutating)}
                  aria-label={`Remove ${group.title} from shopping list`}
                  onClick={() => void mutate(group._id)}
                >
                  {mutating === group._id ? (
                    <Loader2 size={17} className="animate-spin" />
                  ) : (
                    <Trash2 size={17} />
                  )}
                </button>
              </header>
              <ul>
                {group.items.map((item) => (
                  <li key={item._id} className={item.checked ? "complete" : ""}>
                    <label>
                      <input
                        type="checkbox"
                        disabled={Boolean(mutating)}
                        checked={item.checked}
                        onChange={(e) =>
                          void mutate(group._id, item._id, e.target.checked)
                        }
                      />
                      <span>{formatIngredient(item)}</span>
                      {mutating === item._id && (
                        <Loader2 size={14} className="animate-spin" />
                      )}
                    </label>
                  </li>
                ))}
              </ul>
              <p className="field-hint">
                {group.items.every((item) => item.checked) ? (
                  <>
                    <Check size={14} />
                    All set for this recipe.
                  </>
                ) : (
                  "Check ingredients you already have or pick them up on your next shop."
                )}
              </p>
            </section>
          ))}
        </div>
      ) : (
        !error && (
          <div className="empty-cookbook">
            <ShoppingBasket size={42} />
            <h2>Good meals start with a little list.</h2>
            <p>Open a recipe, choose your servings, and add its ingredients.</p>
            <Link className="pill-button" href="/dashboard#recipes">
              Find something delicious →
            </Link>
          </div>
        )
      )}
      {!loading && hasMore && (
        <div className="feed-controls">
          <button
            className="outline-button"
            disabled={loadingMore}
            onClick={() => void load(true)}
          >
            {loadingMore ? "Loading…" : "Load more shopping recipes"}
          </button>
        </div>
      )}
    </PageShell>
  );
}
