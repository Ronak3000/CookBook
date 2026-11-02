'use client';

import Link from 'next/link';
import ThemeToggle from './ThemeToggle';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { ArrowUpRight, ChefHat, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const links = [['Discover', '/dashboard'], ['Kitchen inspiration', '/suggest'], ['My cookbook', '/get-user-blogs']];
  return <nav className="site-nav" aria-label="Main navigation">
    <Link href="/" className="brand"><span className="brand-icon"><ChefHat size={23}/></span>cookbook<span className="brand-dot">.</span></Link>
    <div className={`nav-links ${open ? 'is-open' : ''}`}>{links.map(([label, href]) => <Link onClick={() => setOpen(false)} className={(pathname === href || (pathname === '/' && href === '/dashboard')) ? 'active' : ''} key={href} href={href}>{label}</Link>)}</div>
    <div className="nav-actions"><ThemeToggle/>{session ? <button className="quiet-button" onClick={() => signOut()}>Sign out</button> : <Link className="quiet-button" href="/sign-in">Sign in</Link>}<Link className="pill-button small" href="/post-blogs">Share a recipe <ArrowUpRight size={16}/></Link><button className="menu-toggle" onClick={() => setOpen(!open)} aria-label="Toggle navigation" aria-expanded={open}>{open ? <X/> : <Menu/>}</button></div>
  </nav>;
}
