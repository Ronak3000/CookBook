'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ArrowUpRight, Loader2 } from 'lucide-react';
import PageShell from './PageShell';
import { BlogVerificationSchema } from '@/schemas/blogVerificationSchema';
export default function RecipeEditor({ id }: { id?: string }) {
  const { status } = useSession(); const router = useRouter();
  const [title, setTitle] = useState(''); const [body, setBody] = useState('');
  const [loading, setLoading] = useState(Boolean(id)); const [saving, setSaving] = useState(false); const [error, setError] = useState('');
  useEffect(() => {
    if (!id || status !== 'authenticated') return;
    const controller = new AbortController();
    void (async () => { try {
      const response = await fetch(`/api/get-individual-blogs?id=${encodeURIComponent(id)}`, { signal: controller.signal }); const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Unable to load recipe.');
      setTitle(result.data.title); setBody(result.data.bodyOfBlog);
    } catch (e) { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : 'Unable to load recipe.'); }
    finally { if (!controller.signal.aborted) setLoading(false); }
    })(); return () => controller.abort();
  }, [id, status]);
  const save = async (event: React.FormEvent) => {
    event.preventDefault(); setError('');
    const data = { title, bodyOfBlog: body }; const parsed = BlogVerificationSchema.safeParse(data);
    if (!parsed.success) { setError(parsed.error.issues[0].message); return; }
    setSaving(true);
    try { const response = await fetch(id ? `/api/update-blog?id=${encodeURIComponent(id)}` : '/api/post-blog', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); const result = await response.json(); if (!response.ok) throw new Error(result.message || 'Unable to save recipe.'); router.push('/get-user-blogs'); }
    catch (e) { setError(e instanceof Error ? e.message : 'Unable to save recipe.'); } finally { setSaving(false); }
  };
  return <PageShell eyebrow="FROM YOUR KITCHEN, WITH LOVE" title={id ? 'Refine your recipe.' : 'Every dish has a story.'} description="Share the flavors, little tricks, and memories that make this one yours."><div className="editor-layout"><form className="surface editor-form" onSubmit={save}>{status === 'loading' || loading ? <p>Opening your kitchen…</p> : status === 'unauthenticated' ? <p>Please <a href="/sign-in">sign in</a> to share a recipe.</p> : <><label>Give it a name<input value={title} onChange={e => setTitle(e.target.value)} placeholder="Grandma’s Sunday pasta…" required maxLength={200}/></label><label>The recipe & its story<textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Start with a little backstory. Add your ingredients, quantities, and step-by-step instructions…" required rows={16}/></label><div className="editor-bottom"><span className="field-hint">{body.length.toLocaleString()} characters · Made by you</span><button className="pill-button" disabled={saving}>{saving ? <Loader2 className="animate-spin" size={18}/> : <>{id ? 'Save changes' : 'Share your recipe'}<ArrowUpRight size={17}/></>}</button></div></>}{error && <p className="form-error" role="alert">{error}</p>}</form><aside className="editor-notes"><span className="eyebrow">A RECIPE WORTH KEEPING</span><h2>The little details<br/>make the dish.</h2><p>List your ingredients with quantities.</p><p>Walk us through each step, including cooking times.</p><p>Share your favorite swaps and serving tips.</p><span className="notes-signature">A little love goes a long way.</span></aside></div></PageShell>;
}
