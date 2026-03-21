const stack = [
  { name: 'LangGraph', desc: 'Multi-agent StateGraph orchestration with conditional routing', color: '#7c6ff7' },
  { name: 'Groq', desc: 'llama-3.3-70b-versatile — ultra-fast LLM inference', color: '#f59e0b' },
  { name: 'pgvector', desc: '768-dim embeddings with ivfflat index + cosine similarity', color: '#22d3a0' },
  { name: 'Ollama', desc: 'nomic-embed-text for local, private embeddings', color: '#a78bfa' },
  { name: 'Next.js 14', desc: 'App Router, API routes, SSE streaming, server components', color: '#f0f0f8' },
  { name: 'Drizzle ORM', desc: 'Type-safe schema and queries on PostgreSQL', color: '#7c6ff7' },
  { name: 'Notion API', desc: 'Auto-publish completed documents as formatted pages', color: '#f0f0f8' },
  { name: 'pnpm Workspaces', desc: 'Monorepo with db, rag, agents, notion, web packages', color: '#22d3a0' },
];

export function TechStack() {
  return (
    <section id="tech" className="py-24" style={{ background: '#111118' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-14 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest" style={{ color: '#7c6ff7' }}>Tech Stack</p>
          <h2 className="text-3xl font-extrabold sm:text-4xl" style={{ color: '#f0f0f8' }}>
            Built on production-grade infrastructure
          </h2>
          <p className="mt-3 text-base" style={{ color: '#8888aa' }}>
            Every layer chosen for reliability, speed, and developer experience.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {stack.map((t) => (
            <div
              key={t.name}
              className="group rounded-xl p-4 transition-all hover:border-opacity-60"
              style={{ background: '#0a0a0f', border: '1px solid #2a2a38' }}
            >
              <div
                className="mb-2 inline-flex rounded-lg px-2.5 py-1 text-xs font-bold"
                style={{ background: `${t.color}15`, color: t.color }}
              >
                {t.name}
              </div>
              <p className="text-xs leading-relaxed" style={{ color: '#8888aa' }}>{t.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
