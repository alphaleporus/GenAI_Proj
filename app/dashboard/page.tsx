'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Home, Leaf } from 'lucide-react';
import { useSupplyChainStream } from '@/lib/hooks/useSupplyChainStream';
import AgentOverlay from '@/components/dashboard/AgentOverlay';
import FinancialModal from '@/components/dashboard/FinancialModal';
import UserMenu from '@/components/dashboard/UserMenu';

export default function DashboardPage() {
  const [ecoRouteEnabled, setEcoRouteEnabled] = useState(false);
  const [agentPanelOpen, setAgentPanelOpen] = useState(true);
  const { trucks, events, arbitrageOpportunity, executeArbitrage, dismissArbitrage } = useSupplyChainStream();

  return (
    <div className="h-screen w-screen overflow-hidden gradient-bg">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-72 glass-card border-r border-white/10 z-40 p-6">
        <Link href="/" className="flex items-center gap-2 mb-8">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} className="p-2 rounded-lg bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-teal-500/30">
            <Zap className="w-5 h-5 text-teal-400" />
          </motion.div>
          <span className="text-xl font-bold text-white">ChainReaction</span>
        </Link>
        <nav className="space-y-2">
          <Link href="/dashboard"><div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400"><Home className="w-5 h-5" /><span className="font-medium">Dashboard</span></div></Link>
            <Link href="/analytics">
                <div
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 text-slate-300 hover:text-white transition-colors">
                    <span className="w-5 h-5 flex items-center justify-center">📊</span><span className="font-medium">Analytics</span></div></Link>
        </nav>
        <div className="absolute bottom-6 left-6 right-6">
          <div className="glass-card p-4 rounded-lg">
            <div className="text-xs text-slate-500 uppercase mb-2">System Status</div>
            <div className="flex items-center gap-2">
              <motion.div animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }} transition={{ duration: 2, repeat: Infinity }} className="w-2 h-2 bg-teal-500 rounded-full" />
              <span className="text-sm font-semibold text-teal-400 mono-numbers">LIVE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-72 flex flex-col h-full">
        {/* Top Bar */}
        <div className="glass-nav border-b border-white/10 px-6 py-4">
          <div className="flex items-center justify-between">
            <div><h1 className="text-xl font-bold text-white">Command Center</h1><p className="text-sm text-slate-400">Pune, India</p></div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3 px-4 py-2 glass-card rounded-lg">
                <Leaf className={`w-4 h-4 ${ecoRouteEnabled ? 'text-green-400' : 'text-slate-500'}`} />
                <span className="text-sm font-medium text-white">Eco</span>
                <button onClick={() => setEcoRouteEnabled(!ecoRouteEnabled)} className={`relative w-11 h-6 rounded-full ${ecoRouteEnabled ? 'bg-teal-500' : 'bg-slate-700'}`}>
                  <motion.div animate={{ x: ecoRouteEnabled ? 20 : 0 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }} className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full" />
                </button>
              </div>
              <button onClick={() => setAgentPanelOpen(!agentPanelOpen)} className="btn-ghost px-4 py-2 rounded-lg flex items-center gap-2"><span className="text-sm font-medium text-white">Agent</span></button>
                <UserMenu/>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4 mt-4">
            <div className="glass-card p-3 rounded-lg"><div className="text-xs text-slate-500 uppercase mb-1">Active</div><div className="text-2xl font-bold text-white mono-numbers">1</div></div>
            <div className="glass-card p-3 rounded-lg"><div className="text-xs text-slate-500 uppercase mb-1">Cargo</div><div className="text-2xl font-bold text-teal-400 mono-numbers">$120K</div></div>
            <div className="glass-card p-3 rounded-lg"><div className="text-xs text-slate-500 uppercase mb-1">On-Time</div><div className="text-2xl font-bold text-cyan-400 mono-numbers">98%</div></div>
            <div className="glass-card p-3 rounded-lg"><div className="text-xs text-slate-500 uppercase mb-1">Saved</div><div className="text-2xl font-bold text-orange-400 mono-numbers">$12K</div></div>
          </div>
        </div>

        {/* Map Placeholder - To be integrated by your friend */}
          <div className="flex-1 relative bg-slate-900/50 border border-white/5">
              <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center max-w-md">
                      <div className="text-6xl mb-4">🗺️</div>
                      <h3 className="text-2xl font-bold text-white mb-2">Map Integration Placeholder</h3>
                      <p className="text-slate-400 mb-4">Interactive truck tracking map will be integrated here</p>
                      <div className="glass-card p-4 rounded-lg text-left">
                          <p className="text-sm text-slate-400 mb-2">Features to integrate:</p>
                          <ul className="text-sm text-slate-300 space-y-1">
                              <li>• Real-time truck positions</li>
                              <li>• Route visualization</li>
                              <li>• Status indicators (green/yellow/red)</li>
                              <li>• Interactive markers</li>
                          </ul>
                      </div>
                      <p className="text-xs text-slate-500 mt-4">Component: SupplyChainMap.tsx</p>
                  </div>
              </div>
          <AnimatePresence>
            {agentPanelOpen && <AgentOverlay events={events} isOpen={agentPanelOpen} onClose={() => setAgentPanelOpen(false)} />}
          </AnimatePresence>
        </div>
      </div>

      {/* Financial Modal */}
      <AnimatePresence>
        {arbitrageOpportunity && <FinancialModal opportunity={arbitrageOpportunity} onExecute={executeArbitrage} onDismiss={dismissArbitrage} />}
      </AnimatePresence>
    </div>
  );
}
