import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Providers } from '@/components/Providers';
import { FloatingQuickDock } from '@/components/FloatingQuickDock';

export const metadata: Metadata = {
  title: 'EmpathyLink — We are there for you. Always for you.',
  description:
    'A privacy-first social connection and emotional-support platform connecting kindred souls through themed identities, peer matching, communities, private journaling, and Sol reflection.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-slate-100 flex flex-col antialiased selection:bg-empathy-violet selection:text-white">
        <Providers>
          <Navbar />
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
            {children}
          </main>
          <FloatingQuickDock />
          <footer className="border-t border-surface-border py-8 text-center text-xs text-slate-400 bg-surface/50">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p>© {new Date().getFullYear()} EmpathyLink. We are there for you. Always for you.</p>
              <p className="text-slate-400">
                Sol is an AI reflection assistant, NOT a medical doctor or therapist. No psychiatric diagnoses provided.
              </p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
