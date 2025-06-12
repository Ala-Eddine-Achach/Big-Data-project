import eventlet
eventlet.monkey_patch()

from flask import Flask, jsonify
from flask_socketio import SocketIO, emit
from flask_cors import CORS
from pymongo import MongoClient
import os
import json
import threading
import time
from confluent_kafka import Consumer, KafkaException, KafkaError
import logging

logging.basicConfig(
    format='%(asctime)s %(levelname)s: %(message)s',
    level=logging.INFO
)

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('FLASK_SECRET_KEY', 'your_strong_secret_key')
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet')

MONGO_URL = os.getenv("MONGO_URL", "mongodb://mongodb:27017")
DB_NAME = os.getenv("DB_NAME", "github")
COLLECTION = os.getenv("COLLECTION", "analytics")
RAW_PRS_COLLECTION = os.getenv("RAW_PRS_COLLECTION", "raw_prs")

KAFKA_BROKER = os.getenv("KAFKA_BROKER", "kafka_broker:29092")
KAFKA_PR_TOPIC = os.getenv("KAFKA_PR_TOPIC", "github-prs-topic")

client = MongoClient(MONGO_URL)
db = client[DB_NAME]
coll = db[COLLECTION]
raw_prs_coll = db[RAW_PRS_COLLECTION]

def monitor_mongo_changes():
    logging.info("Starting MongoDB change stream monitor...")
    while True:
        try:
            with coll.watch(full_document='updateLookup') as change_stream:
                for change in change_stream:
                    logging.info(f"Change detected: {change['operationType']}")
                    document = change.get('fullDocument')
                    if document:
                        document['_id'] = str(document['_id'])
                        socketio.emit('data_update', document)
        except Exception as e:
            logging.error(f"Error monitoring MongoDB changes: {e}")
        logging.info('Sleeping 5 seconds before reconnecting to change stream...')
        eventlet.sleep(5)

def consume_kafka_messages():
    logging.info("Starting Kafka consumer...")
    conf = {
        'bootstrap.servers': KAFKA_BROKER,
        'group.id': 'flask_api_group',
        'auto.offset.reset': 'latest'
    }
    consumer = Consumer(conf)
    try:
        consumer.subscribe([KAFKA_PR_TOPIC])
        while True:
            msg = consumer.poll(1.0)
            if msg is None:
                eventlet.sleep(0)
                continue
            if msg.error():
                if msg.error().code() == KafkaError._PARTITION_EOF:
                    eventlet.sleep(0)
                    continue
                else:
                    logging.error(f"Kafka error: {msg.error()}")
                    break
            pr_data = json.loads(msg.value().decode('utf-8'))
            logging.info(f"Received Kafka message for PR: {pr_data.get('id')}")
            if '_id' in pr_data:
                pr_data['_id'] = str(pr_data['_id'])
            socketio.emit('raw_pr_update', pr_data)
            eventlet.sleep(0)
    except Exception as e:
        logging.error(f"Error consuming Kafka messages: {e}")
    finally:
        consumer.close()

@socketio.on('connect')
def handle_connect():
    logging.info("Client connected, sending initial data...")
    emit('status', {'msg': 'Connected to backend'})
    analytics_data = []
    for doc in coll.find():
        doc['_id'] = str(doc['_id'])
        analytics_data.append(doc)
    socketio.emit('initial_analytics', analytics_data)
    logging.info(f"INFO: Sent {len(analytics_data)} initial analytics records via WebSocket.")
    try:
        raw_prs_count = raw_prs_coll.count_documents({})
        analytics_count = coll.count_documents({})
        socketio.emit('status_counts', {'raw_prs_count': raw_prs_count, 'analytics_count': analytics_count})
        logging.info(f"INFO: Sent initial counts: Raw PRs={raw_prs_count}, Analytics={analytics_count}")
        # Emit all raw PRs to the connecting client
        raw_prs_data = []
        for doc in raw_prs_coll.find():
            doc['_id'] = str(doc['_id'])
            raw_prs_data.append(doc)
        emit('initial_prs', raw_prs_data)
        logging.info(f"INFO: Sent {len(raw_prs_data)} initial raw PRs via WebSocket.")
    except Exception as e:
        logging.error(f"Error sending initial counts or raw PRs: {e}")

@socketio.on('disconnect')
def test_disconnect():
    logging.info('Client disconnected')

@app.route('/healthz')
def healthz():
    logging.info('HEALTHCHECK HIT')
    return 'ok', 200

if __name__ == '__main__':
    logging.info('STARTING SOCKETIO SERVER')
    eventlet.spawn_n(monitor_mongo_changes)
    eventlet.spawn_n(consume_kafka_messages)
    socketio.run(app, host='0.0.0.0', port=5000)