import requests
import psycopg2
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
print(f"DEBUG: GITHUB_TOKEN received: {GITHUB_TOKEN[:4]}...{GITHUB_TOKEN[-4:] if GITHUB_TOKEN else None}")
DB_HOST = "localhost"
DB_NAME = "pull_requests_db"
DB_USER = "user"
DB_PASSWORD = "password"

headers = {
    "Authorization": f"token {GITHUB_TOKEN}",
    "Accept": "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28"
}

def fetch_prs(page=1, per_page=100):
    url = f"https://api.github.com/repos/void-linux/void-packages/pulls?state=all&page={page}&per_page={per_page}"
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()  # Raise an HTTPError for bad responses (4xx or 5xx)
        logging.info(f"✅ Successfully fetched page {page} from GitHub API.")
        return response.json()
    except requests.exceptions.RequestException as e:
        logging.error(f"❌ Error fetching PRs from GitHub API (page {page}): {e}")
        return None

def save_prs(prs):
    if not prs:
        return
    conn = None
    cur = None
    try:
        conn = psycopg2.connect(host=DB_HOST, dbname=DB_NAME, user=DB_USER, password=DB_PASSWORD)
        conn.autocommit = True # Ensure DDL statements are committed immediately
        cur = conn.cursor()

        for pr in prs:
            # Check if the table exists before attempting insertion
            cur.execute("""
                SELECT EXISTS (
                    SELECT 1
                    FROM information_schema.tables
                    WHERE table_schema = 'public'
                    AND table_name = 'pull_requests'
                );
            """)
            if not cur.fetchone()[0]:
                logging.error("❌ Table 'pull_requests' does not exist. Please ensure the database is initialized correctly.")
                return # Stop execution if table does not exist
            
            cur.execute("""
                INSERT INTO pull_requests (id, number, title, state, created_at, updated_at, closed_at, merged_at, user_login, html_url)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO NOTHING
            """, (
                pr["id"],
                pr["number"],
                pr["title"],
                pr["state"],
                pr["created_at"],
                pr["updated_at"],
                pr.get("closed_at"),
                pr.get("merged_at"),
                pr["user"]["login"],
                pr["html_url"]
            ))

        conn.commit()
        logging.info(f"✅ Successfully saved {len(prs)} PRs to the database.")
    except psycopg2.Error as e:
        logging.error(f"❌ Error saving PRs to database: {e}")
        if conn:
            conn.rollback()
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

if __name__ == "__main__":
    logging.info("🚀 Starting pull request fetching process.")
    page = 1
    while True:
        prs = fetch_prs(page)
        if prs is None:
            logging.error("❌ Stopping due to API error.")
            break
        if not prs:
            logging.info("✅ No more PRs to fetch.")
            break
        logging.info(f"Processing page {page} with {len(prs)} PRs.")
        save_prs(prs)
        # Break the loop if an error occurred during saving to prevent infinite loops
        if logging.getLogger().handlers[0].level == logging.ERROR:
            break # Assuming first handler is console output and we set level to ERROR on error
        page += 1
    logging.info("🏁 Pull request fetching process completed.")
