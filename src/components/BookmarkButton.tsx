"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Bookmark, Check, Loader2 } from "lucide-react";
export default function BookmarkButton({ recipeId }: { recipeId: string }) {
  const { data: session, status } = useSession();
  const userId = session?.user?._id;
  const [saved, setSaved] = useState(false),
    [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    if (status !== "authenticated") {
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setError("");
    void fetch(`/api/bookmarks?recipeId=${recipeId}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.message);
        if (!controller.signal.aborted) setSaved(result.saved);
      })
      .catch((e) => {
        if (!controller.signal.aborted)
          setError(
            e instanceof Error ? e.message : "Unable to check saved recipes.",
          );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [recipeId, status, userId]);
  const toggle = async () => {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeId, saved: !saved }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      setSaved(result.saved);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save recipe.");
    } finally {
      setBusy(false);
    }
  };
  if (status === "unauthenticated")
    return (
      <Link href="/sign-in" className="outline-button">
        <Bookmark size={16} />
        Sign in to save
      </Link>
    );
  return (
    <div className="bookmark-control">
      <button
        className="outline-button"
        disabled={busy || loading || status === "loading"}
        aria-pressed={saved}
        onClick={() => void toggle()}
      >
        {busy || loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : saved ? (
          <Check size={16} />
        ) : (
          <Bookmark size={16} />
        )}{" "}
        {saved ? "Saved to your recipes" : "Save recipe"}
      </button>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
    </div>
  );
}
