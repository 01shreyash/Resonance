import random
from neo4j import GraphDatabase

URI = "neo4j://localhost:7687"
USER = "neo4j"
PASSWORD = "secure_graph_password_123"  # Make sure this matches your Docker setup!
USER_UUID = "a1b1be59-50a8-4255-a041-845c603083c9"

def fix_network():
    driver = GraphDatabase.driver(URI, auth=(USER, PASSWORD))
    
    try:
        with driver.session() as session:
            # 1. Grab 200 random tracks from the database
            result = session.run("MATCH (t:Track) RETURN t.id AS track_id LIMIT 200")
            all_tracks = [record["track_id"] for record in result]
            
            if not all_tracks:
                print("No tracks found!")
                return
            
            user_keeps = all_tracks[:100]
            friends_exclusive = all_tracks[100:]
            
            print("🔧 Creating blind spots in your library...")
            
            # 2. Make you "forget" 100 tracks so the AI can recommend them back
            for track_id in friends_exclusive:
                session.run("""
                    MATCH (u:User {id: $uid})-[r:LISTENS_TO]->(t:Track {id: $tid})
                    DELETE r
                """, uid=USER_UUID, tid=track_id)
                
            # 3. Rewire the synthetic friends
            friends = ["synth-1", "synth-2", "synth-3", "synth-4", "synth-5"]
            
            for friend_id in friends:
                # Overlap: 5 tracks you both know (to prove similarity)
                overlap = random.sample(user_keeps, 5)
                # Novel: 5 tracks ONLY the friend knows (for the recommendation)
                novel = random.sample(friends_exclusive, 5)
                
                for track_id in overlap + novel:
                    session.run("""
                        MATCH (u:User {id: $uid})
                        MATCH (t:Track {id: $tid})
                        MERGE (u)-[:LISTENS_TO]->(t)
                    """, uid=friend_id, tid=track_id)

            print("✅ Network fixed! Your collaborative AI now has tracks to recommend.")
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        driver.close()

if __name__ == "__main__":
    fix_network()