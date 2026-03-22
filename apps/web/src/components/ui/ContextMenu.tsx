'use client';

import { useEffect, useRef } from 'react';
import type { LucideIcon } from 'lucide-react';

export type ContextMenuItem = {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  danger?: boolean;
  dividerBefore?: boolean;
};

type Props = {
  items: ContextMenuItem[];
  onClose: () => void;
  /** Position relative to the trigger element */
  anchorRect: DOMRect;
};

export function ContextMenu({ items, onClose, anchorRect }: Props) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
    };
    const keyHandler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', keyHandler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', keyHandler);
    };
  }, [onClose]);

  // Calculate position — prefer opening downward, flip up if near bottom
  const top = anchorRect.bottom + 4;
  const left = Math.max(8, anchorRect.left);

  return (
    <div
      ref={menuRef}
      className="fixed z-50 min-w-[180px] overflow-hidden rounded-xl py-1 shadow-2xl"
      style={{
        top,
        left,
        background: '#1e1e2e',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      }}
    >
      {items.map((item, i) => {
        const Icon = item.icon;
        return (
          <div key={i}>
            {item.dividerBefore && (
              <div className="my-1 mx-2" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }} />
            )}
            <button
              onClick={() => { item.onClick(); onClose(); }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-white/5"
              style={{ color: item.danger ? '#f87171' : 'rgba(255,255,255,0.85)' }}
            >
              <Icon size={14} />
              {item.label}
            </button>
          </div>
        );
      })}
    </div>
  );
}
