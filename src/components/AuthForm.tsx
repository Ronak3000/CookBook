'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ArrowUpRight, ChefHat, Loader2, Eye, EyeOff } from 'lucide-react';
import { signUpSchema } from '@/schemas/signUpSchema';
import Navbar from './Navbar';
import Footer from './Footer';

export default function AuthForm({ signup = false }: { signup?: boolean }) {
  const router = useRouter();
  const [values, setValues] = useState({ name: '', username: '', email: '', identifier: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('error');
    if (code) setError('Unable to sign in. Please try again.');
  }, []);
  const update = (key: keyof typeof values, value: string) => setValues(old => ({ ...old, [key]: value }));
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setError('');
    if (signup) {
      const result = signUpSchema.safeParse(values);
      if (!result.success) { setError(result.error.issues[0].message); return; }
    }
    setBusy(true);
    try {
      if (signup) {
        const response = await fetch('/api/sign-up', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values) });
        const result = await response.json();
        if (!response.ok) { setError(result.message || 'Unable to create account.'); return; }
      }
      const result = await signIn('credentials', { identifier: signup ? values.email : values.identifier, password: values.password, redirect: false });
      if (result?.ok && !result.error) { router.replace('/dashboard'); router.refresh(); }
      else setError(signup ? 'Account created. Please sign in to continue.' : 'That username or password doesn’t match. Please try again.');
    } catch { setError('We couldn’t connect. Please try again.'); }
    finally { setBusy(false); }
  };
  return <><Navbar/><main className="auth-layout"><aside className="auth-story"><span className="eyebrow">YOUR SEAT AT THE TABLE</span><h1>{signup ? <>Good food.<br/>Great company.<br/><em>You belong here.</em></> : <>A familiar place.<br/>A fresh craving.<br/><em>Welcome back.</em></>}</h1><p>A home for your favorite recipes, kitchen experiments, and the stories that bring us together.</p><div className="auth-story-bottom"><ChefHat size={30}/><span>Everyday cooks.<br/>Extraordinary possibilities.</span></div></aside><section className="auth-panel"><div className="eyebrow">{signup ? 'START SOMETHING DELICIOUS' : 'BACK TO YOUR KITCHEN'}</div><h2>{signup ? 'Join the table.' : 'Make yourself at home.'}</h2><p className="page-description">{signup ? 'A few details, and your cookbook is ready.' : 'Your recipes and next great ideas are waiting.'}</p><form onSubmit={submit} className="auth-fields">{signup && <div className="field-pair"><label>Full name<input required autoComplete="name" value={values.name} onChange={e => update('name', e.target.value)} placeholder="Your name"/></label><label>Username<input required autoComplete="username" minLength={3} maxLength={20} value={values.username} onChange={e => update('username', e.target.value)} placeholder="Your kitchen alias"/></label></div>}<label>{signup ? 'Email address' : 'Email or username'}<input required type={signup ? 'email' : 'text'} autoComplete={signup ? 'email' : 'username'} value={signup ? values.email : values.identifier} onChange={e => update(signup ? 'email' : 'identifier', e.target.value)} placeholder={signup ? 'you@example.com' : 'Your email or username'}/></label><label>Password<div className="password-field"><input required type={showPassword ? 'text' : 'password'} autoComplete={signup ? 'new-password' : 'current-password'} value={values.password} minLength={signup ? 8 : undefined} maxLength={signup ? 20 : undefined} onChange={e => update('password', e.target.value)} placeholder={signup ? 'Create a password (8–20 characters)' : 'Your password'}/><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={17}/> : <Eye size={17}/>}</button></div></label>{error && <p role="alert" className="form-error">{error}</p>}<button className="pill-button auth-submit" disabled={busy}>{busy ? <Loader2 size={18} className="animate-spin"/> : <>{signup ? 'Create your cookbook' : 'Sign in'}<ArrowUpRight size={18}/></>}</button></form><p className="auth-switch">{signup ? 'Already part of the community?' : 'New around here?'} <Link href={signup ? '/sign-in' : '/sign-up'}>{signup ? 'Sign in' : 'Pull up a chair'}</Link></p></section></main><Footer/></>;
}
