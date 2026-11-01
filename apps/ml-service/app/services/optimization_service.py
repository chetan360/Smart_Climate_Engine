from itertools import combinations

from app.schemas.optimization import (
    OptimizationRequest,
    OptimizationResponse,
    OptimizedCombination,
)
from app.schemas.scenario import Scenario


class OptimizationService:


    def optimize(self, request: OptimizationRequest) -> OptimizationResponse:
        scenarios = request.scenarios
        budget = request.structured_query.budget
        currency = request.structured_query.currency or "INR"
        priorities = [
            p.lower()
            for p in (request.structured_query.priorities or [])
        ]

        # ---------------------------------------------------------
        # 1. Calculate optimization weights
        # ---------------------------------------------------------

        weights = {
            "flood": 0.35,
            "groundwater": 0.25,
            "environmental": 0.20,
            "cost": 0.10,
            "implementation": 0.10,
        }

        self._apply_priority_adjustments(weights, priorities)

        # Make sure weights are valid and sum to 1.
        weights = self._normalize_weights(weights)

        # ---------------------------------------------------------
        # 2. Generate combinations
        # ---------------------------------------------------------

        all_combinations = []

        for size in range(1, min(3, len(scenarios)) + 1):
            for combo in combinations(scenarios, size):

                total_cost = sum(
                    scenario.estimated_cost
                    for scenario in combo
                )

                # Skip combinations above budget
                if budget is not None and total_cost > budget:
                    continue

                metrics = self._calculate_combined_metrics(combo)

                cost_score = self._calculate_cost_score(
                    total_cost,
                    budget,
                )

                implementation_score = self._calculate_implementation_score(
                    metrics["implementation_time_months"]
                )

                optimization_score = (
                    metrics["flood_reduction"] * weights["flood"]
                    + metrics["groundwater_benefit"] * weights["groundwater"]
                    + (100 - metrics["environmental_impact"]) * weights["environmental"]
                    + cost_score * weights["cost"]
                    + implementation_score * weights["implementation"]
                )

                combination_id = self._generate_combination_id(
                    combo,
                    all_combinations,
                )

                reason = self._generate_reason(
                    combo=combo,
                    total_cost=total_cost,
                    metrics=metrics,
                    optimization_score=optimization_score,
                    budget=budget,
                    priorities=priorities,
                )

                all_combinations.append(
                    OptimizedCombination(
                        combination_id=combination_id,
                        scenario_ids=[
                            scenario.id
                            for scenario in combo
                        ],
                        scenario_names=[
                            scenario.name
                            for scenario in combo
                        ],
                        total_cost=round(total_cost, 2),
                        currency=currency,
                        estimated_flood_risk_reduction_percentage=round(
                            metrics["flood_reduction"],
                            2,
                        ),
                        groundwater_recharge_benefit_percentage=round(
                            metrics["groundwater_benefit"],
                            2,
                        ),
                        environmental_impact_score=round(
                            metrics["environmental_impact"],
                            2,
                        ),
                        implementation_time_months=metrics[
                            "implementation_time_months"
                        ],
                        optimization_score=round(
                            optimization_score,
                            2,
                        ),
                        recommendation_reason=reason,
                        is_mock_estimate=True,
                    )
                )

        # ---------------------------------------------------------
        # 3. Sort by optimization score
        # ---------------------------------------------------------

        all_combinations.sort(
            key=lambda combination: combination.optimization_score,
            reverse=True,
        )

        # Return top 5
        recommended = all_combinations[:5]

        return OptimizationResponse(
            region=request.structured_query.region or "Unknown",
            problem_type=request.risk_analysis.problem_type,
            budget=budget,
            currency=currency,
            combinations_evaluated=len(all_combinations),

            optimization_weights={
                key: round(value, 4)
                for key, value in weights.items()
            },

            recommended_combinations=recommended,

            optimization_method=(
                "Weighted multi-objective optimization with "
                "diminishing-return intervention effects"
            ),

            is_mock_data=True,
        )

    # =============================================================
    # COMBINED INTERVENTION EFFECTS
    # =============================================================

    def _calculate_combined_metrics(
        self,
        combo: tuple[Scenario, ...],
    ) -> dict:

        # ---------------------------------------------------------
        # Flood reduction
        #
        # Instead of:
        #
        # 35 + 20 + 30 = 85
        #
        # use diminishing returns:
        #
        # combined = 1 - (1-a)(1-b)(1-c)
        #
        # This models overlapping effects.
        # ---------------------------------------------------------

        flood_remaining = 1.0

        for scenario in combo:
            reduction = (
                scenario.estimated_flood_risk_reduction_percentage
                / 100
            )

            flood_remaining *= (1 - reduction)

        flood_reduction = (1 - flood_remaining) * 100

        # ---------------------------------------------------------
        # Groundwater benefit
        #
        # Same diminishing-return principle.
        # ---------------------------------------------------------

        groundwater_remaining = 1.0

        for scenario in combo:
            benefit = (
                scenario.groundwater_recharge_benefit_percentage
                / 100
            )

            groundwater_remaining *= (1 - benefit)

        groundwater_benefit = (
            1 - groundwater_remaining
        ) * 100

        # ---------------------------------------------------------
        # Environmental impact
        #
        # We use weighted average based on intervention count.
        # ---------------------------------------------------------

        environmental_impact = (
            sum(
                scenario.environmental_impact_score
                for scenario in combo
            )
            / len(combo)
        )

        # ---------------------------------------------------------
        # Implementation time
        #
        # For now, assume interventions can be partially parallelized.
        # The longest intervention determines the overall duration.
        # ---------------------------------------------------------

        implementation_time = max(
            scenario.implementation_time_months
            for scenario in combo
        )

        return {
            "flood_reduction": min(100, flood_reduction),
            "groundwater_benefit": min(100, groundwater_benefit),
            "environmental_impact": min(100, environmental_impact),
            "implementation_time_months": implementation_time,
        }

    # =============================================================
    # COST SCORE
    # =============================================================

    def _calculate_cost_score(
        self,
        total_cost: float,
        budget: float | None,
    ) -> float:

        if budget is None or budget <= 0:
            return 50.0

        budget_usage = total_cost / budget

        # A solution using 10% of budget gets 90.
        # A solution using 100% gets 0.
        score = (1 - budget_usage) * 100

        return max(0, min(100, score))

    # =============================================================
    # IMPLEMENTATION SCORE
    # =============================================================

    def _calculate_implementation_score(
        self,
        implementation_time_months: int,
    ) -> float:

        # 36 months is treated as the upper reference point.
        score = (
            1
            - implementation_time_months / 36
        ) * 100

        return max(0, min(100, score))

    # =============================================================
    # PRIORITIES
    # =============================================================
    
    def _apply_priority_adjustments(
        self,
        weights: dict,
        priorities: list[str],
    ):

        priority_text = " ".join(priorities)

        # Stronger emphasis for explicitly requested priorities.
        if (
            "flood" in priority_text
            or "flood reduction" in priority_text
        ):
            weights["flood"] += 0.15

        if (
            "groundwater" in priority_text
            or "water" in priority_text
        ):
            weights["groundwater"] += 0.15

        if (
            "environment" in priority_text
            or "sustainable" in priority_text
            or "low impact" in priority_text
        ):
            weights["environmental"] += 0.15

        if (
            "cost" in priority_text
            or "budget" in priority_text
            or "low cost" in priority_text
        ):
            weights["cost"] += 0.15

        if (
            "fast" in priority_text
            or "quick" in priority_text
            or "short term" in priority_text
        ):
            weights["implementation"] += 0.15

    # =============================================================
    # NORMALIZE WEIGHTS
    # =============================================================

    def _normalize_weights(self, weights: dict) -> dict:

        # Prevent negative values
        for key in weights:
            weights[key] = max(0.01, weights[key])

        total = sum(weights.values())

        return {
            key: value / total
            for key, value in weights.items()
        }

    # =============================================================
    # COMBINATION ID
    # =============================================================

    def _generate_combination_id(
        self,
        combo: tuple[Scenario, ...],
        existing: list,
    ) -> str:

        number = len(existing) + 1

        return f"combination-{number:03d}"

    # =============================================================
    # EXPLANATION
    # =============================================================

    def _generate_reason(
        self,
        combo: tuple[Scenario, ...],
        total_cost: float,
        metrics: dict,
        optimization_score: float,
        budget: float | None,
        priorities: list[str],
    ) -> str:

        names = ", ".join(
            scenario.name
            for scenario in combo
        )

        reason = (
            f"The combination of {names} achieved an "
            f"optimization score of {optimization_score:.2f}/100. "
            f"It has an estimated total cost of "
            f"₹{total_cost:,.0f}, estimated flood-risk reduction "
            f"of {metrics['flood_reduction']:.1f}%, and estimated "
            f"groundwater-recharge benefit of "
            f"{metrics['groundwater_benefit']:.1f}%. "
            f"Its average environmental impact score is "
            f"{metrics['environmental_impact']:.1f}/100 and "
            f"estimated implementation time is "
            f"{metrics['implementation_time_months']} months."
        )

        if budget is not None:
            budget_percentage = (
                total_cost / budget
            ) * 100

            reason += (
                f" The combination uses approximately "
                f"{budget_percentage:.1f}% of the available budget."
            )

        if priorities:
            reason += (
                f" The optimization also considers the specified "
                f"priorities: {', '.join(priorities)}."
            )

        reason += (
            " These values are mock estimates and require "
            "real-world validation."
        )

        return reason

# service instance
optimization_service = OptimizationService()
