# 🎧 Resonance: Dual-Engine AI Music Recommender

Resonance is a full-stack, machine learning-powered music recommendation platform. Built from the ground up, it utilizes a "Dual-Brain" architecture that combines **Content-Based Filtering** (Natural Language Processing) and **Collaborative Filtering** (Graph Networks) to generate highly accurate, real-time track suggestions.

The entire application is fully containerized using Docker, featuring a modern React frontend and a high-performance FastAPI backend.

## ✨ Core Features

* **🧠 Dual-Brain AI Recommendations:**
  * **Up Next (Content-Based AI):** Uses `Scikit-Learn` to perform TF-IDF vectorization and Cosine Similarity on track metadata, finding songs mathematically similar to the currently playing track.
  * **Network Picks (Collaborative AI):** Uses **Neo4j** Graph Database and Cypher queries to find overlaps between user listening histories, recommending novel tracks based on network similarity.
* **🔁 Active Feedback Loop:** Users can "Like" or "Dislike" a track in real-time. Disliking a track writes a `[:DISLIKES]` relationship to the graph database, dynamically updating the algorithm to never recommend it again.
* **⚡ Live Graph Search:** A real-time search engine querying thousands of nodes in the Neo4j database with instant frontend debouncing.
* **🎨 Dynamic Metadata Fetching:** Integrates with the **Last.fm API** for high-resolution album art and the **iTunes API** for live audio previews.
* **🐳 Fully Containerized:** One-command deployment using Docker and Docker Compose.

## 🛠️ Technology Stack

**Frontend:**
* React 18, TypeScript, Vite
* Tailwind CSS, Lucide Icons

**Backend & AI:**
* Python 3.10, FastAPI, Uvicorn
* Scikit-Learn, Pandas (Data Processing & NLP)
* Neo4j & Cypher (Graph Mathematics)

**Infrastructure:**
* Docker & Docker Compose

## 🚀 Getting Started

### Prerequisites
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.
* Git installed on your local machine.

### Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/yourusername/Resonance.git](https://github.com/yourusername/Resonance.git)
   cd Resonance