# Your Project Title

## Description

This project fetches pull request data from a GitHub repository, stores it in a SQLite database, and includes a column for associated labels.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   **Python 3.x:** Ensure you have Python installed.
*   **Git:** For cloning the repository.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Ala-Eddine-Achach/Big-Data-project.git
    cd Big-Data-project
    ```

2.  **Install Python dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

3.  **Set up your GitHub Personal Access Token:**
    To fetch data from GitHub, you need a Personal Access Token (PAT). Create one by following these steps:
    *   Go to [GitHub Developer Settings](https://github.com/settings/tokens).
    *   Click on "Generate new token" (or "Generate new token (classic)").
    *   Give your token a descriptive name (e.g., "Big-Data-project-PR-Fetcher").
    *   Grant the `repo` scope (or at least `public_repo` if it's a public repository). You might need `repo` for private repositories or full access.
    *   Click "Generate token" and **copy the token immediately**. You won't be able to see it again.

    Create a file named `.env` in the root directory of your project (where `fetch_and_store_prs.py` is located) and add your token like this:

    ```
    GITHUB_TOKEN=your_personal_access_token_here
    ```
    **Replace `your_personal_access_token_here` with the actual token you copied from GitHub.**

## Usage

To fetch pull requests and populate the SQLite database:

```bash
python fetch_and_store_prs.py
```

This will create a `pull_requests.db` file in your project directory containing the fetched data.

## Viewing the Database

You can inspect the `pull_requests.db` SQLite database using the `sqlite3` command-line tool.

1.  **Open the database:**
    Navigate to your project's root directory in your terminal and run:
    ```bash
    sqlite3 pull_requests.db
    ```
    You will see the `sqlite>` prompt.

2.  **List tables:**
    At the `sqlite>` prompt, type:
    ```sql
    .tables
    ```
    You should see `labels`, `pull_requests`, and `pull_request_labels`.

3.  **View table schema:**
    To see the schema of a specific table (e.g., `pull_requests`):
    ```sql
    .schema pull_requests
    .schema labels
    .schema pull_request_labels
    ```

4.  **Query data (example):**
    To see some pull requests:
    ```sql
    SELECT number, title, user_login FROM pull_requests LIMIT 5;
    ```
    To see labels for a specific pull request (e.g., PR number 123, replace with an actual PR number):
    ```sql
    SELECT
        pr.number,
        pr.title,
        l.id AS label_name
    FROM
        pull_requests pr
    JOIN
        pull_request_labels prl ON pr.id = prl.pr_id
    JOIN
        labels l ON prl.label_id = l.id
    WHERE
        pr.number = 123; -- Replace 123 with an actual pull request number
    ```

    To exit the SQLite prompt, type `.quit` and press Enter.

## Database Structure

The `pull_requests.db` SQLite database now uses a normalized schema with three tables:

*   **`pull_requests` table**
    *   `id`: Unique ID of the pull request.
    *   `number`: The pull request number.
    *   `title`: The title of the pull request.
    *   `user_login`: The GitHub login of the user who created the pull request.
    *   `state`: The current state of the pull request (e.g., 'open', 'closed').
    *   `created_at`: Timestamp when the pull request was created.
    *   `updated_at`: Timestamp when the pull request was last updated.
    *   `closed_at`: Timestamp when the pull request was closed.
    *   `merged_at`: Timestamp when the pull request was merged.
    *   `html_url`: The URL to the pull request on GitHub.

*   **`labels` table**
    *   `id`: The unique name of the label (e.g., 'bug', 'enhancement').

*   **`pull_request_labels` table (Junction Table)**
    *   `pr_id`: Foreign key referencing the `id` from the `pull_requests` table.
    *   `label_id`: Foreign key referencing the `id` (label name) from the `labels` table.
    *   This table manages the many-to-many relationship between pull requests and labels.

## Running Tests

Explain how to run any tests for your project. For example:

```bash
pytest
```

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Contact

Your Name - your_email@example.com

Project Link: [https://github.com/Ala-Eddine-Achach/Big-Data-project](https://github.com/Ala-Eddine-Achach/Big-Data-project)

## Acknowledgments

*   List any resources, tutorials, or open-source projects that helped you. 