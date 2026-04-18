"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="glass flex justify-between items-center px-16 py-6 sticky top-0 z-50 mt-4 mx-8 rounded-2xl max-lg:px-8">
        <div>
          <span className="text-2xl font-extrabold tracking-tight">
            Social<span className="text-primary">AI</span>
          </span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/pricing" className="text-muted hover:text-foreground transition-all duration-300">Pricing</Link>
          {session ? (
            <>
              <Link href="/dashboard" className="font-semibold px-6 py-3 text-emerald-400">Dashboard</Link>
              <button 
                onClick={() => signOut()} 
                className="bg-red-500/10 text-red-500 font-semibold px-6 py-3 rounded-lg hover:bg-red-500/20 transition-all duration-300"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="font-semibold px-6 py-3">Login</Link>
              <Link href="/register" className="bg-primary text-white font-semibold px-6 py-3 rounded-lg hover:bg-secondary hover:-translate-y-0.5 hover:shadow-[0_10px_20px_rgba(59,130,246,0.2)] transition-all duration-300">
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      <main className="px-16 py-24 grid grid-cols-[1.2fr_1fr] gap-16 items-center max-w-[1400px] mx-auto max-lg:grid-cols-1 max-lg:text-center max-lg:px-8">
        <div>
          <h1 className="text-7xl font-bold leading-[1.1] mb-8 max-lg:text-5xl">
            Manage your social media <br />
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              with Superhuman Intelligence
            </span>
          </h1>
          <p className="text-xl text-muted mb-12 max-w-[600px] max-lg:mx-auto">
            Generate 30 days of content in seconds. Auto-publish, analyze, and optimize 
            your brand across all platforms with our AI-first manager.
          </p>
          <div className="flex gap-4 max-lg:justify-center">
            {session ? (
              <Link href="/dashboard" className="bg-primary text-white font-semibold px-10 py-4 text-lg rounded-lg hover:bg-secondary hover:-translate-y-0.5 hover:shadow-[0_10px_20px_rgba(59,130,246,0.2)] transition-all duration-300">
                Go to Dashboard
              </Link>
            ) : (
              <Link href="/register" className="bg-primary text-white font-semibold px-10 py-4 text-lg rounded-lg hover:bg-secondary hover:-translate-y-0.5 hover:shadow-[0_10px_20px_rgba(59,130,246,0.2)] transition-all duration-300">
                Start Free Trial
              </Link>
            )}
            <Link href="/demo" className="glass text-white font-semibold px-10 py-4 text-lg rounded-lg hover:bg-surface-hover hover:-translate-y-0.5 transition-all duration-300">
              Watch Demo
            </Link>
          </div>
        </div>

        <div className="perspective-[1000px] max-lg:hidden">
          <div className="glass h-[400px] rounded-3xl overflow-hidden [transform:rotateY(-15deg)_rotateX(5deg)] shadow-[-20px_20px_50px_rgba(0,0,0,0.5)]">
            <div className="h-10 bg-white/5 flex gap-2 items-center px-4">
              <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]"></div>
            </div>
            <div className="grid grid-cols-[80px_1fr] h-full">
              <div className="bg-white/[0.02] border-r border-border"></div>
              <div className="p-8 grid grid-cols-3 gap-6">
                <div className="h-[120px] bg-white/[0.03] rounded-xl border border-border"></div>
                <div className="h-[120px] bg-white/[0.03] rounded-xl border border-border"></div>
                <div className="h-[120px] bg-white/[0.03] rounded-xl border border-border"></div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <section className="grid grid-cols-3 gap-8 px-16 max-w-[1400px] mx-auto pb-16 max-lg:grid-cols-1 max-lg:px-8">
        <div className="glass glass-hover p-10 rounded-3xl text-center transition-all duration-300">
          <h3 className="text-2xl font-bold mb-4">AI Calendar</h3>
          <p className="text-muted">Generate a full month of posts based on your niche and goals.</p>
        </div>
        <div className="glass glass-hover p-10 rounded-3xl text-center transition-all duration-300">
          <h3 className="text-2xl font-bold mb-4">Auto-Publish</h3>
          <p className="text-muted">Schedule and post automatically to FB, IG, X, and LinkedIn.</p>
        </div>
        <div className="glass glass-hover p-10 rounded-3xl text-center transition-all duration-300">
          <h3 className="text-2xl font-bold mb-4">Smart Analytics</h3>
          <p className="text-muted">Get AI-driven insights on how to improve your engagement.</p>
        </div>
      </section>
    </div>
  );
}
