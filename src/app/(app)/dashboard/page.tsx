'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowDown, ArrowRight, ArrowUpRight, BookOpen, ChefHat, Search, Utensils, X } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BlogCard from '@/components/BlogCard';
import { recipeCategories, type RecipeCategory } from '@/types/recipes';
import { useRecipeFeed } from '@/hooks/useRecipeFeed';
import RecipeFeedControls from '@/components/RecipeFeedControls';
import { cuisines, dietaryTags } from '@/types/recipeContent';

const categories = recipeCategories;
const ideas = [
  { title: 'A little heat. A lot of comfort.', label: 'THE WEEKNIGHT EDIT', image: 'photo-1473093295043-cdd812d0e601', query: 'pasta', className: 'pasta' },
  { title: 'Fresh starts here.', label: 'STRAIGHT FROM THE GARDEN', image: 'photo-1512621776951-a57141f2eefd', query: 'salad', className: 'salad' },
  { title: 'Save room for something sweet.', label: 'THE HAPPY ENDING', image: 'photo-1488477181946-6428a0291777', query: 'dessert', className: 'dessert' },
];
export default function Dashboard() {
  const [query, setQuery] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [diet, setDiet] = useState('');
  const [maxMinutes, setMaxMinutes] = useState('');
  const [category, setCategory] = useState<RecipeCategory>('All recipes');
  const [selected, setSelected] = useState<typeof ideas[number] | null>(null);
  const { blogs, loading, loadingMore, error, hasMore, pages, loadMore, retry } = useRecipeFeed('/api/get-all-blogs', query, category, { cuisine, diet, maxMinutes });
  return <><Navbar/><main className="discover-page">
    <section className="hero">
      <div className="hero-copy"><div className="eyebrow"><span className="live-dot"/> A PLACE FOR PEOPLE WHO LOVE FOOD</div><h1>Your next<br/>great <span>craving.</span></h1><p>Every recipe has a story. Discover new favorites,<br className="desktop-break"/> share your own, and make something worth gathering for.</p><div className="hero-actions"><a className="pill-button" href="#recipes">Find your next favorite <ArrowUpRight size={18}/></a><Link className="text-link" href="/post-blogs">Share your story <ArrowRight size={17}/></Link></div><div className="hero-bottom"><span className="mini-icon"><Utensils size={17}/></span><span>From everyday cooks.<br/><strong>For extraordinary everyday meals.</strong></span></div></div>
      <div className="hero-visual"><img src="https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=85" alt="Colorful fresh bowl with vegetables and seasonal ingredients"/><div className="image-shade"/><span className="photo-index">01 / THE FRESH PERSPECTIVE</span><div className="photo-caption"><span>LESS SCROLLING. MORE SAVORING.</span><h2>Something good<br/>is always cooking.</h2></div><a href="#recipes" className="round-arrow" aria-label="Browse recipes"><ArrowDown size={23}/></a><div className="photo-sticker"><ChefHat size={23}/><span>Made with love.<br/><strong>Shared with everyone.</strong></span></div></div>
    </section>
    <div className="ticker"><span>GOOD FOOD, GOOD MOOD</span><span>✳</span><span>A PINCH OF CURIOSITY</span><span>✳</span><span>MAKE IT. LOVE IT. SHARE IT.</span><span>✳</span><span>YOUR TABLE, REIMAGINED</span></div>
    <section className="recipe-section" id="recipes"><div className="section-heading"><div><div className="eyebrow">THE COMMUNITY TABLE</div><h2>Made to be discovered<span>.</span></h2></div><span className="section-note">Fresh ideas for whatever you’re craving.</span></div>
    <div className="recipe-toolbar"><div className="category-tabs" aria-label="Filter recipes">{categories.map(item => <button key={item} onClick={() => setCategory(item)} aria-pressed={category === item} className={category === item ? 'selected' : ''}>{item}</button>)}</div><label className="recipe-search"><Search size={17}/><input maxLength={100} value={query} onChange={event => setQuery(event.target.value)} placeholder="Search a craving…" aria-label="Search recipes"/></label></div>
    <div className="discovery-filters">
      <label>Cuisine<select value={cuisine} onChange={e => setCuisine(e.target.value)}><option value="">Any cuisine</option>{cuisines.map(item => <option key={item}>{item}</option>)}</select></label>
      <label>Dietary preference<select value={diet} onChange={e => setDiet(e.target.value)}><option value="">Any preference</option>{dietaryTags.map(item => <option key={item}>{item}</option>)}</select></label>
      <label>Total time<select value={maxMinutes} onChange={e => setMaxMinutes(e.target.value)}><option value="">Any time</option><option value="15">Up to 15 minutes</option><option value="30">Up to 30 minutes</option><option value="60">Up to 1 hour</option><option value="120">Up to 2 hours</option></select></label>
      {(cuisine || diet || maxMinutes) && <button className="text-link" onClick={() => { setCuisine(''); setDiet(''); setMaxMinutes(''); }}>Clear filters</button>}
    </div>
    {loading ? <div className="recipe-grid" aria-label="Loading recipes" aria-busy="true">{[1,2,3].map(i => <div className="recipe-skeleton" key={i}/>)}</div> : error && !blogs.length ? <div className="collection-state" role="status"><BookOpen size={27}/><div><h3>The kitchen is taking a breather.</h3><p>{error}</p></div><button onClick={() => retry()} className="outline-button">Try again <ArrowRight size={16}/></button></div> : blogs.length ? <div className="recipe-grid">{blogs.map(blog => <BlogCard key={String(blog._id)} blog={blog} forUser={false}/>)}</div> : <div className="collection-state"><BookOpen size={27}/><div><h3>{query || cuisine || diet || maxMinutes || category !== 'All recipes' ? 'No recipes match this craving.' : 'Your next story starts in the kitchen.'}</h3><p>{query || cuisine || diet || maxMinutes || category !== 'All recipes' ? 'Try another keyword or explore a different category.' : 'Be the first to bring a favorite recipe to the table.'}</p></div><Link href="/post-blogs" className="outline-button">Share a recipe <ArrowUpRight size={16}/></Link></div>}
    {!loading && blogs.length > 0 && <RecipeFeedControls hasMore={hasMore} loading={loadingMore} error={error} pages={pages} count={blogs.length} onLoadMore={loadMore} onRetry={retry}/>}
    </section>
    <section className="inspiration-section"><div className="section-heading"><div><div className="eyebrow">FOLLOW YOUR APPETITE</div><h2>A little inspiration goes a long way.</h2></div><Link href="/suggest" className="text-link">Help me decide <ArrowUpRight size={18}/></Link></div><div className="inspiration-grid">{ideas.map(idea => <button className={`idea-card ${idea.className}`} key={idea.query} onClick={() => setSelected(idea)}><img loading="lazy" decoding="async" width={700} height={500} src={`https://images.unsplash.com/${idea.image}?auto=format&fit=crop&w=700&q=80`} alt=""/><div className="idea-content"><span>{idea.label}</span><h3>{idea.title}</h3><span className="idea-arrow"><ArrowUpRight size={20}/></span></div></button>)}</div></section>
    <section className="contribute-banner"><div><span className="eyebrow">A RECIPE IS BETTER WHEN IT’S SHARED</span><h2>Got a signature dish?<br/>Pull up a chair.</h2></div><Link href="/post-blogs" className="pill-button">Add your recipe <ArrowUpRight size={18}/></Link></section>
  </main><Footer/>{selected && <div className="inspiration-modal" onClick={() => setSelected(null)}><section role="dialog" aria-modal="true" aria-label={selected.title} onClick={e => e.stopPropagation()}><button className="modal-close" aria-label="Close inspiration" onClick={() => setSelected(null)} autoFocus><X/></button><span className="eyebrow">{selected.label}</span><h2>{selected.title}</h2><p>Explore the community’s {selected.query} recipes or head to Kitchen inspiration to create an idea with the ingredients you have.</p><Link className="pill-button" href="/dashboard#recipes">Explore recipes <Search size={17}/></Link><Link className="text-link" href="/suggest">Get kitchen inspiration <ArrowUpRight size={17}/></Link></section></div>}</>;
}
