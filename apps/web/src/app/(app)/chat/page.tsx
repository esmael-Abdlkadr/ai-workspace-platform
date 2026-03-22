'use client';

import { useCallback, useEffect, useState } from 'react';
import { AIChatConversationList, type AIChatConversation } from '@/components/ai-chat/AIChatConversationList';
import { AIChatWindow } from '@/components/ai-chat/AIChatWindow';

export default function ChatPage() {
  const [conversations, setConversations] = useState<AIChatConversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loadingList, setLoadingList] = useState(true);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/chat/conversations');
      const data = await res.json() as { conversations: AIChatConversation[] };
      setConversations(data.conversations ?? []);
    } catch {
      setConversations([]);
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    void fetchConversations();
  }, [fetchConversations]);

  const handleNew = useCallback(async (): Promise<string | null> => {
    try {
      const res = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New conversation' }),
      });
      const data = await res.json() as { conversation: AIChatConversation };
      const conv = data.conversation;
      setConversations((prev) => [conv, ...prev]);
      setActiveId(conv.id);
      return conv.id;
    } catch {
      return null;
    }
  }, []);

  const handleSelect = useCallback((id: string) => {
    setActiveId(id);
  }, []);

  const handleTitleUpdated = useCallback(() => {
    void fetchConversations();
  }, [fetchConversations]);

  const handleDelete = useCallback(async (id: string) => {
    await fetch(`/api/chat/conversations/${id}`, { method: 'DELETE' });
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeId === id) setActiveId(null);
  }, [activeId]);

  const handleRename = useCallback(async (id: string, title: string) => {
    await fetch(`/api/chat/conversations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    setConversations((prev) => prev.map((c) => c.id === id ? { ...c, title } : c));
  }, []);

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar */}
      <AIChatConversationList
        conversations={conversations}
        activeId={activeId}
        onSelect={handleSelect}
        onNew={() => void handleNew()}
        onDelete={(id) => void handleDelete(id)}
        onRename={(id, title) => void handleRename(id, title)}
        loading={loadingList}
      />

      {/* Chat window */}
      <AIChatWindow
        conversationId={activeId}
        onNewConversationNeeded={handleNew}
        onTitleUpdated={handleTitleUpdated}
      />
    </div>
  );
}
