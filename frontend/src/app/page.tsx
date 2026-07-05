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

  // Minimal animations to keep it smooth and simple
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.05 }
    }
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'tween', duration: 0.4, ease: 'easeOut' }
    }
  } as const;

  const mockupVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'tween', duration: 0.5, ease: 'easeOut', delay: 0.25 }
    }
  } as const;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-blue-500/20 selection:text-blue-200 overflow-x-hidden">
      
      {/* Header/Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md">
        <div className="container mx-auto max-w-7xl h-16 flex items-center justify-between px-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-2.5"
          >
            <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800 p-1 flex items-center justify-center">
              <Image 
                src="/logo.webp" 
                alt="Logo" 
                width={20} 
                height={20}
                className="rounded object-contain"
              />
            </div>
            <span className="font-semibold text-base tracking-tight text-zinc-100">
              Smart Campaign Manager
            </span>
          </motion.div>

          <nav className="hidden md:flex items-center gap-6 text-sm text-zinc-400">
            <a href="#features" className="hover:text-zinc-100 transition-colors duration-200">Features</a>
            <a href="#tech-stack" className="hover:text-zinc-100 transition-colors duration-200">Tech Stack</a>
          </nav>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-3"
          >
            {isLoading ? (
              <div className="w-16 h-8 rounded bg-zinc-900 animate-pulse" />
            ) : isAuthenticated ? (
              <Link href="/dashboard">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm transition-all duration-200 gap-1">
                  Dashboard <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/50">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm transition-all duration-200">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </motion.div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-16 md:pt-24 md:pb-20 overflow-hidden flex-1 flex flex-col justify-center border-b border-zinc-900">
        <div className="container mx-auto max-w-7xl px-6 relative z-10 text-center">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {/* Minimalist Logo Integration in Hero */}
            <motion.div variants={itemVariants} className="flex justify-center">
              <div className="w-20 h-20 rounded-2xl bg-zinc-900 border border-zinc-800 p-4 flex items-center justify-center shadow-sm">
                <Image 
                  src="/logo.webp" 
                  alt="Logo" 
                  width={48} 
                  height={48}
                  className="object-contain"
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="inline-block">
              <Badge variant="outline" className="px-3.5 py-1 text-xs border-zinc-800 bg-zinc-900/50 text-zinc-400 gap-1.5 rounded-full inline-flex">
                Powered by Groq & Llama 3
              </Badge>
            </motion.div>
            
            <motion.h1 
              variants={itemVariants} 
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight max-w-5xl mx-auto leading-[1.05] text-zinc-100 text-balance"
            >
              Smart Campaign Manager
            </motion.h1>

            <motion.p 
              variants={itemVariants} 
              className="text-base md:text-xl text-zinc-400 max-w-3xl mx-auto font-normal text-balance"
            >
              AI-powered outreach automation integrating LinkedIn, Email, and WhatsApp campaign personalization.
            </motion.p>

            <motion.div 
              variants={itemVariants} 
              className="flex flex-wrap items-center justify-center gap-4 pt-2"
            >
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 h-11 text-sm shadow-sm gap-2 transition-all duration-200 group">
                    Go to Dashboard <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/signup">
                    <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 h-11 text-sm shadow-sm gap-2 transition-all duration-200 group">
                      Start Personalizing Free <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="outline" size="lg" className="border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900 text-zinc-300 hover:text-zinc-100 px-5 h-11 text-sm transition-all duration-200">
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </motion.div>

            {/* Minimalist Dashboard Mockup */}
            <motion.div 
              variants={mockupVariants}
              className="pt-12 md:pt-16 max-w-4xl mx-auto transform-gpu"
            >
              <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-1 shadow-sm">
                <div className="rounded-lg border border-zinc-900/60 bg-zinc-900/10 p-4 md:p-5 text-left space-y-5">
                  
                  {/* Header row mockup */}
                  <div className="flex justify-between items-center pb-3 border-b border-zinc-900">
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-100">Q3 Outreach Campaign</h3>
                      <p className="text-[11px] text-zinc-400">Personalized copy templates per contact</p>
                    </div>
                    <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded text-[10px] text-green-400 font-semibold">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500 shrink-0" />
                      Active Flow
                    </div>
                  </div>

                  {/* Table rows mockup */}
                  <div className="space-y-2">
                    {[
                      { name: 'John Doe', title: 'Software Engineer', email: 'john@example.com', company: 'Tech Corp', status: 'ready' },
                      { name: 'Jane Smith', title: 'UX Designer', email: 'jane@example.com', company: 'Design Studio', status: 'ready' },
                      { name: 'Alice Johnson', title: 'Data Scientist', email: 'alice@example.com', company: 'Data Innovations', status: 'failed' },
                      { name: 'Bob Williams', title: 'Account Executive', email: 'bob@example.com', company: 'Sales Force', status: 'processing' },
                    ].map((row, idx) => (
                      <div 
                        key={idx} 
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-zinc-950 rounded-lg border border-zinc-900 text-xs gap-2"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-350 font-medium text-[11px]">
                            {row.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <div className="font-semibold text-zinc-200 flex items-center gap-1.5">
                              {row.name}
                              {row.status === 'ready' && <span className="w-1.5 h-1.5 rounded-full bg-green-500" title="Success" />}
                              {row.status === 'failed' && <span className="w-1.5 h-1.5 rounded-full bg-red-500" title="Failed" />}
                              {row.status === 'processing' && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" title="Processing" />}
                            </div>
                            <div className="text-[10px] text-zinc-500">{row.title} at {row.company}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3.5 text-zinc-400">
                          <span className="hidden md:inline text-[11px]">{row.email}</span>
                          <div className="flex items-center gap-1.5">
                            <span className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 text-[9px] rounded text-zinc-400">LinkedIn</span>
                            <span className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 text-[9px] rounded text-zinc-400">Email</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-zinc-950/20 border-b border-zinc-900 relative">
        <div className="container mx-auto max-w-7xl px-6 space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-100">Simple outreach personalization</h2>
            <p className="text-zinc-400 max-w-lg mx-auto text-xs md:text-sm">
              Features built directly to increase lead conversion rates and automate manual workflows.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: 'Dynamic AI Rules',
                desc: 'Define custom parameters for campaign templates. Enforce strict brand rules and copy guidelines dynamically.',
                icon: Workflow,
              },
              {
                title: 'Llama 3 Inference',
                desc: 'Uses the Groq API endpoint to bulk-generate personalized messages for campaigns in sub-second speeds.',
                icon: CloudLightning,
              },
              {
                title: 'Cost & Analytics',
                desc: 'Track exact character counts, quality compliance scores, and model execution costs per template.',
                icon: BarChart3,
              }
            ].map((feat, idx) => (
              <Card key={idx} className="bg-zinc-950 border-zinc-900 p-5 space-y-3 transition-colors hover:border-zinc-800">
                <div className="p-2 bg-zinc-900 rounded-lg w-fit text-blue-500">
                  <feat.icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-zinc-200">{feat.title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {feat.desc}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section id="tech-stack" className="py-16">
        <div className="container mx-auto max-w-7xl px-6 text-center space-y-12">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-100">Architecture Overview</h2>
            <p className="text-zinc-400 max-w-lg mx-auto text-xs">
              Open-source, dockerized, and ready to deploy with Supabase Auth and FastAPI.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3.5 max-w-4xl mx-auto">
            {[
              { name: 'Next.js 15', desc: 'React Framework', icon: ArrowRight },
              { name: 'FastAPI', desc: 'Python API Gateway', icon: CloudLightning },
              { name: 'Supabase', desc: 'Backend & Database', icon: Database },
              { name: 'Groq & Llama 3', desc: 'Inference Engine', icon: Workflow },
              { name: 'Tailwind CSS', desc: 'Responsive Design', icon: CheckCircle2 },
              { name: 'Docker Compose', desc: 'Containerization', icon: ShieldCheck }
            ].map((tech, idx) => (
              <div 
                key={idx} 
                className="flex items-center gap-2.5 bg-zinc-950 border border-zinc-900 rounded-lg px-3 py-2 text-left w-56 cursor-default"
              >
                <div className="p-1.5 bg-zinc-900 rounded text-blue-500">
                  <tech.icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-xs text-zinc-200">{tech.name}</div>
                  <div className="text-[9px] text-zinc-500 uppercase font-medium">{tech.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-6 mt-auto">
        <div className="container mx-auto max-w-7xl px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-zinc-500">
          <div>
            &copy; {new Date().getFullYear()} Smart Campaign Manager. MIT License.
          </div>
          <div className="flex gap-4">
            <a href="#features" className="hover:text-zinc-350 transition-colors">Features</a>
            <a href="#tech-stack" className="hover:text-zinc-350 transition-colors">Tech Stack</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
