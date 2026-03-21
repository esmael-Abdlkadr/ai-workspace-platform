import { Zap, Database, Brain, Download, FileText, Layers, BookOpen, RefreshCw } from 'lucide-react';

const large = [
  {
    icon: Zap,
    title: 'Real-time workflow visualizer',
    desc: 'Watch every agent step live via Server-Sent Events. The stepper animates as Researcher → Writer → Critic → Memory → Done.',
    accent: '#7c6ff7',
    preview: (
      <div className="mt-4 flex items-center gap-1">
        {['Researcher', 'Writer', 'Critic', 'Memory', 'Done'].map((s, i) => (
          <div key={s} className="flex flex-1 flex-col items-center gap-1.5">
            <div className="flex w-full items-center">
              <div
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                style={{ background: i < 3 ? '#22d3a020' : '#1a1a24', border: `1.5px solid ${i < 3 ? '#22d3a0' : '#2a2a38'}`, color: i < 3 ? '#22d3a0' : '#55556a' }}
              >
                {i < 3 ? '✓' : i + 1}
              </div>
              {i < 4 && <div className="h-[1.5px] flex-1" style={{ background: i < 2 ? '#22d3a0' : '#2a2a38' }} />}
            </div>
            <span className="hidden text-[9px] sm:block" style={{ color: i < 3 ? '#22d3a0' : '#55556a' }}>{s}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: Database,
    title: 'RAG knowledge base',
    desc: 'Ingest text or URLs. Hybrid semantic + keyword search with Reciprocal Rank Fusion (RRF) finds the most relevant context every time.',
    accent: '#22d3a0',
    preview: (
      <div className="mt-4 flex flex-col gap-1.5">
        {['Semantic search · pgvector cosine', 'Keyword search · full-text (BM25)', 'RRF fusion · reranked top 5'].map((t, i) => (
          <div key={t} className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-[11px]" style={{ background: '#0a0a0f', border: '1px solid #1e1e28', color: '#22d3a0' }}>
            <div className="h-1.5 w-1.5 rounded-full" style={{ background: '#22d3a0', opacity: 1 - i * 0.2 }} />
            {t}
          </div>
        ))}
      </div>
    ),
  },
];

const small = [
  { icon: BookOpen, title: 'Notion write-back', desc: 'Auto-publishes every completed document with extracted H1 as title.', accent: '#f0f0f8' },
  { icon: Brain, title: 'Long-term memory', desc: 'The Memory agent saves key facts. Future runs get smarter over time.', accent: '#a78bfa' },
  { icon: Download, title: 'Download outputs', desc: 'Save any generated document as .md or print to PDF instantly.', accent: '#f59e0b' },
  { icon: Layers, title: 'Multi-workspace', desc: 'Separate knowledge bases, tasks, and memories per workspace.', accent: '#7c6ff7' },
];

export function Features() {
  return (
    <section id="features" className="py-24" style={{ background: '#0a0a0f' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-14 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest" style={{ color: '#7c6ff7' }}>Features</p>
          <h2 className="text-3xl font-extrabold sm:text-4xl" style={{ color: '#f0f0f8' }}>Everything you need</h2>
          <p className="mt-3 text-base" style={{ color: '#8888aa' }}>Production-grade AI research infrastructure out of the box.</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {large.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl p-6"
              style={{ background: '#111118', border: '1px solid #2a2a38' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: `${f.accent}15` }}>
                  <f.icon className="h-4 w-4" style={{ color: f.accent }} />
                </div>
                <h3 className="font-semibold text-sm" style={{ color: '#f0f0f8' }}>{f.title}</h3>
              </div>
              <p className="text-sm" style={{ color: '#8888aa' }}>{f.desc}</p>
              {f.preview}
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {small.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl p-5"
              style={{ background: '#111118', border: '1px solid #2a2a38' }}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg mb-3" style={{ background: `${f.accent}12` }}>
                <f.icon className="h-4 w-4" style={{ color: f.accent }} />
              </div>
              <h3 className="mb-1 text-sm font-semibold" style={{ color: '#f0f0f8' }}>{f.title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: '#8888aa' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
