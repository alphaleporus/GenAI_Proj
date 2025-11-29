'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Zap, Globe, ArrowRight, Sparkles } from 'lucide-react';
import FeatureCards from '@/components/landing/FeatureCards';

export default function LandingPage() {
  return (
    <div className="min-h-screen gradient-bg">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass-nav">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} className="p-2 rounded-lg bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-teal-500/30">
                <Zap className="w-5 h-5 text-teal-400" />
              </motion.div>
              <span className="text-xl font-bold text-white tracking-tight">ChainReaction</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="#platform" className="text-sm text-slate-300 hover:text-white transition-colors">Platform</Link>
              <Link href="#solutions" className="text-sm text-slate-300 hover:text-white transition-colors">Solutions</Link>
            </div>
            <div className="flex items-center gap-4">
              <button className="btn-ghost px-4 py-2 rounded-lg text-sm">Login</button>
              <Link href="/dashboard"><button className="btn-primary px-6 py-2 rounded-lg text-sm flex items-center gap-2">Book Demo<ArrowRight className="w-4 h-4" /></button></Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-50" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
                <Sparkles className="w-4 h-4 text-teal-400" />
                <span className="text-sm text-teal-400 font-semibold">Autonomous Supply Chain Intelligence</span>
              </motion.div>
              <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 tracking-tight leading-tight">
                Supply Chain is Broken.{' '}
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 1 }} className="gradient-text">
                  We Automate the Fix.
                </motion.span>
              </h1>
              <p className="text-xl text-slate-400 mb-8 leading-relaxed">
                The first Autonomous Supply Chain Agent that negotiates penalties and reroutes cargo in real-time. Save millions, automatically.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/dashboard">
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="btn-primary px-8 py-4 rounded-xl text-lg font-semibold glow-teal flex items-center gap-3 w-full sm:w-auto justify-center">
                    <Zap className="w-5 h-5" />Launch ChainReaction OS
                  </motion.button>
                </Link>
                <button className="btn-ghost px-8 py-4 rounded-xl text-lg font-semibold">Watch Demo</button>
              </div>
              <div className="grid grid-cols-3 gap-6 mt-12">
                <div><div className="text-3xl font-bold text-teal-400 mono-numbers">$12M</div><div className="text-sm text-slate-500">Penalties Avoided</div></div>
                <div><div className="text-3xl font-bold text-teal-400 mono-numbers">98.2%</div><div className="text-sm text-slate-500">On-Time Rate</div></div>
                <div><div className="text-3xl font-bold text-teal-400 mono-numbers">24/7</div><div className="text-sm text-slate-500">Autonomous</div></div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4, duration: 0.8 }} className="relative">
              <div className="relative transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="glass-card rounded-2xl p-6 border-2 border-teal-500/20">
                  <div className="aspect-video bg-slate-900/50 rounded-xl overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-transparent" />
                    <div className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="h-8 w-32 bg-slate-700/50 rounded" />
                        <div className="flex gap-2"><div className="h-8 w-8 bg-teal-500/20 rounded" /><div className="h-8 w-8 bg-orange-500/20 rounded" /></div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="h-24 bg-slate-800/50 rounded-lg" />
                        <div className="h-24 bg-teal-500/10 rounded-lg border border-teal-500/20" />
                      </div>
                      <div className="h-32 bg-slate-800/30 rounded-lg" />
                    </div>
                  </div>
                </div>
                <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity }} className="absolute -top-4 -right-4 glass-card px-4 py-2 rounded-full border border-teal-500/30">
                  <span className="text-sm font-semibold text-teal-400">💰 $1,700 Saved</span>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6" id="platform">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">Autonomous Supply Chain Intelligence</h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">The platform that thinks, acts, and saves money while you sleep.</p>
          </motion.div>
          <FeatureCards />
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8"><p className="text-sm text-slate-500 uppercase tracking-wider">Trusted by Leading Logistics Companies</p></div>
          <div className="flex items-center justify-center gap-12 flex-wrap opacity-30 grayscale">
            {['LogistiCorp', 'GlobalFreight', 'ShipMasters', 'CargoLink', 'FastTrack'].map((name) => (
              <div key={name} className="text-2xl font-bold text-white">{name}</div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-card rounded-3xl p-12 border-2 border-teal-500/20">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">Ready to Automate Your Supply Chain?</h2>
            <p className="text-xl text-slate-400 mb-8">Join the future of logistics. Start saving millions today.</p>
            <Link href="/dashboard">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn-primary px-10 py-5 rounded-xl text-lg font-semibold glow-teal inline-flex items-center gap-3">
                <Globe className="w-6 h-6" />Launch Platform<ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-sm text-slate-500">© 2025 ChainReaction. All rights reserved.</div>
          <div className="flex items-center gap-6">
            <Link href="#" className="text-sm text-slate-500 hover:text-white transition-colors">Privacy</Link>
            <Link href="#" className="text-sm text-slate-500 hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
