from app.schemas.environmental_data import EnvironmentalDataset
from app.schemas.query import StructuredQuery
from app.schemas.risk_analysis import RiskAnalysisResult
from app.schemas.scenario import (
    InterventionType,
    Scenario,
    ScenarioGenerationResponse,
)


class ScenarioEngineService:

    def generate_scenarios(
        self,
        structured_query: StructuredQuery,
        environmental_data: EnvironmentalDataset,
        risk_analysis: RiskAnalysisResult,
    ) -> ScenarioGenerationResponse:

        if structured_query.problem_type.value == "flooding":
            scenarios = self._generate_flooding_scenarios(
                structured_query=structured_query,
                environmental_data=environmental_data,
                risk_analysis=risk_analysis,
            )
        else:
            scenarios = self._generate_general_scenarios()

        return ScenarioGenerationResponse(
            region=environmental_data.region,
            problem_type=structured_query.problem_type.value,
            scenarios=scenarios,
            is_mock_data=True,
        )

    def _generate_flooding_scenarios(
        self,
        structured_query: StructuredQuery,
        environmental_data: EnvironmentalDataset,
        risk_analysis: RiskAnalysisResult,
    ) -> list[Scenario]:

        drainage = environmental_data.drainage
        land_use = environmental_data.land_use

        scenarios: list[Scenario] = []

        # -------------------------------------------------
        # Scenario 1: Drainage expansion
        # -------------------------------------------------
        drainage_gap = max(
            drainage.estimated_peak_runoff_m3_per_hour
            - drainage.drainage_capacity_m3_per_hour,
            0,
        )

        drainage_expansion_cost = max(
            drainage_gap * 25000,
            1000000,
        )

        scenarios.append(
            Scenario(
                id="scenario-001",
                name="Drainage Capacity Expansion",
                intervention_type=InterventionType.DRAINAGE_EXPANSION,
                description=(
                    "Increase drainage capacity by upgrading existing drains "
                    "and constructing additional stormwater channels."
                ),
                estimated_cost=round(drainage_expansion_cost, 2),
                estimated_flood_risk_reduction_percentage=35,
                groundwater_recharge_benefit_percentage=5,
                environmental_impact_score=45,
                implementation_time_months=18,
                advantages=[
                    "Can reduce surface-water accumulation",
                    "Useful during intense rainfall events",
                    "Can address insufficient drainage capacity",
                ],
                limitations=[
                    "High construction cost",
                    "May reduce natural groundwater infiltration",
                    "Requires land and road excavation",
                ],
            )
        )

        # -------------------------------------------------
        # Scenario 2: Drainage maintenance
        # -------------------------------------------------
        maintenance_cost = max(
            drainage.blocked_drainage_percentage * 50000,
            200000,
        )

        scenarios.append(
            Scenario(
                id="scenario-002",
                name="Drainage Cleaning and Maintenance",
                intervention_type=InterventionType.DRAINAGE_MAINTENANCE,
                description=(
                    "Clean blocked drains, remove waste, repair damaged sections, "
                    "and introduce regular maintenance schedules."
                ),
                estimated_cost=round(maintenance_cost, 2),
                estimated_flood_risk_reduction_percentage=18,
                groundwater_recharge_benefit_percentage=2,
                environmental_impact_score=10,
                implementation_time_months=3,
                advantages=[
                    "Relatively low cost",
                    "Can be implemented quickly",
                    "Improves existing infrastructure",
                ],
                limitations=[
                    "Does not significantly increase total drainage capacity",
                    "Requires recurring maintenance",
                    "May have limited impact during extreme rainfall",
                ],
            )
        )

        # -------------------------------------------------
        # Scenario 3: Rainwater harvesting
        # -------------------------------------------------
        scenarios.append(
            Scenario(
                id="scenario-003",
                name="Community Rainwater Harvesting",
                intervention_type=InterventionType.RAINWATER_HARVESTING,
                description=(
                    "Install rooftop rainwater collection and recharge systems "
                    "in residential, commercial, and public buildings."
                ),
                estimated_cost=2500000,
                estimated_flood_risk_reduction_percentage=15,
                groundwater_recharge_benefit_percentage=75,
                environmental_impact_score=8,
                implementation_time_months=8,
                advantages=[
                    "Improves groundwater recharge",
                    "Reduces runoff from rooftops",
                    "Can support local water security",
                ],
                limitations=[
                    "Requires building-owner participation",
                    "Needs regular cleaning",
                    "Effectiveness depends on rainfall and soil conditions",
                ],
            )
        )

        # -------------------------------------------------
        # Scenario 4: Permeable pavement
        # -------------------------------------------------
        scenarios.append(
            Scenario(
                id="scenario-004",
                name="Permeable Pavement and Infiltration Zones",
                intervention_type=InterventionType.PERMEABLE_PAVEMENT,
                description=(
                    "Replace selected conventional paved surfaces with permeable "
                    "materials that allow rainfall to infiltrate into the soil."
                ),
                estimated_cost=6000000,
                estimated_flood_risk_reduction_percentage=22,
                groundwater_recharge_benefit_percentage=65,
                environmental_impact_score=15,
                implementation_time_months=12,
                advantages=[
                    "Reduces surface runoff",
                    "Improves groundwater infiltration",
                    "Can be applied to parking areas and footpaths",
                ],
                limitations=[
                    "Not suitable for every soil type",
                    "Requires periodic maintenance",
                    "May have lower effectiveness during saturated soil conditions",
                ],
            )
        )

        # -------------------------------------------------
        # Scenario 5: Bioswales
        # -------------------------------------------------
        scenarios.append(
            Scenario(
                id="scenario-005",
                name="Bioswales and Rain Gardens",
                intervention_type=InterventionType.BIOSWALES,
                description=(
                    "Construct vegetated drainage channels and rain gardens to "
                    "slow runoff, filter pollutants, and improve infiltration."
                ),
                estimated_cost=4500000,
                estimated_flood_risk_reduction_percentage=20,
                groundwater_recharge_benefit_percentage=70,
                environmental_impact_score=7,
                implementation_time_months=10,
                advantages=[
                    "Supports natural water management",
                    "Improves groundwater recharge",
                    "Can improve urban biodiversity",
                    "May reduce water pollution",
                ],
                limitations=[
                    "Requires suitable open space",
                    "Needs vegetation maintenance",
                    "Performance depends on correct design",
                ],
            )
        )

        # -------------------------------------------------
        # Scenario 6: Retention pond
        # -------------------------------------------------
        scenarios.append(
            Scenario(
                id="scenario-006",
                name="Stormwater Retention Pond",
                intervention_type=InterventionType.RETENTION_POND,
                description=(
                    "Create a stormwater storage area that temporarily holds excess "
                    "runoff and releases it gradually."
                ),
                estimated_cost=12000000,
                estimated_flood_risk_reduction_percentage=30,
                groundwater_recharge_benefit_percentage=45,
                environmental_impact_score=20,
                implementation_time_months=20,
                advantages=[
                    "Stores excess stormwater",
                    "Can reduce peak runoff",
                    "May provide ecological benefits",
                ],
                limitations=[
                    "Requires significant land",
                    "High construction cost",
                    "Needs safety and water-quality management",
                ],
            )
        )

        # -------------------------------------------------
        # Scenario 7: Urban green spaces
        # -------------------------------------------------
        scenarios.append(
            Scenario(
                id="scenario-007",
                name="Urban Green Spaces and Tree Corridors",
                intervention_type=InterventionType.URBAN_GREEN_SPACE,
                description=(
                    "Increase vegetation through parks, tree corridors, green areas, "
                    "and small urban infiltration zones."
                ),
                estimated_cost=3500000,
                estimated_flood_risk_reduction_percentage=12,
                groundwater_recharge_benefit_percentage=55,
                environmental_impact_score=5,
                implementation_time_months=14,
                advantages=[
                    "Improves urban cooling",
                    "Supports biodiversity",
                    "Improves infiltration",
                    "Creates public recreational spaces",
                ],
                limitations=[
                    "Requires available land",
                    "Benefits develop gradually",
                    "Needs long-term maintenance",
                ],
            )
        )

        return self._filter_by_budget(
            scenarios=scenarios,
            budget=structured_query.budget,
        )

    def _filter_by_budget(
        self,
        scenarios: list[Scenario],
        budget: float | None,
    ) -> list[Scenario]:

        if budget is None or budget <= 0:
            return scenarios

        affordable_scenarios = [
            scenario
            for scenario in scenarios
            if scenario.estimated_cost <= budget
        ]

        # Always return at least one scenario for the MVP.
        if not affordable_scenarios:
            return sorted(
                scenarios,
                key=lambda scenario: scenario.estimated_cost,
            )[:1]

        return affordable_scenarios

    def _generate_general_scenarios(self) -> list[Scenario]:

        return [
            Scenario(
                id="scenario-general-001",
                name="Environmental Data Collection",
                intervention_type=InterventionType.URBAN_GREEN_SPACE,
                description=(
                    "Collect more detailed environmental and infrastructure "
                    "data before selecting a specific intervention."
                ),
                estimated_cost=500000,
                estimated_flood_risk_reduction_percentage=0,
                groundwater_recharge_benefit_percentage=0,
                environmental_impact_score=0,
                implementation_time_months=2,
                advantages=[
                    "Improves future decision quality",
                    "Identifies missing information",
                ],
                limitations=[
                    "Does not directly reduce environmental risk",
                    "Requires further analysis",
                ],
            )
        ]


scenario_engine_service = ScenarioEngineService()