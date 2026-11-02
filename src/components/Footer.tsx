'use client';
import Link from 'next/link';
import { BookOpen, Lightbulb, Pencil, Search } from 'lucide-react';
export default function Footer() {
  return <footer className="site-footer"><Link href="/" className="footer-wordmark">cookbook.</Link><span>Good food. Better stories. Made to be shared.</span><div className="footer-links"><Link href="/post-blogs"><Pencil size={16}/> Create</Link><Link href="/dashboard#recipes"><Search size={16}/> Explore</Link><Link href="/suggest"><Lightbulb size={16}/> Inspiration</Link><Link href="/get-user-blogs"><BookOpen size={16}/> Collection</Link></div><span className="footer-note">A little inspiration for your everyday table.</span></footer>;
}
