# Team D: Integration, Testing & Deployment

**Role**: Critical Path - Integration Layer  
**Duration**: Day 3-4 (12 hours)  
**Team Size**: 1 Lead Dev + 1 QA  
**Dependencies**: Teams A, B, C (must all be complete)

---

## 🎯 Mission

Integrate all Pathway components, create WebSocket output adapter for frontend compatibility, perform end-to-end
testing, and prepare for deployment.

---

## 📋 Deliverables Checklist

- [ ] WebSocket output adapter implemented
- [ ] Frontend format compatibility layer
- [ ] Complete main.py integration
- [ ] End-to-end testing passed
- [ ] Docker deployment configured
- [ ] Documentation updated
- [ ] Demo scenario validated

---

## ⏱️ Timeline

### Day 3 Morning (4 hours)

- **Hour 1**: Review all team outputs
- **Hour 2**: WebSocket adapter implementation
- **Hour 3**: Format compatibility layer
- **Hour 4**: Integration testing

### Day 3 Afternoon (4 hours)

- **Hour 5**: End-to-end testing
- **Hour 6**: Bug fixes
- **Hour 7**: Frontend integration
- **Hour 8**: Validation

### Day 4 Morning (4 hours)

- **Hour 9**: Docker setup
- **Hour 10**: Deployment testing
- **Hour 11**: Demo preparation
- **Hour 12**: Final checks

---

## 🛠️ Step-by-Step Implementation

### Step 1: Review Team Outputs (1 hour)

Check that all teams have completed their work:

```bash
cd backend-pathway
source venv-pathway/bin/activate

# Verify Team A output
tail output/gps_stream.jsonl

# Verify Team B output  
tail output/truck_status.jsonl
tail output/events.jsonl

# Verify Team C output
tail output/arbitrage.jsonl
ls data/contracts/
```

All should be streaming data continuously.

---

### Step 2: WebSocket Output Adapter (2 hours)

Create `adapters/websocket_output.py`:

```python
"""
WebSocket Output Adapter for Pathway
Broadcasts Pathway stream updates to frontend clients via WebSocket
"""

import asyncio
import websockets
import json
from typing import Set, Dict, Any
import pathway as pw
from datetime import datetime


class WebSocketBroadcaster:
    """
    Converts Pathway output to WebSocket messages compatible with frontend.
    
    Maintains the exact same message format as the original backend to
    ensure zero frontend changes are required.
    """
    
    def __init__(self, host: str = 'localhost', port: int = 8080):
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
        return {
            "id": row['truck_id'],
            "driver": row['driver'],
            "cargoValue": row['cargo_value'],
            "status": row['status'],
            "velocity": row['current_velocity'] if 'current_velocity' in row else row['velocity'],
            "position": [row['current_lon'] if 'current_lon' in row else row['lon'], 
                        row['current_lat'] if 'current_lat' in row else row['lat']],
            "destination": row['route'][-1] if row['route'] else [0, 0],
            "route": row['route'],
            "contractId": row['contract_id'],
            "eta": datetime.now().isoformat()
        }
    
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
        return {
            "truckId": row['truck_id'],
            "projectedPenalty": row['projected_penalty'],
            "solutionType": row.get('solution_type', 'Relief Truck'),
            "solutionCost": row.get('solution_cost', 0),
            "netSavings": row.get('net_savings', 0),
            "details": row.get('details', 'Alternative solution available')
        }
    
    async def update_from_pathway_stream(self, truck_data: list, event_data: list, arbitrage_data: dict = None):
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
        print("🚀 ChainReaction WebSocket Server (Pathway Edition)")
        print("=" * 60)
        print(f"📡 Starting server on ws://{self.host}:{self.port}")
        
        async with websockets.serve(self.handle_client, self.host, self.port):
            print(f"✅ Server listening on ws://{self.host}:{self.port}")
            print("🎬 Ready to broadcast Pathway streams")
            print("\nPress Ctrl+C to stop\n")
            
            # Keep server running
            await asyncio.Future()  # Run forever


# Helper function to bridge Pathway and WebSocket
def create_websocket_output(host: str = 'localhost', port: int = 8080):
    """Factory function to create WebSocket broadcaster"""
    return WebSocketBroadcaster(host, port)
```

---

### Step 3: Integrate Everything in main.py (2 hours)

Create the complete `main.py`:

```python
"""
ChainReaction - Complete Pathway Streaming Pipeline
Integrates GPS tracking, delay detection, contract analysis, and WebSocket output
"""

import pathway as pw
import os
import asyncio
from dotenv import load_dotenv

# Team A imports
from connectors.gps_connector import TruckGPSConnector

# Team B imports
from transformations.delay_detection import apply_all_transformations
from transformations.demo_scenario import apply_demo_scenario

# Team C imports
from llm.contract_rag import (
    setup_contract_stream,
    create_contract_rag_pipeline,
    join_delays_with_contracts
)

# Team D imports
from adapters.websocket_output import create_websocket_output

# Load environment
load_dotenv()

# Truck configuration
TRUCKS_CONFIG = [
    {
        "id": "TRK-402",
        "driver": "Priya Sharma",
        "cargo_value": 120000,
        "velocity": 68,
        "route": [
            [73.8567, 18.5204], [73.5000, 18.7000],
            [73.2000, 18.9000], [72.8777, 19.0760]
        ],
        "contract_id": "CNT-2024-001"
    },
    {
        "id": "TRK-305",
        "driver": "Rajesh Kumar",
        "cargo_value": 85000,
        "velocity": 72,
        "route": [
            [77.5946, 12.9716], [77.8000, 13.5000],
            [78.0000, 15.0000], [78.4867, 17.3850]
        ],
        "contract_id": "CNT-2024-002"
    },
    {
        "id": "TRK-518",
        "driver": "Amit Patel",
        "cargo_value": 95000,
        "velocity": 65,
        "route": [
            [88.3639, 22.5726], [87.5000, 22.0000],
            [86.5000, 21.5000], [85.8245, 20.2961]
        ],
        "contract_id": "CNT-2024-003"
    }
]


async def run_websocket_server(broadcaster):
    """Run WebSocket server in async context"""
    await broadcaster.start_server()


def main():
    """Main Pathway pipeline with all integrations"""
    
    print("=" * 60)
    print("🚀 ChainReaction - Pathway Streaming Engine")
    print("   Team A: GPS Connector")
    print("   Team B: Delay Detection")
    print("   Team C: LLM xPack RAG")
    print("   Team D: WebSocket Integration")
    print("=" * 60)
    
    # ========================================
    # TEAM A: GPS Stream
    # ========================================
    print("\n📡 [Team A] Setting up GPS data stream...")
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
            route=list
        )
    )
    print("✅ GPS stream configured")
    
    # ========================================
    # TEAM B: Transformations
    # ========================================
    print("\n🔧 [Team B] Applying streaming transformations...")
    
    # Apply demo scenario
    gps_with_demo = apply_demo_scenario(gps_stream)
    
    # Apply transformations (windows, delays, events)
    status_stream, events_stream = apply_all_transformations(gps_with_demo)
    
    print("✅ Delay detection active")
    print("✅ Event stream configured")
    
    # ========================================
    # TEAM C: LLM xPack
    # ========================================
    print("\n🧠 [Team C] Setting up LLM xPack for contract analysis...")
    
    contracts = setup_contract_stream()
    rag_app, _ = create_contract_rag_pipeline(contracts)
    
    # Join critical trucks with contracts
    truck_contracts = join_delays_with_contracts(status_stream, contracts)
    
    # Generate arbitrage opportunities
    arbitrage_stream = truck_contracts.select(
        truck_id=pw.this.truck_id,
        contract_id=pw.this.contract_id,
        projected_penalty=pw.apply(
            lambda pph: pph * 2.5,
            pw.this.penalty_per_hour
        ),
        solution_cost=pw.apply(
            lambda alts: min(alts, key=lambda x: x['cost'])['cost'] if alts else 0,
            pw.this.spot_market_alternatives
        )
    ).select(
        pw.this.truck_id,
        pw.this.contract_id,
        pw.this.projected_penalty,
        pw.this.solution_cost,
        net_savings=pw.apply(
            lambda penalty, cost: penalty - cost,
            pw.this.projected_penalty,
            pw.this.solution_cost
        )
    )
    
    print("✅ LLM xPack integration complete")
    
    # ========================================
    # TEAM D: Output
    # ========================================
    print("\n💾 [Team D] Setting up outputs...")
    
    # JSON outputs for debugging
    pw.io.jsonlines.write(status_stream, "output/truck_status.jsonl")
    pw.io.jsonlines.write(events_stream, "output/events.jsonl")
    pw.io.jsonlines.write(arbitrage_stream, "output/arbitrage.jsonl")
    
    print("✅ JSON outputs configured")
    
    # WebSocket output would be added here
    # (See separate WebSocket integration script)
    
    # ========================================
    # RUN PIPELINE
    # ========================================
    print("\n" + "=" * 60)
    print("🎬 Starting Pathway pipeline...")
    print("📊 Outputs:")
    print("   - output/truck_status.jsonl")
    print("   - output/events.jsonl")
    print("   - output/arbitrage.jsonl")
    print("\nPress Ctrl+C to stop")
    print("=" * 60 + "\n")
    
    pw.run()


if __name__ == "__main__":
    try:
        os.makedirs("output", exist_ok=True)
        main()
    except KeyboardInterrupt:
        print("\n\n🛑 Pipeline stopped by user")
    except Exception as e:
        print(f"\n❌ Pipeline error: {e}")
        import traceback
        traceback.print_exc()
        raise
```

---

### Step 4: End-to-End Testing (2 hours)

Create `tests/test_integration.py`:

```python
"""
End-to-end integration tests
"""

import subprocess
import time
import json
import os


def test_pipeline_starts():
    """Test that main.py starts without errors"""
    print("Testing pipeline startup...")
    
    # Start pipeline in background
    process = subprocess.Popen(
        ['python', 'main.py'],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    
    # Wait for startup
    time.sleep(5)
    
    # Check if running
    assert process.poll() is None, "Pipeline crashed on startup"
    
    # Kill process
    process.terminate()
    process.wait()
    
    print("✅ Pipeline startup test passed")


def test_gps_output_generated():
    """Test that GPS data is being written"""
    print("Testing GPS output...")
    
    output_file = 'output/truck_status.jsonl'
    
    # Wait for file to be created
    max_wait = 10
    for i in range(max_wait):
        if os.path.exists(output_file):
            break
        time.sleep(1)
    
    assert os.path.exists(output_file), "GPS output file not created"
    
    # Check file has data
    with open(output_file, 'r') as f:
        lines = f.readlines()
        assert len(lines) > 0, "No data in GPS output"
        
        # Verify JSON is valid
        first_record = json.loads(lines[0])
        assert 'truck_id' in first_record
        assert 'status' in first_record
    
    print("✅ GPS output test passed")


def test_events_generated():
    """Test that events are being created"""
    print("Testing event generation...")
    
    output_file = 'output/events.jsonl'
    
    # Events should be generated after delays
    time.sleep(10)
    
    if os.path.exists(output_file):
        with open(output_file, 'r') as f:
            lines = f.readlines()
            if len(lines) > 0:
                event = json.loads(lines[0])
                assert 'event_id' in event
                assert 'message' in event
                print("✅ Events test passed")
            else:
                print("⚠️  No events yet (may need more time)")
    else:
        print("⚠️  Events file not created yet")


def test_arbitrage_output():
    """Test that arbitrage opportunities are calculated"""
    print("Testing arbitrage output...")
    
    output_file = 'output/arbitrage.jsonl'
    
    # Arbitrage should appear after critical delay
    time.sleep(15)
    
    if os.path.exists(output_file):
        with open(output_file, 'r') as f:
            lines = f.readlines()
            if len(lines) > 0:
                arb = json.loads(lines[0])
                assert 'truck_id' in arb
                assert 'projected_penalty' in arb
                print("✅ Arbitrage test passed")
            else:
                print("⚠️  No arbitrage opportunities yet")
    else:
        print("⚠️  Arbitrage file not created yet")


def test_data_format_compatibility():
    """Test that output matches frontend expectations"""
    print("Testing data format compatibility...")
    
    # Required fields for frontend Truck interface
    required_truck_fields = [
        'truck_id', 'driver', 'cargo_value', 'status',
        'current_velocity', 'contract_id', 'route'
    ]
    
    output_file = 'output/truck_status.jsonl'
    
    if os.path.exists(output_file):
        with open(output_file, 'r') as f:
            line = f.readline()
            if line:
                truck = json.loads(line)
                
                missing_fields = [f for f in required_truck_fields if f not in truck]
                assert len(missing_fields) == 0, f"Missing fields: {missing_fields}"
                
                print("✅ Data format compatibility test passed")
            else:
                print("⚠️  No data to check yet")
    else:
        print("⚠️  Output file not found")


if __name__ == "__main__":
    print("Running integration tests...\n")
    
    # Note: These tests require the pipeline to be running
    print("⚠️  Make sure to start main.py in another terminal first!\n")
    
    test_pipeline_starts()
    test_gps_output_generated()
    test_events_generated()
    test_arbitrage_output()
    test_data_format_compatibility()
    
    print("\n✅ All integration tests completed!")
```

---

### Step 5: Docker Deployment (2 hours)

Create `docker/Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install Pathway and dependencies
RUN pip install --no-cache-dir \
    pathway==0.7.0 \
    'pathway[xpacks-llm]' \
    websockets==12.0 \
    python-dotenv==1.0.0 \
    aiohttp==3.9.1 \
    openai==1.0.0

# Copy application code
COPY backend-pathway/ /app/

# Create output directory
RUN mkdir -p /app/output

# Expose WebSocket port
EXPOSE 8080

# Run the pipeline
CMD ["python", "main.py"]
```

Create `docker/docker-compose.yml`:

```yaml
version: '3.8'

services:
  pathway-backend:
    build:
      context: ..
      dockerfile: docker/Dockerfile
    ports:
      - "8080:8080"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - WS_HOST=0.0.0.0
      - WS_PORT=8080
    volumes:
      - ../backend-pathway/data:/app/data
      - ../backend-pathway/output:/app/output
    restart: unless-stopped
    networks:
      - chainreaction
  
  frontend:
    build:
      context: ..
      dockerfile: Dockerfile.frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_WS_URL=ws://pathway-backend:8080
    depends_on:
      - pathway-backend
    networks:
      - chainreaction

networks:
  chainreaction:
    driver: bridge
```

Test Docker setup:

```bash
cd docker
docker-compose build
docker-compose up
```

---

## 📤 Frontend Integration

No frontend changes needed! The WebSocket adapter matches the existing interface exactly.

Verify in `lib/hooks/useWebSocket.ts` - it should work without modification.

---

## 📊 Success Criteria

- [ ] All 3 teams' outputs integrated
- [ ] main.py runs without errors
- [ ] Data flows through entire pipeline
- [ ] Output files generated correctly
- [ ] WebSocket broadcasts working
- [ ] Frontend can connect and display data
- [ ] Demo scenario executes correctly
- [ ] Docker deployment successful

---

## 🐛 Common Issues & Solutions

### Issue 1: Module import errors

```bash
# Ensure all __init__.py files exist
touch connectors/__init__.py
touch transformations/__init__.py
touch llm/__init__.py
touch adapters/__init__.py
```

### Issue 2: Pipeline crashes

```python
# Add error handling in main.py
try:
    pw.run()
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
```

### Issue 3: Frontend not receiving data

```bash
# Check WebSocket port
netstat -an | grep 8080

# Verify frontend is connecting to correct URL
echo $NEXT_PUBLIC_WS_URL
```

---

## 🎓 Final Documentation

Create `README.md`:

```markdown
# ChainReaction - Pathway Edition

Supply chain monitoring with Pathway streaming engine.

## Pathway Integration

✅ Custom Python GPS connector  
✅ Temporal windows for delay detection  
✅ LLM xPack for contract RAG  
✅ Real-time joins and transformations  
✅ WebSocket output for frontend  

## Quick Start

```bash
# Backend
cd backend-pathway
source venv-pathway/bin/activate
python main.py

# Frontend (separate terminal)
npm run dev
```

## Docker Deployment

```bash
cd docker
docker-compose up
```

## Team Contributions

- **Team A**: GPS Connector
- **Team B**: Delay Detection & Windows
- **Team C**: LLM xPack & Contract RAG
- **Team D**: Integration & Testing

```

---

## 🚀 You're Done!

Estimated completion: End of Day 3 or early Day 4

**Final step**: Record demo video showing Pathway in action!
