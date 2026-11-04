'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { RecipeCategory, RecipePage, RecipeSummary } from '@/types/recipes';

type RequestState = { key: string; controller: AbortController; pending: boolean; cursor: string | null };
type CollectionState = { key: string; blogs: RecipeSummary[]; loading: boolean; loadingMore: boolean; error: string; hasMore: boolean; pages: number };
const emptyState: CollectionState = { key: '', blogs: [], loading: true, loadingMore: false, error: '', hasMore: false, pages: 0 };

export function useRecipeFeed(endpoint: string, query = '', category: RecipeCategory = 'All recipes', filters: { cuisine?: string; diet?: string; maxMinutes?: string } = {}) {
  const [debouncedQuery, setDebouncedQuery] = useState(query.trim());
  const [state, setState] = useState<CollectionState>(emptyState);
  const active = useRef<RequestState | null>(null);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(timer);
  }, [query]);
  const key = `${endpoint}?${new URLSearchParams({ limit: '12', q: debouncedQuery, category, ...(filters.cuisine ? { cuisine: filters.cuisine } : {}), ...(filters.diet ? { diet: filters.diet } : {}), ...(filters.maxMinutes ? { maxMinutes: filters.maxMinutes } : {}) })}`;

  const fetchPage = useCallback(async (run: RequestState, append: boolean) => {
    if (run.pending || run.controller.signal.aborted) return;
    run.pending = true;
    setState(old => old.key === run.key ? { ...old, loading: !append, loadingMore: append, error: '' } : old);
    try {
      const url = new URL(run.key, window.location.origin);
      if (append && run.cursor) url.searchParams.set('cursor', run.cursor);
      const response = await fetch(url, { signal: run.controller.signal, cache: 'no-store' });
      const result: RecipePage = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || 'Unable to load recipes.');
      if (!Array.isArray(result.data) || !result.pagination || (result.pagination.hasMore && (!result.pagination.nextCursor || result.pagination.nextCursor === run.cursor))) throw new Error('Unable to continue this collection. Please refresh and try again.');
      if (active.current !== run || run.controller.signal.aborted) return;
      run.cursor = result.pagination.nextCursor;
      setState(old => {
        const rows = append ? [...old.blogs, ...result.data] : result.data;
        const unique = Array.from(new Map(rows.map(blog => [blog._id, blog])).values());
        return { ...old, blogs: unique, error: '', hasMore: result.pagination.hasMore, pages: append ? old.pages + 1 : 1 };
      });
    } catch (error) {
      if (active.current === run && !run.controller.signal.aborted) setState(old => ({ ...old, error: error instanceof Error ? error.message : 'Unable to load recipes.' }));
    } finally {
      run.pending = false;
      if (active.current === run && !run.controller.signal.aborted) setState(old => ({ ...old, loading: false, loadingMore: false }));
    }
  }, []);

  useEffect(() => {
    const run: RequestState = { key, controller: new AbortController(), pending: false, cursor: null };
    active.current = run;
    setState({ ...emptyState, key });
    void fetchPage(run, false);
    return () => { run.controller.abort(); if (active.current === run) active.current = null; };
  }, [key, fetchPage]);

  const loadMore = useCallback(() => {
    const run = active.current;
    if (run?.key === key && run.cursor) void fetchPage(run, true);
  }, [key, fetchPage]);
  const retry = useCallback(() => {
    const run = active.current;
    if (run?.key === key) void fetchPage(run, run.cursor !== null);
  }, [key, fetchPage]);
  const remove = useCallback((id: string) => setState(old => ({ ...old, blogs: old.blogs.filter(blog => blog._id !== id) })), []);
  return { ...(state.key === key && query.trim() === debouncedQuery ? state : emptyState), loadMore, retry, remove };
}
