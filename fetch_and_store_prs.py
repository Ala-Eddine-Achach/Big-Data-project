import os
import sqlite3
import requests
from dotenv import load_dotenv
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Load environment variables from .env file
load_dotenv()

def fetch_pull_requests(owner, repo, github_token):
    """Fetches pull requests from a GitHub repository."""
    headers = {
        "Authorization": f"token {github_token}",
        "Accept": "application/vnd.github.v3+json",
        "X-GitHub-Api-Version": "2022-11-28"
    }
    url = f"https://api.github.com/repos/{owner}/{repo}/pulls"
    all_pull_requests = []
    page = 1
    per_page = 100  # Max per_page to reduce the number of requests

    while True:
        try:
            params = {"state": "all", "page": page, "per_page": per_page}
            logging.info(f"Fetching page {page} of pull requests...")
            response = requests.get(url, headers=headers, params=params)
            response.raise_for_status()  # Raise an exception for bad status codes
            pull_requests_batch = response.json()

            if not pull_requests_batch:
                break  # No more pull requests to fetch

            all_pull_requests.extend(pull_requests_batch)

            # Check for the 'Link' header to determine if there are more pages
            link_header = response.headers.get('Link')
            if link_header and 'rel="next"' in link_header:
                # Extract the URL for the next page
                next_url = None
                links = link_header.split(', ')
                for link in links:
                    if 'rel="next"' in link:
                        next_url = link[link.find('<')+1:link.find('>')]
                        break
                if next_url:
                    url = next_url # Update URL for the next request
                    page += 1
                else:
                    break # No 'next' link found, so it's the last page
            else:
                break # No Link header or no 'next' relation, so it's the last page

        except requests.exceptions.RequestException as e:
            logging.error(f"❌ Error fetching pull requests from {owner}/{repo} (page {page}): {e}")
            break # Exit loop on error
    
    logging.info(f"✅ Successfully fetched all {len(all_pull_requests)} pull requests from {owner}/{repo}")
    return all_pull_requests

def initialize_db(db_name="pull_requests.db"):
    """Initializes the SQLite database and creates the pull_requests table."""
    try:
        conn = sqlite3.connect(db_name)
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS pull_requests (
                id INTEGER PRIMARY KEY,
                number INTEGER,
                title TEXT,
                user_login TEXT,
                state TEXT,
                created_at TEXT,
                updated_at TEXT,
                closed_at TEXT,
                merged_at TEXT,
                html_url TEXT
            )
        ''')
        # Create labels table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS labels (
                id TEXT PRIMARY KEY  -- label name as ID
            )
        ''')
        # Create junction table for many-to-many relationship
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS pull_request_labels (
                pr_id INTEGER,
                label_id TEXT,
                FOREIGN KEY (pr_id) REFERENCES pull_requests(id),
                FOREIGN KEY (label_id) REFERENCES labels(id),
                PRIMARY KEY (pr_id, label_id)
            )
        ''')
        conn.commit()
        logging.info(f"✅ Database '{db_name}' initialized successfully.")
        return conn
    except sqlite3.Error as e:
        logging.error(f"❌ Error initializing database '{db_name}': {e}")
        return None

def insert_pull_request_data(conn, pr_data):
    """Inserts pull request data into the SQLite database and handles labels."""
    cursor = conn.cursor()
    try:
        # Insert into pull_requests table
        cursor.execute('''
            INSERT INTO pull_requests (
                id, number, title, user_login, state, created_at,
                updated_at, closed_at, merged_at, html_url
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            pr_data["id"],
            pr_data["number"],
            pr_data["title"],
            pr_data["user"]["login"],
            pr_data["state"],
            pr_data["created_at"],
            pr_data["updated_at"],
            pr_data["closed_at"],
            pr_data["merged_at"],
            pr_data["html_url"]
        ))

        # Insert labels and associate with pull request
        for label in pr_data.get("labels", []):
            label_name = label["name"]
            # Insert label into labels table if it doesn't exist
            cursor.execute('''
                INSERT OR IGNORE INTO labels (id) VALUES (?)
            ''', (label_name,))
            # Insert into pull_request_labels junction table
            cursor.execute('''
                INSERT INTO pull_request_labels (pr_id, label_id) VALUES (?, ?)
            ''', (pr_data["id"], label_name))
        conn.commit()
        logging.info(f"➕ Inserted PR #{pr_data['number']}: {pr_data['title']}")
    except sqlite3.Error as e:
        logging.error(f"❌ Error inserting data for PR #{pr_data.get('number', 'N/A')}: {e}")
        conn.rollback() # Rollback changes if an error occurs

def main():
    github_token = os.getenv("GITHUB_TOKEN")
    if not github_token:
        logging.error("🔴 Error: GITHUB_TOKEN environment variable not set. Please set it to your GitHub Personal Access Token.")
        logging.info("➡️ You can create one here: https://github.com/settings/tokens")
        return

    # Replace with your GitHub repository details
    owner = "void-linux"
    repo = "void-packages"

    conn = initialize_db()
    if conn is None:
        logging.error("❌ Failed to initialize database. Exiting.")
        return
    
    logging.info(f"🚀 Fetching pull requests for {owner}/{repo}...")
    pull_requests = fetch_pull_requests(owner, repo, github_token)
    
    if pull_requests:
        logging.info(f"📦 Found {len(pull_requests)} pull requests.")
        for pr in pull_requests:
            insert_pull_request_data(conn, pr)
    else:
        logging.info("ℹ️ No pull requests found or an error occurred during fetching.")
    
    conn.close()
    logging.info("🎉 Database population process completed.")

if __name__ == "__main__":
    main() 