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
    print("Starting MongoDB change stream monitor...")
    try:
        with coll.watch(full_document='updateLookup') as change_stream:
            for change in change_stream:
                print(f"Change detected: {change['operationType']}")
                if change['operationType'] in ['insert', 'update', 'replace']:
                    document = change.get('fullDocument')
                    if document:
                        document['_id'] = str(document['_id'])
                        socketio.emit('data_update', document)
                elif change['operationType'] == 'delete':
                    socketio.emit('data_delete', str(change['documentKey']['_id']))
    except Exception as e:
        print(f"Error monitoring MongoDB changes: {e}")

def consume_kafka_messages():
    print("Starting Kafka consumer...")
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
                continue
            if msg.error():
                if msg.error().code() == KafkaError._PARTITION_EOF:
                    continue
                else:
                    print(f"Kafka error: {msg.error()}")
                    break
            pr_data = json.loads(msg.value().decode('utf-8'))
            print(f"Received Kafka message for PR: {pr_data.get('id')}")
            if '_id' in pr_data:
                pr_data['_id'] = str(pr_data['_id'])
            socketio.emit('raw_pr_update', pr_data)
            # Consider removing or reducing the sleep time if you want real-time updates
    except Exception as e:
        print(f"Error consuming Kafka messages: {e}")
    finally:
        consumer.close()

@socketio.on('connect')
def handle_connect():
    print("Client connected, sending initial data...")
    emit('status', {'msg': 'Connected to backend'})
    analytics_data = []
    for doc in coll.find():
        doc['_id'] = str(doc['_id'])
        analytics_data.append(doc)
    socketio.emit('initial_analytics', analytics_data)
    print(f"INFO: Sent {len(analytics_data)} initial analytics records via WebSocket.")
    try:
        raw_prs_count = raw_prs_coll.count_documents({})
        analytics_count = coll.count_documents({})
        socketio.emit('status_counts', {'raw_prs_count': raw_prs_count, 'analytics_count': analytics_count})
        print(f"INFO: Sent initial counts: Raw PRs={raw_prs_count}, Analytics={analytics_count}")
    except Exception as e:
        print(f"Error sending initial counts: {e}")

@socketio.on('disconnect')
def test_disconnect():
    print('Client disconnected')

if __name__ == '__main__':
    threading.Thread(target=monitor_mongo_changes, daemon=True).start()
    threading.Thread(target=consume_kafka_messages, daemon=True).start()
    socketio.run(app, host='0.0.0.0', port=5000)