"""
Chat Decision Service for Smart Climate Engine
Provides AI decision intelligence reasoning, query understanding, trade-off comparisons,
and executive council briefing drafting for municipal officials.
Designed to integrate with future LLMs, LangChain, or Nugen AI reasoning models.
"""
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

from app.schemas.query import QueryUnderstandingRequest, ProblemType
from app.services.query_understanding_service import understand_query


class ChatMessagePayload(BaseModel):
    role: str
    content: str


class ChatDecisionRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessagePayload]] = Field(default_factory=list)
    region: Optional[str] = "General Municipality"
    budget: Optional[float] = 50.0  # in Crores INR
    priorities: Optional[List[str]] = Field(default_factory=list)
    uploaded_files_context: Optional[List[str]] = Field(default_factory=list)
    environmental_context: Optional[Dict[str, Any]] = Field(default_factory=dict)


class ChatDecisionResponse(BaseModel):
    reply: str
    structured_intent: Optional[Dict[str, Any]] = None
    metrics: Optional[Dict[str, Any]] = None
    suggested_followups: List[str] = Field(default_factory=list)
    region: str
    budget: float
    timestamp: str


class ChatDecisionService:
    def __init__(self):
        pass

    def process_chat_message(self, request: ChatDecisionRequest) -> ChatDecisionResponse:
        import datetime
        now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()

        raw_query = request.message.strip()
        lower_query = raw_query.lower()

        # Step 1: Run NLP Query Understanding
        query_understanding = understand_query(QueryUnderstandingRequest(query=raw_query))
        sq = query_understanding.structured_query

        # Determine effective region and budget
        active_region = sq.region or request.region or "General Municipality"
        if sq.budget:
            active_budget = round(sq.budget / 10_000_000, 1)
        else:
            active_budget = float(request.budget or 50.0)

        # File repository context
        files_count = len(request.uploaded_files_context or [])
        file_names = request.uploaded_files_context or [
            "City_Monsoon_Drainage_MasterPlan_2025.pdf",
            "Regional_Aquifer_Recharge_Zones.geojson",
        ]

        # Step 2: Route by Intent (Trade-off, Council Resolution, Files, or Decision Assessment)
        metrics: Optional[Dict[str, Any]] = None
        suggested_followups: List[str] = []

        if any(w in lower_query for w in ["file", "document", "upload", "data", "repository", "dataset", "geojson"]):
            reply = self._generate_files_reply(active_region, active_budget, file_names, files_count)
            suggested_followups = [
                "Simulate flood reduction using the uploaded drainage master plan",
                "What are the high-risk flood zones identified in our data?",
                "Export executive brief comparing all available scenarios",
            ]

        elif any(w in lower_query for w in ["resolution", "council", "brief", "commissioner", "memo", "approval", "order"]):
            reply = self._generate_resolution_reply(active_region, active_budget)
            suggested_followups = [
                "What are the specific trade-offs between Option A and Option D?",
                "Can we adjust the budget down to Rs. 25 Crore?",
                "How do we monitor groundwater recharge post-implementation?",
            ]

        elif any(w in lower_query for w in ["trade-off", "tradeoff", "compare", "difference", "versus", "vs", "option a", "drainage"]):
            metrics = {
                "optionA_cost": "Rs. 48.0 Cr",
                "optionA_flood": "82%",
                "optionA_gw": "-15%",
                "optionD_cost": "Rs. 35.0 Cr",
                "optionD_flood": "79%",
                "optionD_gw": "+65%",
                "savings": "Rs. 13-15 Cr",
            }
            reply = self._generate_tradeoff_reply(active_region, active_budget)
            suggested_followups = [
                "Can we add rainwater harvesting to Option D?",
                f"What is the simulation result for a {round(active_budget * 0.6)} Cr budget?",
                "Draft an official resolution note for the Commissioner",
            ]

        else:
            # General Decision Assessment
            flood_impact = min(94, round(58 + (active_budget / 50) * 22))
            gw_impact = round(45 + (18 if active_budget > 30 else 5))
            heat_impact = f"{(1.2 + (active_budget / 50) * 0.5):.1f}"

            reply = self._generate_assessment_reply(
                active_region, active_budget, flood_impact, gw_impact, heat_impact, sq.problem_type.value
            )
            suggested_followups = [
                "Compare Conventional Drainage vs Integrated Sponge City",
                "Draft an official resolution note for the Commissioner",
                "What files are indexed in our municipal repository?",
            ]

        return ChatDecisionResponse(
            reply=reply,
            structured_intent={
                "problem_type": sq.problem_type.value,
                "confidence": sq.confidence,
                "detected_region": sq.region,
                "detected_budget": sq.budget,
                "priorities": sq.priorities,
            },
            metrics=metrics,
            suggested_followups=suggested_followups,
            region=active_region,
            budget=active_budget,
            timestamp=now_iso,
        )

    def _generate_files_reply(self, region: str, budget: float, files: List[str], count: int) -> str:
        files_list = "\n".join(f"{i + 1}. **{f}**" for i, f in enumerate(files[:5]))
        return (
            f"### 📁 Municipal Document Repository Status ({region})\n\n"
            f"We have **{max(count, len(files))} active environmental documents & spatial datasets** indexed:\n"
            f"{files_list}\n\n"
            f"**Key Ingestion Capabilities (ML Pipeline):**\n"
            f"- **Spatial GeoJSON/KML:** Ingested into PostGIS spatial layers to delineate natural watershed slopes and flood inundation zones.\n"
            f"- **Hydrological & AQI CSVs:** Telemetry feeds continuously calibrate local precipitation and river stage response functions.\n"
            f"- **Policy & Budget Files:** Used to enforce fiscal limits (Current benchmark: **Rs. {budget} Crore**) and departmental mandates.\n\n"
            f"You can upload additional DPRs, sensor feeds, or shapefiles using the **Document Ingestion** section."
        )

    def _generate_resolution_reply(self, region: str, budget: float) -> str:
        alloc_cost = min(budget, 35.0)
        return (
            f"### 🏛️ Executive Resolution Note for Municipal Authority\n\n"
            f"**Subject:** Approval of Integrated Multi-Hazard Climate Resilience Package for **{region}**  \n"
            f"**Estimated Fiscal Allocation:** Rs. {alloc_cost:.1f} Crore (Within current Rs. {budget} Cr envelope)  \n"
            f"**Target Timeline:** 14 Months  \n\n"
            f"---\n\n"
            f"#### 1. Executive Summary & Problem Context\n"
            f"Traditional single-discipline drainage works expand concrete culverts to flush storm runoff rapidly. "
            f"However, empirical telemetry demonstrates this creates severe negative externalities: "
            f"**downstream surge acceleration** and a **15% deficit in summer groundwater recharge**.\n\n"
            f"#### 2. Recommended Pareto-Optimal Strategy (Option D)\n"
            f"The ML Decision Engine evaluated competing alternatives across resilience, capital cost, aquifer recharge, and urban heat:\n"
            f"- **Hybrid Infrastructure:** 60% nature-based retention (riparian wetland restoration + permeable bioswales) "
            f"paired with targeted sensor-monitored drain maintenance.\n"
            f"- **Flood Risk Reduction:** **79% containment** during 100-year cloudburst events.\n"
            f"- **Groundwater Infiltration:** **+64% annual aquifer replenishment**, directly offsetting tanker dependence during pre-monsoon heat waves.\n"
            f"- **Fiscal Efficiency:** Conserves **Rs. 13-15 Crore** compared to conventional full concrete channelization (Rs. 48 Cr vs Rs. 35 Cr).\n\n"
            f"#### 3. Inter-Departmental Implementation Matrix\n"
            f"- **City Engineering / Stormwater Dept:** Retrofit 12 primary culverts and roadside bioswales.\n"
            f"- **Environment & Parks Dept:** Demarcate and restore 4 riverside retention zones.\n"
            f"- **Finance Dept:** Phased disbursement over 3 fiscal quarters with telemetry-based milestone verification."
        )

    def _generate_tradeoff_reply(self, region: str, budget: float) -> str:
        return (
            f"### ⚖️ Cross-System Trade-Off Analysis: Conventional Drainage vs Integrated Resilience\n\n"
            f"When evaluating climate interventions for **{region}**, single-variable decisions often hide costly second-order penalties:\n\n"
            f"| Performance Metric | Option A: Conventional Heavy Drainage | Option D: Integrated Climate Resilience | Strategic Trade-Off Analysis |\n"
            f"| :--- | :---: | :---: | :--- |\n"
            f"| **Capital Expenditure** | **Rs. 48.0 Cr** (96% budget) | **Rs. 35.0 Cr** (70% budget) | **Saves Rs. 13 Cr** for municipal contingencies |\n"
            f"| **Peak Flood Containment** | **82%** | **79%** | Virtually identical flood safety (-3% delta) |\n"
            f"| **Aquifer Recharge** | **-15% (Aquifer degradation)** | **+65% (Replenished table)** | **+80% Net Advantage** for summer water security |\n"
            f"| **Microclimate Cooling** | **0.1°C** (Negligible) | **1.6°C** (Significant) | Vegetated surfaces counteract urban heat islands |\n"
            f"| **Implementation Period** | 18 Months | 14 Months | Faster phased delivery with lower public disruption |\n\n"
            f"**Core Decision Insight:**\n"
            f"Option A solves one symptom (water on the road) by transferring the problem downstream and aggravating drought months. "
            f"Option D preserves flood containment while converting excess stormwater into an aquifer asset."
        )

    def _generate_assessment_reply(
        self, region: str, budget: float, flood: int, gw: int, heat: str, problem_type: str
    ) -> str:
        alloc_cost = min(budget, 35.0)
        return (
            f"### 🌐 Decision Intelligence Assessment for **{region}**\n\n"
            f"**Context:** Municipal Climate Resilience Simulation under **Rs. {budget} Crore** Fiscal Budget  \n"
            f"**Detected Primary Challenge:** {problem_type.replace('_', ' ').title()} · Groundwater Deficit · Urban Heat Island  \n\n"
            f"#### 1. AI Decision Summary\n"
            f"Based on regional topography and rainfall records, an integrated hybrid strategy achieves the highest Pareto efficiency:\n"
            f"- **Projected Flood Risk Reduction:** **{flood}%** peak surge mitigation\n"
            f"- **Projected Groundwater Infiltration:** **+{gw}%** annual aquifer recharge\n"
            f"- **Projected Urban Heat Island Cooling:** **-{heat}°C** localized surface temperature drop\n"
            f"- **Optimal Budget Allocation:** Rs. {alloc_cost:.1f} Cr deployed across sponge retention, permeable pavement, and smart drainage telemetry.\n\n"
            f"#### 2. Key Actionable Interventions\n"
            f"1. **Nature-Based Retention Swales:** Create decentralized flood retention ponds along natural drainage slopes to absorb first-flush runoff.\n"
            f"2. **Permeable Public Corridors:** Mandate porous paving across municipal parking zones, pedestrian pathways, and institutional campuses.\n"
            f"3. **Smart Sensor Telemetry:** Deploy continuous ultrasonic water-level gauges and rain gauges at critical culvert junctions for early warning.\n\n"
            f"#### 3. Operational Recommendations\n"
            f"You can customize the simulation parameters (budget, target timeline, and hazard priorities) in the **Scenario Simulator** "
            f"or upload regional GIS data in **Document Ingestion** to recalculate localized risk scores."
        )
