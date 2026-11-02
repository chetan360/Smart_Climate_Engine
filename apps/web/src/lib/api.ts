// ============================================================
// Smart Climate Engine – Gateway API Client (Routes through Express)
// ============================================================
import type {
  EnvironmentalDataPoint,
  EnvironmentalSummary,
  Scenario,
  ScenarioOption,
  DecisionRecommendation,
  RegionInfo,
  UploadedFile,
  CustomSimulationResponse,
} from "./types";

// Always route all requests through Express backend
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// Fallback presentation datasets
export const DEFAULT_REGIONS: RegionInfo[] = [
  {
    id: "pune-pcmc",
    name: "Pune & PCMC Metropolitan Area",
    state: "Maharashtra",
    basin: "Mula-Mutha-Pavana Basin",
    primary_hazards: ["Urban Flash Flooding", "Groundwater Depletion", "Urban Heat Island"],
    budget_benchmark_crores: 50,
    baseline_rainfall_annual_mm: 1250,
  },
  {
    id: "mumbai-mmr",
    name: "Mumbai Metropolitan Region (MMR)",
    state: "Maharashtra",
    basin: "Mithi River & Coastal Estuary",
    primary_hazards: ["Coastal Storm Surge", "High-Tide Inundation", "Drainage Choke"],
    budget_benchmark_crores: 120,
    baseline_rainfall_annual_mm: 2420,
  },
  {
    id: "delhi-ncr",
    name: "Delhi National Capital Region",
    state: "Delhi NCR",
    basin: "Yamuna Floodplain Corridor",
    primary_hazards: ["Extreme Heat Island (45°C+)", "Severe Winter AQI", "Floodplain Encroachment"],
    budget_benchmark_crores: 90,
    baseline_rainfall_annual_mm: 790,
  },
  {
    id: "bengaluru-urban",
    name: "Bengaluru Urban District",
    state: "Karnataka",
    basin: "Vrishabhavathi & Dakshina Pinakini",
    primary_hazards: ["Lake Encroachment & Overflow", "Rapid Aquifer Depletion", "Urban Runoff"],
    budget_benchmark_crores: 65,
    baseline_rainfall_annual_mm: 970,
  },
  {
    id: "chennai-corp",
    name: "Greater Chennai Corporation",
    state: "Tamil Nadu",
    basin: "Adyar & Cooum River Basins",
    primary_hazards: ["Northeast Monsoon Deluge", "Saline Intrusion in Coastal Aquifers", "Cyclone Inundation"],
    budget_benchmark_crores: 80,
    baseline_rainfall_annual_mm: 1400,
  },
  {
    id: "custom-region",
    name: "Custom Regional Municipality / District",
    state: "Custom / Pan-India",
    basin: "Custom Catchment Area",
    primary_hazards: ["Multi-Hazard Climate Vulnerability"],
    budget_benchmark_crores: 40,
    baseline_rainfall_annual_mm: 1100,
  },
];

export const DEFAULT_SCENARIOS: ScenarioOption[] = [
  {
    id: "opt-a",
    name: "Option A: Conventional Heavy Drainage Expansion",
    description: "Concrete canal widening and deep culvert reinforcements across low-lying flood corridors.",
    interventions: ["drainage_expansion", "culvert_reinforcement"],
    cost_crores: 48,
    flood_risk_reduction_pct: 82,
    groundwater_recharge_pct: -15, // Negative = worsening aquifer
    urban_heat_reduction_deg: 0.1,
    environmental_score: 42,
    implementation_months: 18,
    feasibility_score: 75,
    is_recommended: false,
    tradeoff_note: "Flushes immediate peak flood volume rapidly, but concrete lining prevents aquifer infiltration (-15%) and transfers peak surge downstream.",
    advantages: ["Rapid evacuation of peak storm volume", "Standard civil engineering specification"],
    disadvantages: ["Exhausts 96% of typical Rs. 50 Cr budget", "Aggravates summer water scarcity (-15% aquifer)"],
  },
  {
    id: "opt-b",
    name: "Option B: Wetland & Natural Retention Basin Restoration",
    description: "Restoring river riparian wetlands, natural retention basins, and vegetative sponge zones along natural catchment paths.",
    interventions: ["wetland_restoration", "retention_pond", "riparian_buffer"],
    cost_crores: 22,
    flood_risk_reduction_pct: 62,
    groundwater_recharge_pct: 54,
    urban_heat_reduction_deg: 1.2,
    environmental_score: 89,
    implementation_months: 12,
    feasibility_score: 88,
    is_recommended: false,
    tradeoff_note: "Exceptional environmental and groundwater co-benefits (+54%), but moderate peak containment on extreme cloudburst deluges.",
    advantages: ["High groundwater replenishment (+54%)", "Cools urban microclimate (-1.2°C)", "Conserves 56% fiscal budget"],
    disadvantages: ["Requires demarcated land acquisition along river banks"],
  },
  {
    id: "opt-c",
    name: "Option C: Permeable Surfaces & Roadside Bioswales",
    description: "Retrofitting urban roads, parking bays, and pathways with porous asphalt and rainwater infiltration bioswales.",
    interventions: ["permeable_pavement", "bioswales", "rainwater_harvesting"],
    cost_crores: 15,
    flood_risk_reduction_pct: 42,
    groundwater_recharge_pct: 40,
    urban_heat_reduction_deg: 0.8,
    environmental_score: 82,
    implementation_months: 8,
    feasibility_score: 92,
    is_recommended: false,
    tradeoff_note: "Fastest implementation (8 months) and lowest capital outlay, but insufficient alone for 100-year river cresting events.",
    advantages: ["Low cost (Rs. 15 Cr)", "Quick 8-month roll-out", "Reduces localized street waterlogging"],
    disadvantages: ["Requires routine sediment cleaning and pervious pavement maintenance"],
  },
  {
    id: "opt-d",
    name: "Option D: Integrated Climate Resilience Framework (Recommended)",
    description: "Pareto-optimal hybrid: 60% nature-based sponge retention paired with permeable bioswales and smart sensor drain telemetry.",
    interventions: ["wetland_restoration", "permeable_pavement", "bioswales", "smart_drainage_maintenance"],
    cost_crores: 35,
    flood_risk_reduction_pct: 79,
    groundwater_recharge_pct: 65,
    urban_heat_reduction_deg: 1.6,
    environmental_score: 92,
    implementation_months: 14,
    feasibility_score: 86,
    is_recommended: true,
    tradeoff_note: "Near-equal flood protection to full civil canalization (79% vs 82%) while saving Rs. 13-15 Cr, increasing groundwater recharge by +65%, and cooling urban heat by 1.6°C.",
    advantages: [
      "Optimal balance across all 5 municipal objectives",
      "Saves Rs. 13-15 Cr compared to full concrete drainage",
      "Replenishes city groundwater aquifer table sustainably",
      "Mitigates urban heat island effect across dense wards",
    ],
    disadvantages: ["Requires inter-departmental coordination between Water Resources & Urban Works"],
  },
];

export const DEFAULT_DATA_POINTS: EnvironmentalDataPoint[] = [
  {
    id: "pt-1",
    source: "Metropolitan Weather Station",
    variable: "rainfall",
    value: 82.5,
    unit: "mm/day",
    location: { type: "Point", coordinates: [73.8567, 18.5204] },
    recorded_at: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
  {
    id: "pt-2",
    source: "Northern Ward Weather Gauge",
    variable: "rainfall",
    value: 125.0,
    unit: "mm/day",
    location: { type: "Point", coordinates: [73.7997, 18.653] },
    recorded_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: "pt-3",
    source: "Industrial IT Corridor Sensor",
    variable: "rainfall",
    value: 96.2,
    unit: "mm/day",
    location: { type: "Point", coordinates: [73.7299, 18.5913] },
    recorded_at: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: "pt-4",
    source: "Central Catchment Telemetry",
    variable: "rainfall",
    value: 145.7,
    unit: "mm/day",
    location: { type: "Point", coordinates: [73.7709, 18.6448] },
    recorded_at: new Date().toISOString(),
  },
  {
    id: "pt-5",
    source: "River Drainage Junction Gauge",
    variable: "water_level",
    value: 4.4,
    unit: "meters",
    location: { type: "Point", coordinates: [73.832, 18.583] },
    recorded_at: new Date().toISOString(),
  },
  {
    id: "pt-6",
    source: "Basin Confluence Telemetry",
    variable: "water_level",
    value: 3.8,
    unit: "meters",
    location: { type: "Point", coordinates: [73.818, 18.572] },
    recorded_at: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
  {
    id: "pt-7",
    source: "Industrial Zone Environmental Node",
    variable: "air_quality",
    value: 168.0,
    unit: "AQI",
    location: { type: "Point", coordinates: [73.845, 18.627] },
    recorded_at: new Date().toISOString(),
  },
  {
    id: "pt-8",
    source: "Urban Core Transit Sensor",
    variable: "air_quality",
    value: 142.0,
    unit: "AQI",
    location: { type: "Point", coordinates: [73.858, 18.501] },
    recorded_at: new Date().toISOString(),
  },
  {
    id: "pt-9",
    source: "Commercial Built-Up Corridor",
    variable: "surface_temperature",
    value: 37.4,
    unit: "°C",
    location: { type: "Point", coordinates: [73.805, 18.628] },
    recorded_at: new Date().toISOString(),
  },
  {
    id: "pt-10",
    source: "Municipal Green Canopy Zone",
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
    const timeoutId = setTimeout(() => controller.abort(), 6000);
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
  // Municipal Regions
  getRegions: async (): Promise<RegionInfo[]> => {
    return safeFetch<RegionInfo[]>(`${API_BASE}/api/v1/regions`, undefined, DEFAULT_REGIONS);
  },

  // Document & File Ingestion
  getFiles: async (region?: string): Promise<UploadedFile[]> => {
    const query = region ? `?region=${encodeURIComponent(region)}` : "";
    return safeFetch<UploadedFile[]>(`${API_BASE}/api/v1/files${query}`, undefined, []);
  },

  uploadFile: async (file: File, region: string): Promise<UploadedFile> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("region", region);

    const res = await fetch(`${API_BASE}/api/v1/files/upload`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Upload failed: ${err}`);
    }
    const json = await res.json();
    return json.data as UploadedFile;
  },

  deleteFile: async (id: string): Promise<void> => {
    await fetch(`${API_BASE}/api/v1/files/${id}`, { method: "DELETE" });
  },

  // Official AI Chat Assistant (Routed through Express)
  sendChatMessage: async (
    message: string,
    history: Array<{ role: string; content: string }>,
    region?: string,
    budget?: number,
    priorities?: string[]
  ) => {
    return safeFetch<any>(
      `${API_BASE}/api/v1/chat`,
      {
        method: "POST",
        body: JSON.stringify({ message, history, region, budget, priorities }),
      },
      {
        reply: `Decision Intelligence Briefing for ${region || "Municipality"}: An integrated climate resilience strategy is recommended for Rs. ${budget || 50} Cr budget. Nature-based sponge retention paired with permeable bioswales mitigates peak flood risk while providing +64% groundwater recharge.`,
        suggestedFollowups: [
          "Compare Option A (Heavy Drainage) vs Option D (Integrated Sponge)",
          "Draft an official resolution note for Municipal Council",
          "What files are indexed in the municipal repository?",
        ],
      }
    );
  },

  // Custom Scenario Simulation (Routed through Express)
  simulateCustom: async (params: {
    name?: string;
    region?: string;
    budget: number;
    interventions: string[];
    priorities?: Record<string, number>;
  }): Promise<CustomSimulationResponse> => {
    const budgetNum = params.budget * 10000000;
    const body = {
      name: params.name || "Custom Intervention Simulation",
      region: params.region || "General Municipality",
      budget: budgetNum,
      interventions: params.interventions,
      priorities: params.priorities,
    };

    return safeFetch<CustomSimulationResponse>(
      `${API_BASE}/api/v1/scenarios/simulate`,
      {
        method: "POST",
        body: JSON.stringify(body),
      },
      {
        scenario_id: "sim-fallback",
        name: params.name || "Custom Scenario",
        region: params.region || "General Municipality",
        simulation_results: {
          flood_risk_reduction_percentage: Math.min(94, Math.round(55 + (params.budget / 50) * 25)),
          groundwater_recharge_benefit_percentage: Math.round(45 + (params.budget > 30 ? 18 : 5)),
          urban_heat_reduction_percentage: parseFloat((1.1 + (params.budget / 50) * 0.5).toFixed(1)),
          environmental_impact_score: 91,
          estimated_cost: budgetNum,
          implementation_time_months: 14,
          resilience_index: 87,
        },
        advantages: [
          `Achieves calculated peak runoff containment for ${params.region || "selected area"}`,
          "Supports positive aquifer recharge and cooling microclimate",
          "Balanced budget deployment across nature-based interventions",
        ],
        tradeoffs: [
          `Allocates Rs. ${params.budget} Cr of municipal funds`,
          "Requires 12-16 months execution cycle",
        ],
      }
    );
  },

  // Environmental data points (Routed through Express)
  getEnvironmentalData: async (): Promise<EnvironmentalDataPoint[]> => {
    return safeFetch<EnvironmentalDataPoint[]>(
      `${API_BASE}/api/v1/environmental/data?limit=50`,
      undefined,
      DEFAULT_DATA_POINTS
    );
  },

  // Environmental summary (Routed through Express)
  getEnvironmentalSummary: async (): Promise<EnvironmentalSummary[]> => {
    return safeFetch<EnvironmentalSummary[]>(
      `${API_BASE}/api/v1/environmental/summary`,
      undefined,
      [
        { variable: "rainfall", count: 4, avg_value: 112.35, min_value: 82.5, max_value: 145.7, latest_at: new Date().toISOString() },
        { variable: "water_level", count: 3, avg_value: 3.77, min_value: 3.1, max_value: 4.4, latest_at: new Date().toISOString() },
        { variable: "air_quality", count: 3, avg_value: 140.67, min_value: 112.0, max_value: 168.0, latest_at: new Date().toISOString() },
        { variable: "surface_temperature", count: 3, avg_value: 35.13, min_value: 31.2, max_value: 37.4, latest_at: new Date().toISOString() },
      ]
    );
  },

  // Scenarios (Routed through Express)
  getScenarios: async (): Promise<Scenario[]> => {
    return safeFetch<Scenario[]>(`${API_BASE}/api/v1/scenarios`, undefined, [
      { id: "a0000000-0000-0000-0000-000000000001", name: "Option A: Conventional Heavy Drainage", budget: 480000000, interventions: ["drainage_expansion"] },
      { id: "a0000000-0000-0000-0000-000000000002", name: "Option B: Wetland & Natural Retention", budget: 220000000, interventions: ["wetland_restoration"] },
      { id: "a0000000-0000-0000-0000-000000000003", name: "Option C: Permeable Surfaces & Bioswales", budget: 150000000, interventions: ["permeable_pavement"] },
      { id: "a0000000-0000-0000-0000-000000000004", name: "Option D: Integrated Climate Resilience", budget: 350000000, interventions: ["wetland_restoration", "permeable_pavement"] },
    ]);
  },

  // Recommendations (Routed through Express)
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
          "Pareto-Optimal Municipal Recommendation: Against the Rs. 50 Cr budget envelope, Option D (Integrated Framework) delivers optimal performance. It achieves 78.5% flood protection matching full civil drainage while saving Rs. 15 Cr in capital expenditure. Crucially, it resolves the hidden trade-off by converting flood runoff into 64% increased groundwater recharge and cooling urban surface temperatures by ~1.6°C.",
        created_at: new Date().toISOString(),
      },
    ]);
  },
};
