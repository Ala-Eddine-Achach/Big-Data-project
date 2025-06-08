import requests
import time
from kafka import KafkaProducer, errors
import json
import os

print("INFO: Producer script started.")

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
OWNER = os.getenv("OWNER")
REPO = os.getenv("REPO")
KAFKA_TOPIC = os.getenv("KAFKA_TOPIC", "github-prs-topic")
KAFKA_SERVER = os.getenv("KAFKA_SERVER", "kafka_broker:29092")

# Kafka connection with retry
while True:
    try:
        producer = KafkaProducer(
            bootstrap_servers=[KAFKA_SERVER],
            value_serializer=lambda v: json.dumps(v).encode('utf-8')
        )
        print("INFO: Successfully connected to Kafka.")
        break
    except errors.NoBrokersAvailable:
        print("WARNING: Kafka not available, retrying in 5 seconds...")
        time.sleep(5)

headers = {
    "Authorization": f"token {GITHUB_TOKEN}",
    "Accept": "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28"
}

def fetch_prs(page, per_page=20, sort="updated", direction="asc"):
    print(f"DEBUG: Fetching PRs - Page: {page}, Per Page: {per_page}, Sort: {sort}, Direction: {direction}")
    params = {
        "state": "all",
        "sort": sort,
        "direction": direction,
        "per_page": per_page,
        "page": page
    }
    url = f"https://api.github.com/repos/{OWNER}/{REPO}/pulls"
    print(f"DEBUG: Requesting URL: {url} with params: {params}")
    r = requests.get(url, headers=headers, params=params)
    r.raise_for_status()
    fetched_prs = r.json()
    print(f"DEBUG: Fetched {len(fetched_prs)} PRs from GitHub API for page {page}.")
    return fetched_prs

def send_prs_to_kafka(prs):
    print(f"INFO: Attempting to send {len(prs)} PRs to Kafka topic '{KAFKA_TOPIC}'.")
    for pr in prs:
        pr_data = {
            "number": pr["number"],
            "title": pr["title"],
            "user_login": pr["user"]["login"],
            "state": pr["state"],
            "created_at": pr["created_at"],
            "updated_at": pr["updated_at"],
            "closed_at": pr["closed_at"],
            "merged_at": pr["merged_at"],
            "html_url": pr["html_url"],
            "labels": [label["name"] for label in pr["labels"]]
        }
        try:
            producer.send(KAFKA_TOPIC, pr_data)
            print(f"DEBUG: Sent PR #{pr['number']} to Kafka.")
        except Exception as e:
            print(f"ERROR: Failed to send PR #{pr.get('number')} to Kafka: {e}")

    print(f"INFO: Successfully sent {len(prs)} PRs to Kafka.")

# --- Phase 1: Fetch ALL PRs, oldest to newest, 20 at a time ---
print("INFO: Starting Phase 1: Initial sync (fetching all PRs, oldest to newest, in batches).")
page = 1
while True:
    prs = fetch_prs(page=page, direction="asc")
    if not prs:
        print("INFO: No more PRs to fetch in Phase 1. Breaking.")
        break
    send_prs_to_kafka(prs)
    print(f"INFO: Waiting 2 minutes before fetching next batch for Phase 1...")
    time.sleep(120)  # Wait 2 minutes between batches
    if len(prs) < 20:
        print("INFO: Last batch in Phase 1 was less than 20. Assuming end of pages. Breaking.")
        break  # No more pages
    page += 1

# --- Phase 2: Always send the latest 20 updated PRs every 2 min, forever ---
print("INFO: Starting Phase 2: Ongoing updates (fetching latest 20 PRs every 2 minutes, forever).")
while True:
    prs = fetch_prs(page=1, direction="desc")
    send_prs_to_kafka(prs)
    print(f"INFO: Waiting 2 minutes before fetching next batch for Phase 2...")
    time.sleep(120)