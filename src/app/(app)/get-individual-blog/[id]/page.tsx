"use client";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, Printer } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BookmarkButton from "@/components/BookmarkButton";
import RecipeCooking from "@/components/RecipeCooking";
import type { RecipeDetail } from "@/types/recipeContent";
export default function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [blog, setBlog] = useState<RecipeDetail | null>(null),
    [owner, setOwner] = useState(""),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `/api/get-individual-blogs?id=${encodeURIComponent(id)}`,
      );
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || "Unable to load recipe.");
      setBlog(result.data);
      setOwner(result.owner || "Community cook");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load recipe.");
    } finally {
      setLoading(false);
    }
  }, [id]);
  useEffect(() => {
    void load();
  }, [load]);
  return (
    <>
      <Navbar />
      <main
        className={`reading-page ${blog?.recipe ? "structured-reading" : ""}`}
      >
        <Link href="/dashboard#recipes" className="text-link">
          <ArrowLeft size={16} />
          Back to the community table
        </Link>
        {loading ? (
          <div className="recipe-skeleton" />
        ) : error ? (
          <div className="collection-state" role="alert">
            <p>{error}</p>
            <button className="outline-button" onClick={() => void load()}>
              Try again
            </button>
          </div>
        ) : (
          blog && (
            <article>
              <header className="reading-heading">
                <span className="eyebrow">A STORY FROM THE COMMUNITY</span>
                <h1>{blog.title}</h1>
                <div className="reading-meta">
                  <span className="author-avatar">
                    {owner.slice(0, 1).toUpperCase()}
                  </span>
                  <span>
                    From the kitchen of <strong>{owner}</strong>
                  </span>
                  <span>
                    <Clock size={14} />
                    {new Date(blog.createdAt).toLocaleDateString(undefined, {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <button onClick={() => window.print()} className="text-link">
                    <Printer size={15} />
                    Print recipe
                  </button>
                </div>
                {blog.recipe && (
                  <div className="recipe-detail-facts">
                    <span>{blog.recipe.prepMinutes} min prep</span>
                    <span>{blog.recipe.cookMinutes} min cooking</span>
                    <span>{blog.recipe.cuisine}</span>
                    {blog.recipe.dietaryTags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                )}
                <div className="reading-save">
                  <BookmarkButton recipeId={id} />
                  <Link className="text-link" href="/saved-recipes">
                    Your saved recipes →
                  </Link>
                </div>
              </header>
              {blog.bodyOfBlog && (
                <div className="recipe-prose">{blog.bodyOfBlog}</div>
              )}
              {blog.recipe ? (
                <RecipeCooking key={id} recipe={blog.recipe} recipeId={id} />
              ) : (
                <p className="legacy-recipe-note">
                  This is a kitchen story. The author can add ingredient
                  quantities and steps to enable serving adjustments and cooking
                  mode.
                </p>
              )}
              <div className="reading-end">
                <span>Made with care. Shared with you.</span>
                <Link href="/post-blogs" className="text-link">
                  Share your own story →
                </Link>
              </div>
            </article>
          )
        )}
      </main>
      <Footer />
    </>
  );
}
