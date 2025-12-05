#!/usr/bin/env python3
"""
Standalone WebSocket Server for FleetFusion
Reads Pathway output files and broadcasts to frontend via WebSocket
"""

import asyncio
import json
import os
from adapters.websocket_output import WebSocketBroadcaster


async def read_pathway_outputs(broadcaster: WebSocketBroadcaster):
    """
    Read Pathway output files and broadcast to clients
    """
    print("📖 Starting to read Pathway output files...")

    last_truck_size = 0
    last_event_size = 0
    last_arbitrage_size = 0

    # Track initial file sizes to skip old data
    initial_truck_size = 0
    initial_event_size = 0
    initial_arbitrage_size = 0

    # Record initial sizes to ignore old data from previous runs
    if os.path.exists('output/truck_status.jsonl'):
        initial_truck_size = os.path.getsize('output/truck_status.jsonl')
        last_truck_size = initial_truck_size
        print(f"📊 Skipping {initial_truck_size} bytes of old truck data")

    if os.path.exists('output/events.jsonl'):
        initial_event_size = os.path.getsize('output/events.jsonl')
        last_event_size = initial_event_size
        print(f"🚨 Skipping {initial_event_size} bytes of old event data")

    if os.path.exists('output/arbitrage_opportunities.jsonl'):
        initial_arbitrage_size = os.path.getsize('output/arbitrage_opportunities.jsonl')
        last_arbitrage_size = initial_arbitrage_size
        print(f"💰 Skipping {initial_arbitrage_size} bytes of old arbitrage data")

    while True:
        try:
            # Read truck status
            if os.path.exists('output/truck_status.jsonl'):
                current_size = os.path.getsize('output/truck_status.jsonl')
                if current_size != last_truck_size:
                    with open('output/truck_status.jsonl', 'r') as f:
                        lines = f.readlines()
                        if lines:
                            # Get latest state for each truck
                            trucks_by_id = {}
                            for line in lines[-50:]:  # Last 50 updates
                                try:
                                    data = json.loads(line)
                                    trucks_by_id[data['truck_id']] = data
                                except:
                                    pass

                            truck_data = list(trucks_by_id.values())
                            if truck_data:
                                await broadcaster.update_from_pathway_stream(truck_data=truck_data)
                                print(f"📊 Broadcast {len(truck_data)} trucks")

                    last_truck_size = current_size

            # Read events
            if os.path.exists('output/events.jsonl'):
                current_size = os.path.getsize('output/events.jsonl')
                if current_size != last_event_size:
                    with open('output/events.jsonl', 'r') as f:
                        lines = f.readlines()
                        if lines:
                            # Get last 10 events
                            event_data = []
                            for line in lines[-10:]:
                                try:
                                    data = json.loads(line)
                                    event_data.append(data)
                                except:
                                    pass

                            if event_data:
                                await broadcaster.update_from_pathway_stream(event_data=event_data)
                                print(f"🚨 Broadcast {len(event_data)} events")

                    last_event_size = current_size

            # Read arbitrage opportunities - ONLY if file has grown (new data)
            if os.path.exists('output/arbitrage_opportunities.jsonl'):
                current_size = os.path.getsize('output/arbitrage_opportunities.jsonl')
                # Only process if file has grown beyond initial size (new data added)
                if current_size > initial_arbitrage_size and current_size != last_arbitrage_size:
                    with open('output/arbitrage_opportunities.jsonl', 'r') as f:
                        lines = f.readlines()
                        if lines:
                            # Get latest arbitrage opportunity
                            try:
                                arbitrage_data = json.loads(lines[-1])
                                await broadcaster.update_from_pathway_stream(arbitrage_data=arbitrage_data)
                                print(f"💰 Broadcast arbitrage opportunity")
                            except:
                                pass

                    last_arbitrage_size = current_size

            # Check every 1 second
            await asyncio.sleep(1)

        except Exception as e:
            print(f"⚠️  Error reading outputs: {e}")
            await asyncio.sleep(1)


async def main():
    """Main entry point"""
    print("=" * 60)
    print("🚀 FleetFusion WebSocket Server (Team D)")
    print("=" * 60)
    print()
    print("📡 This server broadcasts Pathway output to frontend clients")
    print("🔗 Make sure main.py is running in another terminal!")
    print()

    # Clear old arbitrage data to prevent showing stale opportunities
    print("🧹 Clearing old arbitrage data...")
    if os.path.exists('output/arbitrage_opportunities.jsonl'):
        # Don't delete, but we'll skip reading it until new data arrives
        print("   Old arbitrage file exists - will only show NEW opportunities")

    # Get port from environment or use default
    port = int(os.getenv('WEBSOCKET_PORT', 8765))
    host = os.getenv('WEBSOCKET_HOST', 'localhost')

    # Create broadcaster
    broadcaster = WebSocketBroadcaster(host=host, port=port)

    # Start WebSocket server and output reader concurrently
    await asyncio.gather(
        broadcaster.start_server(),
        read_pathway_outputs(broadcaster)
    )


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n\n🛑 WebSocket server stopped by user")
