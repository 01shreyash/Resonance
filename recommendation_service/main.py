from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# We now only need to import the initialized database instance
from recommender import graph_db
from pydantic import BaseModel

class Interaction(BaseModel):
    user_id: str
    action: str  # "like" or "dislike"

app = FastAPI(title="Resonance AI Service")

# Allow your React frontend to talk to this Python backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5000", "http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "online", "service": "Resonance AI Recommendation Engine"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

# ==========================================
# ROUTE 1: CONTENT-BASED FILTERING (TF-IDF NLP)
# ==========================================
@app.get("/api/recommend/{track_id}")
def get_recommendations(track_id: int):
    # This now runs the Scikit-Learn math instantly against all 7,000+ tracks
    recs = graph_db.get_content_recommendations(track_id)
    
    if not recs:
        return {"error": "Track not found or no recommendations available."}
        
    return {
        "source_track_id": track_id, 
        "recommendations": recs,
        "type": "content_based"
    }

# ==========================================
# ROUTE 2: COLLABORATIVE FILTERING (NEO4J GRAPH)
# ==========================================
@app.get("/api/recommend/collaborative/{user_id}")
def get_collab_recommendations(user_id: str):
    recs = graph_db.get_collaborative_recommendations(user_id)
    
    if not recs:
        return {"message": "Not enough network data for collaborative filtering yet."}
        
    return {
        "user_id": user_id, 
        "recommendations": recs,
        "type": "collaborative_graph"
    }

# ==========================================
# ROUTE 3: STANDARD LIBRARY FETCH
# ==========================================
@app.get("/api/tracks")
def get_all_tracks():
    # Grabs 15 random tracks from your real history to populate the left column
    tracks = graph_db.get_library_tracks(15)
    return {"tracks": tracks}

# ==========================================
# ROUTE 4: SEARCH
# ==========================================
@app.get("/api/search")
def search_database(q: str):
    if not q:
        return {"tracks": []}
    tracks = graph_db.search_tracks(q)
    return {"tracks": tracks}

# ==========================================
# ROUTE 5: USER FEEDBACK
# ==========================================
@app.post("/api/interact/{track_id}")
def interact_with_track(track_id: int, data: Interaction):
    graph_db.record_interaction(data.user_id, track_id, data.action)
    return {"status": "success", "action": data.action, "track_id": track_id}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)