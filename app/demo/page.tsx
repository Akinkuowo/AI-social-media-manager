"use client";

import Link from "next/link";
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Play, Sparkles, LayoutDashboard, Calendar, Zap } from 'lucide-react';

export default function DemoPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="glass flex justify-between items-center px-16 py-6 sticky top-0 z-50 mt-4 mx-8 rounded-2xl max-lg:px-8">
        <div>
          <Link href="/" className="text-2xl font-extrabold tracking-tight hover:-translate-y-0.5 transition-transform inline-block">
            Social<span className="text-primary">AI</span>
          </Link>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/pricing" className="text-muted hover:text-foreground transition-all duration-300">Pricing</Link>
          <Link href="/login" className="font-semibold px-6 py-3 text-muted hover:text-foreground transition-all duration-300">Login</Link>
          <Link href="/register" className="bg-primary text-white font-semibold px-6 py-3 rounded-lg hover:bg-secondary hover:-translate-y-0.5 hover:shadow-[0_10px_20px_rgba(59,130,246,0.2)] transition-all duration-300">
            Get Started
          </Link>
        </div>
      </nav>

      <main className="flex-1 px-8 py-20 max-w-[1200px] mx-auto w-full flex flex-col items-center">
        <div className="text-center max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 text-primary text-sm font-semibold rounded-full mb-6 relative">
            <Sparkles size={16} />
            See the AI in Action
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full -z-10"></div>
          </div>
          <h1 className="text-5xl font-bold leading-tight mb-6 tracking-tight">
            Watch how we save brands <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">20+ hours a week</span>
          </h1>
          <p className="text-xl text-muted">
            Take a 2-minute interactive tour of SocialAI. Discover how our generative dashboard turns a single idea into 30 days of multi-platform content.
          </p>
        </div>

        <div className="w-full relative group cursor-pointer mb-20 perspective-[1000px]">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-secondary/20 blur-3xl rounded-[3rem] -z-10 opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>
          
          <Card variant="glass" padding="none" className="overflow-hidden border-border/50 rounded-[2rem] aspect-video relative flex items-center justify-center bg-surface/50 shadow-2xl transition-transform duration-500 hover:scale-[1.01] hover:border-border-focus">
            {/* Faux Video Player UI */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
            
            <div className="z-10 flex flex-col items-center gap-4">
              <button className="w-20 h-20 bg-primary text-white rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(59,130,246,0.6)] group-hover:scale-110 transition-transform duration-300">
                <Play size={32} className="ml-1" fill="currentColor" />
              </button>
              <span className="font-semibold text-lg tracking-wide uppercase drop-shadow-md">Play Demo Video</span>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-3 gap-8 w-full max-lg:grid-cols-1 mb-20">
          <div className="flex items-start gap-4 p-6 glass rounded-2xl">
            <div className="w-12 h-12 bg-primary/15 text-primary rounded-xl flex items-center justify-center flex-shrink-0">
              <LayoutDashboard size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold mb-2">Unified Dashboard</h3>
              <p className="text-sm text-muted">Manage Facebook, Instagram, Twitter, and LinkedIn all from one beautifully designed interface.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4 p-6 glass rounded-2xl">
            <div className="w-12 h-12 bg-secondary/15 text-secondary rounded-xl flex items-center justify-center flex-shrink-0">
              <Zap size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold mb-2">Generative AI</h3>
              <p className="text-sm text-muted">Type a simple prompt and let our engine generate text, captions, threads, and hashtags perfectly tailored to your brand voice.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4 p-6 glass rounded-2xl">
            <div className="w-12 h-12 bg-success/15 text-success rounded-xl flex items-center justify-center flex-shrink-0">
              <Calendar size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold mb-2">Automated Planning</h3>
              <p className="text-sm text-muted">A full-month calendar populated in seconds. Drag, drop, and approve posts with our intuitive scheduling tools.</p>
            </div>
          </div>
        </div>

        <Card variant="glass" padding="lg" className="w-full text-center flex flex-col items-center">
          <h2 className="text-3xl font-bold mb-4">Ready to stop wasting time?</h2>
          <p className="text-muted mb-8 max-w-lg">Join 500+ businesses who have already automated their social media workflow.</p>
          <Link href="/register">
            <Button variant="primary" size="lg" className="px-12 py-4">
              Start Your Free 14-Day Trial
            </Button>
          </Link>
          <p className="text-xs text-muted mt-4 font-medium uppercase tracking-widest">No credit card required</p>
        </Card>
      </main>
    </div>
  );
}
