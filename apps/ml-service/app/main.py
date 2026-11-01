from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.health import router as health_router
from app.api.routes.analysis import router as analysis_router
from app.api.routes.query import router as query_router
from app.api.routes.environmental_data import (
    router as environmental_data_router,
)
from app.api.routes.environmental_analysis import (
    router as environmental_analysis_router,
)
from app.api.routes.risk_analysis import (
    router as risk_analysis_router,
)
from app.api.routes.scenario_engine import (
    router as scenario_engine_router,
)
from app.api.routes.optimization import (
    router as optimization_router,
)
from app.api.routes.decision_api import (
    router as decision_api_router,
)

app = FastAPI(
    title="Climate Intelligence Engine",
    description="Private AI and climate decision-making backend",
    version="0.1.0",
)

# Enable CORS for local and docker environments
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(decision_api_router)
app.include_router(analysis_router)
app.include_router(query_router)
app.include_router(environmental_data_router)
app.include_router(environmental_analysis_router)
app.include_router(risk_analysis_router)
app.include_router(scenario_engine_router)
app.include_router(optimization_router)
