import uuid

from app.schemas.analysis import (
    AnalysisRequest,
    AnalysisResponse,
    Intervention,
)


def analyze_climate_problem(
    request: AnalysisRequest,
) -> AnalysisResponse:

    interventions = [
        Intervention(
            name="Drainage System Upgrade",
            estimated_cost=250000000,
            flood_risk_reduction=65.0,
            environmental_impact="Moderate",
            advantages=[
                "Improves water evacuation",
                "Reduces short-term flood risk",
            ],
            disadvantages=[
                "High construction cost",
                "May reduce natural water infiltration",
            ],
        ),
        Intervention(
            name="Wetland Restoration",
            estimated_cost=120000000,
            flood_risk_reduction=40.0,
            environmental_impact="Positive",
            advantages=[
                "Stores excess rainwater",
                "Improves groundwater recharge",
                "Supports biodiversity",
            ],
            disadvantages=[
                "Requires suitable land",
                "Needs long-term maintenance",
            ],
        ),
        Intervention(
            name="Permeable Roads and Green Infrastructure",
            estimated_cost=180000000,
            flood_risk_reduction=50.0,
            environmental_impact="Positive",
            advantages=[
                "Improves rainwater infiltration",
                "Reduces surface runoff",
                "Supports urban cooling",
            ],
            disadvantages=[
                "May require road reconstruction",
                "Needs regular maintenance",
            ],
        ),
    ]

    recommended_intervention = (
        "Wetland Restoration + Permeable Roads and Green Infrastructure"
    )

    return AnalysisResponse(
        analysis_id=str(uuid.uuid4()),
        region=request.region,
        identified_problem=request.problem,
        risk_summary=(
            "The region may have elevated flood vulnerability due to "
            "insufficient drainage capacity and high surface runoff."
        ),
        interventions=interventions,
        recommended_intervention=recommended_intervention,
        explanation=(
            "A combined nature-based and infrastructure-based solution "
            "may reduce flood risk while supporting groundwater recharge "
            "and long-term environmental resilience."
        ),
    )