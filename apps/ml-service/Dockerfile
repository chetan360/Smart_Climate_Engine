# ============================================================
# Smart Climate Engine – ML Service (FastAPI)
# Multi-stage Dockerfile: development + production
# ============================================================

# ---------- Base ----------
FROM python:3.11-slim AS base

# System dependencies for geospatial libs (GDAL, PostGIS clients)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    gcc \
    g++ \
    libpq-dev \
    gdal-bin \
    libgdal-dev \
    libgeos-dev \
    libproj-dev \
    && rm -rf /var/lib/apt/lists/*

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# ---------- Dependencies ----------
FROM base AS deps

COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

# ---------- Development ----------
FROM deps AS development

# Install dev-only extras (hot reload, debugger, etc.)
RUN pip install watchfiles pytest pytest-asyncio httpx

COPY . .

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload", "--reload-dir", "app"]

# ---------- Production ----------
FROM deps AS production

COPY . .

# Non-root user for security
RUN addgroup --system sce && adduser --system --ingroup sce sce
USER sce

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
