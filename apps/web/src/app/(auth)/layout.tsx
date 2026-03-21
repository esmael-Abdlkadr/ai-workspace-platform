import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Workspace — Auth',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{ background: 'var(--background)' }}
    >
      {children}
    </div>
  );
}
