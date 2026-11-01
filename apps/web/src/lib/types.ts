// ============================================================
// Smart Climate Engine – Shared TypeScript Types
// ============================================================

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
  };
  explanation: string;
  created_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  source?: "cache" | "db";
}
