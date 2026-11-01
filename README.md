# Smart Climate Engine 🌍⚡
### AI-Powered Climate Resilience Decision Intelligence Platform
**Team Climate Bandits · PCCOE International Grand Challenge 2026 (Pune, India · Theme: AI for Climate Change)**

[![Docker](https://img.shields.io/badge/Docker-Compose%20v2-blue?logo=docker&logoColor=white)](docker-compose.yml)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2016%20%7C%20React%2019-black?logo=next.js&logoColor=white)](apps/web)
[![Express](https://img.shields.io/badge/Gateway-Express%20%7C%20TypeScript-lightgrey?logo=express&logoColor=white)](apps/api-express)
[![FastAPI](https://img.shields.io/badge/ML%20Service-FastAPI%20%7C%20Python%203.11-009688?logo=fastapi&logoColor=white)](apps/ml-service)
[![PostGIS](https://img.shields.io/badge/Spatial%20DB-PostgreSQL%2016%20%2B%20PostGIS-336791?logo=postgresql&logoColor=white)](infra/db)
[![Redis](https://img.shields.io/badge/Cache-Redis%207-DC382D?logo=redis&logoColor=white)](docker-compose.yml)

---

## 📌 Executive Summary

Governments and industries collect enormous volumes of environmental data (weather forecasts, air quality, water levels, satellite land-use, infrastructure maps). **Data collection is not the bottleneck.**

The unresolved question for municipal authorities and urban planners is:
> *"Given everything that is happening and how environmental systems are interconnected — what should a decision-maker actually do next?"*

**The gap is Decision Intelligence, not raw data.**

Traditional tools operate in silos:
- Flood models assist hydrologic engineers
- Sensor networks assist environmental monitoring
- Climate models assist regional projections
- Cost-benefit sheets assist finance officers

**Smart Climate Engine** unifies these streams into **one continuous decision intelligence loop**, simulating interventions numerically and applying **Nugen AI reasoning** to recommend the most sustainable combination of actions by balancing resilience, ecological health, budget constraints, and long-term unintended trade-offs together.

---

## ⚡ The Hidden Trade-Off Problem

Single-issue fixes create unintended consequences across connected systems.

### Real-World Example – Conventional Heavy Drainage Response:
```
                      ┌──> Fixes short-term street flooding
                      │
[ Heavy Concrete Canal ]───> Prevents natural stormwater infiltration into aquifers
                      │       └──> Worsens summer groundwater scarcity
                      │
                      └───> Replaces vegetation with heat-absorbing concrete
                              └──> Increases Urban Heat Island (UHI) intensity
```

### The Smart Climate Engine Solution:
Instead of treating flooding in isolation, the platform optimizes **multi-hazard resilience** simultaneously:
$$\text{Resilience} = f(\text{Flood Protection}, \text{Groundwater Infiltration}, \text{Urban Heat Mitigation}, \text{Cost Efficiency})$$

---

## 🎯 Case Study: Pune & Pimpri-Chinchwad (PCMC) Municipal Region
**Scenario:** Recurrent monsoon inundation along the Pavana and Mula river basins under a **Rs. 50 Crore** municipal capital budget envelope.

| Strategy Option | Flood Risk Reduction | Groundwater Aquifer Recharge | Urban Heat Mitigation | Estimated Cost | Evaluation & Status |
|---|:---:|:---:|:---:|:---:|---|
| **Option A: Heavy Drainage Expansion** | **↓↓↓ (-82%)** | **— (-15% depletion)** | **— (+0.1°C)** | ₹48.0 Cr | High capex, starves aquifers, exhausts 96% of budget. |
| **Option B: Wetland Restoration** | **↓↓ (-62%)** | **↑↑ (+54% recharge)** | **↓ (-1.2°C)** | ₹22.0 Cr | Outstanding ecological gain; lower peak cloudburst containment. |
| **Option C: Permeable Pavements** | **↓ (-42%)** | **↑ (+40% recharge)** | **↓ (-0.8°C)** | ₹15.0 Cr | Fast 8-month deployment; insufficient alone for 100-year river surge. |
| **Option D: Integrated Framework** ⭐ | **↓↓↓ (-79%)** | **↑↑↑ (+65% recharge)** | **↓↓ (-1.6°C)** | **₹35.0 Cr** | **Pareto-Optimal (AI Recommended):** Matches full drainage safety while saving ₹15 Cr and replenishing groundwater. |

---

## 🔄 The 6-Stage Continuous Decision Loop

```
  [ 01. COLLECT ] ──────> [ 02. UNDERSTAND ] ─────> [ 03. SIMULATE ]
  GIS, sensors, postgis    NLP query decomposition   Hydrologic physics models
            │                                                 │
            ▼                                                 ▼
     [ 06. ACT ] <────────── [ 05. RECOMMEND ] <───── [ 04. COMPARE ]
Municipal official call   Nugen AI plain-language     Multi-objective Pareto
```

1. **Collect:** Ingests rainfall gauges, river water levels, air quality index, and land permeability in PostGIS.
2. **Understand:** Natural Language query parser extracts problem types, budget bounds, and region priorities.
3. **Simulate:** Numerically estimates runoff curves, infiltration capacities, and microclimate changes.
4. **Compare:** Pareto-frontier optimization scores options against competing objectives.
5. **Recommend (Nugen AI Layer):** Contextualizes quantitative scores into human-readable executive reasoning.
6. **Act:** Human-in-the-loop governance: the municipal authority inspects options and approves the binding action.

---

## 🏗 Monorepo Architecture

```
smart-climate-engine/
├── apps/
│   ├── web/                     # Next.js 16 Web Dashboard (React 19, Tailwind CSS, Recharts)
│   │   ├── src/app/             # App Router (page.tsx, layout.tsx, globals.css)
│   │   ├── src/components/      # Interactive components (Matrix, Simulator, GIS Map, Nugen AI)
│   │   ├── src/lib/             # API client and TypeScript models
│   │   └── Dockerfile           # Multi-stage Docker build
│   │
│   ├── api-express/             # Node.js + Express API Gateway (TypeScript)
│   │   ├── src/controllers/     # REST controllers (scenarios, environmental, recommendations)
│   │   ├── src/db/              # PostgreSQL + PostGIS connection pooling
│   │   ├── src/config/          # Redis client and Zod env validation
│   │   └── Dockerfile           # Multi-stage Docker build
│   │
│   └── ml-service/              # Python FastAPI Decision Engine
│       ├── app/api/routes/      # Endpoints (simulation, optimization, risk analysis, decision pipeline)
│       ├── app/services/        # Optimization algorithms, hydrologic models, Nugen AI logic
│       ├── app/repositories/    # Environmental datasets & spatial models
│       └── Dockerfile           # Multi-stage Docker build with geospatial libs
│
├── infra/
│   └── db/init/01_init.sql      # PostGIS schema definition & Pune / PCMC seed data
│
├── docker-compose.yml           # Unified orchestration for all 5 services
├── .env.example                 # Environment configuration template
└── README.md                    # Project documentation
```

---

## 🚀 Quickstart with Docker Compose

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) & [Docker Compose v2](https://docs.docker.com/compose/)
- Git

### 1. Clone & Configure Environment
```bash
git clone <repo-url> "Smart Climate Engine"
cd "Smart Climate Engine"

# Initialize .env file from template
cp .env.example .env
```

### 2. Build & Launch All Containers
```bash
docker compose up --build -d
```

### 3. Check Service Health
```bash
docker compose ps
```
All 5 containers (`sce-db`, `sce-redis`, `sce-ml-service`, `sce-api-express`, and `sce-web`) will be running and healthy.

---

## 🌐 Service Access Points

| Service | Technology | Port | Access URL | Health Endpoint |
|---|---|:---:|---|---|
| **Web Dashboard** | Next.js 16 · React 19 | `3000` | [http://localhost:3000](http://localhost:3000) | `http://localhost:3000` |
| **API Gateway** | Express · TypeScript | `4000` | [http://localhost:4000](http://localhost:4000) | [http://localhost:4000/health](http://localhost:4000/health) |
| **Decision Engine** | Python 3.11 · FastAPI | `8000` | [http://localhost:8000/docs](http://localhost:8000/docs) (Swagger) | [http://localhost:8000/health](http://localhost:8000/health) |
| **Spatial Database** | PostGIS 16 · PostgreSQL | `5432` | `localhost:5432` (`climate_db`) | `pg_isready` |
| **Cache & Queue** | Redis 7 Alpine | `6379` | `localhost:6379` | `redis-cli ping` |

---

## 💻 Local Development (Without Docker)

If you wish to run services locally on your host machine:

### 1. PostgreSQL & Redis
Ensure PostGIS is running on port `5432` and Redis on port `6379`.

### 2. Python ML Service
```bash
cd apps/ml-service
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 3. Express API Gateway
```bash
cd apps/api-express
npm install
npm run dev
```

### 4. Next.js Web App
```bash
cd apps/web
npm install
npm run dev
```
Navigate to `http://localhost:3000`.

---

## 📡 API Specification

### Express API Gateway (`http://localhost:4000`)
- `GET /health` – Health status of Gateway, DB, and Redis
- `GET /api/v1/environmental/data` – Query spatial data points with bounding box/radius
- `GET /api/v1/environmental/summary` – Statistical aggregations across variables
- `GET /api/v1/scenarios` – List municipal scenarios
- `POST /api/v1/scenarios` – Create a new scenario
- `POST /api/v1/scenarios/:id/simulate` – Execute simulation against Python ML engine
- `GET /api/v1/recommendations` – Retrieve AI-generated decision recommendations
- `POST /api/v1/recommendations/generate` – Trigger multi-objective optimization with Nugen AI reasoning
- `POST /api/v1/decision/pipeline` – Complete 6-stage end-to-end decision intelligence loop

### Python Decision Engine (`http://localhost:8000`)
- `GET /health` – ML service healthcheck
- `POST /scenario-engine/simulate` – Hydrologic physics & intervention simulation
- `POST /optimization/recommend` – Multi-objective trade-off scoring and Nugen AI explanation
- `POST /api/v1/decision/pipeline` – Full decision loop pipeline
- `POST /internal/query/understand` – NLP query understanding
- `POST /internal/risk-analysis/analyze` – Multi-hazard risk level assessment
- `GET /docs` – Interactive OpenAPI Swagger documentation

---

## 👥 Team & Acknowledgements

**Team:** Climate Bandits  
**Programme:** MCA 2026–2028, Pimpri Chinchwad College of Engineering (PCCOE), Pune  
**Competition:** PCCOE International Grand Challenge 2026  
**Theme:** AI for Climate Change  

- **Srishti Sharma**
- **Chetan Satish Mankar**
- **Onkar Vinayak Dongare**

*Antigravity-powered open source monorepo · Built for resilient cities and sustainable tomorrows.*
