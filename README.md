# GitHub PR Big Data Pipeline

This project sets up a comprehensive big data pipeline to ingest, process, and visualize GitHub Pull Request (PR) data in near real-time.

## Components
-   **GitHub PR Producer**: Fetches PRs from the GitHub API and sends them to Kafka. (`kafka/github_pr_producer.py`)
-   **Kafka**: A distributed streaming platform for ingesting and processing PR data. (`kafka_broker` service)
-   **Kafka to MongoDB Consumer**: Reads PR data from Kafka and stores it in MongoDB. (`kafka/kafka_to_mongo_consumer.py`)
-   **MongoDB**: A NoSQL database serving as a data lake for raw PRs and storing aggregated analytics. (`mongodb` service)
-   **Spark Batch Job**: Processes raw PR data from MongoDB to generate analytics (e.g., average merge time, PR activity) and stores the results back into MongoDB. (`spark/spark-batch-job.py`)
-   **Flask API**: A Python Flask application that exposes REST endpoints for the dashboard to fetch raw PR data and analytics, and serves as a WebSocket server for real-time updates. (`api/app.py`)
-   **React Dashboard**: A modern web application built with React, served by Nginx, that visualizes the PR analytics and raw PR data from the Flask API, including real-time updates via WebSockets. (`dashboard/`)

## How To Run

1.  **Build and Start All Services (Recommended):**
    Navigate to the project root directory and run:
    ```bash
    docker-compose up --build -d
    ```
    This command will:
    *   Build Docker images for all custom services (backend API, dashboard, producer, consumer, Spark job).
    *   Download necessary images for Kafka, Zookeeper, and MongoDB.
    *   Start all services in detached mode.

2.  **Access the Dashboard:**
    Once all services are up, open your web browser and navigate to:
    `http://localhost/`
    The dashboard will display real-time and historical GitHub PR analytics.

3.  **View Backend API Logs:**
    To see logs from the Flask API (backend_api service), run:
    ```bash
    docker-compose logs backend_api
    ```
    You can also view logs for other services by replacing `backend_api` with `github_pr_producer`, `kafka_to_mongo_consumer`, `spark_batch_job`, `kafka_broker`, `mongodb`, or `zookeeper`.

## Customization

-   **GitHub Repository/Owner/Token**: Modify `kafka/github_pr_producer.py` to change the GitHub repository, owner, or your personal access token for fetching PRs.
-   **Spark Analytics**: Adjust the logic in `spark/spark-batch-job.py` to perform different or more advanced analytics on the PR data.
-   **API Endpoints**: Extend `api/app.py` to add new API endpoints or modify existing ones to serve different data or analytics.
-   **Dashboard UI**: Customize the React components in `dashboard/src/components` to change the appearance or add new visualizations.

## Notes

-   All raw PR data is stored in MongoDB's `github.raw_prs` collection.
-   Processed analytics data is stored in MongoDB's `github.analytics` collection.
-   Kafka facilitates real-time streaming of PR events.
-   Spark is used for batch processing and aggregation of PR data.
-   CORS is configured on the Flask API to allow requests from the dashboard. If you change the dashboard's origin, remember to update the `CORS` configuration in `api/app.py`.

---

**This project is modular: you can swap components like Kafka, MongoDB, or even the processing engine (e.g., Flink instead of Spark) to fit different architectural needs!**