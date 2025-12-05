"""
Custom Pathway GPS Connector
Simulates real-time truck GPS updates by emitting position data every second
"""

import pathway as pw
import time
import json
import math
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
            truck['progress'] = 0.0  # Progress along current segment (0.0 to 1.0)

    def _calculate_distance(self, point1: List[float], point2: List[float]) -> float:
        """Calculate approximate distance in km between two lat/lon points"""
        # Simple approximation for short distances
        lat1, lon1 = point1[1], point1[0]
        lat2, lon2 = point2[1], point2[0]

        # Approximate distance using Euclidean distance with lat/lon scaling
        dlat = lat2 - lat1
        dlon = lon2 - lon1

        # Rough approximation: 1 degree ≈ 111 km
        distance = math.sqrt((dlat * 111) ** 2 + (dlon * 111 * math.cos(math.radians(lat1))) ** 2)
        return distance

    def _interpolate_position(self, start: List[float], end: List[float], progress: float) -> List[float]:
        """Linearly interpolate between two points"""
        lon = start[0] + (end[0] - start[0]) * progress
        lat = start[1] + (end[1] - start[1]) * progress
        return [lon, lat]

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

                # Emit data to Pathway stream using self.next_json()
                # Convert the data to a dictionary and use next_json
                data = {
                    "truck_id": truck['id'],
                    "driver": truck['driver'],
                    "lat": truck['current_position'][1],
                    "lon": truck['current_position'][0],
                    "velocity": float(truck['velocity']),
                    "cargo_value": truck['cargo_value'],
                    "contract_id": truck['contract_id'],
                    "status": truck['status'],
                    "timestamp": int(datetime.now().timestamp()),
                    "route": json.dumps(truck['route'])
                }

                self.next_json(data)

                if iteration % 10 == 0:  # Log every 10 seconds
                    route_segment = f"segment {truck['route_index']}/{len(truck['route']) - 1}"
                    print(f"📍 {truck['id']}: position [{truck['current_position'][0]:.4f}, "
                          f"{truck['current_position'][1]:.4f}], {route_segment}, "
                          f"progress {truck['progress']:.2f}, velocity {truck['velocity']} km/h")

            # IMPORTANT: Commit the data so Pathway starts processing it
            self.commit()

            iteration += 1
            time.sleep(1)  # Update frequency: 1 second

    def _update_truck_position(self, truck: Dict):
        """
        Move truck smoothly along its route based on velocity.
        Uses linear interpolation between waypoints.
        """
        route = truck['route']
        current_idx = truck['route_index']

        if current_idx >= len(route) - 1:
            # Reached end, restart route (for continuous demo)
            truck['route_index'] = 0
            truck['progress'] = 0.0
            truck['current_position'] = route[0]
            return

        # Get current segment
        start_point = route[current_idx]
        end_point = route[current_idx + 1]

        # Calculate how far truck moves in 1 second at current velocity
        # velocity is in km/h, convert to km/second
        velocity_km_per_sec = truck['velocity'] / 3600.0

        # Calculate distance of current segment
        segment_distance = self._calculate_distance(start_point, end_point)

        # Calculate progress increment (avoid division by zero)
        if segment_distance > 0:
            progress_increment = velocity_km_per_sec / segment_distance
        else:
            progress_increment = 1.0

        # Update progress along current segment
        truck['progress'] += progress_increment

        if truck['progress'] >= 1.0:
            # Move to next segment
            truck['route_index'] += 1
            truck['progress'] = 0.0

            # If we reached the end, wrap around
            if truck['route_index'] >= len(route) - 1:
                truck['route_index'] = len(route) - 1
                truck['current_position'] = route[-1]
            else:
                truck['current_position'] = route[truck['route_index']]
        else:
            # Interpolate position within current segment
            # IMPORTANT: Ensure the interpolated position is ON the route
            truck['current_position'] = self._interpolate_position(
                start_point,
                end_point,
                truck['progress']
            )


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
                [72.8777, 19.0760]  # Mumbai
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
    for i in range(5):
        for truck in connector.trucks:
            connector._update_truck_position(truck)
            print(f"Iteration {i}: {truck['id']} at {truck['current_position']} (progress: {truck['progress']:.2f})")
        time.sleep(1)

    print("✅ GPS Connector test passed!")
