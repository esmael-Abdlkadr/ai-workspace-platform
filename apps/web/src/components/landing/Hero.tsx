'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

const NODES = [
  { label: 'Researcher', color: '#22d3a0' },
  { label: 'Writer', color: '#7c6ff7' },
  { label: 'Critic', color: '#f59e0b' },
  { label: 'Memory', color: '#a78bfa' },
  { label: 'Notion', color: '#f0f0f8' },
];

export function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 pt-16">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(124,111,247,0.18) 0%, transparent 70%)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(124,111,247,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(124,111,247,0.5) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      <div className="relative z-10 flex max-w-5xl flex-col items-center gap-6 text-center">
        <div
          className="flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold"
          style={{ background: 'rgba(124,111,247,0.12)', border: '1px solid rgba(124,111,247,0.3)', color: '#a78bfa' }}
        >
          <Sparkles className="h-3 w-3" />
          Powered by LangGraph · Groq · pgvector
        </div>

        <h1 className="text-5xl font-extrabold leading-tight tracking-tight sm:text-6xl lg:text-7xl" style={{ color: '#f0f0f8' }}>
          Research.{' '}
          <span style={{ background: 'linear-gradient(135deg, #7c6ff7, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Write.
          </span>{' '}
          Publish.
        </h1>

        <p className="max-w-2xl text-lg leading-relaxed sm:text-xl" style={{ color: '#8888aa' }}>
          A multi-agent AI platform that researches your topic, writes a full document, critiques and refines it, then publishes directly to Notion — all automatically.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/chat"
            className="flex items-center gap-2 rounded-full px-7 py-3.5 text-base font-semibold text-white transition-all hover:opacity-90 hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #7c6ff7, #a78bfa)',
              boxShadow: '0 0 32px rgba(124,111,247,0.4)',
            }}
          >
            Start Building
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="#how-it-works"
            className="flex items-center gap-2 rounded-full border px-7 py-3.5 text-base font-semibold transition-all hover:opacity-80"
            style={{ borderColor: '#2a2a38', color: '#8888aa' }}
          >
            See how it works
          </a>
        </div>

        <div className="mt-8 w-full max-w-3xl">
          <div
            className="rounded-2xl p-6 sm:p-8"
            style={{ background: '#111118', border: '1px solid #2a2a38', boxShadow: '0 32px 80px rgba(0,0,0,0.5)' }}
          >
            <p className="mb-4 text-left text-[11px] font-semibold uppercase tracking-widest" style={{ color: '#55556a' }}>
              Workflow Progress
            </p>
            <div className="flex items-center gap-1 sm:gap-2">
              {NODES.map((node, i) => (
                <div key={node.label} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex w-full items-center">
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold animate-pulse"
                      style={{
                        background: `${node.color}20`,
                        border: `2px solid ${node.color}`,
                        color: node.color,
                        boxShadow: `0 0 16px ${node.color}40`,
                        animationDelay: `${i * 0.4}s`,
                        animationDuration: '2s',
                      }}
                    >
                      {i + 1}
                    </div>
                    {i < NODES.length - 1 && (
                      <div className="h-[2px] flex-1" style={{ background: `linear-gradient(90deg, ${node.color}60, ${NODES[i+1]!.color}30)` }} />
                    )}
                  </div>
                  <span className="hidden text-center text-[10px] font-medium sm:block" style={{ color: node.color }}>
                    {node.label}
                  </span>
                </div>
              ))}
            </div>

            <div
              className="mt-5 rounded-xl p-4 text-left font-mono text-sm"
              style={{ background: '#0a0a0f', border: '1px solid #1e1e28' }}
            >
              <div style={{ color: '#55556a' }}>{`// Researcher`}</div>
              <div style={{ color: '#22d3a0' }}>Found 3 relevant chunks from knowledge base</div>
              <div className="mt-1" style={{ color: '#55556a' }}>{`// Writer`}</div>
              <div style={{ color: '#a78bfa' }}>Drafted 1,847-word structured document</div>
              <div className="mt-1" style={{ color: '#55556a' }}>{`// Critic`}</div>
              <div style={{ color: '#f59e0b' }}>Score: 8.5/10 — approved on first pass</div>
              <div className="mt-1" style={{ color: '#55556a' }}>{`// Published`}</div>
              <div style={{ color: '#f0f0f8' }}>notion.so/your-workspace/document ✓</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
