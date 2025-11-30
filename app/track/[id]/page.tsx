'use client';

import {useEffect, useState} from 'react';
import {motion} from 'framer-motion';
import {Package, MapPin, Clock, CheckCircle2, Truck, AlertCircle} from 'lucide-react';
import {useParams} from 'next/navigation';

interface TrackingData {
    orderId: string;
    truckId: string;
    status: 'pending' | 'in-transit' | 'delayed' | 'delivered';
    currentLocation: string;
    destination: string;
    estimatedDelivery: string;
    timeline: {
        status: string;
        timestamp: string;
        completed: boolean;
    }[];
    truck: {
        id: string;
        driver: string;
        position: [number, number];
        velocity: number;
    };
}

export default function TrackOrderPage() {
    const params = useParams();
    const orderId = params.id as string;

    const [tracking, setTracking] = useState<TrackingData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate fetching tracking data
        setTimeout(() => {
            setTracking({
                orderId: orderId || 'ORD-402',
                truckId: 'TRK-402',
                status: 'in-transit',
                currentLocation: 'Pune, Maharashtra',
                destination: 'Mumbai, Maharashtra',
                estimatedDelivery: new Date(Date.now() + 3 * 60 * 60 * 1000).toLocaleString(),
                timeline: [
                    {
                        status: 'Order Placed',
                        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toLocaleString(),
                        completed: true
                    },
                    {
                        status: 'Picked Up',
                        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toLocaleString(),
                        completed: true
                    },
                    {status: 'In Transit', timestamp: new Date().toLocaleString(), completed: true},
                    {status: 'Out for Delivery', timestamp: 'Pending', completed: false},
                    {status: 'Delivered', timestamp: 'Pending', completed: false},
                ],
                truck: {
                    id: 'TRK-402',
                    driver: 'Priya Sharma',
                    position: [73.8567, 18.5204],
                    velocity: 68,
                }
            });
            setLoading(false);
        }, 1000);
    }, [orderId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <motion.div
                        animate={{rotate: 360}}
                        transition={{duration: 1, repeat: Infinity, ease: 'linear'}}
                        className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full mx-auto mb-4"
                    />
                    <p className="text-slate-600">Loading tracking information...</p>
                </div>
            </div>
        );
    }

    if (!tracking) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4"/>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Order Not Found</h2>
                    <p className="text-slate-600">We couldn&apos;t find tracking information for order {orderId}</p>
                </div>
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'delivered':
                return 'text-green-600';
            case 'in-transit':
                return 'text-teal-600';
            case 'delayed':
                return 'text-amber-600';
            default:
                return 'text-slate-600';
        }
    };

    const getStatusBg = (status: string) => {
        switch (status) {
            case 'delivered':
                return 'bg-green-100';
            case 'in-transit':
                return 'bg-teal-100';
            case 'delayed':
                return 'bg-amber-100';
            default:
                return 'bg-slate-100';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-teal-500 rounded-lg">
                                <Package className="w-6 h-6 text-white"/>
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-slate-800">Track Your Order</h1>
                                <p className="text-sm text-slate-500">Order #{tracking.orderId}</p>
                            </div>
                        </div>
                        <div className={`px-4 py-2 rounded-full ${getStatusBg(tracking.status)}`}>
              <span className={`text-sm font-semibold ${getStatusColor(tracking.status)} uppercase`}>
                {tracking.status.replace('-', ' ')}
              </span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column - Timeline & Details */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Delivery Info Card */}
                        <motion.div
                            initial={{opacity: 0, y: 20}}
                            animate={{opacity: 1, y: 0}}
                            className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6"
                        >
                            <h2 className="text-lg font-bold text-slate-800 mb-4">Delivery Information</h2>

                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <MapPin className="w-5 h-5 text-teal-500 mt-0.5"/>
                                    <div>
                                        <p className="text-sm text-slate-500">Current Location</p>
                                        <p className="font-semibold text-slate-800">{tracking.currentLocation}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Package className="w-5 h-5 text-teal-500 mt-0.5"/>
                                    <div>
                                        <p className="text-sm text-slate-500">Destination</p>
                                        <p className="font-semibold text-slate-800">{tracking.destination}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Clock className="w-5 h-5 text-teal-500 mt-0.5"/>
                                    <div>
                                        <p className="text-sm text-slate-500">Estimated Delivery</p>
                                        <p className="font-semibold text-slate-800">{tracking.estimatedDelivery}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Truck className="w-5 h-5 text-teal-500 mt-0.5"/>
                                    <div>
                                        <p className="text-sm text-slate-500">Driver</p>
                                        <p className="font-semibold text-slate-800">{tracking.truck.driver}</p>
                                        <p className="text-xs text-slate-500 mt-1">Truck {tracking.truckId} • {tracking.truck.velocity} km/h</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Timeline Card */}
                        <motion.div
                            initial={{opacity: 0, y: 20}}
                            animate={{opacity: 1, y: 0}}
                            transition={{delay: 0.1}}
                            className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6"
                        >
                            <h2 className="text-lg font-bold text-slate-800 mb-4">Delivery Timeline</h2>

                            <div className="space-y-4">
                                {tracking.timeline.map((event, index) => (
                                    <div key={index} className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                                event.completed ? 'bg-teal-500' : 'bg-slate-200'
                                            }`}>
                                                {event.completed ? (
                                                    <CheckCircle2 className="w-5 h-5 text-white"/>
                                                ) : (
                                                    <div className="w-2 h-2 bg-slate-400 rounded-full"/>
                                                )}
                                            </div>
                                            {index < tracking.timeline.length - 1 && (
                                                <div
                                                    className={`w-0.5 h-12 ${event.completed ? 'bg-teal-500' : 'bg-slate-200'}`}/>
                                            )}
                                        </div>
                                        <div className="flex-1 pb-4">
                                            <p className={`font-semibold ${event.completed ? 'text-slate-800' : 'text-slate-400'}`}>
                                                {event.status}
                                            </p>
                                            <p className="text-sm text-slate-500">{event.timestamp}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Support Card */}
                        <motion.div
                            initial={{opacity: 0, y: 20}}
                            animate={{opacity: 1, y: 0}}
                            transition={{delay: 0.2}}
                            className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl border border-teal-200 p-6"
                        >
                            <h3 className="font-bold text-slate-800 mb-2">Need Help?</h3>
                            <p className="text-sm text-slate-600 mb-4">Our support team is available 24/7</p>
                            <button
                                className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 rounded-lg transition-colors">
                                Contact Support
                            </button>
                        </motion.div>
                    </div>

                    {/* Right Column - Map Placeholder */}
                    <motion.div
                        initial={{opacity: 0, x: 20}}
                        animate={{opacity: 1, x: 0}}
                        transition={{delay: 0.3}}
                        className="lg:col-span-2"
                    >
                        <div
                            className="bg-white rounded-2xl shadow-sm border border-slate-200 h-[600px] flex items-center justify-center">
                            <div className="text-center max-w-md p-8">
                                <div className="text-6xl mb-4">🗺️</div>
                                <h3 className="text-2xl font-bold text-slate-800 mb-2">Map Integration Placeholder</h3>
                                <p className="text-slate-600 mb-4">Live tracking map will be integrated here by your
                                    friend</p>
                                <div className="bg-slate-50 p-4 rounded-lg text-left border border-slate-200">
                                    <p className="text-sm text-slate-600 mb-2 font-semibold">Truck Info:</p>
                                    <ul className="text-sm text-slate-700 space-y-1">
                                        <li>• ID: {tracking.truckId}</li>
                                        <li>• Driver: {tracking.truck.driver}</li>
                                        <li>• Speed: {tracking.truck.velocity} km/h</li>
                                        <li>• Location: {tracking.currentLocation}</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-white border-t border-slate-200 mt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-sm text-slate-500">© 2025 ChainReaction. Real-time tracking powered by
                            AI.</p>
                        <div className="flex gap-4">
                            <a href="#" className="text-sm text-slate-500 hover:text-teal-600 transition-colors">Privacy
                                Policy</a>
                            <a href="#" className="text-sm text-slate-500 hover:text-teal-600 transition-colors">Terms
                                of Service</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
