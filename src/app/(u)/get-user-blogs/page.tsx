'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, BookOpen } from 'lucide-react';
import PageShell from '@/components/PageShell';
import BlogCard from '@/components/BlogCard';
import type { Blog } from '@/model/Blog.model';
export default function MyCookbook() {
  const [blogs, setBlogs] = useState<Blog[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const load = useCallback(async () => { setLoading(true); setError(''); try { const response = await fetch('/api/get-user-blogs'); const result = await response.json(); if (!response.ok) throw new Error(result.message || 'Unable to load your cookbook.'); setBlogs(result.data || []); } catch (e) { setError(e instanceof Error ? e.message : 'Unable to load recipes.'); } finally { setLoading(false); } }, []);
  useEffect(() => { void load(); }, [load]);
  return <PageShell eyebrow="YOUR PERSONAL KITCHEN JOURNAL" title="A collection with your name on it." description="The dishes you love making. The stories you love sharing."><div className="collection-heading"><span>{blogs.length} shared {blogs.length === 1 ? 'recipe' : 'recipes'}</span><Link href="/post-blogs" className="pill-button">Add a recipe<ArrowUpRight size={17}/></Link></div>{loading ? <div className="recipe-grid">{[1,2,3].map(i => <div key={i} className="recipe-skeleton"/>)}</div> : error ? <div className="collection-state" role="alert"><p>{error}</p><button onClick={() => void load()} className="outline-button">Try again</button></div> : blogs.length ? <div className="recipe-grid">{blogs.map(blog => <BlogCard key={String(blog._id)} blog={blog} forUser onBlogDeleted={id => setBlogs(old => old.filter(item => String(item._id) !== id))}/>)}</div> : <div className="empty-cookbook"><BookOpen size={42}/><h2>Every collection starts with one.</h2><p>Bring your first recipe to the table.</p><Link href="/post-blogs" className="text-link">Write a recipe<ArrowUpRight size={17}/></Link></div>}</PageShell>;
}
