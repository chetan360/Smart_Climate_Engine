// ============================================================
// Smart Climate Engine – Shared TypeScript Types
// ============================================================

export interface RegionInfo {
  id: string;
  name: string;
  state: string;
  basin: string;
  primary_hazards: string[];
  budget_benchmark_crores: number;
  baseline_rainfall_annual_mm: number;
}

export interface UploadedFile {
  id: string;
  filename: string;
  original_name: string;
  mime_type: string;
  size_bytes: number;
  summary: string;
  region: string;
  uploaded_at: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  metrics?: Record<string, any>;
  suggestedFollowups?: string[];
}

export interface EnvironmentalDataPoint {
  id: string;
  source: string;
  variable: "rainfall" | "air_quality" | "water_level" | "surface_temperature" | "groundwater" | string;
  value: number;
  unit: string;
  location: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  } | null;
  recorded_at: string;
}

export interface EnvironmentalSummary {
  variable: string;
  count: number;
  avg_value: number;
  min_value: number;
  max_value: number;
  latest_at: string;
}

export interface ScenarioOption {
  id: string;
  name: string;
  description: string;
  interventions: string[];
  cost_crores: number;
  flood_risk_reduction_pct: number;
  groundwater_recharge_pct: number;
  urban_heat_reduction_deg: number;
  environmental_score: number;
  implementation_months: number;
  feasibility_score: number;
  is_recommended?: boolean;
  tradeoff_note: string;
  advantages: string[];
  disadvantages: string[];
}

export interface Scenario {
  id: string;
  name: string;
  description?: string;
  budget: number;
  interventions: string[];
  created_at?: string;
}

export interface ObjectiveWeights {
  flood: number;
  groundwater: number;
  heat: number;
  cost: number;
  feasibility: number;
}

export interface SimulationResult {
  flood_risk_reduction_percentage: number;
  groundwater_recharge_benefit_percentage: number;
  urban_heat_reduction_percentage: number;
  environmental_impact_score: number;
  estimated_cost: number;
  implementation_time_months: number;
  resilience_index: number;
}

export interface CustomSimulationResponse {
  scenario_id: string;
  name: string;
  region: string;
  simulation_results: SimulationResult;
  advantages: string[];
  tradeoffs: string[];
}

export interface DecisionRecommendation {
  id: string;
  scenario_id: string;
  recommended: {
    combination_id: string;
    scenario_names: string[];
    total_cost: number;
    currency: string;
    estimated_flood_risk_reduction_percentage: number;
    groundwater_recharge_benefit_percentage: number;
    urban_heat_reduction_percentage: number;
    environmental_impact_score: number;
    implementation_time_months: number;
    optimization_score: number;
  };
  scores: {
    resilience: number;
    cost: number;
    environment: number;
    feasibility: number;
    overall?: number;
  };
  explanation: string;
  created_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  message?: string;
  source?: "cache" | "db";
}
