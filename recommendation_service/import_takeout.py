import json
from neo4j import GraphDatabase

# IMPORTANT: Keep the password you found in docker-compose.yml!
URI = "neo4j://localhost:7687"
USER = "neo4j"
PASSWORD = "secure_graph_password_123" 
USER_UUID = "a1b1be59-50a8-4255-a041-845c603083c9"

def process_takeout(filepath):
    print("Loading Takeout JSON... This might take a second.")
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)

    clean_tracks = {}
    track_id_counter = 100 # Start at 100 to avoid conflicting with mock tracks 1-6
    
    for item in data:
        # We only want YouTube Music, not regular YouTube videos
        if item.get('header') == 'YouTube Music':
            raw_title = item.get('title', '')
            title = raw_title.replace('Watched ', '') # Google adds "Watched" to everything
            
            subtitles = item.get('subtitles', [])
            artist = subtitles[0]['name'] if subtitles else "Unknown Artist"
            
            # Create a unique key to deduplicate the thousands of plays
            track_key = f"{title}-{artist}"
            if track_key not in clean_tracks:
                clean_tracks[track_key] = {
                    "id": track_id_counter,
                    "title": title,
                    "artist": artist,
                    "duration": "0:00" # Takeout doesn't provide duration
                }
                track_id_counter += 1
                
    return list(clean_tracks.values())

def ingest_to_neo4j(tracks):
    print(f"Found {len(tracks)} unique tracks from your history. Injecting into Neo4j...")
    driver = GraphDatabase.driver(URI, auth=(USER, PASSWORD))
    
    # We use Cypher's UNWIND to batch insert all tracks in a single transaction
    cypher_query = """
    MATCH (u:User {id: $user_id})
    UNWIND $tracks AS track
    MERGE (t:Track {title: track.title, artist: track.artist})
    ON CREATE SET t.id = track.id, t.duration = track.duration
    MERGE (u)-[:LISTENS_TO]->(t)
    """
    
    try:
        with driver.session() as session:
            session.run(cypher_query, user_id=USER_UUID, tracks=tracks)
            print("✅ Massive Brain Upgrade Complete! Your music DNA is now in the matrix.")
    except Exception as e:
        print(f"❌ Error during ingestion: {e}")
    finally:
        driver.close()

if __name__ == "__main__":
    filepath = "watch-history.json" 
    try:
        unique_tracks = process_takeout(filepath)
        if unique_tracks:
            ingest_to_neo4j(unique_tracks)
        else:
            print("⚠️ No YouTube Music tracks found in the file.")
    except FileNotFoundError:
        print(f"❌ Could not find {filepath}. Make sure it is in the recommendation_service folder!")