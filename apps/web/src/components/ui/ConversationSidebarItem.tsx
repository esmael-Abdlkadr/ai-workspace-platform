'use client';

import { useRef, useState } from 'react';
import { MessageSquare, MoreHorizontal, Pencil, Trash2, Check, X } from 'lucide-react';
import { ContextMenu, type ContextMenuItem } from './ContextMenu';
import { ConfirmModal } from './ConfirmModal';

export type SidebarConversation = {
  id: string;
  title: string;
  updatedAt: string;
};

type Props = {
  conversation: SidebarConversation;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onRename: (title: string) => void;
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function ConversationSidebarItem({ conversation, isActive, onSelect, onDelete, onRename }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<DOMRect | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(conversation.title);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const openMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setMenuAnchor(rect);
    setMenuOpen(true);
  };

  const startEdit = () => {
    setDraft(conversation.title);
    setEditing(true);
    setTimeout(() => { inputRef.current?.focus(); inputRef.current?.select(); }, 10);
  };

  const confirmEdit = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== conversation.title) onRename(trimmed);
    setEditing(false);
  };

  const cancelEdit = () => { setDraft(conversation.title); setEditing(false); };

  const menuItems: ContextMenuItem[] = [
    { icon: Pencil, label: 'Rename', onClick: startEdit },
    { icon: Trash2, label: 'Delete', onClick: () => setConfirmDelete(true), danger: true, dividerBefore: true },
  ];

  return (
    <>
      <div
        className="group flex w-full cursor-pointer items-center gap-2.5 px-3 py-2.5 transition-all hover:bg-white/5"
        style={{
          background: isActive ? 'var(--accent-dim)' : 'transparent',
          borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
        }}
        onClick={() => { if (!editing) onSelect(); }}
      >
        <MessageSquare size={13} className="shrink-0"
          style={{ color: isActive ? 'var(--accent)' : 'var(--text-muted)' }} />

        <div className="min-w-0 flex-1">
          {editing ? (
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <input
                ref={inputRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') confirmEdit(); if (e.key === 'Escape') cancelEdit(); }}
                onBlur={confirmEdit}
                className="min-w-0 flex-1 rounded bg-white/10 px-1.5 py-0.5 text-xs font-medium outline-none"
                style={{ color: 'var(--text-primary)' }}
              />
              <button onClick={confirmEdit} className="shrink-0 rounded p-0.5 hover:opacity-70"
                style={{ color: '#4ade80' }}><Check size={11} /></button>
              <button onClick={cancelEdit} className="shrink-0 rounded p-0.5 hover:opacity-70"
                style={{ color: 'var(--text-muted)' }}><X size={11} /></button>
            </div>
          ) : (
            <p className="truncate text-xs font-medium"
              style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
              {conversation.title}
            </p>
          )}
          {!editing && (
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              {timeAgo(conversation.updatedAt)}
            </p>
          )}
        </div>

        {/* 3-dot menu button — visible on hover or active */}
        {!editing && (
          <button
            ref={menuBtnRef}
            onClick={openMenu}
            className="shrink-0 rounded-lg p-1 opacity-0 transition-all group-hover:opacity-100"
            style={{
              color: 'var(--text-muted)',
              opacity: isActive || menuOpen ? 1 : undefined,
            }}
          >
            <MoreHorizontal size={13} />
          </button>
        )}
      </div>

      {/* Context menu portal */}
      {menuOpen && menuAnchor && (
        <ContextMenu
          items={menuItems}
          anchorRect={menuAnchor}
          onClose={() => setMenuOpen(false)}
        />
      )}

      {/* Delete confirmation modal */}
      <ConfirmModal
        open={confirmDelete}
        title="Delete conversation?"
        description="This will permanently delete this conversation and all its messages. This action cannot be undone."
        confirmLabel="Delete"
        danger
        onConfirm={() => { setConfirmDelete(false); onDelete(); }}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
}
