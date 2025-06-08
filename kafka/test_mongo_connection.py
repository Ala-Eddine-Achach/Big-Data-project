import pymongo
import time

def test_mongo_connection():
    mongo_client = None
    while mongo_client is None:
        try:
            print("INFO: Attempting to connect to MongoDB...")
            mongo_client = pymongo.MongoClient("mongodb://mongodb:27017/", serverSelectionTimeoutMS=5000)
            mongo_client.admin.command('ping') # Test connection
            print("INFO: Successfully connected to MongoDB.")
        except pymongo.errors.ServerSelectionTimeoutError as err:
            print(f"ERROR: MongoDB connection failed: {err}")
            time.sleep(5)
        except Exception as e:
            print(f"ERROR: An unexpected error occurred during MongoDB connection: {e}")
            time.sleep(5)

    db = mongo_client.github
    collection = db.raw_prs

    test_document = {"source": "test_script", "timestamp": time.time(), "message": "This is a test document from the consumer container."}
    try:
        result = collection.insert_one(test_document)
        print(f"INFO: Successfully inserted test document with ID: {result.inserted_id}")
        # Verify insertion by counting documents
        count_after_insert = collection.count_documents({})
        print(f"INFO: Documents in collection after insert: {count_after_insert}")
    except Exception as e:
        print(f"ERROR: Failed to insert test document: {e}")
    finally:
        mongo_client.close()
        print("INFO: MongoDB connection closed.")

if __name__ == "__main__":
    test_mongo_connection() 