import random
from neo4j import GraphDatabase

URI = "neo4j://localhost:7687"
USER = "neo4j"
PASSWORD = "secure_graph_password_123"  # Make sure this matches your Docker setup!
USER_UUID = "a1b1be59-50a8-4255-a041-845c603083c9"

def generate_synthetic_friends():
    driver = GraphDatabase.driver(URI, auth=(USER, PASSWORD))
    
    # Fake users to populate your network
    friends = [
        {"id": "synth-1", "name": "Cyber Ninja"},
        {"id": "synth-2", "name": "Lofi Girl"},
        {"id": "synth-3", "name": "Neon Rider"},
        {"id": "synth-4", "name": "Vinyl Junkie"},
        {"id": "synth-5", "name": "Basshead"}
    ]
    
    try:
        with driver.session() as session:
            # 1. Get 100 random tracks that YOU listen to
            result = session.run("MATCH (u:User {id: $uuid})-[:LISTENS_TO]->(t:Track) RETURN t.id AS track_id LIMIT 100", uuid=USER_UUID)
            your_tracks = [record["track_id"] for record in result]
            
            if not your_tracks:
                print("⚠️ I couldn't find your tracks! Did you wipe the database?")
                return

            print("🧬 Cloning your musical DNA to synthetic users...")
            
            # 2. For each friend, randomly select 20 tracks from your list and link them
            for friend in friends:
                # Create the user
                session.run("MERGE (u:User {id: $id, name: $name})", id=friend["id"], name=friend["name"])
                
                # Pick 20 random tracks from your pool
                friend_tracks = random.sample(your_tracks, 20)
                
                # Link the friend to the tracks
                for track_id in friend_tracks:
                    session.run("""
                        MATCH (u:User {id: $user_id})
                        MATCH (t:Track {id: $track_id})
                        MERGE (u)-[:LISTENS_TO]->(t)
                    """, user_id=friend["id"], track_id=track_id)
                    
            print(f"✅ Successfully created {len(friends)} synthetic friends in Neo4j!")
            print("Refresh your React dashboard—Your Network Picks are going to light up!")
            
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        driver.close()

if __name__ == "__main__":
    generate_synthetic_friends()