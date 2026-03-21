import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export function Footer() {
  return (
    <footer style={{ background: '#0a0a0f', borderTop: '1px solid #1e1e28' }}>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-lg"
              style={{ background: 'linear-gradient(135deg, #7c6ff7, #a78bfa)' }}
            >
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: '#f0f0f8' }}>AI Workspace</p>
              <p className="text-xs" style={{ color: '#55556a' }}>Multi-agent research platform</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {[
              { href: '#how-it-works', label: 'How it Works' },
              { href: '#features', label: 'Features' },
              { href: '#tech', label: 'Tech Stack' },
              { href: '/chat', label: 'Launch App' },
              { href: 'https://github.com/esmael-Abdlkadr/ai-workspace-platform', label: 'GitHub' },
            ].map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-xs font-medium transition-colors hover:text-white"
                style={{ color: '#55556a' }}
              >
                {l.label}
              </a>
            ))}
          </div>

          <p className="text-xs" style={{ color: '#55556a' }}>
            © 2025 AI Workspace · LangGraph · Groq · pgvector
          </p>
        </div>
      </div>
    </footer>
  );
}
