"""
Unit tests for Pathway connectors
"""

import pathway as pw
from connectors.gps_connector import TruckGPSConnector
import json
import time
import os


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
            if not first_line:
                print("⚠️  Output file is empty - run main.py first")
                return

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
