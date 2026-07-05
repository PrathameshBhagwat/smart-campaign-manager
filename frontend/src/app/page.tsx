'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Users, 
  Activity, 
  ShieldCheck, 
  CloudLightning, 
  Database,
  BarChart3,
  Copy,
  Mail,
  Workflow
} from 'lucide-react';

export default function LandingPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Header/Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-900 bg-slate-950/80 backdrop-blur-md">
        <div className="container mx-auto max-w-7xl h-16 flex items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-gradient-to-br from-indigo-500 to-violet-600 p-[1px]">
              <div className="w-full h-full bg-slate-950 rounded-lg flex items-center justify-center">
                <Image 
                  src="/logo.png" 
                  alt="Logo" 
                  width={24} 
                  height={24}
                  className="rounded-md object-contain"
                />
              </div>
            </div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-slate-350 bg-clip-text text-transparent">
              Smart Campaign Manager
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#tech-stack" className="hover:text-white transition-colors">Tech Stack</a>
            <a href="#stats" className="hover:text-white transition-colors">Metrics</a>
          </nav>

          <div className="flex items-center gap-3">
            {isLoading ? (
              <div className="w-20 h-8 rounded bg-slate-900 animate-pulse" />
            ) : isAuthenticated ? (
              <Link href="/dashboard">
                <Button size="sm" className="gap-1.5 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                  Dashboard <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 md:pt-32 md:pb-24 overflow-hidden flex-1 flex flex-col justify-center">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-violet-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="container mx-auto max-w-7xl px-6 relative z-10 text-center space-y-6">
          <Badge variant="outline" className="px-3.5 py-1 text-xs border-indigo-500/30 bg-indigo-500/5 text-indigo-400 gap-1.5 rounded-full inline-flex animate-fade-in">
            <Sparkles className="w-3.5 h-3.5" /> Powered by Groq & Llama 3
          </Badge>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-[1.1] text-balance">
            Supercharge Your Outreach with{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-blue-400 bg-clip-text text-transparent">
              AI Personalization
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-normal text-balance">
            Import contacts, configure campaign business rules, and instantly bulk-generate highly tailored messages for LinkedIn, Email, and WhatsApp.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button size="lg" className="h-12 px-6 text-base gap-2 shadow-[0_0_25px_rgba(99,102,241,0.3)]">
                  Go to Dashboard <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/signup">
                  <Button size="lg" className="h-12 px-6 text-base gap-2 shadow-[0_0_25px_rgba(99,102,241,0.3)]">
                    Start Personalizing Free <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="lg" className="h-12 px-6 text-base border-slate-800 bg-slate-900/50 hover:bg-slate-900 text-slate-350 hover:text-white">
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Interactive UI Mockup */}
          <div className="pt-12 md:pt-16 max-w-5xl mx-auto">
            <div className="relative rounded-2xl border border-slate-900 bg-slate-950 p-2 shadow-[0_0_50px_rgba(99,102,241,0.08)]">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10 rounded-2xl" />
              <div className="rounded-xl overflow-hidden border border-slate-900 bg-slate-900/40 p-4 md:p-6 text-left space-y-6">
                
                {/* Header row mockup */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800">
                  <div>
                    <h3 className="text-lg font-bold text-white">Q3 Campaign Contacts</h3>
                    <p className="text-xs text-slate-400">Personalizing outreach copy for target accounts</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse mt-2" />
                    <span className="text-xs text-green-400 font-semibold bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">4 Generated Successfully</span>
                  </div>
                </div>

                {/* Table rows mockup */}
                <div className="space-y-3.5">
                  {[
                    { name: 'John Doe', title: 'Software Engineer', email: 'john@example.com', company: 'Tech Corp', status: 'ready' },
                    { name: 'Jane Smith', title: 'UX Designer', email: 'jane@example.com', company: 'Design Studio', status: 'ready' },
                    { name: 'Alice Johnson', title: 'Data Scientist', email: 'alice@example.com', company: 'Data Innovations', status: 'failed' },
                    { name: 'Bob Williams', title: 'Account Executive', email: 'bob@example.com', company: 'Sales Force', status: 'processing' },
                  ].map((row, idx) => (
                    <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between p-3.5 bg-slate-950 rounded-xl border border-slate-900 hover:border-slate-850 transition-colors gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-xs">
                          {row.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-white flex items-center gap-2">
                            {row.name}
                            {row.status === 'ready' && <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />}
                            {row.status === 'failed' && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]" />}
                            {row.status === 'processing' && <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.5)]" />}
                          </div>
                          <div className="text-[11px] text-slate-400">{row.title} at {row.company}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-400">
                        <span className="hidden sm:inline">{row.email}</span>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-[10px] rounded font-medium">LinkedIn</span>
                          <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-[10px] rounded font-medium">Email</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 border-t border-slate-900 bg-slate-950/40 relative">
        <div className="container mx-auto max-w-7xl px-6 space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Outreach Personalization, Solved.</h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm md:text-base">
              A comprehensive set of tools built to optimize response rates and speed up sales development operations.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-slate-950/50 border-slate-900 p-6 space-y-4 hover:border-slate-800 transition-colors">
              <div className="p-2.5 bg-indigo-500/10 rounded-lg w-fit text-indigo-400">
                <Workflow className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Dynamic AI Rules</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Define strict guidelines for your outreach templates. Enforce language rules and business constraints dynamically per campaign.
              </p>
            </Card>

            <Card className="bg-slate-950/50 border-slate-900 p-6 space-y-4 hover:border-slate-800 transition-colors">
              <div className="p-2.5 bg-violet-500/10 rounded-lg w-fit text-violet-400">
                <CloudLightning className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Hyper-Fast Processing</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Connects straight to the Groq API endpoint to bulk-generate hundreds of unique, compliant outreach copies in seconds.
              </p>
            </Card>

            <Card className="bg-slate-950/50 border-slate-900 p-6 space-y-4 hover:border-slate-800 transition-colors">
              <div className="p-2.5 bg-blue-500/10 rounded-lg w-fit text-blue-400">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Cost & Quality Metrics</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Real-time estimation of model costs, character counts, and AI generation quality ratings so you stay in budget.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section id="tech-stack" className="py-20 border-t border-slate-900">
        <div className="container mx-auto max-w-7xl px-6 text-center space-y-12">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tight">Our Modern Architecture</h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm">
              An enterprise-ready stack ensuring sub-second response times, secure auth, and decoupled microservice communication.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
            {[
              { name: 'Next.js 15', desc: 'React Framework', icon: Sparkles },
              { name: 'FastAPI', desc: 'Python API Gateway', icon: CloudLightning },
              { name: 'Supabase', desc: 'Backend & Database', icon: Database },
              { name: 'Groq & Llama 3', desc: 'Inference Engine', icon: Workflow },
              { name: 'Tailwind CSS', desc: 'Responsive Design', icon: CheckCircle2 },
              { name: 'Docker Compose', desc: 'Containerization', icon: ShieldCheck }
            ].map((tech, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-slate-950 border border-slate-900 rounded-xl px-4 py-3 text-left hover:border-slate-800 transition-colors w-64">
                <div className="p-2 bg-slate-900 rounded-lg text-indigo-400">
                  <tech.icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-white">{tech.name}</div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">{tech.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8">
        <div className="container mx-auto max-w-7xl px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400">
          <div>
            &copy; {new Date().getFullYear()} Smart Campaign Manager. Open source MIT license.
          </div>
          <div className="flex gap-4">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#tech-stack" className="hover:text-white transition-colors">Tech Stack</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
