from flask import Flask, jsonify
from flask_socketio import SocketIO, emit
from flask_cors import CORS, cross_origin # Import CORS and cross_origin
from pymongo import MongoClient
import os
import json
import threading
import time

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('FLASK_SECRET_KEY', 'your_strong_secret_key') # Use a strong, unique key in production
socketio = SocketIO(app, cors_allowed_origins="*")
CORS(app, resources={r"/api/*": {"origins": "*"}}) # Initialize CORS for the Flask app, allowing all origins for /api routes

MONGO_URL = os.getenv("MONGO_URL", "mongodb://mongodb:27017")
DB_NAME = os.getenv("DB_NAME", "github")
COLLECTION = os.getenv("COLLECTION", "analytics") # Spark job outputs to analytics
RAW_PRS_COLLECTION = os.getenv("RAW_PRS_COLLECTION", "raw_prs") # Kafka consumer outputs to raw_prs

client = MongoClient(MONGO_URL)
db = client[DB_NAME]
coll = db[COLLECTION] # For analytics data
raw_prs_coll = db[RAW_PRS_COLLECTION] # For raw PR data

def monitor_mongo_changes():
    print("Starting MongoDB change stream monitor...")
    try:
        # Use a full document pre-image to get the document before and after change
        # requires MongoDB 6.0 or later and collection to have change stream pre-images enabled
        # db.command({'collMod': COLLECTION, 'changeStreamPreAndPostImages': {'enabled': True}});
        with coll.watch(full_document='updateLookup') as change_stream:
            for change in change_stream:
                print(f"Change detected: {change['operationType']}")
                # For simplicity, we'll just send the full document after update
                if change['operationType'] in ['insert', 'update', 'replace']:
                    document = change.get('fullDocument')
                    if document:
                        # Convert ObjectId to string for JSON serialization
                        document['_id'] = str(document['_id'])
                        socketio.emit('data_update', document)
                elif change['operationType'] == 'delete':
                    # Send the ID of the deleted document
                    socketio.emit('data_delete', str(change['documentKey']['_id']))
    except Exception as e:
        print(f"Error monitoring MongoDB changes: {e}")
        # Reconnect logic, or simply stop if the error is persistent

@app.route('/')
def index():
    return "WebSocket server for GitHub PR Analytics"

@app.route('/api/raw-prs')
def get_raw_prs():
    # This endpoint provides a list of individual pull requests
    # You can add query parameters for pagination, sorting, or filtering if needed.
    data = []
    # Fetching a limited number of recent PRs to avoid overwhelming the response
    for doc in raw_prs_coll.find().sort("updated_at", -1).limit(100):
        doc['_id'] = str(doc['_id'])
        if 'user' in doc and 'login' in doc['user']:
            doc['user_login'] = doc['user']['login']
        data.append(doc)
    print(f"INFO: Sending {len(data)} raw PRs via /api/raw-prs endpoint.")
    return jsonify(data)

@app.route('/api/analytics')
@cross_origin() # Add this decorator
def get_all_analytics():
    # This endpoint is for initial load or full refresh, not real-time
    data = []
    for doc in coll.find():
        doc['_id'] = str(doc['_id'])
        data.append(doc)
    print(f"INFO: Sending {len(data)} analytics records via /api/analytics endpoint.")
    return jsonify(data)

@app.route('/api/status/raw-prs-count')
def get_raw_prs_count():
    try:
        count = raw_prs_coll.count_documents({})
        return jsonify({'raw_prs_count': count})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/status/analytics-count')
def get_analytics_count():
    try:
        count = coll.count_documents({})
        return jsonify({'analytics_count': count})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@socketio.on('connect')
def test_connect():
    print("Client connected")
    emit('status', {'msg': 'Connected to backend'})

@socketio.on('disconnect')
def test_disconnect():
    print('Client disconnected')

if __name__ == '__main__':
    # Start the MongoDB change stream monitor in a separate thread
    threading.Thread(target=monitor_mongo_changes, daemon=True).start()
    socketio.run(app, host='0.0.0.0', port=5000, allow_unsafe_werkzeug=True) 