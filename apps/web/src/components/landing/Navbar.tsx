'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, Menu, X } from 'lucide-react';

const links = [
  { href: '#how-it-works', label: 'How it Works' },
  { href: '#features', label: 'Features' },
  { href: '#tech', label: 'Tech Stack' },
  { href: '#demo', label: 'Demo' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <nav
      className="fixed left-0 right-0 top-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(10,10,15,0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(42,42,56,0.8)' : 'none',
      }}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ background: 'linear-gradient(135deg, #7c6ff7, #a78bfa)' }}
          >
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="text-base font-bold" style={{ color: '#f0f0f8' }}>
            AI Workspace
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium transition-colors hover:text-white"
              style={{ color: '#8888aa' }}
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/chat"
            className="rounded-full px-5 py-2 text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{
              background: 'linear-gradient(135deg, #7c6ff7, #a78bfa)',
              boxShadow: '0 0 24px rgba(124,111,247,0.35)',
            }}
          >
            Launch App
          </Link>
        </div>

        <button className="md:hidden" onClick={() => setOpen(!open)} style={{ color: '#8888aa' }}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div
          className="border-t px-4 pb-4 pt-2 md:hidden"
          style={{ background: 'rgba(10,10,15,0.95)', borderColor: '#2a2a38' }}
        >
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block py-2.5 text-sm font-medium"
              style={{ color: '#8888aa' }}
            >
              {l.label}
            </a>
          ))}
          <Link
            href="/chat"
            onClick={() => setOpen(false)}
            className="mt-2 block rounded-full px-5 py-2.5 text-center text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #7c6ff7, #a78bfa)' }}
          >
            Launch App
          </Link>
        </div>
      )}
    </nav>
  );
}
