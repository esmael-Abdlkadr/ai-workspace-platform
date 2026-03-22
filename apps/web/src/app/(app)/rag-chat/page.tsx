'use client';

import { useCallback, useEffect, useState } from 'react';
import { ConversationList, type Conversation } from '@/components/rag-chat/ConversationList';
import { ChatWindow } from '@/components/rag-chat/ChatWindow';
import { WorkspaceSelector } from '@/components/workspace/WorkspaceSelector';
import type { Workspace } from '@/lib/api';

export default function RagChatPage() {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loadingConvs, setLoadingConvs] = useState(false);

  const fetchConversations = useCallback(async (wsId: string) => {
    setLoadingConvs(true);
    try {
      const res = await fetch(`/api/conversations?workspaceId=${wsId}`);
      const data = await res.json();
      setConversations(data.conversations ?? []);
    } catch {
      setConversations([]);
    } finally {
      setLoadingConvs(false);
    }
  }, []);

  const handleWorkspaceChange = (ws: Workspace) => {
    setWorkspace(ws);
    setActiveId(null);
    setConversations([]);
    fetchConversations(ws.id);
  };

  const handleNewConversation = async () => {
    if (!workspace) return;
    setLoadingConvs(true);
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId: workspace.id }),
      });
      const data = await res.json();
      const newConv: Conversation = data.conversation;
      setConversations((prev) => [newConv, ...prev]);
      setActiveId(newConv.id);
    } catch {
      // silently fail
    } finally {
      setLoadingConvs(false);
    }
  };

  const handleSelectConversation = (id: string) => setActiveId(id);

  const handleDelete = useCallback(async (id: string) => {
    await fetch(`/api/conversations/${id}`, { method: 'DELETE' });
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeId === id) setActiveId(null);
  }, [activeId]);

  const handleRename = useCallback(async (id: string, title: string) => {
    await fetch(`/api/conversations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    setConversations((prev) => prev.map((c) => c.id === id ? { ...c, title } : c));
  }, []);

  useEffect(() => {
    if (!workspace || !activeId) return;
    const timer = setInterval(() => {
      const active = conversations.find((c) => c.id === activeId);
      if (active && active.title === 'New conversation') {
        fetchConversations(workspace.id);
      }
    }, 4000);
    return () => clearInterval(timer);
  }, [workspace, activeId, conversations, fetchConversations]);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Top bar */}
      <div
        className="flex shrink-0 items-center gap-4 px-5 py-3"
        style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--surface)' }}
      >
        <div className="flex items-center gap-2">
          <div
            className="flex h-6 w-6 items-center justify-center rounded-lg text-[10px] font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #7c6ff7, #a78bfa)' }}
          >
            R
          </div>
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            RAG Chat
          </span>
        </div>
        <div className="ml-auto w-52">
          <WorkspaceSelector
            value={workspace?.id ?? null}
            onChange={handleWorkspaceChange}
          />
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        <ConversationList
          conversations={conversations}
          activeId={activeId}
          onSelect={handleSelectConversation}
          onNew={handleNewConversation}
          onDelete={(id) => void handleDelete(id)}
          onRename={(id, title) => void handleRename(id, title)}
          loading={loadingConvs}
        />

        <ChatWindow
          conversationId={activeId}
          workspaceName={workspace?.name ?? null}
        />
      </div>
    </div>
  );
}
