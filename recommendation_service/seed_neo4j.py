from neo4j import GraphDatabase

# IMPORTANT: Keep the password you found in docker-compose.yml!
URI = "neo4j://localhost:7687"
USER = "neo4j"
PASSWORD = "secure_graph_password_123" 

def seed_database():
    driver = GraphDatabase.driver(URI, auth=(USER, PASSWORD))
    
    # Query 1: The Wrecking Ball
    cypher_clear = "MATCH (n) DETACH DELETE n"
    
    # Query 2: The Builder
    cypher_build = """
    MERGE (u1:User {id: 'a1b1be59-50a8-4255-a041-845c603083c9', username: '01shreyash'})
    MERGE (u2:User {id: 'user-002', username: 'lofi_girl'})
    MERGE (u3:User {id: 'user-003', username: 'cyber_ninja'})
    
    MERGE (t1:Track {id: 1, title: 'Neural Synapse Part 1', artist: 'Resonance AI', duration: '3:42'})
    MERGE (t2:Track {id: 2, title: 'Deep Learning Lofi', artist: 'Resonance AI', duration: '2:55'})
    MERGE (t3:Track {id: 3, title: 'Gradient Descent', artist: 'Resonance AI', duration: '4:10'})
    MERGE (t4:Track {id: 4, title: 'Vector Embeddings', artist: 'Resonance AI', duration: '3:15'})
    MERGE (t5:Track {id: 5, title: 'Backpropagation', artist: 'Resonance AI', duration: '5:01'})
    MERGE (t6:Track {id: 6, title: 'Latent Space', artist: 'Resonance AI', duration: '4:20'})
    
    MERGE (u1)-[:LISTENS_TO]->(t1)
    MERGE (u1)-[:LISTENS_TO]->(t2)
    
    MERGE (u2)-[:LISTENS_TO]->(t1)
    MERGE (u2)-[:LISTENS_TO]->(t2)
    MERGE (u2)-[:LISTENS_TO]->(t5)
    
    MERGE (u3)-[:LISTENS_TO]->(t1)
    MERGE (u3)-[:LISTENS_TO]->(t3)
    MERGE (u3)-[:LISTENS_TO]->(t6)
    """
    
    try:
        with driver.session() as session:
            # We run them sequentially now!
            session.run(cypher_clear)
            session.run(cypher_build)
            print("✅ Successfully seeded Neo4j with Users, Tracks, and Listening Graph!")
    except Exception as e:
        print(f"❌ Error connecting to Neo4j: {e}")
    finally:
        driver.close()

if __name__ == "__main__":
    print("Connecting to Neo4j and building the graph...")
    seed_database()