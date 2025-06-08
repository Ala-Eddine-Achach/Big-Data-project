from pymongo import MongoClient
from pymongo.errors import ServerSelectionTimeoutError
import time

MONGO_URL = "mongodb://mongodb:27017/"
DB_NAME = "github"
COLLECTION_NAME = "raw_prs"

def test_mongodb_connection():
    try:
        client = MongoClient(MONGO_URL, serverSelectionTimeoutMS=5000) # 5 second timeout
        db = client[DB_NAME]
        collection = db[COLLECTION_NAME]
        
        # Try to force a connection to trigger ServerSelectionTimeoutError if MongoDB is not available
        client.admin.command('ping')
        print(f"Successfully connected to MongoDB at {MONGO_URL}", flush=True)
        
        # Optional: Insert a test document to ensure write access
        test_doc = {"test_field": "test_value", "timestamp": time.time()}
        collection.insert_one(test_doc)
        print("Successfully inserted a test document.", flush=True)
        
        count = collection.count_documents({})
        print(f"Number of documents in {COLLECTION_NAME}: {count}", flush=True)
        
        # Clean up the test document
        collection.delete_one(test_doc)
        print("Cleaned up the test document.", flush=True)

    except ServerSelectionTimeoutError as err:
        print(f"Could not connect to MongoDB: {err}", flush=True)
    except Exception as e:
        print(f"An unexpected error occurred: {e}", flush=True)
    finally:
        if 'client' in locals() and client:
            client.close()

if __name__ == "__main__":
    test_mongodb_connection() 