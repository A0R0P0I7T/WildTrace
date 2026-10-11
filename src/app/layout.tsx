import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/layout/Navbar';

export const metadata: Metadata = {
  title: 'WildTrace — Longitudinal Micro-Habitat Observation System',
  description: 'Grounded micro-habitat observation and visual change intelligence. Built for DEV Community Hacktoberfest Week 1: Touch Grass.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#060c08] text-slate-100 min-h-screen relative selection:bg-lime-500/30 selection:text-lime-200">
        {/* Subtle Ambient Spatial Glow Orbs */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
          <div className="absolute -top-[10%] left-[20%] w-[500px] h-[500px] rounded-full bg-emerald-950/20 blur-[130px]" />
          <div className="absolute top-[40%] -right-[10%] w-[600px] h-[600px] rounded-full bg-lime-950/15 blur-[150px]" />
          <div className="absolute -bottom-[10%] left-[10%] w-[500px] h-[500px] rounded-full bg-teal-950/20 blur-[140px]" />
          <div className="absolute inset-0 bg-[radial-gradient(#15261b_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />
        </div>

        <Navbar />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        <footer className="border-t border-emerald-900/30 bg-[#040805]/80 backdrop-blur-md py-8 mt-20 text-center text-xs text-emerald-600/70">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
              <span>WildTrace &bull; Longitudinal Micro-Habitat Observation</span>
            </div>
            <p>
              Created for <span className="text-emerald-400 font-medium">DEV Community Hacktoberfest Week 1: Touch Grass</span>
            </p>
            <p className="text-slate-500">
              Open-weight AI &bull; Grounded Visual Diff &bull; Privacy-Preserving
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
