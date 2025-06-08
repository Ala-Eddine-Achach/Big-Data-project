from kafka import KafkaConsumer
import pymongo
import json

MONGO_URL = "mongodb://localhost:27017"
DB_NAME = "github"
COLLECTION = "raw_prs"
KAFKA_TOPIC = "github-prs"
KAFKA_SERVER = "localhost:9092"

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