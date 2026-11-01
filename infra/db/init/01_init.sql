-- ============================================================
-- Smart Climate Engine – PostGIS Init Script
-- ============================================================

-- Enable PostGIS extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---- Schemas ----
CREATE SCHEMA IF NOT EXISTS environmental;
CREATE SCHEMA IF NOT EXISTS scenarios;
CREATE SCHEMA IF NOT EXISTS decisions;

-- ---- Core tables ----

-- Environmental data points (rainfall, AQ, WQ, heat, water levels)
CREATE TABLE IF NOT EXISTS environmental.data_points (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source      TEXT NOT NULL,
    variable    TEXT NOT NULL,           -- e.g. 'rainfall', 'air_quality', 'water_level', 'surface_temperature'
    value       DOUBLE PRECISION,
    unit        TEXT,
    location    GEOMETRY(Point, 4326),   -- PostGIS spatial column (WGS84)
    recorded_at TIMESTAMPTZ NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_data_points_location
    ON environmental.data_points USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_data_points_variable
    ON environmental.data_points(variable);
CREATE INDEX IF NOT EXISTS idx_data_points_recorded_at
    ON environmental.data_points(recorded_at DESC);

-- Intervention scenarios
CREATE TABLE IF NOT EXISTS scenarios.scenarios (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name          TEXT NOT NULL,
    description   TEXT,
    region        GEOMETRY(Polygon, 4326),
    budget        NUMERIC(14, 2),
    interventions JSONB DEFAULT '[]',
    created_at    TIMESTAMPTZ DEFAULT now()
);

-- Optimization results / AI recommendations
CREATE TABLE IF NOT EXISTS decisions.recommendations (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scenario_id  UUID REFERENCES scenarios.scenarios(id) ON DELETE CASCADE,
    recommended  JSONB NOT NULL,     -- recommended combination
    scores       JSONB NOT NULL,     -- resilience, cost, env, feasibility
    explanation  TEXT,               -- Nugen AI plain-language output
    created_at   TIMESTAMPTZ DEFAULT now()
);

-- ---- SEED DATA (Pune & Pimpri-Chinchwad Region · PCCOE Case Study) ----

INSERT INTO environmental.data_points (source, variable, value, unit, location, recorded_at) VALUES
-- Rainfall sensors
('IMD Shivajinagar Station', 'rainfall', 82.5, 'mm/day', ST_SetSRID(ST_MakePoint(73.8567, 18.5204), 4326), NOW() - INTERVAL '3 days'),
('PCMC Nigdi Weather Station', 'rainfall', 125.0, 'mm/day', ST_SetSRID(ST_MakePoint(73.7997, 18.6530), 4326), NOW() - INTERVAL '2 days'),
('Hinjawadi IT Park Sensor', 'rainfall', 96.2, 'mm/day', ST_SetSRID(ST_MakePoint(73.7299, 18.5913), 4326), NOW() - INTERVAL '1 day'),
('PCCOE Akurdi Campus Station', 'rainfall', 145.7, 'mm/day', ST_SetSRID(ST_MakePoint(73.7709, 18.6448), 4326), NOW()),

-- River & Drainage Water Levels (Mula, Mutha, Pavana)
('Pavana River Dapodi Gauge', 'water_level', 4.4, 'meters', ST_SetSRID(ST_MakePoint(73.8320, 18.5830), 4326), NOW()),
('Mula River Sangvi Station', 'water_level', 3.8, 'meters', ST_SetSRID(ST_MakePoint(73.8180, 18.5720), 4326), NOW() - INTERVAL '6 hours'),
('Mutha River Deccan Gauge', 'water_level', 3.1, 'meters', ST_SetSRID(ST_MakePoint(73.8440, 18.5170), 4326), NOW() - INTERVAL '12 hours'),

-- Air Quality Index (AQI PM2.5)
('Bhosari MIDC Station', 'air_quality', 168.0, 'AQI', ST_SetSRID(ST_MakePoint(73.8450, 18.6270), 4326), NOW()),
('Swargate City Sensor', 'air_quality', 142.0, 'AQI', ST_SetSRID(ST_MakePoint(73.8580, 18.5010), 4326), NOW()),
('Akurdi Railway Station Sensor', 'air_quality', 112.0, 'AQI', ST_SetSRID(ST_MakePoint(73.7780, 18.6490), 4326), NOW()),

-- Surface Temperature / Urban Heat
('Kharadi Urban Corridor', 'surface_temperature', 36.8, '°C', ST_SetSRID(ST_MakePoint(73.9380, 18.5520), 4326), NOW()),
('Pimpri Industrial Hub', 'surface_temperature', 37.4, '°C', ST_SetSRID(ST_MakePoint(73.8050, 18.6280), 4326), NOW()),
('Pune University Green Zone', 'surface_temperature', 31.2, '°C', ST_SetSRID(ST_MakePoint(73.8260, 18.5530), 4326), NOW())
ON CONFLICT DO NOTHING;

-- Seed Standard Scenarios
INSERT INTO scenarios.scenarios (id, name, description, budget, interventions) VALUES
('a0000000-0000-0000-0000-000000000001',
 'Option A: Conventional Heavy Drainage Expansion',
 'Concrete stormwater canal widening and high-capacity culverts across vulnerable flood zones. High civil capex, reduces local flooding but prevents groundwater aquifer recharge and increases urban runoff downstream.',
 480000000.00,
 '["drainage_expansion", "culvert_reinforcement"]'::jsonb),

('a0000000-0000-0000-0000-000000000002',
 'Option B: Wetland & Natural Retention Basin Restoration',
 'Rehabilitating Pavana & Mula river riparian wetlands, natural retention swales and floodplain conservation. Moderate cost, improves water retention, replenishes aquifers and enhances urban microclimate.',
 220000000.00,
 '["wetland_restoration", "retention_pond", "riparian_buffer"]'::jsonb),

('a0000000-0000-0000-0000-000000000003',
 'Option C: Permeable Pavements & Bioswales Integration',
 'Retrofitting urban roads, parking zones, and pedestrian pathways with porous asphalt and vegetated bioswales to catch surface stormwater runoff at source.',
 150000000.00,
 '["permeable_pavement", "bioswales", "rainwater_harvesting"]'::jsonb),

('a0000000-0000-0000-0000-000000000004',
 'Option D: Integrated Climate Resilience Framework (Recommended)',
 'Optimal hybrid: 60% nature-based solutions (wetland + permeable bioswales) combined with targeted smart drain maintenance and sensor telemetry. Provides 92% flood safety while boosting groundwater recharge and lowering heat island index.',
 350000000.00,
 '["wetland_restoration", "permeable_pavement", "bioswales", "drainage_maintenance"]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Seed Initial AI Recommendation
INSERT INTO decisions.recommendations (scenario_id, recommended, scores, explanation) VALUES
('a0000000-0000-0000-0000-000000000004',
 '{
   "combination_id": "combo-optimal-pune-d",
   "scenario_names": ["Wetland Restoration", "Permeable Pavements & Bioswales", "Targeted Drain Upgrades"],
   "total_cost": 350000000,
   "currency": "INR",
   "estimated_flood_risk_reduction_percentage": 78.5,
   "groundwater_recharge_benefit_percentage": 64.0,
   "urban_heat_reduction_percentage": 28.0,
   "environmental_impact_score": 91.5,
   "implementation_time_months": 14,
   "optimization_score": 88.4
 }'::jsonb,
 '{
   "resilience": 0.88,
   "cost": 0.82,
   "environment": 0.91,
   "feasibility": 0.85
 }'::jsonb,
 'Nugen AI Recommendation: For Pune & Pimpri-Chinchwad municipal area with a Rs. 50 Cr budget envelope, Option D (Integrated Framework) is Pareto-optimal. It provides 78.5% flood protection matching full civil drainage while saving Rs. 15 Cr in capital expenditure. Crucially, it resolves the hidden trade-off by converting flood runoff into 64% increased groundwater recharge and mitigating urban surface temperatures by ~1.6°C.')
ON CONFLICT DO NOTHING;
