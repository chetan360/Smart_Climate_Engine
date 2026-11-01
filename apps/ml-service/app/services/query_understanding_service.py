import re
from typing import List, Optional, Tuple

from app.schemas.query import (
    ProblemType,
    QueryUnderstandingRequest,
    QueryUnderstandingResponse,
    StructuredQuery,
)


PROBLEM_KEYWORDS = {
    ProblemType.FLOODING: [
        "flood",
        "flooding",
        "waterlogging",
        "water logging",
        "drainage",
        "inundation",
        "heavy runoff",
    ],
    ProblemType.WATER_SCARCITY: [
        "water scarcity",
        "water shortage",
        "drought",
        "groundwater depletion",
        "lack of water",
        "water stress",
    ],
    ProblemType.URBAN_HEAT: [
        "urban heat",
        "heat island",
        "high temperature",
        "excessive heat",
        "hot area",
    ],
    ProblemType.POLLUTION: [
        "pollution",
        "air quality",
        "water contamination",
        "contaminated water",
        "toxic waste",
    ],
    ProblemType.LAND_DEGRADATION: [
        "land degradation",
        "soil erosion",
        "deforestation",
        "soil damage",
        "loss of vegetation",
    ],
}


PRIORITY_KEYWORDS = {
    "flood risk reduction": [
        "reduce flooding",
        "flood risk reduction",
        "prevent flooding",
        "control flooding",
    ],
    "groundwater recharge": [
        "groundwater recharge",
        "recharge groundwater",
        "improve groundwater",
        "water infiltration",
    ],
    "urban cooling": [
        "urban cooling",
        "reduce heat",
        "cooler city",
        "reduce temperature",
    ],
    "biodiversity protection": [
        "biodiversity",
        "protect wildlife",
        "ecosystem protection",
    ],
    "pollution reduction": [
        "reduce pollution",
        "improve air quality",
        "improve water quality",
    ],
    "long-term resilience": [
        "long-term resilience",
        "long term resilience",
        "sustainable solution",
        "future resilience",
    ],
}


def normalize_text(text: str) -> str:
    """
    Normalize text for easier keyword matching.
    """
    return " ".join(text.lower().strip().split())


def extract_problem_type(text: str) -> ProblemType:
    """
    Identify the main environmental problem using keywords.
    """
    for problem_type, keywords in PROBLEM_KEYWORDS.items():
        for keyword in keywords:
            if keyword in text:
                return problem_type

    return ProblemType.UNKNOWN


def extract_region(text: str) -> Optional[str]:
    """
    Basic region extraction.

    This is intentionally simple for the MVP.
    It detects phrases such as:
    - in Kharadi, Pune
    - at Kharadi, Pune
    - area: Kharadi, Pune
    """

    patterns = [
        r"\bin\s+([A-Za-z0-9 .,'-]+?)(?=\s+(?:is|has|faces|experiences|floods|with|and|because)\b|[.!?]|$)",
        r"\bat\s+([A-Za-z0-9 .,'-]+?)(?=\s+(?:is|has|faces|experiences|floods|with|and|because)\b|[.!?]|$)",
        r"\barea\s*:\s*([A-Za-z0-9 .,'-]+)",
        r"\blocation\s*:\s*([A-Za-z0-9 .,'-]+)",
        r"\bregion\s*:\s*([A-Za-z0-9 .,'-]+)",
    ]

    for pattern in patterns:
        match = re.search(pattern, text, flags=re.IGNORECASE)

        if match:
            region = match.group(1).strip(" ,.")
            if region:
                return region

    return None


def extract_budget(text: str) -> Tuple[Optional[float], Optional[str]]:
    """
    Extract a budget expressed in INR.

    Supported examples:
    - ₹50 crore
    - Rs. 10 lakh
    - INR 5000000
    - 50 crore
    """

    normalized = text.lower().replace(",", "").replace(" ", "")

    currency = None

    if "₹" in text or "rs" in normalized or "inr" in normalized:
        currency = "INR"

    crore_match = re.search(r"₹?([\d.]+)crore", normalized)

    if crore_match:
        amount = float(crore_match.group(1)) * 10_000_000
        return amount, currency or "INR"

    lakh_match = re.search(r"₹?([\d.]+)lakh", normalized)

    if lakh_match:
        amount = float(lakh_match.group(1)) * 100_000
        return amount, currency or "INR"

    numeric_match = re.search(
        r"(?:₹|rs\.?|inr)?([\d]+(?:\.\d+)?)",
        normalized,
    )

    if numeric_match and currency:
        return float(numeric_match.group(1)), currency

    return None, currency


def extract_priorities(text: str) -> List[str]:
    """
    Identify the official's desired outcomes.
    """
    priorities = []

    for priority, keywords in PRIORITY_KEYWORDS.items():
        if any(keyword in text for keyword in keywords):
            priorities.append(priority)

    return priorities


def calculate_confidence(
    problem_type: ProblemType,
    region: Optional[str],
    budget: Optional[float],
    priorities: List[str],
) -> float:
    """
    Basic confidence score for the rule-based parser.
    """
    score = 0.0

    if problem_type != ProblemType.UNKNOWN:
        score += 0.45

    if region:
        score += 0.25

    if budget is not None:
        score += 0.15

    if priorities:
        score += 0.15

    return round(min(score, 1.0), 2)


def understand_query(
    request: QueryUnderstandingRequest,
) -> QueryUnderstandingResponse:

    original_query = request.query
    text = normalize_text(original_query)

    problem_type = extract_problem_type(text)
    region = extract_region(original_query)
    budget, currency = extract_budget(original_query)
    priorities = extract_priorities(text)

    missing_information = []

    if not region:
        missing_information.append("region")

    if problem_type == ProblemType.UNKNOWN:
        missing_information.append("problem_type")

    confidence = calculate_confidence(
        problem_type=problem_type,
        region=region,
        budget=budget,
        priorities=priorities,
    )

    structured_query = StructuredQuery(
        region=region,
        problem_type=problem_type,
        problem_description=original_query,
        budget=budget,
        currency=currency,
        priorities=priorities,
        missing_information=missing_information,
        confidence=confidence,
    )

    return QueryUnderstandingResponse(
        original_query=original_query,
        structured_query=structured_query,
    )