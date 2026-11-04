'use client';
import Link from 'next/link';
import { ArrowUpRight, BookOpen } from 'lucide-react';
import PageShell from '@/components/PageShell';
import BlogCard from '@/components/BlogCard';
import { useRecipeFeed } from '@/hooks/useRecipeFeed';
import RecipeFeedControls from '@/components/RecipeFeedControls';

export default function MyCookbook() {
  const { blogs, loading, loadingMore, error, hasMore, pages, loadMore, retry, remove } = useRecipeFeed('/api/get-user-blogs');
  return <PageShell eyebrow="YOUR PERSONAL KITCHEN JOURNAL" title="A collection with your name on it." description="The dishes you love making. The stories you love sharing.">
    <div className="kitchen-page-tabs"><Link href="/get-user-blogs" className="active">My recipes</Link><Link href="/saved-recipes">Saved recipes</Link><Link href="/shopping-list">Shopping list</Link></div>
    <div className="collection-heading">
      <span>{loading ? 'Opening your cookbook…' : `${blogs.length} ${blogs.length === 1 ? 'recipe' : 'recipes'} loaded`}</span>
      <Link href="/post-blogs" className="pill-button">Add a recipe<ArrowUpRight size={17}/></Link>
    </div>
    {loading ? <div className="recipe-grid" aria-label="Loading your recipes" aria-busy="true">{[1,2,3].map(i => <div key={i} className="recipe-skeleton"/>)}</div>
      : error && !blogs.length ? <div className="collection-state" role="alert"><p>{error}</p><button onClick={retry} className="outline-button">Try again</button></div>
      : blogs.length || hasMore ? <div className="recipe-grid">{blogs.map(blog => <BlogCard key={blog._id} blog={blog} forUser onBlogDeleted={remove}/>)}</div>
      : <div className="empty-cookbook"><BookOpen size={42}/><h2>Every collection starts with one.</h2><p>Bring your first recipe to the table.</p><Link href="/post-blogs" className="text-link">Write a recipe<ArrowUpRight size={17}/></Link></div>}
    {!loading && (blogs.length > 0 || hasMore) && <RecipeFeedControls hasMore={hasMore} loading={loadingMore} error={error} pages={pages} count={blogs.length} onLoadMore={loadMore} onRetry={retry}/>}
  </PageShell>;
}
