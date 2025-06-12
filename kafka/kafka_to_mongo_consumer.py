from kafka import KafkaConsumer, errors
import pymongo
import json
import os
import time
import logging

logging.basicConfig(
    format='%(asctime)s %(levelname)s: %(message)s',
    level=logging.INFO
)

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
        logging.info("INFO: Successfully connected to MongoDB.")
        break
    except pymongo.errors.ServerSelectionTimeoutError as e:
        logging.warning(f"WARNING: MongoDB not available, retrying in {retry_delay_seconds} seconds: {e}")
        time.sleep(retry_delay_seconds)
    except Exception as e:
        logging.error(f"ERROR: An unexpected error occurred during MongoDB connection: {e}. Exiting.")
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
        logging.info("INFO: Successfully connected to Kafka consumer.")
        break
    except errors.NoBrokersAvailable:
        logging.warning(f"WARNING: Kafka broker not available for consumer, retrying in {retry_delay_seconds} seconds...")
        time.sleep(retry_delay_seconds)
    except Exception as e:
        logging.error(f"ERROR: An unexpected error occurred during Kafka consumer connection: {e}. Exiting.")
        exit(1)

logging.info("INFO: Starting to consume messages from Kafka...")

for message in consumer:
    logging.info(f"INFO: Received message from Kafka for PR: {message.value.get('number', 'N/A')}")
    pr = message.value
    # Remove MongoDB's _id field if it exists in the incoming data
    # This ensures MongoDB generates/manages _id correctly for upserts
    if '_id' in pr:
        del pr['_id']
    logging.info(f"INFO: Attempting to upsert PR #{pr['number']} into MongoDB.")
    try:
        result = coll.update_one(
            {"number": pr["number"]},
            {"$set": pr},
            upsert=True
        )
        logging.info(f"INFO: Upserted PR #{pr['number']} into MongoDB. Matched: {result.matched_count}, Modified: {result.modified_count}, Upserted Id: {result.upserted_id}")
    except pymongo.errors.PyMongoError as e:
        logging.error(f"ERROR: Failed to upsert PR #{pr['number']} into MongoDB: {e}")
    except Exception as e:
        logging.error(f"ERROR: An unexpected error occurred during MongoDB upsert for PR #{pr['number']}: {e}")