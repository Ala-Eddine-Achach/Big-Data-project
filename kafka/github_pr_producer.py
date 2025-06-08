import requests
import time
from kafka import KafkaProducer
import json
import os
from dotenv import load_dotenv

load_dotenv()

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
OWNER = os.getenv("OWNER")
REPO = os.getenv("REPO")
KAFKA_TOPIC = "github-prs"
KAFKA_SERVER = "localhost:9092"

producer = KafkaProducer(
    bootstrap_servers=[KAFKA_SERVER],
    value_serializer=lambda v: json.dumps(v).encode('utf-8')
)

headers = {
    "Authorization": f"token {GITHUB_TOKEN}",
    "Accept": "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28"
}

per_page = 10
last_updated = None

def get_prs(page, since=None):
    params = {
        "state": "all",
        "sort": "updated",
        "direction": "asc",
        "per_page": per_page,
        "page": page
    }
    if since:
        params["since"] = since
    r = requests.get(
        f"https://api.github.com/repos/{OWNER}/{REPO}/pulls",
        headers=headers,
        params=params
    )
    r.raise_for_status()
    return r.json()

while True:
    fetched = 0
    prs = get_prs(1, since=last_updated)
    if not prs:
        print("No new PRs to fetch.")
    else:
        for pr in prs:
            # Extract only the necessary fields
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
                "labels": pr["labels"]
            }
            producer.send(KAFKA_TOPIC, pr_data)
            fetched += 1
        last_updated = prs[-1]["updated_at"]

    print(f"Fetched and sent {fetched} PRs to Kafka.")
    time.sleep(600)  # wait before next poll