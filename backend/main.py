import os
import sys

# Ensure root directory is on sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from backend.config import PORT, HOST
from backend.database import init_db
from backend.routes import router as api_router

app = FastAPI(
    title="LearnPath AI API",
    description="Personalized Learning Path Recommender & AI EdTech SaaS Backend",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Endpoints
app.include_router(api_router)

# Mount frontend build directory if present
frontend_dist = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frontend", "dist")

if os.path.exists(frontend_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")
    
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        if full_path.startswith("api"):
            return None
        file_path = os.path.join(frontend_dist, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dist, "index.html"))

@app.on_event("startup")
def on_startup():
    print("Initializing LearnPath AI SQLite Database...")
    init_db()
    print("Database Initialized successfully.")

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host=HOST, port=PORT, reload=True)
