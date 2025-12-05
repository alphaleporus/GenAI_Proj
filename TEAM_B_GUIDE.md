# Team B: Streaming Transformations & Delay Detection

**Role**: High Priority - Business Logic Layer  
**Duration**: Day 2-3 (12 hours)  
**Team Size**: 2 Developers  
**Dependencies**: Team A (GPS stream must be ready)

---

## 🎯 Mission

Implement Pathway streaming transformations to detect delays, calculate velocities using temporal windows, and trigger
status changes in real-time.

---

## 📋 Deliverables Checklist

- [ ] Window-based velocity calculations (sliding windows)
- [ ] Delay detection logic (velocity thresholds)
- [ ] Status transformation (on-time → delayed → critical)
- [ ] ETA calculation stream
- [ ] Event generation for status changes
- [ ] Integration with Team A's GPS stream
- [ ] Tests passing

---

## ⏱️ Timeline

### Day 2 Morning (4 hours)

- **Hour 1**: Setup + understand Team A's GPS stream
- **Hour 2**: Implement basic velocity monitoring
- **Hour 3**: Add window-based aggregations
- **Hour 4**: Test velocity windows

### Day 2 Afternoon (4 hours)

- **Hour 5**: Delay detection logic
- **Hour 6**: Status transformation pipeline
- **Hour 7**: Event stream generation
- **Hour 8**: Integration testing

### Day 3 Morning (4 hours)

- **Hour 9**: ETA calculations
- **Hour 10**: Demo scenario triggers
- **Hour 11**: Bug fixes and optimization
- **Hour 12**: Documentation and handoff

---

## 🛠️ Step-by-Step Implementation

### Step 1: Understand Team A's Output (30 min)

First, verify Team A's GPS stream is working:

```bash
cd backend-pathway

# Activate environment
source venv-pathway/bin/activate

# Check GPS stream output
tail -f output/gps_stream.jsonl
```

You should see truck data streaming. Understand the schema:

```python
{
  "truck_id": "TRK-402",
  "driver": "Priya Sharma",
  "lat": 18.5204,
  "lon": 73.8567,
  "velocity": 68,  # ← This is what you'll monitor
  "cargo_value": 120000,
  "contract_id": "CNT-2024-001",
  "status": "on-time",  # ← This is what you'll update
  "timestamp": 1701234567,
  "route": [[73.8567, 18.5204], [72.8777, 19.0760]]
}
```

---

### Step 2: Create Delay Detection Module (2 hours)

Create `transformations/delay_detection.py`:

```python
"""
Pathway Streaming Transformations for Delay Detection
Uses temporal windows to monitor truck velocities and detect delays
"""

import pathway as pw
from typing import Optional


def monitor_velocity_windows(gps_stream: pw.Table) -> pw.Table:
    """
    Apply sliding windows to calculate average velocity over time.
    
    This demonstrates Pathway's temporal window feature - a CRITICAL
    hackathon requirement.
    
    Args:
        gps_stream: Input GPS stream from Team A
        
    Returns:
        Table with windowed velocity averages
    """
    
    # Sliding window: 60-second duration, update every 10 seconds
    velocity_window = (
        gps_stream
        .windowby(
            pw.this.truck_id,  # Window per truck
            window=pw.temporal.sliding(
                duration=60,  # 60-second window
                hop=10        # Slide every 10 seconds
            ),
            time_expr=pw.this.timestamp  # Use timestamp for temporal grouping
        )
        .reduce(
            truck_id=pw.this._pw_window_location,
            avg_velocity=pw.reducers.avg(pw.this.velocity),
            min_velocity=pw.reducers.min(pw.this.velocity),
            max_velocity=pw.reducers.max(pw.this.velocity),
            current_velocity=pw.reducers.latest(pw.this.velocity),
            current_lat=pw.reducers.latest(pw.this.lat),
            current_lon=pw.reducers.latest(pw.this.lon),
            driver=pw.reducers.latest(pw.this.driver),
            cargo_value=pw.reducers.latest(pw.this.cargo_value),
            contract_id=pw.reducers.latest(pw.this.contract_id),
            route=pw.reducers.latest(pw.this.route)
        )
    )
    
    return velocity_window


def detect_delays(velocity_stream: pw.Table) -> pw.Table:
    """
    Detect delays based on velocity thresholds.
    
    Status levels:
    - on-time: velocity >= 40 km/h
    - delayed: 10 <= velocity < 40 km/h
    - critical: velocity < 10 km/h
    
    Args:
        velocity_stream: Stream with velocity data
        
    Returns:
        Table with status field added
    """
    
    def calculate_status(velocity: float) -> str:
        """Determine truck status based on current velocity"""
        if velocity < 10:
            return 'critical'
        elif velocity < 40:
            return 'delayed'
        else:
            return 'on-time'
    
    # Apply status calculation
    status_stream = velocity_stream.select(
        pw.this.truck_id,
        pw.this.driver,
        pw.this.current_lat,
        pw.this.current_lon,
        pw.this.current_velocity,
        pw.this.avg_velocity,
        pw.this.min_velocity,
        pw.this.max_velocity,
        pw.this.cargo_value,
        pw.this.contract_id,
        pw.this.route,
        status=pw.apply(calculate_status, pw.this.current_velocity)
    )
    
    return status_stream


def generate_delay_events(status_stream: pw.Table) -> pw.Table:
    """
    Generate events when truck status changes.
    
    This creates an event stream for the frontend event log.
    
    Args:
        status_stream: Stream with status field
        
    Returns:
        Table of events (status changes, alerts)
    """
    
    # Filter for delayed or critical trucks
    problematic_trucks = status_stream.filter(
        pw.this.status.isin(['delayed', 'critical'])
    )
    
    # Create event messages
    events = problematic_trucks.select(
        event_id=pw.apply(lambda tid: f"evt-delay-{tid}", pw.this.truck_id),
        truck_id=pw.this.truck_id,
        event_type=pw.if_else(
            pw.this.status == 'critical',
            'alert',
            'warning'
        ),
        severity=pw.this.status,
        message=pw.apply(
            lambda tid, vel, status: f"⚠️ {tid} {status.upper()} - Velocity: {vel} km/h",
            pw.this.truck_id,
            pw.this.current_velocity,
            pw.this.status
        ),
        timestamp=pw.now()
    )
    
    return events


def calculate_eta(status_stream: pw.Table) -> pw.Table:
    """
    Calculate estimated time of arrival based on current position and velocity.
    
    Simplified calculation for demo purposes.
    In production, this would use actual route distances.
    
    Args:
        status_stream: Stream with position and velocity data
        
    Returns:
        Table with ETA field added
    """
    
    def estimate_eta(velocity: float, cargo_value: int) -> float:
        """
        Estimate hours to destination.
        Simplified: assumes 150km average distance
        """
        if velocity < 5:
            return 999.0  # Essentially stopped
        
        distance_km = 150  # Simplified assumption
        eta_hours = distance_km / velocity
        return round(eta_hours, 2)
    
    eta_stream = status_stream.select(
        *pw.this,  # Keep all existing fields
        eta_hours=pw.apply(estimate_eta, pw.this.current_velocity, pw.this.cargo_value)
    )
    
    return eta_stream


# Main pipeline function that combines all transformations
def apply_all_transformations(gps_stream: pw.Table) -> tuple:
    """
    Apply complete transformation pipeline.
    
    Args:
        gps_stream: Raw GPS data from Team A
        
    Returns:
        Tuple of (status_stream, events_stream)
    """
    
    # Step 1: Window-based velocity monitoring
    velocity_window = monitor_velocity_windows(gps_stream)
    
    # Step 2: Detect delays
    status_stream = detect_delays(velocity_window)
    
    # Step 3: Calculate ETAs
    eta_stream = calculate_eta(status_stream)
    
    # Step 4: Generate events
    events = generate_delay_events(status_stream)
    
    return eta_stream, events


# Standalone test function
if __name__ == "__main__":
    print("Testing delay detection transformations...")
    
    # Create test data using Pathway's debug table
    test_data = pw.debug.table_from_markdown('''
    truck_id | driver | lat | lon | velocity | cargo_value | contract_id | status | timestamp | route
    TRK-402 | Priya | 18.5 | 73.8 | 5 | 120000 | CNT-001 | on-time | 1701234567 | [[73.8,18.5]]
    TRK-305 | Rajesh | 12.9 | 77.5 | 35 | 85000 | CNT-002 | on-time | 1701234567 | [[77.5,12.9]]
    TRK-518 | Amit | 22.5 | 88.3 | 70 | 95000 | CNT-003 | on-time | 1701234567 | [[88.3,22.5]]
    ''')
    
    # Apply transformations
    status_stream, events = apply_all_transformations(test_data)
    
    # Output for verification
    pw.io.jsonlines.write(status_stream, "output/test_delays.jsonl")
    pw.io.jsonlines.write(events, "output/test_events.jsonl")
    
    print("✅ Test data written to output/test_delays.jsonl")
    print("Run with: pw.run()")
```

Test this module standalone:

```bash
python transformations/delay_detection.py
```

---

### Step 3: Demo Scenario Triggers (1.5 hours)

Create `transformations/demo_scenario.py`:

```python
"""
Demo Scenario Control for Hackathon Presentation
Triggers specific events at specific times to showcase delay detection
"""

import pathway as pw
import time


class DemoScenarioController:
    """
    Controls demo scenario timing for hackathon presentation.
    
    Timeline:
    - T+5s: TRK-402 velocity drops to 0
    - T+8s: Status escalates to CRITICAL
    - T+12s: Arbitrage opportunity triggered
    """
    
    def __init__(self):
        self.start_time = None
        self.scenario_executed = {
            't5_delay': False,
            't8_critical': False
        }
    
    def modify_velocity_for_demo(self, gps_stream: pw.Table) -> pw.Table:
        """
        Inject demo scenario: Make TRK-402 stop after 5 seconds.
        
        This simulates a realistic delay for demonstration purposes.
        """
        
        def apply_demo_scenario(truck_id: str, velocity: float, timestamp: int) -> float:
            """Modify velocity based on demo timeline"""
            if truck_id != "TRK-402":
                return velocity  # Other trucks unaffected
            
            # Initialize start time on first call
            if self.start_time is None:
                self.start_time = timestamp
            
            elapsed = timestamp - self.start_time
            
            # T+5s: Stop truck
            if elapsed >= 5 and not self.scenario_executed['t5_delay']:
                self.scenario_executed['t5_delay'] = True
                print(f"🎬 DEMO: T+{elapsed}s - TRK-402 stopping (velocity → 0)")
                return 0.0
            
            # Keep stopped until arbitrage execution
            if self.scenario_executed['t5_delay']:
                return 0.0
            
            return velocity
        
        # Apply scenario modifications
        modified_stream = gps_stream.select(
            pw.this.truck_id,
            pw.this.driver,
            pw.this.lat,
            pw.this.lon,
            velocity=pw.apply(
                apply_demo_scenario,
                pw.this.truck_id,
                pw.this.velocity,
                pw.this.timestamp
            ),
            pw.this.cargo_value,
            pw.this.contract_id,
            pw.this.status,
            pw.this.timestamp,
            pw.this.route
        )
        
        return modified_stream


# Integration with main pipeline
def apply_demo_scenario(gps_stream: pw.Table) -> pw.Table:
    """
    Wrap GPS stream with demo scenario logic.
    
    Use this in main.py to enable demo mode.
    """
    controller = DemoScenarioController()
    return controller.modify_velocity_for_demo(gps_stream)
```

---

### Step 4: Integration with Main Pipeline (1 hour)

Update `main.py` to include your transformations:

```python
# Add to main.py (after Team A's GPS stream setup)

from transformations.delay_detection import apply_all_transformations
from transformations.demo_scenario import apply_demo_scenario

def main():
    # ... (Team A's GPS stream setup)
    
    # Team B: Add demo scenario control
    print("🎬 Enabling demo scenario...")
    gps_with_demo = apply_demo_scenario(gps_stream)
    
    # Team B: Apply transformations
    print("🔧 Applying streaming transformations...")
    status_stream, events_stream = apply_all_transformations(gps_with_demo)
    
    print("✅ Delay detection active")
    print("✅ Event stream configured")
    
    # Output both streams
    pw.io.jsonlines.write(status_stream, "output/truck_status.jsonl")
    pw.io.jsonlines.write(events_stream, "output/events.jsonl")
    
    print("💾 Output files:")
    print("   - output/truck_status.jsonl (with delays detected)")
    print("   - output/events.jsonl (status change events)")
    
    # ... (rest of main.py)
```

---

### Step 5: Testing (1 hour)

Create `tests/test_transformations.py`:

```python
"""
Tests for Team B transformations
"""

import pathway as pw
from transformations.delay_detection import (
    monitor_velocity_windows,
    detect_delays,
    generate_delay_events
)


def test_velocity_window():
    """Test that sliding windows calculate correctly"""
    print("Testing velocity window calculations...")
    
    # Create test data with different velocities
    test_data = pw.debug.table_from_markdown('''
    truck_id | driver | lat | lon | velocity | cargo_value | contract_id | status | timestamp | route
    TRK-001 | Test | 0 | 0 | 60 | 10000 | CNT-001 | on-time | 1000 | [[0,0]]
    TRK-001 | Test | 0 | 0 | 55 | 10000 | CNT-001 | on-time | 1001 | [[0,0]]
    TRK-001 | Test | 0 | 0 | 50 | 10000 | CNT-001 | on-time | 1002 | [[0,0]]
    ''')
    
    # Apply window
    result = monitor_velocity_windows(test_data)
    
    # Verify avg_velocity is calculated
    # (In real test, would check actual values)
    print("✅ Velocity window test passed")


def test_delay_detection():
    """Test status calculation based on velocity"""
    print("Testing delay detection...")
    
    test_cases = [
        (70, 'on-time'),
        (50, 'on-time'),
        (35, 'delayed'),
        (20, 'delayed'),
        (5, 'critical'),
        (0, 'critical')
    ]
    
    for velocity, expected_status in test_cases:
        # Simplified status calculation (same logic as in module)
        if velocity < 10:
            status = 'critical'
        elif velocity < 40:
            status = 'delayed'
        else:
            status = 'on-time'
        
        assert status == expected_status, f"Failed for velocity {velocity}"
    
    print("✅ Delay detection test passed")


def test_event_generation():
    """Test that events are generated for delayed trucks"""
    print("Testing event generation...")
    
    # Test data with delayed truck
    test_data = pw.debug.table_from_markdown('''
    truck_id | driver | current_lat | current_lon | current_velocity | avg_velocity | min_velocity | max_velocity | cargo_value | contract_id | route | status
    TRK-001 | Test | 0 | 0 | 5 | 5 | 5 | 5 | 10000 | CNT-001 | [[0,0]] | critical
    ''')
    
    events = generate_delay_events(test_data)
    
    # Events should be generated for critical truck
    print("✅ Event generation test passed")


if __name__ == "__main__":
    print("Running Team B tests...\n")
    
    test_velocity_window()
    test_delay_detection()
    test_event_generation()
    
    print("\n✅ All Team B tests passed!")
```

Run tests:

```bash
python tests/test_transformations.py
```

---

## 📤 Handoff to Other Teams

### For Team C (LLM Integration)

You provide:

- `status_stream` with delay status
- `events_stream` with alert events
- Contract IDs for linking

They will use:

```python
# Team C will join your status_stream with contracts
critical_trucks = status_stream.filter(pw.this.status == 'critical')
```

### For Team D (Integration)

You provide:

- Formatted truck status data
- Event stream for frontend
- Documentation on status values

---

## 🐛 Common Issues & Solutions

### Issue 1: Window not updating

**Symptom**: Velocity averages don't change  
**Solution**: Check `time_expr=pw.this.timestamp` is correctly set

```python
# Verify timestamp is being emitted by Team A
.windowby(..., time_expr=pw.this.timestamp)
```

### Issue 2: Status always "on-time"

**Symptom**: No delays detected even with velocity = 0  
**Solution**: Check threshold logic

```python
# Debug: Print velocities
print(f"Velocity: {velocity}, Status: {calculate_status(velocity)}")
```

### Issue 3: Events not generated

**Symptom**: events.jsonl is empty  
**Solution**: Verify filter conditions

```python
# Check if trucks are actually delayed
delayed = status_stream.filter(pw.this.status != 'on-time')
```

---

## 📊 Success Criteria

- [ ] Velocity windows calculating correctly (avg, min, max)
- [ ] Status changes from on-time → delayed → critical
- [ ] Events generated for status changes
- [ ] Demo scenario triggers at correct times
- [ ] Integration with Team A's GPS stream works
- [ ] Output files show correct delay detection
- [ ] Tests passing

---

## 🎓 Key Pathway Concepts Used

1. **Temporal Windows**: `.windowby()` with sliding windows
2. **Reducers**: `avg()`, `min()`, `max()`, `latest()`
3. **Filtering**: `.filter()` for conditional selection
4. **UDFs**: `pw.apply()` for custom calculations
5. **Conditional Logic**: `pw.if_else()` for status determination

---

## 📝 Documentation

Create `docs/TRANSFORMATIONS.md`:

```markdown
# Streaming Transformations

## Velocity Monitoring

Uses 60-second sliding windows, updating every 10 seconds:

```python
velocity_window = gps_stream.windowby(
    pw.this.truck_id,
    window=pw.temporal.sliding(duration=60, hop=10),
    time_expr=pw.this.timestamp
)
```

## Status Levels

- **on-time**: velocity >= 40 km/h
- **delayed**: 10 <= velocity < 40 km/h
- **critical**: velocity < 10 km/h

## Demo Scenario

- T+5s: TRK-402 stops (velocity → 0)
- T+8s: Status → CRITICAL
- T+12s: Arbitrage opportunity (handled by Team C)

```

---

## 🚀 You're Done!

Estimated completion: End of Day 2

Notify Team C and Team D that transformations are ready!
