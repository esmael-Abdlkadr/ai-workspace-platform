const steps = [
  {
    n: '01',
    title: 'Write a prompt',
    desc: 'Describe your research topic or document goal in plain English.',
    code: '"Write a technical overview of how transformer attention mechanisms work"',
    color: '#7c6ff7',
  },
  {
    n: '02',
    title: 'Researcher searches your knowledge base',
    desc: 'Hybrid semantic + keyword search over your ingested documents using pgvector and RRF fusion.',
    code: 'Found 4 chunks · semantic: 0.87 · keyword: 0.71 · hybrid score: 0.82',
    color: '#22d3a0',
  },
  {
    n: '03',
    title: 'Writer drafts the document',
    desc: 'The Writer agent turns research findings into a structured, professional markdown document.',
    code: '# Transformer Attention Mechanisms\n## Self-Attention\n...',
    color: '#a78bfa',
  },
  {
    n: '04',
    title: 'Critic reviews and scores',
    desc: 'Scores 0–10 on accuracy, completeness, and quality. Sends back to Writer if below 7.',
    code: 'Score: 8.5/10 · "Well structured, accurate" · approved',
    color: '#f59e0b',
  },
  {
    n: '05',
    title: 'Published to Notion + Memory saved',
    desc: 'Result auto-publishes to your Notion database. Key facts saved to long-term memory.',
    code: 'notion.so/workspace/transformer-attention-mechanisms ✓',
    color: '#f0f0f8',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-14 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest" style={{ color: '#7c6ff7' }}>
            The Workflow
          </p>
          <h2 className="text-3xl font-extrabold sm:text-4xl" style={{ color: '#f0f0f8' }}>
            From prompt to published document
          </h2>
          <p className="mt-3 text-base" style={{ color: '#8888aa' }}>
            Four specialized agents collaborate in sequence — fully automated.
          </p>
        </div>

        <div className="relative flex flex-col gap-0">
          <div
            className="absolute left-[19px] top-8 hidden w-[2px] sm:block"
            style={{ height: 'calc(100% - 40px)', background: 'linear-gradient(to bottom, #7c6ff7, #22d3a0, #a78bfa, #f59e0b, #f0f0f830)' }}
          />

          {steps.map((step, i) => (
            <div key={step.n} className="flex gap-5 pb-10 last:pb-0">
              <div className="relative flex flex-col items-center">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold z-10"
                  style={{ background: '#0a0a0f', border: `2px solid ${step.color}`, color: step.color, boxShadow: `0 0 16px ${step.color}30` }}
                >
                  {step.n}
                </div>
              </div>
              <div
                className="flex-1 rounded-xl p-5 mb-3"
                style={{ background: '#111118', border: '1px solid #2a2a38' }}
              >
                <h3 className="mb-1 text-base font-semibold" style={{ color: '#f0f0f8' }}>{step.title}</h3>
                <p className="mb-3 text-sm" style={{ color: '#8888aa' }}>{step.desc}</p>
                <div
                  className="rounded-lg px-4 py-2.5 font-mono text-xs"
                  style={{ background: '#0a0a0f', border: '1px solid #1e1e28', color: step.color }}
                >
                  {step.code}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
