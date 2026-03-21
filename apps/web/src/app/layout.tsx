import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNav } from '@/components/layout/MobileNav';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI Workspace Platform',
  description: 'Multi-agent AI research and writing platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="flex h-screen overflow-hidden" style={{ background: 'var(--background)' }}>
          <div className="hidden md:flex">
            <Sidebar />
          </div>
          <main className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto">{children}</div>
            <MobileNav />
          </main>
        </div>
      </body>
    </html>
  );
}
