'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  CloudLightning, 
  Database,
  BarChart3,
  Workflow,
  ShieldCheck
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

  // Framer Motion variants for smooth reveals
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 }
    }
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 80, damping: 15 }
    }
  } as const;

  const mockupVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 40 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 50, damping: 20, delay: 0.4 }
    }
  } as const;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500/30 selection:text-indigo-200 overflow-x-hidden">
      
      {/* Header/Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-900 bg-slate-950/80 backdrop-blur-md">
        <div className="container mx-auto max-w-7xl h-16 flex items-center justify-between px-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2.5"
          >
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
          </motion.div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition-colors duration-200">Features</a>
            <a href="#tech-stack" className="hover:text-white transition-colors duration-200">Tech Stack</a>
          </nav>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3"
          >
            {isLoading ? (
              <div className="w-20 h-8 rounded bg-slate-900 animate-pulse" />
            ) : isAuthenticated ? (
              <Link href="/dashboard">
                <Button size="sm" className="gap-1.5 shadow-[0_0_15px_rgba(99,102,241,0.2)] hover:shadow-[0_0_25px_rgba(99,102,241,0.45)] transition-all duration-300">
                  Dashboard <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white hover:bg-slate-900/50">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="shadow-[0_0_15px_rgba(99,102,241,0.2)] hover:shadow-[0_0_25px_rgba(99,102,241,0.45)] transition-all duration-300">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </motion.div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 md:pt-28 md:pb-24 overflow-hidden flex-1 flex flex-col justify-center">
        {/* Hardware-accelerated background blur glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none transform-gpu animate-pulse duration-10000" />
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-violet-500/10 rounded-full blur-[100px] pointer-events-none transform-gpu" />

        <div className="container mx-auto max-w-7xl px-6 relative z-10 text-center">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            <motion.div variants={itemVariants} className="inline-block">
              <Badge variant="outline" className="px-3.5 py-1 text-xs border-indigo-500/30 bg-indigo-500/5 text-indigo-400 gap-1.5 rounded-full inline-flex">
                <Sparkles className="w-3.5 h-3.5 animate-spin-slow" /> Powered by Groq & Llama 3
              </Badge>
            </motion.div>
            
            <motion.h1 
              variants={itemVariants} 
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-[1.1] text-balance"
            >
              Supercharge Your Outreach with{' '}
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-blue-400 bg-clip-text text-transparent">
                AI Personalization
              </span>
            </motion.h1>

            <motion.p 
              variants={itemVariants} 
              className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-normal text-balance"
            >
              Import contacts, configure campaign business rules, and instantly bulk-generate highly tailored messages for LinkedIn, Email, and WhatsApp.
            </motion.p>

            <motion.div 
              variants={itemVariants} 
              className="flex flex-wrap items-center justify-center gap-4 pt-4"
            >
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <Button size="lg" className="h-12 px-6 text-base gap-2 shadow-[0_0_25px_rgba(99,102,241,0.25)] hover:shadow-[0_0_35px_rgba(99,102,241,0.5)] transition-all duration-300 group">
                    Go to Dashboard <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/signup">
                    <Button size="lg" className="h-12 px-6 text-base gap-2 shadow-[0_0_25px_rgba(99,102,241,0.25)] hover:shadow-[0_0_35px_rgba(99,102,241,0.5)] transition-all duration-300 group">
                      Start Personalizing Free <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="outline" size="lg" className="h-12 px-6 text-base border-slate-800 bg-slate-900/50 hover:bg-slate-900 text-slate-350 hover:text-white transition-all duration-300">
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </motion.div>

            {/* Interactive UI Mockup with Tilt Animation */}
            <motion.div 
              variants={mockupVariants}
              className="pt-12 md:pt-16 max-w-5xl mx-auto transform-gpu"
              whileHover={{ y: -5, scale: 1.01 }}
              transition={{ duration: 0.3 }}
            >
              <div className="relative rounded-2xl border border-slate-900 bg-slate-950 p-2 shadow-[0_0_50px_rgba(99,102,241,0.08)]">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10 rounded-2xl pointer-events-none" />
                <div className="rounded-xl overflow-hidden border border-slate-900 bg-slate-900/40 p-4 md:p-6 text-left space-y-6">
                  
                  {/* Header row mockup */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800">
                    <div>
                      <h3 className="text-lg font-bold text-white">Q3 Campaign Contacts</h3>
                      <p className="text-xs text-slate-400">Personalizing outreach copy for target accounts</p>
                    </div>
                    <div className="flex gap-2 items-center">
                      <span className="h-2.5 w-2.5 rounded-full bg-green-500 animate-ping" />
                      <span className="text-xs text-green-400 font-semibold bg-green-500/10 px-2.5 py-1 rounded-full border border-green-500/20">Active Personalization Flow</span>
                    </div>
                  </div>

                  {/* Table rows mockup with hover actions */}
                  <div className="space-y-3.5">
                    {[
                      { name: 'John Doe', title: 'Software Engineer', email: 'john@example.com', company: 'Tech Corp', status: 'ready' },
                      { name: 'Jane Smith', title: 'UX Designer', email: 'jane@example.com', company: 'Design Studio', status: 'ready' },
                      { name: 'Alice Johnson', title: 'Data Scientist', email: 'alice@example.com', company: 'Data Innovations', status: 'failed' },
                      { name: 'Bob Williams', title: 'Account Executive', email: 'bob@example.com', company: 'Sales Force', status: 'processing' },
                    ].map((row, idx) => (
                      <motion.div 
                        key={idx} 
                        whileHover={{ x: 4, borderColor: 'rgba(99, 102, 241, 0.4)' }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-col md:flex-row md:items-center justify-between p-3.5 bg-slate-950 rounded-xl border border-slate-900 transition-colors gap-3 cursor-default"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
                            {row.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <div className="font-semibold text-sm text-white flex items-center gap-2">
                              {row.name}
                              {row.status === 'ready' && <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />}
                              {row.status === 'failed' && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]" />}
                              {row.status === 'processing' && <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce shadow-[0_0_8px_rgba(245,158,11,0.5)]" />}
                            </div>
                            <div className="text-[11px] text-slate-450">{row.title} at {row.company}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-400">
                          <span className="hidden sm:inline">{row.email}</span>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-[10px] rounded font-medium">LinkedIn</span>
                            <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-[10px] rounded font-medium">Email</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
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
            {[
              {
                title: 'Dynamic AI Rules',
                desc: 'Define strict guidelines for your outreach templates. Enforce language rules and business constraints dynamically per campaign.',
                icon: Workflow,
                color: 'text-indigo-400',
                bg: 'bg-indigo-500/10',
                borderHover: 'hover:border-indigo-500/30'
              },
              {
                title: 'Hyper-Fast Processing',
                desc: 'Connects straight to the Groq API endpoint to bulk-generate hundreds of unique, compliant outreach copies in seconds.',
                icon: CloudLightning,
                color: 'text-violet-400',
                bg: 'bg-violet-500/10',
                borderHover: 'hover:border-violet-500/30'
              },
              {
                title: 'Cost & Quality Metrics',
                desc: 'Real-time estimation of model costs, character counts, and AI generation quality ratings so you stay in budget.',
                icon: BarChart3,
                color: 'text-blue-400',
                bg: 'bg-blue-500/10',
                borderHover: 'hover:border-blue-500/30'
              }
            ].map((feat, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -6 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="transform-gpu"
              >
                <Card className={`h-full bg-slate-950/50 border-slate-900 p-6 space-y-4 transition-all duration-300 border ${feat.borderHover} hover:shadow-[0_4px_25px_rgba(99,102,241,0.03)]`}>
                  <div className={`p-2.5 ${feat.bg} rounded-lg w-fit ${feat.color}`}>
                    <feat.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white">{feat.title}</h3>
                  <p className="text-sm text-slate-450 leading-relaxed">
                    {feat.desc}
                  </p>
                </Card>
              </motion.div>
            ))}
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
              <motion.div 
                key={idx}
                whileHover={{ scale: 1.03, borderColor: 'rgba(99, 102, 241, 0.3)' }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-3 bg-slate-950 border border-slate-900 rounded-xl px-4 py-3 text-left hover:border-slate-800 transition-colors w-64 cursor-default transform-gpu"
              >
                <div className="p-2 bg-slate-900 rounded-lg text-indigo-400">
                  <tech.icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-white">{tech.name}</div>
                  <div className="text-[10px] text-slate-450 uppercase tracking-wider">{tech.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 mt-auto">
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
