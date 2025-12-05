"""
FleetFusion - Pathway Streaming Pipeline
Main orchestration file for the supply chain monitoring system
"""

import pathway as pw
import os
from dotenv import load_dotenv
from connectors.gps_connector import TruckGPSConnector
from transformations.delay_detection import apply_all_transformations
from transformations.demo_scenario import apply_demo_scenario
# Team C: LLM/Contract RAG imports
from llm.contract_rag import (
    ContractRAGPipeline,
    join_delays_with_contracts
)

# Load environment variables
load_dotenv()

# Import truck configurations from existing backend
TRUCKS_CONFIG = [
    {
        "id": "TRK-402",
        "driver": "Priya Sharma",
        "cargo_value": 120000,
        "velocity": 68,
        "route": [
            [73.8567, 18.5204],  # Pune
            [73.5000, 18.7000],
            [73.2000, 18.9000],
            [72.8777, 19.0760]  # Mumbai
        ],
        "contract_id": "CNT-2024-001"
    },
    {
        "id": "TRK-305",
        "driver": "Rajesh Kumar",
        "cargo_value": 85000,
        "velocity": 72,
        "route": [
            [77.5946, 12.9716],  # Bangalore
            [77.8000, 13.5000],
            [78.0000, 15.0000],
            [78.4867, 17.3850]  # Hyderabad
        ],
        "contract_id": "CNT-2024-002"
    },
    {
        "id": "TRK-518",
        "driver": "Amit Patel",
        "cargo_value": 95000,
        "velocity": 65,
        "route": [
            [88.3639, 22.5726],  # Kolkata
            [87.5000, 22.0000],
            [86.5000, 21.5000],
            [85.8245, 20.2961]  # Bhubaneswar
        ],
        "contract_id": "CNT-2024-003"
    }
]


def main():
    """Main Pathway pipeline"""

    print("=" * 60)
    print("🚀 FleetFusion - Pathway Streaming Engine")
    print("=" * 60)

    # Step 1: Create GPS data stream using custom connector
    print("📡 Setting up GPS data stream...")

    gps_stream = pw.io.python.read(
        TruckGPSConnector(TRUCKS_CONFIG),
        schema=pw.schema_from_types(
            truck_id=str,
            driver=str,
            lat=float,
            lon=float,
            velocity=float,
            cargo_value=int,
            contract_id=str,
            status=str,
            timestamp=int,
            route=str  # JSON string representation
        )
    )

    print("✅ GPS stream configured")

    # Team B: Add demo scenario control
    print("🎬 Enabling demo scenario (TRK-402 will stop after 5s)...")
    gps_with_demo = apply_demo_scenario(gps_stream, enable_demo=True)

    # Team B: Apply transformations
    print("🔧 Applying streaming transformations...")
    print("   - Velocity window monitoring (60s sliding window)")
    print("   - Delay detection (critical < 10 km/h)")
    print("   - ETA calculations")
    print("   - Event stream generation")

    status_stream, events_stream = apply_all_transformations(gps_with_demo)

    print("✅ Delay detection active")
    print("✅ Event stream configured")

    # Team C: Setup contract RAG pipeline (LLM xPack)
    print("\n🧠 Setting up Contract RAG with Pathway LLM xPack (Team C)...")
    rag_pipeline = ContractRAGPipeline(contracts_folder="data/contracts")
    contracts = rag_pipeline.setup_document_store()
    print("✅ Contract RAG pipeline initialized")

    if rag_pipeline.use_llm:
        print("✅ LLM-enhanced analysis enabled (OpenAI)")
    else:
        print("⚠️  LLM fallback mode (no API key)")

    # Team C: Generate arbitrage opportunities
    print("🔗 Generating AI-powered arbitrage opportunities...")
    arbitrage_stream = join_delays_with_contracts(status_stream, contracts, rag_pipeline)
    print("✅ Arbitrage stream configured")

    # Step 2: Basic transformation - select relevant fields (for raw GPS output)
    print("\n🔧 Setting up GPS passthrough...")

    truck_positions = gps_with_demo.select(
        pw.this.truck_id,
        pw.this.driver,
        pw.this.lat,
        pw.this.lon,
        pw.this.velocity,
        pw.this.cargo_value,
        pw.this.contract_id,
        pw.this.status,
        pw.this.timestamp,
        pw.this.route
    )

    print("✅ Transformations configured")

    # Step 3: Output to JSON files
    print("\n💾 Setting up output...")

    pw.io.jsonlines.write(truck_positions, "output/gps_stream.jsonl")
    pw.io.jsonlines.write(status_stream, "output/truck_status.jsonl")
    pw.io.jsonlines.write(events_stream, "output/events.jsonl")
    # Team C: Output arbitrage opportunities
    pw.io.jsonlines.write(arbitrage_stream, "output/arbitrage_opportunities.jsonl")

    print("✅ Output configured:")
    print("   - output/gps_stream.jsonl (raw GPS data)")
    print("   - output/truck_status.jsonl (with delays detected)")
    print("   - output/events.jsonl (status change events)")
    print("   - output/arbitrage_opportunities.jsonl (AI-powered arbitrage)")

    # Step 4: Run the pipeline
    print("\n" + "=" * 60)
    print("🎬 Starting Pathway pipeline...")
    print("📊 Updates streaming to output files")
    print("⚠️  Watch for TRK-402 to stop after ~5 seconds")
    print("🧠 AI will analyze contract penalties and suggest arbitrage")
    print("💡 Using Pathway LLM xPack for real-time RAG")
    print("Press Ctrl+C to stop")
    print("=" * 60 + "\n")

    # This starts the streaming engine - it will run indefinitely
    pw.run()


if __name__ == "__main__":
    try:
        # Create output directory
        os.makedirs("output", exist_ok=True)

        main()
    except KeyboardInterrupt:
        print("\n\n🛑 Pipeline stopped by user")
    except Exception as e:
        print(f"\n❌ Pipeline error: {e}")
        raise
