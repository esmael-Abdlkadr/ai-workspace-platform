import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNav } from '@/components/layout/MobileNav';
import { ToasterProvider } from '@/components/layout/ToasterProvider';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/login');

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--background)' }}>
      <ToasterProvider />
      <div className="hidden md:flex">
        <Sidebar user={{ name: session.user.name, email: session.user.email, image: session.user.image ?? null }} />
      </div>
      <main className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">{children}</div>
        <MobileNav />
      </main>
    </div>
  );
}
