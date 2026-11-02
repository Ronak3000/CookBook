'use client';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock, Printer } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import type { Blog } from '@/model/Blog.model';
export default function RecipeDetail() {
  const { id } = useParams<{ id: string }>(); const [blog, setBlog] = useState<Blog | null>(null); const [owner, setOwner] = useState(''); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const load = useCallback(async () => { setLoading(true); setError(''); try { const response = await fetch(`/api/get-individual-blogs?id=${encodeURIComponent(id)}`); const result = await response.json(); if (!response.ok) throw new Error(result.message || 'Unable to load recipe.'); setBlog(result.data); setOwner(result.owner || 'Community cook'); } catch (e) { setError(e instanceof Error ? e.message : 'Unable to load recipe.'); } finally { setLoading(false); } }, [id]);
  useEffect(() => { void load(); }, [load]);
  return <><Navbar/><main className="reading-page"><Link href="/dashboard#recipes" className="text-link"><ArrowLeft size={16}/>Back to the community table</Link>{loading ? <div className="recipe-skeleton"/> : error ? <div className="collection-state" role="alert"><p>{error}</p><button className="outline-button" onClick={() => void load()}>Try again</button></div> : blog && <article><header className="reading-heading"><span className="eyebrow">A STORY FROM THE COMMUNITY</span><h1>{blog.title}</h1><div className="reading-meta"><span className="author-avatar">{owner.slice(0,1).toUpperCase()}</span><span>From the kitchen of <strong>{owner}</strong></span><span><Clock size={14}/>{new Date(blog.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span><button onClick={() => window.print()} className="text-link"><Printer size={15}/>Print recipe</button></div></header><div className="recipe-prose">{blog.bodyOfBlog}</div><div className="reading-end"><span>Made with care. Shared with you.</span><Link href="/post-blogs" className="text-link">Share your own story →</Link></div></article>}</main><Footer/></>;
}
