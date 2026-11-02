'use client';
import { useEffect, useRef } from 'react';
import { ArrowDown, Loader2 } from 'lucide-react';

type Props = { hasMore: boolean; loading: boolean; error: string; pages: number; count: number; onLoadMore: () => void; onRetry: () => void };
export default function RecipeFeedControls({ hasMore, loading, error, pages, count, onLoadMore, onRetry }: Props) {
  const sentinel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // Stop automatic loading after three batches so the footer stays reachable.
    // The explicit button always works, including in browsers without this API.
    if (!hasMore || loading || error || pages >= 3 || !sentinel.current || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) onLoadMore();
    }, { rootMargin: '250px 0px' });
    observer.observe(sentinel.current);
    return () => observer.disconnect();
  }, [hasMore, loading, error, pages, onLoadMore]);
  return <div className="feed-controls" ref={sentinel}>
    <p className="feed-status" role="status">{loading ? 'Bringing more recipes to the table…' : error ? 'Couldn’t load the next recipes. Your collection is still here.' : hasMore ? `${count} recipes loaded · there’s more to discover` : count ? `You’re all caught up · ${count} ${count === 1 ? 'recipe' : 'recipes'}` : ''}</p>
    {error && <p className="form-error" role="alert">{error}</p>}
    {(hasMore || error) && <button className="outline-button" disabled={loading} onClick={error ? onRetry : onLoadMore}>{loading ? <Loader2 className="animate-spin" size={16}/> : <ArrowDown size={16}/>} {loading ? 'Loading…' : error ? 'Try again' : 'Load more recipes'}</button>}
  </div>;
}
