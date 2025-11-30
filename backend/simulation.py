"""
Supply Chain Simulation Engine
Generates realistic truck movements, delays, and events
"""

import asyncio
import random
import json
from datetime import datetime, timedelta
from typing import Dict, List, Tuple


class TruckSimulator:
    """Simulates realistic truck movements and events"""

    def __init__(self):
        self.trucks = self._initialize_trucks()
        self.events = []

    def _initialize_trucks(self) -> List[Dict]:
        """Initialize truck fleet with realistic data"""
        return [
            {
                "id": "TRK-402",
                "driver": "Priya Sharma",
                "cargoValue": 120000,
                "status": "on-time",
                "velocity": 68,
                "position": [73.7567, 18.4704],  # Pune starting point
                "destination": [72.8777, 19.0760],  # Mumbai
                "route": self._generate_route([73.7567, 18.4704], [72.8777, 19.0760]),
                "currentRouteIndex": 0,
                "contractId": "CNT-2024-001",
                "eta": (datetime.now() + timedelta(hours=3)).isoformat(),
            },
            {
                "id": "TRK-305",
                "driver": "Rajesh Kumar",
                "cargoValue": 85000,
                "status": "on-time",
                "velocity": 72,
                "position": [77.5946, 12.9716],  # Bangalore
                "destination": [78.4867, 17.3850],  # Hyderabad
                "route": self._generate_route([77.5946, 12.9716], [78.4867, 17.3850]),
                "currentRouteIndex": 0,
                "contractId": "CNT-2024-002",
                "eta": (datetime.now() + timedelta(hours=4)).isoformat(),
            },
            {
                "id": "TRK-518",
                "driver": "Amit Patel",
                "cargoValue": 95000,
                "status": "on-time",
                "velocity": 65,
                "position": [88.3639, 22.5726],  # Kolkata
                "destination": [85.8245, 20.2961],  # Bhubaneswar
                "route": self._generate_route([88.3639, 22.5726], [85.8245, 20.2961]),
                "currentRouteIndex": 0,
                "contractId": "CNT-2024-003",
                "eta": (datetime.now() + timedelta(hours=5)).isoformat(),
            }
        ]

    def _generate_route(self, start: List[float], end: List[float]) -> List[List[float]]:
        """Generate interpolated route points between start and end"""
        points = []
        steps = 20  # Number of waypoints

        for i in range(steps + 1):
            t = i / steps
            lon = start[0] + (end[0] - start[0]) * t
            lat = start[1] + (end[1] - start[1]) * t
            # Add small random variation for realistic paths
            lon += random.uniform(-0.01, 0.01)
            lat += random.uniform(-0.01, 0.01)
            points.append([lon, lat])

        return points

    def update_positions(self):
        """Update truck positions along their routes"""
        for truck in self.trucks:
            if truck["status"] == "on-time" and truck["velocity"] > 0:
                # Move truck along route
                if truck["currentRouteIndex"] < len(truck["route"]) - 1:
                    truck["currentRouteIndex"] += 1
                    truck["position"] = truck["route"][truck["currentRouteIndex"]]
                else:
                    # Reached destination, reset
                    truck["currentRouteIndex"] = 0
                    truck["position"] = truck["route"][0]

    def simulate_delay(self, truck_id: str, severity: str = "minor"):
        """Simulate a delay event for a specific truck"""
        for truck in self.trucks:
            if truck["id"] == truck_id:
                if severity == "critical":
                    truck["velocity"] = 0
                    truck["status"] = "critical"
                elif severity == "major":
                    truck["velocity"] = max(20, truck["velocity"] - 40)
                    truck["status"] = "delayed"
                else:
                    truck["velocity"] = max(40, truck["velocity"] - 20)
                    truck["status"] = "delayed"

                self.events.append({
                    "id": f"evt-{datetime.now().timestamp()}",
                    "timestamp": datetime.now().isoformat(),
                    "type": "alert",
                    "severity": severity,
                    "message": f"{truck_id} - Delay detected. Speed: {truck['velocity']} km/h",
                    "truckId": truck_id
                })
                break

    def resolve_delay(self, truck_id: str):
        """Resolve a delay for a specific truck"""
        for truck in self.trucks:
            if truck["id"] == truck_id:
                truck["velocity"] = random.randint(60, 75)
                truck["status"] = "on-time"

                self.events.append({
                    "id": f"evt-{datetime.now().timestamp()}",
                    "timestamp": datetime.now().isoformat(),
                    "type": "success",
                    "severity": "info",
                    "message": f"{truck_id} - Issue resolved. Resuming normal speed.",
                    "truckId": truck_id
                })
                break

    def get_state(self) -> Dict:
        """Get current simulation state"""
        return {
            "trucks": self.trucks,
            "events": self.events[-10:],  # Last 10 events
            "timestamp": datetime.now().isoformat()
        }

    def add_event(self, event_type: str, message: str, truck_id: str = None):
        """Add a custom event to the event log"""
        self.events.append({
            "id": f"evt-{datetime.now().timestamp()}",
            "timestamp": datetime.now().isoformat(),
            "type": event_type,
            "severity": "info",
            "message": message,
            "truckId": truck_id
        })


class ScenarioEngine:
    """Orchestrates predefined scenarios for demo purposes"""

    def __init__(self, simulator: TruckSimulator):
        self.simulator = simulator
        self.scenarios = []

    def add_scenario(self, delay: float, action: callable):
        """Add a timed scenario"""
        self.scenarios.append({
            "delay": delay,
            "action": action,
            "executed": False
        })

    async def run_scenarios(self):
        """Execute scenarios based on timing"""
        start_time = datetime.now()

        while True:
            current_time = datetime.now()
            elapsed = (current_time - start_time).total_seconds()

            for scenario in self.scenarios:
                if not scenario["executed"] and elapsed >= scenario["delay"]:
                    scenario["action"]()
                    scenario["executed"] = True

            await asyncio.sleep(1)


def create_demo_scenarios(simulator: TruckSimulator) -> ScenarioEngine:
    """Create the demo scenario timeline"""
    engine = ScenarioEngine(simulator)

    # T+0s: Initialize
    engine.add_scenario(0, lambda: simulator.add_event(
        "system", "🚀 Supply Chain Agent initialized", None
    ))

    # T+5s: TRK-402 stops
    engine.add_scenario(5, lambda: simulator.simulate_delay("TRK-402", "critical"))

    # T+8s: Escalate to critical
    engine.add_scenario(8, lambda: simulator.add_event(
        "alert", "⚠️ TRK-402 CRITICAL - SLA threshold exceeded", "TRK-402"
    ))

    return engine


if __name__ == "__main__":
    # Test simulation
    sim = TruckSimulator()
    print("Initial State:")
    print(json.dumps(sim.get_state(), indent=2))

    sim.update_positions()
    sim.simulate_delay("TRK-402", "critical")

    print("\nAfter Delay:")
    print(json.dumps(sim.get_state(), indent=2))
