'use client';

import {useState, useEffect, useCallback, useRef} from 'react';
import {Truck, AgentEvent, ArbitrageOpportunity} from '../types';

interface WebSocketDataMessage {
    trucks?: Truck[];
    events?: AgentEvent[];
}

interface WebSocketMessage {
    type: string;
    data?: WebSocketDataMessage | ArbitrageOpportunity;
    truckId?: string;
    timestamp?: string;
}

interface WebSocketState {
    trucks: Truck[];
    events: AgentEvent[];
    arbitrageOpportunity: ArbitrageOpportunity | null;
    connected: boolean;
    error: string | null;
}

export function useWebSocket(url: string = 'ws://localhost:8080') {
    const [state, setState] = useState<WebSocketState>({
        trucks: [],
        events: [],
        arbitrageOpportunity: null,
        connected: false,
        error: null,
    });

    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
    const reconnectAttempts = useRef(0);
    const maxReconnectAttempts = 5;

    const handleMessage = useCallback((message: WebSocketMessage) => {
        switch (message.type) {
            case 'initial_state':
            case 'state_update':
                if (message.data && 'trucks' in message.data) {
                    const data = message.data as WebSocketDataMessage;
                    setState(prev => ({
                        ...prev,
                        trucks: data.trucks || prev.trucks,
                        events: data.events || prev.events,
                    }));
                }
                break;

            case 'arbitrage_opportunity':
                if (message.data && 'truckId' in message.data) {
                    setState(prev => ({
                        ...prev,
                        arbitrageOpportunity: message.data as ArbitrageOpportunity,
                    }));
                }
                break;

            case 'arbitrage_executed':
                setState(prev => ({
                    ...prev,
                    arbitrageOpportunity: null,
                }));
                break;

            case 'pong':
                // Handle ping/pong for keepalive
                break;

            default:
                console.log('Unknown message type:', message.type);
        }
    }, []);

    const connectRef = useRef<(() => void) | undefined>(undefined);

    const connect = useCallback(() => {
        try {
            const ws = new WebSocket(url);
            wsRef.current = ws;

            ws.onopen = () => {
                console.log('✅ WebSocket connected');
                setState(prev => ({...prev, connected: true, error: null}));
                reconnectAttempts.current = 0;
            };

            ws.onmessage = (event) => {
                try {
                    const message: WebSocketMessage = JSON.parse(event.data);
                    handleMessage(message);
                } catch (error) {
                    console.error('Failed to parse WebSocket message:', error);
                }
            };

            ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                setState(prev => ({...prev, error: 'WebSocket connection error'}));
            };

            ws.onclose = () => {
                console.log('❌ WebSocket disconnected');
                setState(prev => ({...prev, connected: false}));

                // Attempt reconnection
                if (reconnectAttempts.current < maxReconnectAttempts) {
                    reconnectAttempts.current++;
                    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 10000);
                    console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttempts.current}/${maxReconnectAttempts})`);

                    reconnectTimeoutRef.current = setTimeout(() => {
                        connectRef.current?.();
                    }, delay);
                } else {
                    setState(prev => ({
                        ...prev,
                        error: 'Failed to connect to server. Please check if the backend is running.'
                    }));
                }
            };
        } catch (error) {
            console.error('Failed to create WebSocket:', error);
            setState(prev => ({...prev, error: 'Failed to create WebSocket connection'}));
        }
    }, [url, handleMessage]);

    useEffect(() => {
        connectRef.current = connect;
    }, [connect]);

    const sendMessage = useCallback((message: Record<string, unknown>) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(message));
        } else {
            console.warn('WebSocket not connected, cannot send message');
        }
    }, []);

    const executeArbitrage = useCallback(() => {
        setState(prev => {
            if (!prev.arbitrageOpportunity) return prev;

            // Send message via WebSocket
            if (wsRef.current?.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify({
                    type: 'execute_arbitrage',
                    truckId: prev.arbitrageOpportunity.truckId,
                }));
            }

            // Add local event immediately
            const newEvent: AgentEvent = {
                id: `evt-${Date.now()}`,
                timestamp: new Date(),
                type: 'system',
                message: '✅ Executing arbitrage solution...',
                severity: 'info',
            };

            return {
                ...prev,
                events: [newEvent, ...prev.events],
            };
        });
    }, []);

    const dismissArbitrage = useCallback(() => {
        setState(prev => ({...prev, arbitrageOpportunity: null}));
    }, []);

    useEffect(() => {
        connect();

        return () => {
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, [connect]);

    return {
        trucks: state.trucks,
        events: state.events,
        arbitrageOpportunity: state.arbitrageOpportunity,
        connected: state.connected,
        error: state.error,
        executeArbitrage,
        dismissArbitrage,
        sendMessage,
    };
}
