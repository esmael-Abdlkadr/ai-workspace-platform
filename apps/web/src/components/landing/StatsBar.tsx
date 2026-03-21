import { Bot, Zap, BookOpen, Database } from 'lucide-react';

const stats = [
  { icon: Bot, label: '4 AI Agents', desc: 'Researcher · Writer · Critic · Memory' },
  { icon: Zap, label: 'Real-time Streaming', desc: 'SSE workflow progress updates' },
  { icon: BookOpen, label: 'Notion Write-Back', desc: 'Auto-publishes every result' },
  { icon: Database, label: 'RAG-Powered', desc: 'Hybrid search + pgvector' },
];

export function StatsBar() {
  return (
    <section style={{ background: '#111118', borderTop: '1px solid #1e1e28', borderBottom: '1px solid #1e1e28' }}>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {stats.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex items-start gap-3">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                style={{ background: 'rgba(124,111,247,0.12)' }}
              >
                <Icon className="h-4 w-4" style={{ color: '#7c6ff7' }} />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: '#f0f0f8' }}>{label}</p>
                <p className="text-xs" style={{ color: '#55556a' }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
