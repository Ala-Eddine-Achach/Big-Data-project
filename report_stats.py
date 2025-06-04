import sqlite3
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def generate_and_log_stats(db_name="pull_requests.db"):
    """Generates and logs various statistics from the pull requests database."""
    try:
        conn = sqlite3.connect(db_name)
        cursor = conn.cursor()

        logging.info("📊 Generating Pull Request Statistics:")

        # Total number of Pull Requests
        cursor.execute("SELECT COUNT(*) FROM pull_requests;")
        total_prs = cursor.fetchone()[0]
        logging.info(f"  ➡️ Total Pull Requests: {total_prs}")

        # Count Open PRs
        cursor.execute("SELECT COUNT(*) FROM pull_requests WHERE state = 'open';")
        open_prs = cursor.fetchone()[0]
        logging.info(f"  ➡️ Open Pull Requests: {open_prs}")

        # Count Closed PRs
        cursor.execute("SELECT COUNT(*) FROM pull_requests WHERE state = 'closed';")
        closed_prs = cursor.fetchone()[0]
        logging.info(f"  ➡️ Closed Pull Requests (including merged): {closed_prs}")

        # Count Merged PRs
        cursor.execute("SELECT COUNT(*) FROM pull_requests WHERE merged_at IS NOT NULL;")
        merged_prs = cursor.fetchone()[0]
        logging.info(f"  ➡️ Merged Pull Requests: {merged_prs}")

        # Count Closed but NOT Merged PRs
        cursor.execute("SELECT COUNT(*) FROM pull_requests WHERE state = 'closed' AND merged_at IS NULL;")
        closed_not_merged_prs = cursor.fetchone()[0]
        logging.info(f"  ➡️ Closed but NOT Merged Pull Requests: {closed_not_merged_prs}")

        # Count of Pull Requests per Label
        logging.info("\n🏷️ Pull Requests per Label:")
        cursor.execute('''
            SELECT
                l.id AS label_name,
                COUNT(prl.pr_id) AS pull_request_count
            FROM
                labels l
            JOIN
                pull_request_labels prl ON l.id = prl.label_id
            GROUP BY
                l.id
            ORDER BY
                pull_request_count DESC;
        ''')
        label_counts = cursor.fetchall()
        if label_counts:
            for label_name, count in label_counts:
                logging.info(f"  - {label_name}: {count}")
        else:
            logging.info("  No labels found or no pull requests associated with labels.")

        conn.close()
        logging.info("✅ Statistics generation completed.")

    except sqlite3.Error as e:
        logging.error(f"❌ Error generating statistics from database '{db_name}': {e}")

def main():
    generate_and_log_stats()

if __name__ == "__main__":
    main() 