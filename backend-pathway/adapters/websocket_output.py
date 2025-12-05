"""
WebSocket Output Adapter for Pathway
Broadcasts Pathway stream updates to frontend clients via WebSocket
"""

import asyncio
import websockets
import json
from typing import Set, Dict, Any
from datetime import datetime


class WebSocketBroadcaster:
    """
    Converts Pathway output to WebSocket messages compatible with frontend.
    
    Maintains the exact same message format as the original backend to
    ensure zero frontend changes are required.
    """

    def __init__(self, host: str = 'localhost', port: int = 8765):
        self.host = host
        self.port = port
        self.clients: Set[websockets.WebSocketServerProtocol] = set()
        self.state = {
            'trucks': [],
            'events': [],
            'arbitrage': None
        }

    async def handle_client(self, websocket):
        """Handle new client connection"""
        self.clients.add(websocket)
        client_id = id(websocket)
        print(f"✅ Client connected: {client_id} | Total: {len(self.clients)}")

        try:
            # Send initial state
            await websocket.send(json.dumps({
                "type": "initial_state",
                "data": self.state
            }))

            # Handle incoming messages
            async for message in websocket:
                data = json.loads(message)
                await self.process_client_message(data, websocket)

        except websockets.exceptions.ConnectionClosed:
            print(f"❌ Client disconnected: {client_id}")
        finally:
            self.clients.remove(websocket)

    async def process_client_message(self, data: Dict, websocket):
        """Process messages from clients"""
        msg_type = data.get("type")

        if msg_type == "execute_arbitrage":
            truck_id = data.get("truckId")
            print(f"🎯 Arbitrage execution requested for {truck_id}")

            # Broadcast execution confirmation
            await self.broadcast({
                "type": "arbitrage_executed",
                "truckId": truck_id,
                "timestamp": datetime.now().isoformat()
            })

        elif msg_type == "ping":
            await websocket.send(json.dumps({
                "type": "pong",
                "timestamp": datetime.now().isoformat()
            }))

    async def broadcast(self, message: Dict):
        """Broadcast message to all connected clients"""
        if self.clients:
            message_json = json.dumps(message)
            await asyncio.gather(
                *[client.send(message_json) for client in self.clients],
                return_exceptions=True
            )

    def format_truck_for_frontend(self, row: Dict) -> Dict:
        """
        Convert Pathway output to frontend Truck interface.
        
        Frontend expects:
        {
          "id": string,
          "driver": string,
          "cargoValue": number,
          "status": "on-time" | "delayed" | "critical",
          "velocity": number,
          "position": [lon, lat],
          "destination": [lon, lat],
          "route": [[lon, lat], ...],
          "contractId": string,
          "eta": string
        }
        """
        # Parse route from JSON string if needed
        route = row.get('route', [])
        if isinstance(route, str):
            try:
                route = json.loads(route)
            except Exception as e:
                print(f"⚠️  Error parsing route for {row.get('truck_id', 'unknown')}: {e}")
                route = []

        # Ensure route is a list of coordinate pairs
        if not route or not isinstance(route, list):
            route = []

        # Get current position from lat/lon fields
        current_lon = row.get('current_lon', row.get('lon', 0))
        current_lat = row.get('current_lat', row.get('lat', 0))

        # Build truck data
        truck_data = {
            "id": row['truck_id'],
            "driver": row['driver'],
            "cargoValue": row['cargo_value'],
            "status": row['status'],
            "velocity": row.get('current_velocity', row.get('velocity', 0)),
            "position": [current_lon, current_lat],
            "destination": route[-1] if route else [0, 0],
            "route": route,  # Backend routes are used directly
            "contractId": row['contract_id'],
            "eta": datetime.now().isoformat()
        }

        return truck_data

    def format_event_for_frontend(self, row: Dict) -> Dict:
        """
        Convert Pathway output to frontend AgentEvent interface.
        
        Frontend expects:
        {
          "id": string,
          "timestamp": Date,
          "type": "sensor" | "contract" | "alert" | "arbitrage" | "system",
          "message": string,
          "severity": "info" | "warning" | "critical"
        }
        """
        return {
            "id": row['event_id'],
            "timestamp": row['timestamp'] if isinstance(row['timestamp'], str) else datetime.now().isoformat(),
            "type": row['event_type'],
            "message": row['message'],
            "severity": row['severity']
        }

    def format_arbitrage_for_frontend(self, row: Dict) -> Dict:
        """
        Convert Pathway output to frontend ArbitrageOpportunity interface.
        
        Frontend expects:
        {
          "truckId": string,
          "projectedPenalty": number,
          "solutionType": string,
          "solutionCost": number,
          "netSavings": number,
          "details": string
        }
        """
        # Parse arbitrage_analysis if it's a JSON string
        analysis = row.get('arbitrage_analysis', {})
        if isinstance(analysis, str):
            try:
                analysis = json.loads(analysis)
            except Exception as e:
                print(f"⚠️  Error parsing arbitrage_analysis: {e}")
                analysis = {}

        # Extract values with proper field names (camelCase from Python snake_case)
        formatted = {
            "truckId": row.get('truck_id', analysis.get('truckId', '')),
            "projectedPenalty": analysis.get('projectedPenalty', 0),
            "solutionType": analysis.get('solutionType', 'Relief Truck'),
            "solutionCost": analysis.get('solutionCost', 0),
            "netSavings": analysis.get('netSavings', 0),
            "details": analysis.get('details', 'Alternative solution available')
        }

        print(f"📤 Formatted arbitrage for frontend: {formatted}")
        return formatted

    async def update_from_pathway_stream(self, truck_data: list = None, event_data: list = None,
                                         arbitrage_data: dict = None):
        """Update state from Pathway streams and broadcast"""

        # Update trucks
        if truck_data:
            self.state['trucks'] = [self.format_truck_for_frontend(t) for t in truck_data]

        # Update events (keep last 10)
        if event_data:
            formatted_events = [self.format_event_for_frontend(e) for e in event_data]
            self.state['events'] = formatted_events[-10:]

        # Update arbitrage
        if arbitrage_data:
            self.state['arbitrage'] = self.format_arbitrage_for_frontend(arbitrage_data)

        # Broadcast state update
        await self.broadcast({
            "type": "state_update",
            "data": self.state
        })

    async def start_server(self):
        """Start WebSocket server"""
        print("=" * 60)
        print("🚀 FleetFusion WebSocket Server (Pathway Edition)")
        print("=" * 60)
        print(f"📡 Starting server on ws://{self.host}:{self.port}")
        print(f"🔌 Waiting for client connections...")
        print()

        async with websockets.serve(self.handle_client, self.host, self.port):
            print(f"✅ Server listening on ws://{self.host}:{self.port}")
            print("🎬 Ready to broadcast Pathway streams")
            print("\nPress Ctrl+C to stop\n")

            # Keep server running
            await asyncio.Future()  # Run forever


# Helper function to bridge Pathway and WebSocket
def create_websocket_output(host: str = 'localhost', port: int = 8765):
    """Factory function to create WebSocket broadcaster"""
    return WebSocketBroadcaster(host, port)
