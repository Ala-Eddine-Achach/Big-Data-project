import requests
import time
from kafka import KafkaProducer
import json
import os
from datetime import datetime

print("DEBUG: Environment variables at startup:")
for key, value in os.environ.items():
    print(f"DEBUG: {key}={value}")

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
OWNER = os.getenv("OWNER")
REPO = os.getenv("REPO")
KAFKA_TOPIC = os.getenv("KAFKA_TOPIC", "github-prs-topic")
KAFKA_SERVER = os.getenv("KAFKA_SERVER", "kafka_broker:29092")

producer = None
max_retries = 10
retry_delay_seconds = 5

for i in range(max_retries):
    try:
        producer = KafkaProducer(
            bootstrap_servers=[KAFKA_SERVER],
            value_serializer=lambda v: json.dumps(v).encode('utf-8')
        )
        print(f"INFO: Successfully connected to Kafka after {i+1} attempts.")
        break
    except Exception as e:
        print(f"WARNING: Failed to connect to Kafka (attempt {i+1}/{max_retries}): {e}")
        if i < max_retries - 1:
            time.sleep(retry_delay_seconds)
        else:
            print("ERROR: Exceeded maximum Kafka connection retries. Exiting.")
            exit(1)

headers = {
    "Authorization": f"token {GITHUB_TOKEN}",
    "Accept": "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28"
}

per_page = 100 # Maximum per_page allowed by GitHub API
last_processed_updated_at = None # Store as datetime object

def fetch_pull_requests_from_github():
    all_prs = []
    page = 1
    while True:
        params = {
            "state": "all",
            "sort": "updated",
            "direction": "asc",
            "per_page": per_page,
            "page": page
        }
        
        request_url = f"https://api.github.com/repos/{OWNER}/{REPO}/pulls"
        print(f"DEBUG: Request URL: {request_url}")
        print(f"DEBUG: Request Headers: {headers}")
        print(f"DEBUG: Request Params: {params}")

        try:
            r = requests.get(request_url, headers=headers, params=params)
            r.raise_for_status() # Raise HTTPError for bad responses (4xx or 5xx)
            current_page_prs = r.json()
        except requests.exceptions.RequestException as e:
            print(f"ERROR: Failed to fetch pull requests: {e}")
            break # Exit loop on error
        
        if not current_page_prs:
            break # No more PRs
        
        all_prs.extend(current_page_prs)
        
        if len(current_page_prs) < per_page:
            break # Less than per_page, so it's the last page

        page += 1
        time.sleep(1) # Be a good citizen, avoid hitting rate limits
    return all_prs

while True:
    fetched_count = 0  # Count of PRs sent to Kafka in this interval
    # This variable tracks the latest updated_at among ALL new/updated PRs fetched from API
    # for the purpose of setting last_processed_updated_at for the *next* iteration.
    current_max_updated_at_overall_fetched = last_processed_updated_at

    prs_from_api = fetch_pull_requests_from_github()

    if not prs_from_api:
        print("No PRs fetched from GitHub API in this iteration.")
    else:
        for pr in prs_from_api:
            pr_updated_at_str = pr["updated_at"]
            try:
                pr_updated_at_dt = datetime.strptime(pr_updated_at_str, "%Y-%m-%dT%H:%M:%SZ")
            except ValueError:
                print(f"WARNING: Could not parse updated_at timestamp: {pr_updated_at_str} for PR {pr.get('number')}. Skipping.")
                continue

            # This condition checks if the PR is genuinely new or updated compared to our last processed one.
            if last_processed_updated_at is None or pr_updated_at_dt > last_processed_updated_at:
                # Update the overall max timestamp encountered in this API fetch, for the next iteration's 'since'
                if current_max_updated_at_overall_fetched is None or pr_updated_at_dt > current_max_updated_at_overall_fetched:
                    current_max_updated_at_overall_fetched = pr_updated_at_dt

                # Now, apply the sending limit
                if fetched_count < 20:  # Only send if we haven't reached the limit for this interval
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
                        fetched_count += 1
                    except Exception as e:
                        print(f"ERROR: Failed to send PR {pr.get('number')} to Kafka: {e}")
                else:
                    # If we've hit the sending limit but there are still newer PRs,
                    # we still want to update current_max_updated_at_overall_fetched to account for them.
                    pass  # We just don't send this PR in this interval, but we mark it as "seen" for the next poll.
            else:
                # Since PRs are sorted by updated_at ascending, if we find one that's
                # not strictly newer, we can stop processing this batch as subsequent PRs will also be older or same.
                break

        # After processing all relevant PRs, update the overall last_processed_updated_at for the next cycle.
        # This ensures we don't re-process PRs that were newer than the last_processed_updated_at from the previous cycle
        # but were not sent due to the 20-PR limit.
        last_processed_updated_at = current_max_updated_at_overall_fetched

    print(f"Processed and sent {fetched_count} new or updated PRs to Kafka in this interval. Last processed timestamp for next run: {last_processed_updated_at.isoformat() if last_processed_updated_at else 'None'}")
    time.sleep(300)  # Wait for 5 minutes (300 seconds)