"use client";
import Link from "next/link";
import { Bookmark } from "lucide-react";
import PageShell from "@/components/PageShell";
import BlogCard from "@/components/BlogCard";
import RecipeFeedControls from "@/components/RecipeFeedControls";
import { useRecipeFeed } from "@/hooks/useRecipeFeed";
export default function SavedRecipes() {
  const {
    blogs,
    loading,
    loadingMore,
    error,
    hasMore,
    pages,
    loadMore,
    retry,
  } = useRecipeFeed("/api/bookmarks");
  return (
    <PageShell
      eyebrow="KEEP THE GOOD ONES CLOSE"
      title="For another delicious day."
      description="The community recipes you’ve saved, all in one little corner of your kitchen."
    >
      <div className="kitchen-page-tabs">
        <Link className="active" href="/saved-recipes">
          Saved recipes
        </Link>
        <Link href="/shopping-list">Shopping list</Link>
        <Link href="/get-user-blogs">My recipes</Link>
      </div>
      {loading ? (
        <div
          className="recipe-grid"
          aria-label="Loading saved recipes"
          aria-busy="true"
        >
          {[1, 2, 3].map((i) => (
            <div className="recipe-skeleton" key={i} />
          ))}
        </div>
      ) : error && !blogs.length ? (
        <div className="collection-state" role="alert">
          <p>{error}</p>
          <button className="outline-button" onClick={retry}>
            Try again
          </button>
        </div>
      ) : blogs.length ? (
        <div className="recipe-grid">
          {blogs.map((blog) => (
            <BlogCard key={blog._id} blog={blog} forUser={false} />
          ))}
        </div>
      ) : (
        <div className="empty-cookbook">
          <Bookmark size={40} />
          <h2>A good recipe is worth keeping.</h2>
          <p>Open a recipe and choose “Save recipe” to keep it here.</p>
          <Link href="/dashboard#recipes" className="pill-button">
            Find your next favorite →
          </Link>
        </div>
      )}
      {!loading && blogs.length > 0 && (
        <RecipeFeedControls
          hasMore={hasMore}
          loading={loadingMore}
          error={error}
          pages={pages}
          count={blogs.length}
          onLoadMore={loadMore}
          onRetry={retry}
        />
      )}
    </PageShell>
  );
}
