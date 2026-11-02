'use client';

import Link from 'next/link';
import ThemeToggle from './ThemeToggle';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { ArrowUpRight, ChefHat } from 'lucide-react';
import { useRef, useState } from 'react';

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const links = [
    ['Discover', '/dashboard'],
    ['Kitchen inspiration', '/suggest'],
    ['My cookbook', '/get-user-blogs'],
  ];

  return <nav className="site-nav" aria-label="Main navigation" onKeyDown={event => {
    if (event.key === 'Escape' && open) {
      setOpen(false);
      menuButton.current?.focus();
    }
  }}>
    <Link href="/" className="brand"><span className="brand-icon"><ChefHat size={23}/></span>cookbook<span className="brand-dot">.</span></Link>
    <div id="primary-navigation" className={`nav-links ${open ? 'is-open' : ''}`}>
      {links.map(([label, href]) => <Link onClick={() => setOpen(false)} className={(pathname === href || (pathname === '/' && href === '/dashboard')) ? 'active' : ''} key={href} href={href}>{label}</Link>)}
    </div>
    <div className="nav-actions">
      <ThemeToggle/>
      {session ? <button className="quiet-button" onClick={() => signOut()}>Sign out</button> : <Link className="quiet-button" href="/sign-in">Sign in</Link>}
      <Link className="pill-button small" href="/post-blogs">Share a recipe <ArrowUpRight size={16}/></Link>
      <button ref={menuButton} className={`menu-toggle ${open ? 'is-open' : ''}`} onClick={() => setOpen(value => !value)} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="primary-navigation">
        <span className="menu-icon" aria-hidden="true"><span/><span/><span/></span>
      </button>
    </div>
  </nav>;
}
