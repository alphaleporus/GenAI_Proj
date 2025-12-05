"""
End-to-end integration tests for Team D
Tests the complete Pathway pipeline integration
"""

import subprocess
import time
import json
import os
import sys


def test_pipeline_starts():
    """Test that main.py starts without errors"""
    print("\n" + "=" * 60)
    print("TEST 1: Pipeline Startup")
    print("=" * 60)
    print("Testing pipeline startup...")

    # Start pipeline in background
    process = subprocess.Popen(
        [sys.executable, 'main.py'],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        cwd=os.path.dirname(os.path.dirname(__file__))
    )

    # Wait for startup
    time.sleep(5)

    # Check if running
    if process.poll() is None:
        print("✅ Pipeline started successfully")
        # Kill process
        process.terminate()
        process.wait()
        return True
    else:
        stdout, stderr = process.communicate()
        print(f"❌ Pipeline crashed: {stderr.decode()}")
        return False


def test_gps_output_generated():
    """Test that GPS data is being written"""
    print("\n" + "=" * 60)
    print("TEST 2: GPS Output Generation")
    print("=" * 60)
    print("Testing GPS output...")

    output_file = 'output/truck_status.jsonl'

    if not os.path.exists(output_file):
        print(f"❌ GPS output file not found: {output_file}")
        return False

    # Check file has data
    with open(output_file, 'r') as f:
        lines = f.readlines()
        if len(lines) == 0:
            print("❌ No data in GPS output")
            return False

        # Verify JSON is valid
        try:
            first_record = json.loads(lines[0])
            assert 'truck_id' in first_record, "Missing truck_id field"
            assert 'status' in first_record, "Missing status field"
            print(f"✅ GPS output valid ({len(lines)} records)")
            print(f"   Sample: {first_record['truck_id']} - {first_record['status']}")
            return True
        except Exception as e:
            print(f"❌ Invalid JSON in output: {e}")
            return False


def test_events_generated():
    """Test that events are being created"""
    print("\n" + "=" * 60)
    print("TEST 3: Event Generation")
    print("=" * 60)
    print("Testing event generation...")

    output_file = 'output/events.jsonl'

    if not os.path.exists(output_file):
        print(f"⚠️  Events file not created yet: {output_file}")
        return False

    with open(output_file, 'r') as f:
        lines = f.readlines()
        if len(lines) > 0:
            event = json.loads(lines[0])
            assert 'event_id' in event, "Missing event_id"
            assert 'message' in event, "Missing message"
            print(f"✅ Events test passed ({len(lines)} events)")
            print(f"   Sample: {event['message']}")
            return True
        else:
            print("⚠️  No events yet (may need more time)")
            return False


def test_arbitrage_output():
    """Test that arbitrage opportunities are calculated"""
    print("\n" + "=" * 60)
    print("TEST 4: Arbitrage Output")
    print("=" * 60)
    print("Testing arbitrage output...")

    output_file = 'output/arbitrage_opportunities.jsonl'

    if not os.path.exists(output_file):
        print(f"⚠️  Arbitrage file not created yet: {output_file}")
        return False

    with open(output_file, 'r') as f:
        lines = f.readlines()
        if len(lines) > 0:
            arb = json.loads(lines[0])
            assert 'truck_id' in arb, "Missing truck_id"
            assert 'arbitrage_analysis' in arb, "Missing arbitrage_analysis"

            # Parse nested analysis
            analysis = json.loads(arb['arbitrage_analysis'])
            print(f"✅ Arbitrage test passed ({len(lines)} opportunities)")
            print(f"   Truck: {arb['truck_id']}")
            print(f"   Savings: ${analysis.get('net_savings', 0)}")
            return True
        else:
            print("⚠️  No arbitrage opportunities yet")
            return False


def test_data_format_compatibility():
    """Test that output matches frontend expectations"""
    print("\n" + "=" * 60)
    print("TEST 5: Data Format Compatibility")
    print("=" * 60)
    print("Testing data format compatibility...")

    # Required fields for frontend Truck interface
    required_truck_fields = [
        'truck_id', 'driver', 'cargo_value', 'status',
        'current_velocity', 'contract_id', 'route'
    ]

    output_file = 'output/truck_status.jsonl'

    if not os.path.exists(output_file):
        print(f"❌ Output file not found: {output_file}")
        return False

    with open(output_file, 'r') as f:
        line = f.readline()
        if line:
            truck = json.loads(line)

            missing_fields = [f for f in required_truck_fields if f not in truck]
            if len(missing_fields) > 0:
                print(f"❌ Missing fields: {missing_fields}")
                return False

            print("✅ Data format compatibility test passed")
            print(f"   All required fields present")
            return True
        else:
            print("⚠️  No data to check yet")
            return False


def test_websocket_adapter():
    """Test that WebSocket adapter can be imported and initialized"""
    print("\n" + "=" * 60)
    print("TEST 6: WebSocket Adapter")
    print("=" * 60)
    print("Testing WebSocket adapter...")

    try:
        from adapters.websocket_output import WebSocketBroadcaster, create_websocket_output

        # Test initialization
        broadcaster = create_websocket_output('localhost', 8080)
        assert broadcaster.host == 'localhost'
        assert broadcaster.port == 8080

        # Test formatting functions
        sample_truck = {
            'truck_id': 'TRK-402',
            'driver': 'Test Driver',
            'cargo_value': 100000,
            'status': 'on-time',
            'current_velocity': 65.0,
            'current_lat': 18.5,
            'current_lon': 73.8,
            'contract_id': 'CNT-001',
            'route': '[[73.8, 18.5], [72.8, 19.0]]'
        }

        formatted = broadcaster.format_truck_for_frontend(sample_truck)
        assert 'id' in formatted
        assert 'position' in formatted
        assert 'cargoValue' in formatted

        print("✅ WebSocket adapter test passed")
        print(f"   Broadcaster initialized on {broadcaster.host}:{broadcaster.port}")
        print(f"   Data formatting working")
        return True

    except Exception as e:
        print(f"❌ WebSocket adapter test failed: {e}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """Run all integration tests"""
    print("\n" + "=" * 60)
    print("🧪 FleetFusion - Integration Tests (Team D)")
    print("=" * 60)
    print("\n⚠️  Make sure main.py has been run at least once to generate outputs!\n")

    results = {
        "Pipeline Startup": test_pipeline_starts(),
        "GPS Output": test_gps_output_generated(),
        "Events": test_events_generated(),
        "Arbitrage": test_arbitrage_output(),
        "Data Format": test_data_format_compatibility(),
        "WebSocket Adapter": test_websocket_adapter()
    }

    # Summary
    print("\n" + "=" * 60)
    print("📊 TEST SUMMARY")
    print("=" * 60)

    passed = sum(1 for v in results.values() if v)
    total = len(results)

    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {test_name}")

    print("\n" + "=" * 60)
    print(f"Results: {passed}/{total} tests passed")

    if passed == total:
        print("🎉 All integration tests passed!")
        print("=" * 60)
        return 0
    else:
        print("⚠️  Some tests failed or need more time")
        print("=" * 60)
        return 1


if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
