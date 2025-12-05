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
    route=str            # JSON string of [[lon, lat], ...] waypoints
)
```

## Example Usage for Team B (Transformations)

```python
# Import the GPS stream from main.py (or use your own connector)
from main import gps_stream

# Add transformations - example: detect delayed trucks
delayed_trucks = gps_stream.filter(pw.this.velocity < 10)

# Join with contract data, aggregate, etc.
```

## Example Output (JSON format)

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
  "timestamp": 1733428830,
  "route": "[[73.8567, 18.5204], [73.5, 18.7], [73.2, 18.9], [72.8777, 19.076]]",
  "diff": 1,
  "time": 1733428830034
}
```

Note: `diff` and `time` fields are automatically added by Pathway:

- `diff`: 1 for additions, -1 for deletions
- `time`: Internal Pathway timestamp

## Data Flow

```
GPS Connector → Pathway Stream → Transformations (Team B) → LLM Analysis (Team C) → WebSocket Output (Team D)
```

## Testing

To generate test GPS data, run:

```bash
python main.py
```

The output will be written to `output/gps_stream.jsonl` and updated in real-time.
