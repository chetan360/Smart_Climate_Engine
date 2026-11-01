from app.schemas.environmental_data import EnvironmentalDataset
from app.schemas.query import StructuredQuery
from app.schemas.risk_analysis import (
    RiskAnalysisResult,
    RiskFactor,
    RiskLevel,
)


class RiskAnalysisService:

    def analyze_risk(
        self,
        structured_query: StructuredQuery,
        environmental_data: EnvironmentalDataset,
    ) -> RiskAnalysisResult:

        problem_type = structured_query.problem_type.value
        region = environmental_data.region

        if problem_type == "flooding":
            return self._analyze_flooding_risk(
                structured_query,
                environmental_data,
            )

        return self._analyze_generic_risk(
            structured_query,
            environmental_data,
        )

    def _analyze_flooding_risk(
        self,
        structured_query: StructuredQuery,
        environmental_data: EnvironmentalDataset,
    ) -> RiskAnalysisResult:

        factors: list[RiskFactor] = []

        # -------------------------------------------------
        # Factor 1: Drainage pressure
        # -------------------------------------------------
        drainage = environmental_data.drainage

        if drainage.estimated_peak_runoff_m3_per_hour > 0:
            drainage_pressure = (
                drainage.estimated_peak_runoff_m3_per_hour
                / drainage.drainage_capacity_m3_per_hour
            ) * 100
        else:
            drainage_pressure = 0

        drainage_pressure_score = min(drainage_pressure, 100)

        if drainage_pressure_score >= 100:
            drainage_explanation = (
                "Estimated peak runoff exceeds available drainage capacity."
            )
        else:
            drainage_explanation = (
                "Estimated peak runoff is within the available drainage capacity."
            )

        factors.append(
            RiskFactor(
                name="Drainage pressure",
                contribution=round(drainage_pressure_score, 2),
                explanation=drainage_explanation,
            )
        )

        # -------------------------------------------------
        # Factor 2: Blocked drainage
        # -------------------------------------------------
        blocked_drainage_score = min(
            environmental_data.drainage.blocked_drainage_percentage,
            100,
        )

        factors.append(
            RiskFactor(
                name="Blocked drainage",
                contribution=round(blocked_drainage_score, 2),
                explanation=(
                    f"{environmental_data.drainage.blocked_drainage_percentage}% "
                    "of the drainage system is estimated to be blocked."
                ),
            )
        )

        # -------------------------------------------------
        # Factor 3: Historical flood frequency
        # -------------------------------------------------
        historical_floods = environmental_data.historical_floods

        if historical_floods:
            flood_count = sum(
                1
                for record in historical_floods
                if record.flood_occurred
            )

            historical_flood_score = (
                flood_count / len(historical_floods)
            ) * 100
        else:
            historical_flood_score = 0

        factors.append(
            RiskFactor(
                name="Historical flood frequency",
                contribution=round(historical_flood_score, 2),
                explanation=(
                    f"Flooding was recorded in {flood_count} out of "
                    f"{len(historical_floods)} available historical records."
                    if historical_floods
                    else "No historical flood records are available."
                ),
            )
        )

        # -------------------------------------------------
        # Factor 4: Impervious surface
        # -------------------------------------------------
        impervious_surface = (
            environmental_data.land_use.impervious_surface_percentage
        )

        impervious_surface_score = min(impervious_surface, 100)

        factors.append(
            RiskFactor(
                name="Impervious surface",
                contribution=round(impervious_surface_score, 2),
                explanation=(
                    f"{impervious_surface}% of the region is classified "
                    "as impervious surface, which can reduce infiltration."
                ),
            )
        )

        # -------------------------------------------------
        # Factor 5: Drainage coverage
        # -------------------------------------------------
        drainage_coverage_score = 100 - min(
            environmental_data.drainage.drainage_coverage_percentage,
            100,
        )

        factors.append(
            RiskFactor(
                name="Drainage coverage gap",
                contribution=round(drainage_coverage_score, 2),
                explanation=(
                    f"Drainage coverage is "
                    f"{environmental_data.drainage.drainage_coverage_percentage}%."
                ),
            )
        )

        # -------------------------------------------------
        # Calculate weighted risk score
        # -------------------------------------------------
        weighted_score = (
            drainage_pressure_score * 0.35
            + blocked_drainage_score * 0.15
            + historical_flood_score * 0.25
            + impervious_surface_score * 0.15
            + drainage_coverage_score * 0.10
        )

        risk_score = round(min(max(weighted_score, 0), 100), 2)
        risk_level = self._get_risk_level(risk_score)

        summary = self._generate_flooding_summary(
            environmental_data,
            risk_score,
            risk_level,
        )

        return RiskAnalysisResult(
            region=environmental_data.region,
            problem_type=structured_query.problem_type.value,
            risk_score=risk_score,
            risk_level=risk_level,
            summary=summary,
            risk_factors=factors,
            is_mock_data=environmental_data.is_mock_data,
            data_source=environmental_data.data_source,
        )

    def _analyze_generic_risk(
        self,
        structured_query: StructuredQuery,
        environmental_data: EnvironmentalDataset,
    ) -> RiskAnalysisResult:

        return RiskAnalysisResult(
            region=environmental_data.region,
            problem_type=structured_query.problem_type.value,
            risk_score=0,
            risk_level=RiskLevel.LOW,
            summary=(
                "Risk analysis for this problem type has not been implemented yet."
            ),
            risk_factors=[],
            is_mock_data=environmental_data.is_mock_data,
            data_source=environmental_data.data_source,
        )

    def _get_risk_level(self, risk_score: float) -> RiskLevel:

        if risk_score < 25:
            return RiskLevel.LOW

        if risk_score < 50:
            return RiskLevel.MODERATE

        if risk_score < 75:
            return RiskLevel.HIGH

        return RiskLevel.VERY_HIGH

    def _generate_flooding_summary(
        self,
        environmental_data: EnvironmentalDataset,
        risk_score: float,
        risk_level: RiskLevel,
    ) -> str:

        drainage = environmental_data.drainage

        if (
            drainage.estimated_peak_runoff_m3_per_hour
            > drainage.drainage_capacity_m3_per_hour
        ):
            drainage_message = (
                "Peak runoff is greater than the available drainage capacity."
            )
        else:
            drainage_message = (
                "Peak runoff is currently within the available drainage capacity."
            )

        return (
            f"The estimated flooding risk for "
            f"{environmental_data.region} is {risk_level.value} "
            f"with a score of {risk_score}/100. "
            f"{drainage_message} "
            "Historical flooding, drainage conditions, and impervious "
            "surface coverage were included in this assessment."
        )


risk_analysis_service = RiskAnalysisService()