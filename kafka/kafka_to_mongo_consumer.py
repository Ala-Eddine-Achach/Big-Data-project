from kafka import KafkaConsumer
import pymongo
import json
import os

MONGO_URL = os.getenv("MONGO_URL", "mongodb://mongodb:27017/?replicaSet=rs0")
DB_NAME = os.getenv("DB_NAME", "github")
COLLECTION = os.getenv("RAW_PRS_COLLECTION", "raw_prs")
KAFKA_TOPIC = os.getenv("KAFKA_TOPIC", "github-prs-topic")
KAFKA_SERVER = os.getenv("KAFKA_SERVER", "kafka_broker:29092")

client = pymongo.MongoClient(MONGO_URL)
db = client[DB_NAME]
coll = db[COLLECTION]

consumer = KafkaConsumer(
    KAFKA_TOPIC,
    bootstrap_servers=[KAFKA_SERVER],
    value_deserializer=lambda m: json.loads(m.decode('utf-8'))
)

for message in consumer:
    pr = message.value
    coll.update_one(
        {"number": pr["number"]},
        {"$set": pr},
        upsert=True
    )
    print(f"Upserted PR #{pr['number']} into MongoDB")