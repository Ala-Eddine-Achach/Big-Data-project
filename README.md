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

## Generating Statistics

To view various statistics about the pull requests in your database, run the `report_stats.py` script:

```bash
python report_stats.py
```

This script will output statistics such as the number of open, closed, merged, and closed-not-merged pull requests, as well as a breakdown of pull requests per label.

## Viewing the Database

You can inspect the `