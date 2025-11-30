'use client';

import {useState} from 'react';
import {signOut, useSession} from 'next-auth/react';
import {motion, AnimatePresence} from 'framer-motion';
import {User, LogOut, Settings, ChevronDown} from 'lucide-react';

export default function UserMenu() {
    const {data: session} = useSession();
    const [isOpen, setIsOpen] = useState(false);

    if (!session?.user) return null;

    const handleSignOut = async () => {
        await signOut({callbackUrl: '/login'});
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
            >
                <div
                    className="w-8 h-8 rounded-full bg-teal-500/20 border border-teal-500/30 flex items-center justify-center">
                    <User className="w-4 h-4 text-teal-400"/>
                </div>
                <div className="hidden sm:block text-left">
                    <div className="text-sm font-semibold text-white">{session.user.name}</div>
                    <div className="text-xs text-slate-400">{session.user.email}</div>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}/>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Menu */}
                        <motion.div
                            initial={{opacity: 0, y: -10}}
                            animate={{opacity: 1, y: 0}}
                            exit={{opacity: 0, y: -10}}
                            className="absolute right-0 mt-2 w-56 glass-card rounded-xl border border-white/10 shadow-xl z-50 overflow-hidden"
                        >
                            <div className="p-3 border-b border-white/10">
                                <div className="text-sm font-semibold text-white">{session.user.name}</div>
                                <div className="text-xs text-slate-400">{session.user.email}</div>
                            </div>

                            <div className="p-2">
                                <button
                                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 text-slate-300 hover:text-white transition-colors"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <Settings className="w-4 h-4"/>
                                    <span className="text-sm">Settings</span>
                                </button>

                                <button
                                    onClick={handleSignOut}
                                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-500/10 text-slate-300 hover:text-red-400 transition-colors"
                                >
                                    <LogOut className="w-4 h-4"/>
                                    <span className="text-sm">Sign Out</span>
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
