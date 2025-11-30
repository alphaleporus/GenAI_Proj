'use client';

import {useState} from 'react';
import {signIn} from 'next-auth/react';
import {useRouter} from 'next/navigation';
import {motion} from 'framer-motion';
import Link from 'next/link';
import {Zap, Mail, Lock, AlertCircle, Loader2} from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError(result.error);
            } else if (result?.ok) {
                router.push('/dashboard');
                router.refresh();
            }
        } catch {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
            <div className="absolute inset-0 grid-pattern opacity-30"/>

            <motion.div
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                className="relative z-10 w-full max-w-md"
            >
                {/* Logo */}
                <Link href="/" className="flex items-center justify-center gap-2 mb-8">
                    <motion.div
                        animate={{rotate: 360}}
                        transition={{duration: 20, repeat: Infinity, ease: 'linear'}}
                        className="p-3 rounded-lg bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-teal-500/30"
                    >
                        <Zap className="w-8 h-8 text-teal-400"/>
                    </motion.div>
                    <span className="text-2xl font-bold text-white">ChainReaction</span>
                </Link>

                {/* Login Card */}
                <div className="glass-card rounded-3xl p-8 border border-white/10">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
                        <p className="text-slate-400">Sign in to access your dashboard</p>
                    </div>

                    {error && (
                        <motion.div
                            initial={{opacity: 0, y: -10}}
                            animate={{opacity: 1, y: 0}}
                            className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3"
                        >
                            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0"/>
                            <p className="text-sm text-red-400">{error}</p>
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"/>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full pl-11 pr-4 py-3 rounded-lg bg-slate-800/50 border border-white/10 text-white placeholder-slate-500 focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 transition-all outline-none"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"/>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full pl-11 pr-4 py-3 rounded-lg bg-slate-800/50 border border-white/10 text-white placeholder-slate-500 focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 transition-all outline-none"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary py-3 rounded-lg font-semibold text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin"/>
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    {/* Demo Credentials */}
                    <div className="mt-6 p-4 rounded-lg bg-teal-500/5 border border-teal-500/20">
                        <p className="text-sm font-semibold text-teal-400 mb-2">Demo Credentials:</p>
                        <div className="space-y-1 text-xs text-slate-400">
                            <p>Email: <span className="text-white mono-numbers">demo@chainreaction.com</span></p>
                            <p>Password: <span className="text-white mono-numbers">demo123</span></p>
                        </div>
                    </div>

                    <div className="mt-6 text-center">
                        <Link href="/" className="text-sm text-slate-400 hover:text-teal-400 transition-colors">
                            ← Back to Home
                        </Link>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-sm text-slate-500 mt-8">
                    © 2025 ChainReaction. All rights reserved.
                </p>
            </motion.div>
        </div>
    );
}
