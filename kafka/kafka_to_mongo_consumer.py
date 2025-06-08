from kafka import KafkaConsumer, errors
import pymongo
import json
import os
import time

MONGO_URL = os.getenv("MONGO_URL", "mongodb://mongodb:27017/?replicaSet=rs0")
DB_NAME = os.getenv("DB_NAME", "github")
COLLECTION = os.getenv("RAW_PRS_COLLECTION", "raw_prs")
KAFKA_TOPIC = os.getenv("KAFKA_TOPIC", "github-prs-topic")
KAFKA_SERVER = os.getenv("KAFKA_SERVER", "kafka_broker:29092")

# MongoDB connection with retry logic
client = None
retry_delay_seconds = 5
while True:
    try:
        client = pymongo.MongoClient(MONGO_URL, serverSelectionTimeoutMS=5000)
        client.admin.command('ping')
        print("INFO: Successfully connected to MongoDB.")
        break
    except pymongo.errors.ServerSelectionTimeoutError as e:
        print(f"WARNING: MongoDB not available, retrying in {retry_delay_seconds} seconds: {e}")
        time.sleep(retry_delay_seconds)
    except Exception as e:
        print(f"ERROR: An unexpected error occurred during MongoDB connection: {e}. Exiting.")
        exit(1)

db = client[DB_NAME]
coll = db[COLLECTION]

# Kafka Consumer connection with retry logic
consumer = None
while True:
    try:
        consumer = KafkaConsumer(
            KAFKA_TOPIC,
            bootstrap_servers=[KAFKA_SERVER],
            value_deserializer=lambda m: json.loads(m.decode('utf-8'))
        )
        print("INFO: Successfully connected to Kafka consumer.")
        break
    except errors.NoBrokersAvailable:
        print(f"WARNING: Kafka broker not available for consumer, retrying in {retry_delay_seconds} seconds...")
        time.sleep(retry_delay_seconds)
    except Exception as e:
        print(f"ERROR: An unexpected error occurred during Kafka consumer connection: {e}. Exiting.")
        exit(1)

for message in consumer:
    pr = message.value
    coll.update_one(
        {"number": pr["number"]},
        {"$set": pr},
        upsert=True
    )
    print(f"Upserted PR #{pr['number']} into MongoDB")