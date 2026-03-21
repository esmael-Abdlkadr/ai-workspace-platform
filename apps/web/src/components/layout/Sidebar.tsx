'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageSquare, ListTodo, FileText, Brain, Sparkles, Library } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/chat', label: 'Chat', icon: MessageSquare },
  { href: '/tasks', label: 'Tasks', icon: ListTodo },
  { href: '/outputs', label: 'Outputs', icon: Library },
  { href: '/documents', label: 'Documents', icon: FileText },
  { href: '/memory', label: 'Memory', icon: Brain },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="flex h-full w-56 flex-col"
      style={{ background: 'var(--surface)', borderRight: '1px solid var(--border-subtle)' }}
    >
      <div className="flex h-14 items-center gap-2.5 px-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div
          className="flex h-7 w-7 items-center justify-center rounded-lg"
          style={{ background: 'linear-gradient(135deg, #7c6ff7, #a78bfa)' }}
        >
          <Sparkles className="h-3.5 w-3.5 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>AI Workspace</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 p-2.5 pt-3">
        <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
          Navigation
        </p>
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-all duration-150',
                isActive ? 'text-white' : 'hover:text-white',
              )}
              style={
                isActive
                  ? { background: 'linear-gradient(135deg, #7c6ff720, #a78bfa15)', color: 'var(--accent-hover)', boxShadow: 'inset 0 0 0 1px #7c6ff730' }
                  : { color: 'var(--text-secondary)' }
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
              {isActive && <div className="ml-auto h-1.5 w-1.5 rounded-full" style={{ background: 'var(--accent)' }} />}
            </Link>
          );
        })}
      </nav>

      <div className="p-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <div className="rounded-lg p-3" style={{ background: 'var(--surface-2)' }}>
          <p className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>Multi-Agent Platform</p>
          <p className="mt-0.5 text-[10px]" style={{ color: 'var(--text-muted)' }}>Powered by LangGraph + Groq</p>
        </div>
      </div>
    </aside>
  );
}
