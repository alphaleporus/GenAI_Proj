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
                return float(velocity)  # Other trucks unaffected

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

            return float(velocity)

        # Apply scenario modifications
        modified_stream = gps_stream.select(
            truck_id=pw.this.truck_id,
            driver=pw.this.driver,
            lat=pw.this.lat,
            lon=pw.this.lon,
            velocity=pw.apply(
                apply_demo_scenario,
                pw.this.truck_id,
                pw.this.velocity,
                pw.this.timestamp
            ),
            cargo_value=pw.this.cargo_value,
            contract_id=pw.this.contract_id,
            status=pw.this.status,
            timestamp=pw.this.timestamp,
            route=pw.this.route
        )

        return modified_stream


# Integration with main pipeline
def apply_demo_scenario(gps_stream: pw.Table, enable_demo: bool = True) -> pw.Table:
    """
    Wrap GPS stream with demo scenario logic.
    
    Use this in main.py to enable demo mode.
    
    Args:
        gps_stream: Original GPS stream
        enable_demo: Whether to enable demo scenario (default: True)
        
    Returns:
        Modified GPS stream (or original if demo disabled)
    """
    if not enable_demo:
        return gps_stream

    controller = DemoScenarioController()
    return controller.modify_velocity_for_demo(gps_stream)
