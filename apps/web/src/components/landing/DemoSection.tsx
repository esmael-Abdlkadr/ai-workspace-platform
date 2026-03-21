import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const lines = [
  { label: 'prompt', color: '#8888aa', text: '"Write a deep-dive on transformer attention mechanisms"' },
  { label: 'researcher', color: '#22d3a0', text: '→ Found 4 chunks · hybrid score 0.87' },
  { label: 'writer', color: '#a78bfa', text: '→ Drafted 1,847-word structured document' },
  { label: 'critic', color: '#f59e0b', text: '→ Score 8.5/10 · approved on first pass' },
  { label: 'notion', color: '#7c6ff7', text: '→ Published notion.so/your-doc ✓' },
];

export function DemoSection() {
  return (
    <section id="demo" className="py-24" style={{ background: '#0a0a0f' }}>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div
          className="overflow-hidden rounded-3xl"
          style={{ background: 'linear-gradient(135deg, #111118 0%, #1a1a24 100%)', border: '1px solid #2a2a38', boxShadow: '0 0 80px rgba(124,111,247,0.12)' }}
        >
          <div className="px-6 pt-10 pb-6 text-center sm:px-12 sm:pt-14">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest" style={{ color: '#7c6ff7' }}>
              Live Demo
            </p>
            <h2 className="text-3xl font-extrabold sm:text-4xl" style={{ color: '#f0f0f8' }}>
              See it in action
            </h2>
            <p className="mt-3 text-base" style={{ color: '#8888aa' }}>
              Ingest a document, submit a research prompt, watch 4 agents collaborate in real time.
            </p>
          </div>

          <div className="mx-6 mb-6 rounded-xl sm:mx-12" style={{ background: '#0a0a0f', border: '1px solid #1e1e28' }}>
            <div className="flex items-center gap-1.5 border-b px-4 py-3" style={{ borderColor: '#1e1e28' }}>
              <div className="h-3 w-3 rounded-full" style={{ background: '#f43f5e' }} />
              <div className="h-3 w-3 rounded-full" style={{ background: '#f59e0b' }} />
              <div className="h-3 w-3 rounded-full" style={{ background: '#22d3a0' }} />
              <span className="ml-2 text-xs" style={{ color: '#55556a' }}>AI Workspace — workflow run</span>
            </div>
            <div className="p-5">
              {lines.map((line) => (
                <div key={line.label} className="flex gap-3 py-1 font-mono text-sm">
                  <span className="w-20 shrink-0 text-right text-xs" style={{ color: '#55556a' }}>{line.label}</span>
                  <span style={{ color: line.color }}>{line.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center gap-3 px-6 pb-10 sm:flex-row sm:justify-center sm:px-12">
            <Link
              href="/chat"
              className="flex w-full items-center justify-center gap-2 rounded-full px-7 py-3.5 text-base font-semibold text-white transition-all hover:opacity-90 sm:w-auto"
              style={{ background: 'linear-gradient(135deg, #7c6ff7, #a78bfa)', boxShadow: '0 0 32px rgba(124,111,247,0.35)' }}
            >
              Launch the Platform
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="https://github.com/esmael-Abdlkadr/ai-workspace-platform"
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-full border px-7 py-3.5 text-base font-semibold transition-all hover:opacity-80 sm:w-auto"
              style={{ borderColor: '#2a2a38', color: '#8888aa' }}
            >
              View on GitHub
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
