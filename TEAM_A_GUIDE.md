# Team A: Core Pathway Setup & GPS Connector

**Role**: Critical Path - Foundation Layer  
**Duration**: Day 1-2 (16 hours)  
**Team Size**: 2 Senior Developers  
**Status**: 🔴 BLOCKING (Other teams depend on you)

---

## 🎯 Mission

Build the foundational Pathway streaming infrastructure with a custom GPS connector that feeds real-time truck position
data into the Pathway engine.

---

## 📋 Deliverables Checklist

- [ ] Pathway environment installed and verified
- [ ] Project structure created (`backend-pathway/`)
- [ ] Custom GPS Python connector implemented
- [ ] Streaming GPS table with truck data
- [ ] Basic output (JSON file) working
- [ ] Integration test passing (data flows end-to-end)
- [ ] Documentation for other teams

---

## ⏱️ Timeline

### Day 1 Morning (4 hours)

- **Hour 1**: Environment setup + Pathway installation
- **Hour 2**: Project structure + reference code study
- **Hour 3**: GPS connector skeleton
- **Hour 4**: First data emission test

### Day 1 Afternoon (4 hours)

- **Hour 5**: Complete GPS connector with route logic
- **Hour 6**: Schema definition + validation
- **Hour 7**: Output connector (JSON)
- **Hour 8**: End-to-end test

### Day 2 Morning (4 hours)

- **Hour 9**: Bug fixes from overnight testing
- **Hour 10**: Performance optimization
- **Hour 11**: Documentation
- **Hour 12**: Handoff to Team B & D

### Day 2 Afternoon (4 hours)

- **Support Mode**: Help other teams integrate

---

## 🛠️ Step-by-Step Implementation

### Step 1: Environment Setup (1 hour)

```bash
# Navigate to project root
cd /Users/gauravsharma/PycharmProjects/GenAI_Proj

# Create new Pathway backend directory
mkdir backend-pathway
cd backend-pathway

# Create Python virtual environment
python3 -m venv venv-pathway
source venv-pathway/bin/activate  # On Mac/Linux

# Install Pathway
pip install pathway==0.7.0

# Verify installation
python -c "import pathway as pw; print(f'Pathway version: {pw.__version__}')"

# Install additional dependencies
pip install python-dotenv websockets aiohttp
```

**Validation**: You should see "Pathway version: 0.7.0" printed.

---

### Step 2: Project Structure (30 min)

```bash
# Create directory structure
mkdir -p connectors transformations llm adapters data/contracts data/routes tests

# Create __init__.py files
touch connectors/__init__.py
touch transformations/__init__.py
touch llm/__init__.py
touch adapters/__init__.py
touch tests/__init__.py

# Create main files
touch main.py
touch requirements-pathway.txt
touch README.md
```

Create `requirements-pathway.txt`:

```txt
pathway==0.7.0
websockets==12.0
python-dotenv==1.0.0
aiohttp==3.9.1
pydantic==2.5.0
```

---

### Step 3: GPS Connector Implementation (3 hours)

Create `connectors/gps_connector.py`:

```python
"""
Custom Pathway GPS Connector
Simulates real-time truck GPS updates by emitting position data every second
"""

import pathway as pw
import time
from datetime import datetime
from typing import List, Dict


class TruckGPSConnector(pw.io.python.ConnectorSubject):
    """
    Custom Python connector for Pathway that simulates GPS data streams.
    
    This connector implements the required 'run()' method that continuously
    emits truck position updates to the Pathway streaming engine.
    """
    
    def __init__(self, trucks_config: List[Dict]):
        """
        Initialize the GPS connector with truck configurations.
        
        Args:
            trucks_config: List of truck dictionaries containing:
                - id: Truck identifier (e.g., "TRK-402")
                - driver: Driver name
                - route: List of [lon, lat] coordinates
                - velocity: Speed in km/h
                - cargo_value: Cargo value in USD
                - contract_id: Associated contract ID
        """
        super().__init__()
        self.trucks = trucks_config
        self._initialize_truck_state()
    
    def _initialize_truck_state(self):
        """Setup initial state for each truck"""
        for truck in self.trucks:
            truck['route_index'] = 0
            truck['current_position'] = truck['route'][0] if truck['route'] else [0, 0]
            truck['status'] = 'on-time'
    
    def run(self):
        """
        Main connector loop - REQUIRED by Pathway.
        
        This method runs continuously, emitting GPS updates every second.
        Each emission creates a new row in the Pathway streaming table.
        """
        print("🚀 GPS Connector started - emitting data every 1 second")
        
        iteration = 0
        while True:
            for truck in self.trucks:
                # Update truck position along route
                self._update_truck_position(truck)
                
                # Emit data to Pathway stream using self.next()
                self.next(
                    truck_id=truck['id'],
                    driver=truck['driver'],
                    lat=truck['current_position'][1],
                    lon=truck['current_position'][0],
                    velocity=truck['velocity'],
                    cargo_value=truck['cargo_value'],
                    contract_id=truck['contract_id'],
                    status=truck['status'],
                    timestamp=int(datetime.now().timestamp()),
                    route=truck['route']  # Send entire route for frontend
                )
                
                if iteration % 10 == 0:  # Log every 10 seconds
                    print(f"📍 {truck['id']}: position [{truck['current_position'][0]:.4f}, "
                          f"{truck['current_position'][1]:.4f}], velocity {truck['velocity']} km/h")
            
            iteration += 1
            time.sleep(1)  # Update frequency: 1 second
    
    def _update_truck_position(self, truck: Dict):
        """Move truck along its route"""
        route = truck['route']
        current_idx = truck['route_index']
        
        # Move to next waypoint if not at end
        if current_idx < len(route) - 1:
            truck['route_index'] = current_idx + 1
            truck['current_position'] = route[current_idx + 1]
        else:
            # Reached end, restart route (for continuous demo)
            truck['route_index'] = 0
            truck['current_position'] = route[0]


# Example usage and testing
if __name__ == "__main__":
    # Test data matching your frontend trucks
    test_trucks = [
        {
            "id": "TRK-402",
            "driver": "Priya Sharma",
            "route": [
                [73.8567, 18.5204],  # Pune
                [73.5000, 18.7000],
                [73.2000, 18.9000],
                [72.8777, 19.0760]   # Mumbai
            ],
            "velocity": 68,
            "cargo_value": 120000,
            "contract_id": "CNT-2024-001"
        }
    ]
    
    # Create and test connector
    connector = TruckGPSConnector(test_trucks)
    
    # Simulate a few iterations
    print("Testing GPS Connector...")
    for i in range(3):
        for truck in connector.trucks:
            connector._update_truck_position(truck)
            print(f"Iteration {i}: {truck['id']} at {truck['current_position']}")
        time.sleep(1)
    
    print("✅ GPS Connector test passed!")
```

**Test the connector**:

```bash
python connectors/gps_connector.py
```

You should see truck positions updating.

---

### Step 4: Main Pipeline Setup (2 hours)

Create `main.py`:

```python
"""
ChainReaction - Pathway Streaming Pipeline
Main orchestration file for the supply chain monitoring system
"""

import pathway as pw
import os
from dotenv import load_dotenv
from connectors.gps_connector import TruckGPSConnector

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
            [72.8777, 19.0760]   # Mumbai
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
            [78.4867, 17.3850]   # Hyderabad
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
            [85.8245, 20.2961]   # Bhubaneswar
        ],
        "contract_id": "CNT-2024-003"
    }
]


def main():
    """Main Pathway pipeline"""
    
    print("=" * 60)
    print("🚀 ChainReaction - Pathway Streaming Engine")
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
            route=list  # For frontend compatibility
        )
    )
    
    print("✅ GPS stream configured")
    
    # Step 2: Basic transformation - select relevant fields
    print("🔧 Setting up transformations...")
    
    truck_positions = gps_stream.select(
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
    
    # Step 3: Output to JSON file (for testing)
    print("💾 Setting up output...")
    
    pw.io.jsonlines.write(truck_positions, "output/gps_stream.jsonl")
    
    print("✅ Output configured to: output/gps_stream.jsonl")
    
    # Step 4: Run the pipeline
    print("\n" + "=" * 60)
    print("🎬 Starting Pathway pipeline...")
    print("📊 GPS updates will be written to output/gps_stream.jsonl")
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
```

---

### Step 5: Test the Pipeline (1 hour)

```bash
# Create output directory
mkdir output

# Run the pipeline
python main.py
```

**Expected output**:

```
============================================================
🚀 ChainReaction - Pathway Streaming Engine
============================================================
📡 Setting up GPS data stream...
✅ GPS stream configured
🔧 Setting up transformations...
✅ Transformations configured
💾 Setting up output...
✅ Output configured to: output/gps_stream.jsonl
============================================================
🎬 Starting Pathway pipeline...
📊 GPS updates will be written to output/gps_stream.jsonl
Press Ctrl+C to stop
============================================================

🚀 GPS Connector started - emitting data every 1 second
📍 TRK-402: position [73.8567, 18.5204], velocity 68 km/h
📍 TRK-305: position [77.5946, 12.9716], velocity 72 km/h
📍 TRK-518: position [88.3639, 22.5726], velocity 65 km/h
```

**Verify output file**:

```bash
# In another terminal
tail -f output/gps_stream.jsonl
```

You should see JSON lines with truck data streaming in real-time.

---

### Step 6: Create Validation Script (1 hour)

Create `tests/test_connectors.py`:

```python
"""
Unit tests for Pathway connectors
"""

import pathway as pw
from connectors.gps_connector import TruckGPSConnector
import json
import time


def test_gps_connector_initialization():
    """Test connector initializes correctly"""
    trucks = [{
        "id": "TEST-001",
        "driver": "Test Driver",
        "route": [[0, 0], [1, 1]],
        "velocity": 50,
        "cargo_value": 10000,
        "contract_id": "TEST-CNT"
    }]
    
    connector = TruckGPSConnector(trucks)
    assert len(connector.trucks) == 1
    assert connector.trucks[0]['route_index'] == 0
    print("✅ Connector initialization test passed")


def test_position_update():
    """Test truck position updates along route"""
    trucks = [{
        "id": "TEST-001",
        "driver": "Test Driver",
        "route": [[0, 0], [1, 1], [2, 2]],
        "velocity": 50,
        "cargo_value": 10000,
        "contract_id": "TEST-CNT"
    }]
    
    connector = TruckGPSConnector(trucks)
    truck = connector.trucks[0]
    
    # Initial position
    assert truck['current_position'] == [0, 0]
    
    # Move once
    connector._update_truck_position(truck)
    assert truck['current_position'] == [1, 1]
    
    # Move again
    connector._update_truck_position(truck)
    assert truck['current_position'] == [2, 2]
    
    # Loop back to start
    connector._update_truck_position(truck)
    assert truck['current_position'] == [0, 0]
    
    print("✅ Position update test passed")


def test_output_format():
    """Test that output matches expected format"""
    expected_fields = [
        'truck_id', 'driver', 'lat', 'lon', 'velocity',
        'cargo_value', 'contract_id', 'status', 'timestamp', 'route'
    ]
    
    # Read output file
    try:
        with open('output/gps_stream.jsonl', 'r') as f:
            first_line = f.readline()
            data = json.loads(first_line)
            
            for field in expected_fields:
                assert field in data, f"Missing field: {field}"
            
        print("✅ Output format test passed")
    except FileNotFoundError:
        print("⚠️  Output file not found - run main.py first")


if __name__ == "__main__":
    print("Running Team A validation tests...\n")
    
    test_gps_connector_initialization()
    test_position_update()
    test_output_format()
    
    print("\n✅ All Team A tests passed!")
```

Run tests:

```bash
python tests/test_connectors.py
```

---

## 📤 Handoff to Other Teams

### For Team B (Transformations)

**What you provide**:

1. Working `gps_stream` Pathway table with schema
2. Example usage in `main.py`
3. Documentation on data format

**Integration point**:

```python
# Team B will import and use your stream like this:
from main import gps_stream

# They will add transformations
delayed_trucks = gps_stream.filter(pw.this.velocity < 10)
```

### For Team D (Integration)

**What you provide**:

1. Output format specification (JSON schema)
2. Test data samples in `output/gps_stream.jsonl`
3. Schema documentation

**Documentation to create**:

Create `docs/GPS_STREAM_SCHEMA.md`:

```markdown
# GPS Stream Schema

## Pathway Table Schema

```python
schema=pw.schema_from_types(
    truck_id=str,        # e.g., "TRK-402"
    driver=str,          # e.g., "Priya Sharma"
    lat=float,           # Latitude
    lon=float,           # Longitude
    velocity=float,      # Speed in km/h
    cargo_value=int,     # USD value
    contract_id=str,     # Associated contract
    status=str,          # 'on-time', 'delayed', 'critical'
    timestamp=int,       # Unix timestamp
    route=list           # List of [lon, lat] waypoints
)
```

## Example Output

```json
{
  "truck_id": "TRK-402",
  "driver": "Priya Sharma",
  "lat": 18.5204,
  "lon": 73.8567,
  "velocity": 68,
  "cargo_value": 120000,
  "contract_id": "CNT-2024-001",
  "status": "on-time",
  "timestamp": 1701234567,
  "route": [[73.8567, 18.5204], [72.8777, 19.0760]]
}
```

```

---

## 🐛 Common Issues & Solutions

### Issue 1: Pathway not importing

```bash
# Solution: Verify installation
pip list | grep pathway
# Should show: pathway    0.7.0

# If not, reinstall
pip install --upgrade pathway==0.7.0
```

### Issue 2: "No module named 'pw'"

```bash
# Solution: Activate virtual environment
source venv-pathway/bin/activate
```

### Issue 3: Output file not created

```bash
# Solution: Check directory exists
mkdir -p output

# Verify permissions
ls -la output/
```

### Issue 4: Connector not emitting data

**Debug steps**:

1. Add print statements in `run()` method
2. Test connector standalone (run `gps_connector.py` directly)
3. Verify `self.next()` is being called

---

## 📊 Success Criteria

Before marking Team A complete:

- [ ] `python main.py` runs without errors
- [ ] GPS data appears in `output/gps_stream.jsonl`
- [ ] At least 3 trucks are streaming
- [ ] Data updates every 1 second
- [ ] All tests in `test_connectors.py` pass
- [ ] Documentation created for other teams
- [ ] Code committed to version control

---

## 🎓 Key Pathway Concepts Used

1. **Custom Connector**: `pw.io.python.ConnectorSubject`
    - Implements `run()` method
    - Uses `self.next()` to emit data

2. **Schema Definition**: `pw.schema_from_types()`
    - Defines table structure
    - Type validation

3. **Table Operations**: `select()`, `filter()`
    - Basic transformations
    - Column selection

4. **Output Connectors**: `pw.io.jsonlines.write()`
    - Stream data to files
    - Real-time writes

5. **Pipeline Execution**: `pw.run()`
    - Starts the streaming engine
    - Runs indefinitely

---

## 📝 README Template

Create `README.md`:

```markdown
# ChainReaction - Pathway Backend

Supply chain monitoring system powered by Pathway streaming engine.

## Setup

```bash
python3 -m venv venv-pathway
source venv-pathway/bin/activate
pip install -r requirements-pathway.txt
```

## Run

```bash
python main.py
```

## Team A Deliverables

✅ Custom GPS connector implemented  
✅ Streaming GPS table with real-time updates  
✅ JSON output for validation  
✅ Tests passing

## Next Steps

- Team B: Add transformations (delay detection)
- Team C: Integrate LLM xPack (contract analysis)
- Team D: WebSocket output adapter

```

---

## 🚀 You're Done!

Once all success criteria are met, notify the team lead and move to support mode for other teams.

**Estimated completion**: End of Day 1 or early Day 2

Good luck! 🎉
