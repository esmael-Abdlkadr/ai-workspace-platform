'use client';

import { Plus, MessageSquare } from 'lucide-react';
import { ConversationSidebarItem, type SidebarConversation } from '@/components/ui/ConversationSidebarItem';

export type Conversation = SidebarConversation;

type Props = {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
  loading?: boolean;
};

export function ConversationList({ conversations, activeId, onSelect, onNew, onDelete, onRename, loading }: Props) {
  return (
    <div className="flex h-full w-64 shrink-0 flex-col"
      style={{ borderRight: '1px solid var(--border-subtle)', background: 'var(--surface)' }}>

      <div className="flex items-center justify-between px-4 py-3.5"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          Conversations
        </span>
        <button onClick={onNew} title="New conversation"
          className="flex h-7 w-7 items-center justify-center rounded-lg transition-all hover:opacity-80"
          style={{ background: 'var(--accent)', color: '#fff' }}>
          <Plus size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-1">
        {loading ? (
          <div className="space-y-1 px-3 pt-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-xl"
                style={{ background: 'rgba(255,255,255,0.04)' }} />
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <MessageSquare size={20} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No conversations yet</p>
          </div>
        ) : (
          conversations.map((conv) => (
            <ConversationSidebarItem
              key={conv.id}
              conversation={conv}
              isActive={conv.id === activeId}
              onSelect={() => onSelect(conv.id)}
              onDelete={() => onDelete(conv.id)}
              onRename={(title) => onRename(conv.id, title)}
            />
          ))
        )}
      </div>
    </div>
  );
}
