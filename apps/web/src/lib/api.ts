// ============================================================
// Smart Climate Engine – Resilient API Client
// ============================================================
import type {
  ApiResponse,
  EnvironmentalDataPoint,
  EnvironmentalSummary,
  Scenario,
  ScenarioOption,
  DecisionRecommendation,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const ML_BASE = process.env.NEXT_PUBLIC_ML_SERVICE_URL || "http://localhost:8000";

// Fallback presentation dataset (Pune & Pimpri-Chinchwad case study)
export const DEFAULT_SCENARIOS: ScenarioOption[] = [
  {
    id: "opt-a",
    name: "Option A: Heavy Drainage Expansion",
    description: "Concrete canal widening and deep stormwater culverts along river corridors.",
    interventions: ["drainage_expansion", "culvert_reinforcement"],
    cost_crores: 48,
    flood_risk_reduction_pct: 82,
    groundwater_recharge_pct: -15, // Negative = worsening aquifer
    urban_heat_reduction_deg: 0.1,
    environmental_score: 42,
    implementation_months: 18,
    feasibility_score: 75,
    is_recommended: false,
    tradeoff_note: "Fixes immediate flooding, but severely impedes groundwater infiltration and increases downstream peak velocity.",
    advantages: ["Rapid evacuation of peak storm volume", "Standard civil engineering specification"],
    disadvantages: ["Exhausts 96% of 50 Cr budget", "Aggravates summer water scarcity (-15% aquifer)"],
  },
  {
    id: "opt-b",
    name: "Option B: Wetland & Riparian Restoration",
    description: "Restoring natural floodplains, Pavana river oxbows, and vegetative sponge zones.",
    interventions: ["wetland_restoration", "retention_pond", "riparian_buffer"],
    cost_crores: 22,
    flood_risk_reduction_pct: 62,
    groundwater_recharge_pct: 54,
    urban_heat_reduction_deg: 1.2,
    environmental_score: 89,
    implementation_months: 12,
    feasibility_score: 88,
    is_recommended: false,
    tradeoff_note: "Outstanding environmental & aquifer benefits, but lower peak flash flood containment on extreme cloudbursts.",
    advantages: ["Excellent groundwater replenishment (+54%)", "Cools urban microclimate (-1.2°C)", "Conserves 56% budget"],
    disadvantages: ["Moderate reduction in ultra-dense built-up corridors"],
  },
  {
    id: "opt-c",
    name: "Option C: Permeable Surfaces & Bioswales",
    description: "Pervious pedestrian paths, roadside bioswales, and institutional rainwater harvesting.",
    interventions: ["permeable_pavement", "bioswales", "rainwater_harvesting"],
    cost_crores: 15,
    flood_risk_reduction_pct: 42,
    groundwater_recharge_pct: 40,
    urban_heat_reduction_deg: 0.8,
    environmental_score: 82,
    implementation_months: 8,
    feasibility_score: 92,
    is_recommended: false,
    tradeoff_note: "Lowest cost and fastest deployment, but insufficient alone for massive 100-year river cresting.",
    advantages: ["Cost effective (Rs. 15 Cr)", "Quick 8-month roll-out", "Reduces localized street waterlogging"],
    disadvantages: ["Requires routine sediment maintenance"],
  },
  {
    id: "opt-d",
    name: "Option D: Integrated Climate Framework (Recommended)",
    description: "Hybrid Pareto-optimal strategy: 60% nature-based sponge infrastructure paired with smart drainage maintenance.",
    interventions: ["wetland_restoration", "permeable_pavement", "bioswales", "smart_drainage_maintenance"],
    cost_crores: 35,
    flood_risk_reduction_pct: 79,
    groundwater_recharge_pct: 65,
    urban_heat_reduction_deg: 1.6,
    environmental_score: 92,
    implementation_months: 14,
    feasibility_score: 86,
    is_recommended: true,
    tradeoff_note: "Near-equal flood protection to Option A (79% vs 82%) while saving Rs. 13 Cr, increasing groundwater recharge by +65% and cooling urban heat by 1.6°C.",
    advantages: [
      "Optimal balance across all 5 municipal objectives",
      "Saves Rs. 13 Cr vs full concrete canalization",
      "Replenishes Pune groundwater basin sustainably",
      "Mitigates urban heat island effect",
    ],
    disadvantages: ["Requires coordination between Water Resources & Urban Forestry depts"],
  },
];

export const DEFAULT_DATA_POINTS: EnvironmentalDataPoint[] = [
  {
    id: "pt-1",
    source: "IMD Shivajinagar",
    variable: "rainfall",
    value: 82.5,
    unit: "mm/day",
    location: { type: "Point", coordinates: [73.8567, 18.5204] },
    recorded_at: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
  {
    id: "pt-2",
    source: "PCMC Nigdi Station",
    variable: "rainfall",
    value: 125.0,
    unit: "mm/day",
    location: { type: "Point", coordinates: [73.7997, 18.653] },
    recorded_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: "pt-3",
    source: "Hinjawadi IT Park Sensor",
    variable: "rainfall",
    value: 96.2,
    unit: "mm/day",
    location: { type: "Point", coordinates: [73.7299, 18.5913] },
    recorded_at: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: "pt-4",
    source: "PCCOE Akurdi Station",
    variable: "rainfall",
    value: 145.7,
    unit: "mm/day",
    location: { type: "Point", coordinates: [73.7709, 18.6448] },
    recorded_at: new Date().toISOString(),
  },
  {
    id: "pt-5",
    source: "Pavana River Dapodi Gauge",
    variable: "water_level",
    value: 4.4,
    unit: "meters",
    location: { type: "Point", coordinates: [73.832, 18.583] },
    recorded_at: new Date().toISOString(),
  },
  {
    id: "pt-6",
    source: "Mula River Sangvi Station",
    variable: "water_level",
    value: 3.8,
    unit: "meters",
    location: { type: "Point", coordinates: [73.818, 18.572] },
    recorded_at: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
  {
    id: "pt-7",
    source: "Bhosari MIDC Station",
    variable: "air_quality",
    value: 168.0,
    unit: "AQI",
    location: { type: "Point", coordinates: [73.845, 18.627] },
    recorded_at: new Date().toISOString(),
  },
  {
    id: "pt-8",
    source: "Swargate Urban Core",
    variable: "air_quality",
    value: 142.0,
    unit: "AQI",
    location: { type: "Point", coordinates: [73.858, 18.501] },
    recorded_at: new Date().toISOString(),
  },
  {
    id: "pt-9",
    source: "Pimpri Industrial Hub",
    variable: "surface_temperature",
    value: 37.4,
    unit: "°C",
    location: { type: "Point", coordinates: [73.805, 18.628] },
    recorded_at: new Date().toISOString(),
  },
  {
    id: "pt-10",
    source: "Pune University Green Canopy",
    variable: "surface_temperature",
    value: 31.2,
    unit: "°C",
    location: { type: "Point", coordinates: [73.826, 18.553] },
    recorded_at: new Date().toISOString(),
  },
];

async function safeFetch<T>(url: string, options?: RequestInit, fallback?: T): Promise<T> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      ...options,
    });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return (json.data ?? json) as T;
  } catch (err) {
    if (fallback !== undefined) return fallback;
    throw err;
  }
}

export const climateApi = {
  // Environmental data points
  getEnvironmentalData: async (): Promise<EnvironmentalDataPoint[]> => {
    return safeFetch<EnvironmentalDataPoint[]>(
      `${API_BASE}/api/v1/environmental/data?limit=50`,
      undefined,
      DEFAULT_DATA_POINTS,
    );
  },

  // Environmental summary
  getEnvironmentalSummary: async (): Promise<EnvironmentalSummary[]> => {
    return safeFetch<EnvironmentalSummary[]>(
      `${API_BASE}/api/v1/environmental/summary`,
      undefined,
      [
        { variable: "rainfall", count: 4, avg_value: 112.35, min_value: 82.5, max_value: 145.7, latest_at: new Date().toISOString() },
        { variable: "water_level", count: 3, avg_value: 3.77, min_value: 3.1, max_value: 4.4, latest_at: new Date().toISOString() },
        { variable: "air_quality", count: 3, avg_value: 140.67, min_value: 112.0, max_value: 168.0, latest_at: new Date().toISOString() },
        { variable: "surface_temperature", count: 3, avg_value: 35.13, min_value: 31.2, max_value: 37.4, latest_at: new Date().toISOString() },
      ],
    );
  },

  // Scenarios
  getScenarios: async (): Promise<Scenario[]> => {
    return safeFetch<Scenario[]>(`${API_BASE}/api/v1/scenarios`, undefined, [
      { id: "a0000000-0000-0000-0000-000000000001", name: "Option A: Conventional Heavy Drainage", budget: 480000000, interventions: ["drainage_expansion"] },
      { id: "a0000000-0000-0000-0000-000000000002", name: "Option B: Wetland & Natural Retention", budget: 220000000, interventions: ["wetland_restoration"] },
      { id: "a0000000-0000-0000-0000-000000000003", name: "Option C: Permeable Surfaces & Bioswales", budget: 150000000, interventions: ["permeable_pavement"] },
      { id: "a0000000-0000-0000-0000-000000000004", name: "Option D: Integrated Climate Resilience", budget: 350000000, interventions: ["wetland_restoration", "permeable_pavement"] },
    ]);
  },

  // Simulate custom scenario
  simulateCustom: async (budget: number, weights: { flood: number; gw: number; heat: number }) => {
    try {
      const res = await safeFetch<any>(
        `${ML_BASE}/scenario-engine/simulate`,
        {
          method: "POST",
          body: JSON.stringify({
            budget: budget * 10000000,
            interventions: ["wetland_restoration", "permeable_pavement", "bioswales"],
            region: "Pune & PCMC",
          }),
        },
        null,
      );
      if (res && res.simulation_results) return res.simulation_results;
    } catch {}

    // Calculation fallback based on mathematical model
    const flood = Math.min(95, Math.round(55 + (budget / 50) * 25));
    const gw = Math.round(40 + (weights.gw / 0.5) * 20);
    const heat = (1.1 + (weights.heat / 0.5) * 0.6).toFixed(1);
    return {
      flood_risk_reduction_percentage: flood,
      groundwater_recharge_benefit_percentage: gw,
      urban_heat_reduction_percentage: parseFloat(heat),
      environmental_impact_score: 91,
      estimated_cost: budget * 10000000,
      implementation_time_months: 14,
      resilience_index: 87,
    };
  },

  // Recommendations
  getRecommendations: async (): Promise<DecisionRecommendation[]> => {
    return safeFetch<DecisionRecommendation[]>(`${API_BASE}/api/v1/recommendations`, undefined, [
      {
        id: "rec-1",
        scenario_id: "a0000000-0000-0000-0000-000000000004",
        recommended: {
          combination_id: "combo-d-optimal",
          scenario_names: ["Wetland Restoration", "Permeable Pavement & Bioswales", "Smart Drain Maintenance"],
          total_cost: 350000000,
          currency: "INR",
          estimated_flood_risk_reduction_percentage: 78.5,
          groundwater_recharge_benefit_percentage: 64.0,
          urban_heat_reduction_percentage: 28.0,
          environmental_impact_score: 91.5,
          implementation_time_months: 14,
          optimization_score: 88.4,
        },
        scores: {
          resilience: 0.88,
          cost: 0.82,
          environment: 0.91,
          feasibility: 0.85,
        },
        explanation:
          "Nugen AI Strategic Recommendation: For Pune & PCMC with a Rs. 50 Cr budget envelope, Option D (Integrated Framework) delivers Pareto-optimal performance. It achieves 78.5% flood protection matching full civil drainage while saving Rs. 15 Cr in capital expenditure. Crucially, it resolves the hidden trade-off by converting flood runoff into 64% increased groundwater recharge and cooling urban surface temperatures by ~1.6°C.",
        created_at: new Date().toISOString(),
      },
    ]);
  },
};
