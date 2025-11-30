"""
AI-Powered Contract Analysis using OpenAI
Analyzes contracts, calculates penalties, and finds arbitrage opportunities
"""

import os
import json
from typing import Dict, Optional
from datetime import datetime, timedelta
from openai import OpenAI


class ContractAnalyzer:
    """Analyzes supply chain contracts and calculates financial impacts"""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            print("⚠️  WARNING: OpenAI API key not found. Using mock responses.")
            self.client = None
        else:
            self.client = OpenAI(api_key=self.api_key)

        # In-memory contract database
        self.contracts = {
            "CNT-2024-001": {
                "id": "CNT-2024-001",
                "client": "TechCorp India Pvt Ltd",
                "route": "Pune to Mumbai",
                "cargoValue": 120000,
                "deliveryDeadline": (datetime.now() + timedelta(hours=3)).isoformat(),
                "penaltyPerHour": 500,
                "maxPenalty": 2500,
                "terms": "Delivery must be completed within 3 hours. Penalty of $500/hour for delays up to 5 hours. Maximum penalty capped at $2,500."
            },
            "CNT-2024-002": {
                "id": "CNT-2024-002",
                "client": "PharmaCare Ltd",
                "route": "Bangalore to Hyderabad",
                "cargoValue": 85000,
                "deliveryDeadline": (datetime.now() + timedelta(hours=4)).isoformat(),
                "penaltyPerHour": 400,
                "maxPenalty": 2000,
                "terms": "Temperature-controlled delivery within 4 hours. $400/hour penalty for delays."
            },
            "CNT-2024-003": {
                "id": "CNT-2024-003",
                "client": "AutoParts Express",
                "route": "Kolkata to Bhubaneswar",
                "cargoValue": 95000,
                "deliveryDeadline": (datetime.now() + timedelta(hours=5)).isoformat(),
                "penaltyPerHour": 350,
                "maxPenalty": 1750,
                "terms": "Standard delivery in 5 hours. $350/hour penalty applies."
            }
        }

        # Spot market alternatives
        self.spot_market = [
            {
                "provider": "QuickFreight India",
                "baseCost": 800,
                "eta": "45 minutes",
                "availability": "high"
            },
            {
                "provider": "RapidLogistics",
                "baseCost": 950,
                "eta": "30 minutes",
                "availability": "medium"
            },
            {
                "provider": "ExpressHaul Services",
                "baseCost": 1100,
                "eta": "20 minutes",
                "availability": "low"
            }
        ]

    def get_contract(self, contract_id: str) -> Optional[Dict]:
        """Retrieve contract details"""
        return self.contracts.get(contract_id)

    def calculate_penalty(self, contract_id: str, delay_hours: float) -> Dict:
        """Calculate penalty for a given delay"""
        contract = self.get_contract(contract_id)
        if not contract:
            return {"error": "Contract not found"}

        penalty_per_hour = contract["penaltyPerHour"]
        max_penalty = contract["maxPenalty"]

        calculated_penalty = min(penalty_per_hour * delay_hours, max_penalty)

        return {
            "contractId": contract_id,
            "delayHours": delay_hours,
            "penaltyPerHour": penalty_per_hour,
            "calculatedPenalty": calculated_penalty,
            "maxPenalty": max_penalty,
            "terms": contract["terms"]
        }

    def find_spot_market_solution(self, location: str, destination: str) -> Dict:
        """Find the best spot market alternative"""
        # For demo, return the cheapest option
        best_option = min(self.spot_market, key=lambda x: x["baseCost"])

        return {
            "provider": best_option["provider"],
            "cost": best_option["baseCost"],
            "eta": best_option["eta"],
            "availability": best_option["availability"]
        }

    def analyze_arbitrage_opportunity(self, truck_id: str, contract_id: str, delay_hours: float = 2.5) -> Dict:
        """
        Analyze if there's an arbitrage opportunity
        Returns comparison of paying penalty vs booking alternative
        """
        penalty_info = self.calculate_penalty(contract_id, delay_hours)
        spot_solution = self.find_spot_market_solution("Pune", "Mumbai")

        if penalty_info.get("error"):
            return penalty_info

        penalty_cost = penalty_info["calculatedPenalty"]
        solution_cost = spot_solution["cost"]
        net_savings = penalty_cost - solution_cost

        # Only recommend if savings are positive
        if net_savings > 0:
            return {
                "truckId": truck_id,
                "contractId": contract_id,
                "projectedPenalty": penalty_cost,
                "solutionType": f"Relief Truck via {spot_solution['provider']}",
                "solutionCost": solution_cost,
                "netSavings": net_savings,
                "details": f"Deploy backup truck - ETA {spot_solution['eta']}",
                "recommendation": "EXECUTE",
                "confidence": 0.95
            }
        else:
            return {
                "truckId": truck_id,
                "contractId": contract_id,
                "projectedPenalty": penalty_cost,
                "recommendation": "WAIT",
                "reason": "No cost-effective alternative available"
            }

    async def ai_contract_analysis(self, contract_text: str, delay_scenario: str) -> Dict:
        """
        Use OpenAI to analyze contract and suggest solutions
        Falls back to rule-based if API key not available
        """
        if not self.client:
            # Mock response when no API key
            return {
                "analysis": "Contract parsed successfully (mock mode)",
                "penalty": 2500,
                "recommendation": "Book alternative truck",
                "confidence": 0.9
            }

        try:
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a supply chain financial analyst. Analyze contracts and calculate penalties."
                    },
                    {
                        "role": "user",
                        "content": f"""
                        Contract Terms: {contract_text}
                        
                        Scenario: {delay_scenario}
                        
                        Please analyze:
                        1. What is the penalty for this delay?
                        2. What alternatives should we consider?
                        3. What's the recommended action?
                        
                        Respond in JSON format with: penalty, alternatives, recommendation
                        """
                    }
                ],
                response_format={"type": "json_object"},
                temperature=0.3
            )

            result = json.loads(response.choices[0].message.content)
            return result

        except Exception as e:
            print(f"OpenAI API Error: {e}")
            return {
                "error": str(e),
                "analysis": "AI analysis failed, using fallback",
                "penalty": 2500
            }

    def get_contract_summary(self, contract_id: str) -> str:
        """Get a human-readable contract summary"""
        contract = self.get_contract(contract_id)
        if not contract:
            return "Contract not found"

        return f"""
Contract: {contract['id']}
Client: {contract['client']}
Route: {contract['route']}
Cargo Value: ${contract['cargoValue']:,}
Deadline: {contract['deliveryDeadline']}
Penalty: ${contract['penaltyPerHour']}/hour (max ${contract['maxPenalty']})
Terms: {contract['terms']}
        """.strip()


# Sample contract text for AI analysis
SAMPLE_CONTRACT_TEXT = """
LOGISTICS SERVICE AGREEMENT

Client: TechCorp India Pvt Ltd
Service Provider: ChainReaction Logistics

DELIVERY TERMS:
- Origin: Pune, Maharashtra
- Destination: Mumbai, Maharashtra  
- Expected Duration: 3 hours
- Cargo Value: $120,000

PENALTY CLAUSE:
In the event of delayed delivery, the Service Provider shall pay:
- $500 per hour for the first 5 hours of delay
- Maximum penalty capped at $2,500
- Penalties automatically deducted from invoice

FORCE MAJEURE:
Weather, natural disasters, and government-mandated closures exempt from penalties.
"""

if __name__ == "__main__":
    # Test contract analyzer
    analyzer = ContractAnalyzer()

    print("=== Contract Summary ===")
    print(analyzer.get_contract_summary("CNT-2024-001"))

    print("\n=== Penalty Calculation ===")
    penalty = analyzer.calculate_penalty("CNT-2024-001", 2.5)
    print(json.dumps(penalty, indent=2))

    print("\n=== Arbitrage Analysis ===")
    arbitrage = analyzer.analyze_arbitrage_opportunity("TRK-402", "CNT-2024-001", 2.5)
    print(json.dumps(arbitrage, indent=2))
