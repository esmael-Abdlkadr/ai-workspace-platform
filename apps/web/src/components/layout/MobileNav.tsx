'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageSquare, ListTodo, FileText, Brain, Library } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/chat', label: 'Chat', icon: MessageSquare },
  { href: '/tasks', label: 'Tasks', icon: ListTodo },
  { href: '/outputs', label: 'Outputs', icon: Library },
  { href: '/documents', label: 'Docs', icon: FileText },
  { href: '/memory', label: 'Memory', icon: Brain },
];

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav
      className="flex items-center justify-around px-2 py-2 md:hidden"
      style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--surface)' }}
    >
      {navItems.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href || pathname.startsWith(href + '/');
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-1 rounded-lg px-3 py-1.5 text-[10px] font-medium transition-colors"
            style={{ color: isActive ? 'var(--accent-hover)' : 'var(--text-muted)' }}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
