'use client';

import Link from 'next/link';
import {Zap} from 'lucide-react';

export default function TestDashboard() {
    return (
        <div className="min-h-screen gradient-bg p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                    <Zap className="w-8 h-8 text-teal-400"/>
                    <h1 className="text-3xl font-bold text-white">Test Dashboard (No Auth)</h1>
                </div>

                <div className="glass-card rounded-2xl p-8 mb-6">
                    <h2 className="text-xl font-bold text-white mb-4">Authentication Bypass</h2>
                    <p className="text-slate-300 mb-6">
                        This is a test page to access the dashboard without authentication while we debug the login
                        issue.
                    </p>

                    <div className="space-y-4">
                        <Link href="/dashboard" className="block">
                            <button className="btn-primary w-full py-3 rounded-lg font-semibold">
                                Go to Dashboard (May require auth)
                            </button>
                        </Link>

                        <Link href="/analytics" className="block">
                            <button className="btn-ghost w-full py-3 rounded-lg font-semibold">
                                Go to Analytics (May require auth)
                            </button>
                        </Link>

                        <Link href="/track/ORD-402" className="block">
                            <button className="btn-ghost w-full py-3 rounded-lg font-semibold">
                                Go to Customer Tracking (Public)
                            </button>
                        </Link>
                    </div>
                </div>

                <div className="glass-card rounded-2xl p-6">
                    <h3 className="font-bold text-white mb-4">Debug Info:</h3>
                    <div className="space-y-2 text-sm font-mono text-slate-300">
                        <p>• Check terminal for NextAuth logs</p>
                        <p>• Try API test: <a href="/api/test" className="text-teal-400 underline">/api/test</a></p>
                        <p>• Credentials: demo@chainreaction.com / demo123</p>
                    </div>
                </div>

                <Link href="/login" className="block mt-6">
                    <button className="btn-ghost w-full py-3 rounded-lg">
                        Back to Login
                    </button>
                </Link>
            </div>
        </div>
    );
}
