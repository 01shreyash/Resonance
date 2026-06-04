import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from neo4j import GraphDatabase

class Neo4jRecommender:
    def __init__(self, uri, user, password):
        self.driver = GraphDatabase.driver(uri, auth=(user, password))
        self.df = pd.DataFrame()
        self.tfidf_matrix = None
        
        # Load the ML model immediately upon startup
        self._initialize_ml_model()

    def close(self):
        self.driver.close()

    def _initialize_ml_model(self):
        """
        Pulls all real tracks from Neo4j and builds a TF-IDF matrix 
        based on the Artist and Title for Content-Based filtering.
        """
        print("🧠 Booting up Scikit-Learn AI Brain...")
        query = "MATCH (t:Track) RETURN t.id AS id, t.title AS title, t.artist AS artist, t.duration AS duration"
        
        with self.driver.session() as session:
            result = session.run(query)
            # Create a Pandas DataFrame from the database records
            self.df = pd.DataFrame([dict(record) for record in result])
        
        if not self.df.empty:
            # Combine artist and title to create a searchable text feature
            self.df['features'] = self.df['artist'] + " " + self.df['title']
            
            # Run the NLP math
            tfidf = TfidfVectorizer(stop_words='english')
            self.tfidf_matrix = tfidf.fit_transform(self.df['features'])
            print(f"✅ AI Brain trained on {len(self.df)} tracks!")

    # ==========================================
    # BRAIN 1: CONTENT-BASED FILTERING (SCIKIT-LEARN)
    # ==========================================
    def get_content_recommendations(self, track_id: int, top_n: int = 3):
        if self.df.empty or self.tfidf_matrix is None:
            return []

        try:
            # Find where the clicked track lives in our matrix
            idx = self.df.index[self.df['id'] == track_id].tolist()[0]
        except IndexError:
            return [] 

        # Calculate cosine similarity against all 7,000+ tracks instantly
        cosine_sim = cosine_similarity(self.tfidf_matrix[idx], self.tfidf_matrix)
        
        # Sort and grab the top matches
        sim_scores = list(enumerate(cosine_sim[0]))
        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
        sim_scores = sim_scores[1:top_n+1]

        track_indices = [i[0] for i in sim_scores]
        
        # Return cleanly formatted data for React
        recs = self.df.iloc[track_indices]
        return recs[['id', 'title', 'artist', 'duration']].to_dict('records')

    # ==========================================
    # BRAIN 2: COLLABORATIVE FILTERING (NEO4J)
    # ==========================================
    def get_collaborative_recommendations(self, user_id: str, top_n: int = 5):
        # UPGRADE: We added |LIKES|DISLIKES to the WHERE NOT clause so it never plays disliked songs!
        cypher_query = """
            MATCH (current_user:User {id: $user_id})-[:LISTENS_TO]->(t:Track)<-[:LISTENS_TO]-(similar_user:User)
            MATCH (similar_user)-[:LISTENS_TO]->(recommended_track:Track)
            WHERE NOT (current_user)-[:LISTENS_TO|LIKES|DISLIKES]->(recommended_track)
            RETURN 
                recommended_track.id AS id, 
                recommended_track.title AS title, 
                recommended_track.artist AS artist, 
                recommended_track.duration AS duration, 
                COUNT(*) AS strength
            ORDER BY strength DESC
            LIMIT $top_n
        """
        with self.driver.session() as session:
            result = session.run(cypher_query, user_id=user_id, top_n=top_n)
            recommendations = []
            for record in result:
                recommendations.append({
                    "id": record["id"],
                    "title": record["title"],
                    "artist": record["artist"],
                    "duration": record["duration"],
                    "strength": record["strength"]
                })
            return recommendations

    # ==========================================
    # NEW: FEEDBACK LOOP (LIKE/DISLIKE)
    # ==========================================
    def record_interaction(self, user_id: str, track_id: int, action: str):
        with self.driver.session() as session:
            if action == "like":
                # Delete any old dislikes, and add a LIKE
                query = """
                    MATCH (u:User {id: $uid}), (t:Track {id: $tid})
                    OPTIONAL MATCH (u)-[r:DISLIKES]->(t) DELETE r
                    MERGE (u)-[:LIKES]->(t)
                """
            else:
                # Delete any old likes, and add a DISLIKE
                query = """
                    MATCH (u:User {id: $uid}), (t:Track {id: $tid})
                    OPTIONAL MATCH (u)-[r:LIKES]->(t) DELETE r
                    MERGE (u)-[:DISLIKES]->(t)
                """
            session.run(query, uid=user_id, tid=track_id)

    # ==========================================
    # STANDARD LIBRARY FETCH
    # ==========================================
    def get_library_tracks(self, limit: int = 15):
        cypher_query = """
            MATCH (t:Track)
            RETURN t.id AS id, t.title AS title, t.artist AS artist, t.duration AS duration
            LIMIT $limit
        """
        with self.driver.session() as session:
            result = session.run(cypher_query, limit=limit)
            tracks = []
            for record in result:
                tracks.append({
                    "id": record["id"],
                    "title": record["title"],
                    "artist": record["artist"],
                    "duration": record["duration"]
                })
            return tracks
        
        # ==========================================
    # SEARCH ENGINE
    # ==========================================
    def search_tracks(self, query: str, limit: int = 20):
        # Changed $query to $search_term to avoid the Neo4j Python collision!
        cypher_query = """
            MATCH (t:Track)
            WHERE toLower(t.title) CONTAINS toLower($search_term) 
               OR toLower(t.artist) CONTAINS toLower($search_term)
            RETURN t.id AS id, t.title AS title, t.artist AS artist, t.duration AS duration
            LIMIT $limit
        """
        with self.driver.session() as session:
            # Pass the query string into the new search_term variable
            result = session.run(cypher_query, search_term=query, limit=limit)
            tracks = []
            for record in result:
                tracks.append({
                    "id": record["id"],
                    "title": record["title"],
                    "artist": record["artist"],
                    "duration": record["duration"]
                })
            return tracks

# Initialize the connection (Make sure password matches!)
graph_db = Neo4jRecommender("neo4j://localhost:7687", "neo4j", "secure_graph_password_123")