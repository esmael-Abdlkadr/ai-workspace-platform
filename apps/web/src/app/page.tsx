import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Navbar } from '@/components/landing/Navbar';
import { Hero } from '@/components/landing/Hero';
import { StatsBar } from '@/components/landing/StatsBar';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Features } from '@/components/landing/Features';
import { TechStack } from '@/components/landing/TechStack';
import { DemoSection } from '@/components/landing/DemoSection';
import { Footer } from '@/components/landing/Footer';

export default async function LandingPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session) redirect('/chat');

  return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh' }}>
      <Navbar />
      <Hero />
      <StatsBar />
      <HowItWorks />
      <Features />
      <TechStack />
      <DemoSection />
      <Footer />
    </div>
  );
}
