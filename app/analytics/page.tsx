'use client';

import {useState} from 'react';
import Link from 'next/link';
import {motion} from 'framer-motion';
import {Zap, Home, BarChart3, Download, RefreshCcw} from 'lucide-react';
import UserMenu from '@/components/dashboard/UserMenu';
import MetricsOverview from './components/MetricsOverview';
import SavingsChart from './components/SavingsChart';
import TruckStatusChart from './components/TruckStatusChart';
import RecentArbitrage from './components/RecentArbitrage';

export default function AnalyticsPage() {
    const [refreshing, setRefreshing] = useState(false);

    const handleRefresh = () => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 1000);
    };

    const handleExport = () => {
        alert('Exporting analytics data... (Feature coming soon)');
    };

    return (
        <div className="h-screen w-screen overflow-hidden gradient-bg">
            {/* Sidebar */}
            <div className="fixed left-0 top-0 h-full w-72 glass-card border-r border-white/10 z-40 p-6">
                <Link href="/" className="flex items-center gap-2 mb-8">
                    <motion.div
                        animate={{rotate: 360}}
                        transition={{duration: 20, repeat: Infinity, ease: 'linear'}}
                        className="p-2 rounded-lg bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-teal-500/30"
                    >
                        <Zap className="w-5 h-5 text-teal-400"/>
                    </motion.div>
                    <span className="text-xl font-bold text-white">ChainReaction</span>
                </Link>

                <nav className="space-y-2">
                    <Link href="/dashboard">
                        <div
                            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 text-slate-300 hover:text-white transition-colors">
                            <Home className="w-5 h-5"/>
                            <span className="font-medium">Dashboard</span>
                        </div>
                    </Link>
                    <div
                        className="flex items-center gap-3 px-4 py-3 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400">
                        <BarChart3 className="w-5 h-5"/>
                        <span className="font-medium">Analytics</span>
                    </div>
                </nav>

                <div className="absolute bottom-6 left-6 right-6">
                    <div className="glass-card p-4 rounded-lg">
                        <div className="text-xs text-slate-500 uppercase mb-2">Data Updated</div>
                        <div className="flex items-center gap-2">
                            <motion.div
                                animate={{scale: [1, 1.2, 1], opacity: [1, 0.5, 1]}}
                                transition={{duration: 2, repeat: Infinity}}
                                className="w-2 h-2 bg-teal-500 rounded-full"
                            />
                            <span className="text-sm font-semibold text-teal-400">Real-time</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="ml-72 flex flex-col h-full overflow-hidden">
                {/* Top Bar */}
                <div className="glass-nav border-b border-white/10 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-bold text-white">Analytics Dashboard</h1>
                            <p className="text-sm text-slate-400">Comprehensive supply chain insights</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleRefresh}
                                className="btn-ghost px-4 py-2 rounded-lg flex items-center gap-2"
                                disabled={refreshing}
                            >
                                <RefreshCcw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`}/>
                                <span className="text-sm font-medium text-white">Refresh</span>
                            </button>
                            <button
                                onClick={handleExport}
                                className="btn-primary px-4 py-2 rounded-lg flex items-center gap-2"
                            >
                                <Download className="w-4 h-4"/>
                                <span className="text-sm font-medium">Export</span>
                            </button>
                            <UserMenu/>
                        </div>
                    </div>
                </div>

                {/* Analytics Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-[1600px] mx-auto space-y-6">
                        {/* Metrics Overview */}
                        <MetricsOverview/>

                        {/* Charts Row */}
                        <div className="grid lg:grid-cols-2 gap-6">
                            <SavingsChart/>
                            <TruckStatusChart/>
                        </div>

                        {/* Recent Arbitrage */}
                        <RecentArbitrage/>

                        {/* Additional Stats */}
                        <div className="grid md:grid-cols-3 gap-6">
                            <motion.div
                                initial={{opacity: 0, y: 20}}
                                animate={{opacity: 1, y: 0}}
                                transition={{delay: 0.5}}
                                className="glass-card rounded-2xl p-6 border border-white/10"
                            >
                                <h4 className="text-sm font-semibold text-slate-400 mb-4">Top Routes</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-white text-sm">Pune → Mumbai</span>
                                        <span className="text-teal-400 font-semibold mono-numbers">342</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-white text-sm">Delhi → Jaipur</span>
                                        <span className="text-teal-400 font-semibold mono-numbers">287</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-white text-sm">Bangalore → Chennai</span>
                                        <span className="text-teal-400 font-semibold mono-numbers">234</span>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{opacity: 0, y: 20}}
                                animate={{opacity: 1, y: 0}}
                                transition={{delay: 0.6}}
                                className="glass-card rounded-2xl p-6 border border-white/10"
                            >
                                <h4 className="text-sm font-semibold text-slate-400 mb-4">Performance Metrics</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-white text-sm">Avg. Delivery Time</span>
                                        <span className="text-white font-semibold mono-numbers">3.2h</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-white text-sm">Fuel Efficiency</span>
                                        <span className="text-green-400 font-semibold mono-numbers">8.2 km/L</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-white text-sm">Customer Rating</span>
                                        <span className="text-amber-400 font-semibold mono-numbers">4.8/5</span>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{opacity: 0, y: 20}}
                                animate={{opacity: 1, y: 0}}
                                transition={{delay: 0.7}}
                                className="glass-card rounded-2xl p-6 border border-white/10"
                            >
                                <h4 className="text-sm font-semibold text-slate-400 mb-4">Carbon Impact</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-white text-sm">CO₂ Saved</span>
                                        <span className="text-green-400 font-semibold mono-numbers">2.4T</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-white text-sm">Credits Earned</span>
                                        <span className="text-green-400 font-semibold mono-numbers">$450</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-white text-sm">Trees Equivalent</span>
                                        <span className="text-green-400 font-semibold mono-numbers">48</span>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
