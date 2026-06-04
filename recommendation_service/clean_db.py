from neo4j import GraphDatabase

URI = "neo4j://localhost:7687"
USER = "neo4j"
PASSWORD = "secure_graph_password_123"  # Make sure this matches your Docker setup!

def clean_database():
    driver = GraphDatabase.driver(URI, auth=(USER, PASSWORD))
    
    # This Cypher query finds and deletes any track with an ID less than 100
    cypher_query = "MATCH (t:Track) WHERE t.id < 100 DETACH DELETE t"
    
    try:
        with driver.session() as session:
            session.run(cypher_query)
            print("💥 Mock tracks 1-6 successfully obliterated!")
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        driver.close()

if __name__ == "__main__":
    clean_database()