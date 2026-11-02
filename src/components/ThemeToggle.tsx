'use client';
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
export default function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => { setDark(document.documentElement.classList.contains('dark')); }, []);
  return <button className="theme-toggle" aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'} onClick={() => {
    const next = !dark; setDark(next); document.documentElement.classList.toggle('dark', next);
    try { localStorage.setItem('cookbook-theme', next ? 'dark' : 'light'); } catch {}
  }}>{dark ? <Sun size={18}/> : <Moon size={18}/>}</button>;
}
