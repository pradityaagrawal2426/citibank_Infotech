"""RaahSetu Backend - Main FastAPI Application"""
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database import engine, Base
from app.api import (
    auth, students, careers, opportunities, roadmaps, facilitator,
    ai_engine, demand_ledger, micro_gigs, bridge_funding,
    pravas_kavach, prep_dojo, demo_control
)
from app.services.seed import seed_database


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables and seed data
    Base.metadata.create_all(bind=engine)
    seed_database()
    yield
    # Shutdown (cleanup if needed)


app = FastAPI(
    title="RaahSetu API",
    description="AI-Powered Education, Career and Livelihood Platform for Rural India",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(students.router, prefix="/api/students", tags=["students"])
app.include_router(careers.router, prefix="/api/careers", tags=["careers"])
app.include_router(opportunities.router, prefix="/api/opportunities", tags=["opportunities"])
app.include_router(roadmaps.router, prefix="/api/roadmaps", tags=["roadmaps"])
app.include_router(facilitator.router, prefix="/api/facilitator", tags=["facilitator"])
app.include_router(ai_engine.router, prefix="/api/ai", tags=["ai"])
app.include_router(demand_ledger.router, prefix="/api/demand-ledger", tags=["demand-ledger"])
app.include_router(micro_gigs.router, prefix="/api/micro-gigs", tags=["micro-gigs"])
app.include_router(bridge_funding.router, prefix="/api/bridge", tags=["bridge-funding"])
app.include_router(pravas_kavach.router, prefix="/api/pravas-kavach", tags=["pravas-kavach"])
app.include_router(prep_dojo.router, prefix="/api/prep-dojo", tags=["prep-dojo"])
app.include_router(demo_control.router, prefix="/api/demo", tags=["demo-control"])


@app.get("/")
def read_root():
    return {
        "name": "RaahSetu API",
        "version": "1.0.0",
        "status": "operational",
        "description": "AI-Powered Education, Career and Livelihood Platform for Rural India",
    }


@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "raahsetu-api"}
