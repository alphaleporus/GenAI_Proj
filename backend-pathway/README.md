# FleetFusion - Pathway Streaming Backend

Supply chain monitoring system powered by **Pathway** streaming engine v0.7.0.

## 🚀 Overview

This is the real-time streaming backend for FleetFusion, a supply chain monitoring platform. It uses Pathway to
process GPS data from trucks in real-time and detect delays, analyze contracts, and provide actionable insights.

## ✅ Team A Deliverables (COMPLETE)

- ✅ Custom GPS Python connector implemented
- ✅ Streaming GPS table with real-time updates (1-second intervals)
- ✅ JSON output for validation
- ✅ All tests passing
- ✅ Documentation created for other teams

## 📁 Project Structure

```
backend-pathway/
├── connectors/
│   ├── __init__.py
│   └── gps_connector.py          # Custom GPS streaming connector
├── transformations/
│   └── __init__.py                # (Team B will add transformations here)
├── llm/
│   └── __init__.py                # (Team C will add LLM integration here)
├── adapters/
│   └── __init__.py                # (Team D will add WebSocket adapter here)
├── tests/
│   ├── __init__.py
│   └── test_connectors.py         # Unit tests for connectors
├── docs/
│   └── GPS_STREAM_SCHEMA.md      # Schema documentation
├── output/
│   └── gps_stream.jsonl          # Real-time output file
├── main.py                        # Main pipeline orchestration
├── requirements-pathway.txt      # Python dependencies
└── README.md                      # This file
```

## 🔧 Setup

### 1. Create Virtual Environment

```bash
python3 -m venv venv-pathway
source venv-pathway/bin/activate  # On Mac/Linux
# On Windows: venv-pathway\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements-pathway.txt
```

### 3. Verify Installation

```bash
python -c "import pathway as pw; print(f'✅ Pathway version: {pw.__version__}')"
```

Expected output: `✅ Pathway version: 0.7.0`

## 🏃 Running the Pipeline

### Start the Streaming Pipeline

```bash
python main.py
```

You should see:

```
============================================================
🚀 FleetFusion - Pathway Streaming Engine
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
📍 TRK-402: position [73.5000, 18.7000], velocity 68 km/h
📍 TRK-305: position [77.8000, 13.5000], velocity 72 km/h
📍 TRK-518: position [87.5000, 22.0000], velocity 65 km/h
```

### Monitor Output

In a separate terminal:

```bash
tail -f output/gps_stream.jsonl
```

### Run Tests

```bash
PYTHONPATH=. python tests/test_connectors.py
```

## 📊 Data Schema

See [docs/GPS_STREAM_SCHEMA.md](docs/GPS_STREAM_SCHEMA.md) for complete schema documentation.

**Quick Reference**:

```python
{
  "truck_id": str,       # e.g., "TRK-402"
  "driver": str,         # e.g., "Priya Sharma"
  "lat": float,          # Latitude
  "lon": float,          # Longitude
  "velocity": float,     # Speed in km/h
  "cargo_value": int,    # USD value
  "contract_id": str,    # Associated contract
  "status": str,         # 'on-time', 'delayed', 'critical'
  "timestamp": int,      # Unix timestamp
  "route": str           # JSON string of waypoints
}
```

## 🎯 Next Steps for Other Teams

### Team B: Transformations

Add delay detection and aggregations:

```python
# In transformations/delay_detection.py
from main import gps_stream

delayed_trucks = gps_stream.filter(pw.this.velocity < 10)
```

### Team C: LLM Integration

Add contract analysis using Pathway xPack:

```python
# In llm/contract_analyzer.py
import pathway as pw
from pathway.xpacks.llm import llms

# Integrate with delayed trucks from Team B
```

### Team D: WebSocket Output

Create WebSocket adapter for frontend:

```python
# In adapters/websocket_adapter.py
import pathway as pw

# Output to WebSocket instead of JSON file
```

## 🐛 Troubleshooting

### Issue: "No module named 'pathway'"

**Solution**:

```bash
# Verify you're in the virtual environment
source venv-pathway/bin/activate

# Reinstall if needed
pip install --upgrade pathway==0.7.0
```

### Issue: Output file is empty

**Solution**: Make sure the pipeline is running (`python main.py`) and wait a few seconds for data to be committed.

### Issue: Import errors in tests

**Solution**: Run tests with PYTHONPATH set:

```bash
PYTHONPATH=. python tests/test_connectors.py
```

## 📚 Key Pathway Concepts Used

1. **Custom Python Connector**: `pw.io.python.ConnectorSubject`
    - Implements `run()` method
    - Uses `next_json()` to emit data
    - Calls `commit()` to trigger processing

2. **Schema Definition**: `pw.schema_from_types()`
    - Defines table structure
    - Type validation

3. **Table Operations**: `select()`, `filter()`
    - Stream transformations
    - Column selection

4. **Output Connectors**: `pw.io.jsonlines.write()`
    - Stream data to files
    - Real-time writes

5. **Pipeline Execution**: `pw.run()`
    - Starts the streaming engine
    - Runs indefinitely

## 📖 Additional Resources

- [Pathway Documentation](https://pathway.com/developers/)
- [Custom Python Connectors Guide](https://pathway.com/developers/user-guide/connect/connectors/custom-python-connectors)
- [Team A Implementation Guide](../TEAM_A_GUIDE.md)

## 🎉 Status

**Team A Implementation: ✅ COMPLETE**

All success criteria met:

- ✅ Custom GPS connector working
- ✅ Real-time streaming (1-second updates)
- ✅ 3 trucks streaming simultaneously
- ✅ JSON output validated
- ✅ Tests passing
- ✅ Documentation complete

---

**Built with ❤️ using Pathway v0.7.0**
