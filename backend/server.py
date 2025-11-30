"""
WebSocket Server for Real-Time Supply Chain Updates
Broadcasts truck positions, events, and arbitrage opportunities
"""

import asyncio
import json
import websockets
import os
from datetime import datetime
from typing import Set
from dotenv import load_dotenv

from simulation import TruckSimulator, create_demo_scenarios
from contract_analyzer import ContractAnalyzer

# Load environment variables
load_dotenv()

# Server configuration
WS_HOST = os.getenv("WS_HOST", "localhost")
WS_PORT = int(os.getenv("WS_PORT", 8080))

# Connected clients
clients: Set[websockets.WebSocketServerProtocol] = set()

# Initialize systems
simulator = TruckSimulator()
analyzer = ContractAnalyzer()
scenario_engine = create_demo_scenarios(simulator)


async def broadcast(message: dict):
    """Broadcast message to all connected clients"""
    if clients:
        message_json = json.dumps(message)
        await asyncio.gather(
            *[client.send(message_json) for client in clients],
            return_exceptions=True
        )


async def handle_client(websocket):
    """Handle individual client connection"""
    clients.add(websocket)
    client_id = id(websocket)
    print(f"✅ Client connected: {client_id} | Total clients: {len(clients)}")

    try:
        # Send initial state
        await websocket.send(json.dumps({
            "type": "initial_state",
            "data": simulator.get_state()
        }))

        # Handle incoming messages
        async for message in websocket:
            try:
                data = json.loads(message)
                await process_client_message(data, websocket)
            except json.JSONDecodeError:
                await websocket.send(json.dumps({
                    "type": "error",
                    "message": "Invalid JSON"
                }))

    except websockets.exceptions.ConnectionClosed:
        print(f"❌ Client disconnected: {client_id}")
    finally:
        clients.remove(websocket)


async def process_client_message(data: dict, websocket):
    """Process messages from clients"""
    msg_type = data.get("type")

    if msg_type == "execute_arbitrage":
        truck_id = data.get("truckId")
        simulator.resolve_delay(truck_id)
        simulator.add_event("success", f"✅ Arbitrage executed for {truck_id}", truck_id)

        await broadcast({
            "type": "arbitrage_executed",
            "truckId": truck_id,
            "timestamp": datetime.now().isoformat()
        })

    elif msg_type == "request_contract":
        contract_id = data.get("contractId")
        contract = analyzer.get_contract(contract_id)

        await websocket.send(json.dumps({
            "type": "contract_data",
            "data": contract
        }))

    elif msg_type == "ping":
        await websocket.send(json.dumps({
            "type": "pong",
            "timestamp": datetime.now().isoformat()
        }))


async def simulation_loop():
    """Main simulation loop - updates every second"""
    await asyncio.sleep(2)  # Initial delay

    time_elapsed = 0
    arbitrage_sent = False

    while True:
        # Update truck positions
        simulator.update_positions()

        # Check for demo scenario triggers
        if time_elapsed == 5:
            simulator.simulate_delay("TRK-402", "critical")

        if time_elapsed == 8:
            simulator.add_event("alert", "⚠️ TRK-402 CRITICAL - SLA threshold exceeded", "TRK-402")

        if time_elapsed == 12 and not arbitrage_sent:
            # Analyze and send arbitrage opportunity
            arbitrage = analyzer.analyze_arbitrage_opportunity("TRK-402", "CNT-2024-001", 2.5)

            if arbitrage.get("recommendation") == "EXECUTE":
                simulator.add_event("arbitrage", f"💎 ARBITRAGE OPPORTUNITY - Net Savings: ${arbitrage['netSavings']}",
                                    "TRK-402")

                await broadcast({
                    "type": "arbitrage_opportunity",
                    "data": arbitrage
                })

                arbitrage_sent = True

        # Broadcast state update
        await broadcast({
            "type": "state_update",
            "data": simulator.get_state()
        })

        time_elapsed += 1
        await asyncio.sleep(1)  # Update every second


async def main():
    """Start the WebSocket server"""
    print("=" * 60)
    print("🚀 ChainReaction WebSocket Server")
    print("=" * 60)
    print(f"📡 Starting server on ws://{WS_HOST}:{WS_PORT}")

    # Check OpenAI API key
    if os.getenv("OPENAI_API_KEY"):
        print("✅ OpenAI API key detected")
    else:
        print("⚠️  OpenAI API key not found - using mock responses")

    print(f"🚛 Initialized {len(simulator.trucks)} trucks")
    print("=" * 60)

    # Start WebSocket server
    async with websockets.serve(handle_client, WS_HOST, WS_PORT):
        print(f"✅ Server listening on ws://{WS_HOST}:{WS_PORT}")
        print("📊 Broadcasting simulation updates every 1 second")
        print("🎬 Demo scenario will run automatically")
        print("\nPress Ctrl+C to stop\n")

        # Run simulation loop
        await simulation_loop()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n\n🛑 Server stopped by user")
    except Exception as e:
        print(f"\n❌ Server error: {e}")
