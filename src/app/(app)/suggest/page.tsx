'use client';
import { useState } from 'react';
import { ArrowRight, Check, ChefHat, Copy, Loader2, Minus, Plus, X } from 'lucide-react';
import PageShell from '@/components/PageShell';
const pantry = ['Tomatoes', 'Onions', 'Garlic', 'Rice', 'Pasta', 'Potatoes', 'Chicken', 'Eggs', 'Tofu', 'Paneer', 'Spinach', 'Mushrooms', 'Lentils', 'Chickpeas', 'Cheese', 'Broccoli', 'Carrots', 'Bell peppers'];
const cuisines = ['Indian', 'Italian', 'Chinese', 'Mexican', 'Japanese', 'French', 'Greek', 'Thai', 'Mediterranean', 'Middle Eastern', 'Korean', 'Spanish', 'Vietnamese', 'American', 'African', 'Caribbean'];
type Recipe = { title: string; preparationSteps: string[]; cookingInstructions: string[]; servingSuggestions: string[] };
export default function Inspiration() {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [custom, setCustom] = useState('');
  const [cuisine, setCuisine] = useState('Indian');
  const [people, setPeople] = useState(2);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const toggle = (name: string) => setIngredients(old => old.includes(name) ? old.filter(item => item !== name) : [...old, name]);
  const add = () => { const name = custom.trim(); if (name && name.length <= 100 && ingredients.length < 60 && !ingredients.some(item => item.toLowerCase() === name.toLowerCase())) setIngredients(old => [...old, name]); setCustom(''); };
  const generate = async (event: React.FormEvent) => {
    event.preventDefault(); setError(''); setCopied(false);
    if (!ingredients.length) { setError('Add at least one ingredient to get cooking.'); return; }
    setLoading(true);
    try {
      const response = await fetch('/api/suggest-recipies', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ingredients, cuisine, people }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Unable to create your recipe.');
      setRecipe(result.data);
    } catch (err) { setError(err instanceof Error ? err.message : 'Please try again.'); }
    finally { setLoading(false); }
  };
  const copy = async () => {
    if (!recipe) return;
    try { await navigator.clipboard.writeText([recipe.title, ...['preparationSteps', 'cookingInstructions', 'servingSuggestions'].map(key => (recipe[key as keyof Recipe] as string[]).join('\n'))].join('\n\n')); setCopied(true); }
    catch { setError('Unable to copy. You can select and copy the recipe text.'); }
  };
  return <PageShell eyebrow="A LITTLE KITCHEN ALCHEMY" title="What’s in your kitchen?" description="A handful of ingredients. A world of possibilities. Let’s find your next great meal."><div className="inspiration-workspace"><form onSubmit={generate} className="surface inspiration-form"><div className="step-label"><span>01</span> Start with what you have</div><label className="ingredient-entry"><input value={custom} maxLength={100} placeholder="Add an ingredient…" aria-label="Add an ingredient" onChange={e => setCustom(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}/><button type="button" onClick={add} aria-label="Add ingredient"><Plus size={19}/></button></label><p className="field-hint">Or pick a few pantry favorites.</p><div className="pantry-chips">{pantry.map(item => <button type="button" key={item} aria-pressed={ingredients.includes(item)} className={ingredients.includes(item) ? 'chosen' : ''} onClick={() => toggle(item)}>{ingredients.includes(item) && <Check size={12}/>} {item}</button>)}</div>{ingredients.length > 0 && <div className="selected-ingredients"><span className="field-hint">ON THE COUNTER · {ingredients.length}</span><div>{ingredients.map(item => <button key={item} type="button" onClick={() => toggle(item)} aria-label={`Remove ${item}`}>{item}<X size={12}/></button>)}</div></div>}<div className="step-label"><span>02</span> Set the mood</div><div className="field-pair"><label>Cuisine<select value={cuisine} onChange={e => setCuisine(e.target.value)}>{cuisines.map(item => <option key={item}>{item}</option>)}</select></label><label>People at the table<div className="serving-stepper"><button type="button" disabled={people <= 1} onClick={() => setPeople(n => n - 1)} aria-label="Fewer servings"><Minus size={16}/></button><output aria-live="polite">{people}</output><button type="button" disabled={people >= 100} onClick={() => setPeople(n => n + 1)} aria-label="More servings"><Plus size={16}/></button></div></label></div>{error && <p className="form-error" role="alert">{error}</p>}<button disabled={loading} className="pill-button auth-submit">{loading ? <><Loader2 className="animate-spin" size={18}/>Finding something delicious…</> : <>Make something delicious<ArrowRight size={18}/></>}</button><p className="field-hint">A recipe inspired by your ingredients, generated with AI.</p></form><div className="recipe-output" aria-live="polite" aria-busy={loading}>{loading ? <div className="inspiration-placeholder"><Loader2 size={40} className="animate-spin"/><h2>A good idea is simmering.</h2><p>Putting your ingredients together. This may take a moment.</p></div> : recipe ? <article className="surface generated-recipe"><div className="recipe-result-meta"><span className="eyebrow">YOUR NEXT GREAT MEAL</span><button className="text-link" onClick={() => void copy()}>{copied ? <Check size={16}/> : <Copy size={16}/>} {copied ? 'Copied' : 'Copy recipe'}</button></div><h2>{recipe.title}</h2>{([{ key: 'preparationSteps', title: 'A little prep' }, { key: 'cookingInstructions', title: 'Let’s get cooking' }, { key: 'servingSuggestions', title: 'Bring it to the table' }] as const).map(section => <section key={section.key}><h3>{section.title}</h3><ol>{recipe[section.key].map((step, i) => <li key={i}>{step}</li>)}</ol></section>)}</article> : <div className="inspiration-placeholder"><div className="placeholder-emblem"><ChefHat size={42}/></div><span className="eyebrow">GOOD THINGS START SMALL</span><h2>Your next favorite<br/>is already in your pantry.</h2><p>Choose your ingredients and a cuisine.<br/>We’ll take care of the inspiration.</p></div>}</div></div></PageShell>;
}
