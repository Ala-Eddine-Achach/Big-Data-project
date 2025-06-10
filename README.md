# GitHub PR Big Data Pipeline

A real-time and batch data processing pipeline for analyzing GitHub Pull Request (PR) activity.

This project demonstrates a hybrid architecture combining streaming and batch processing with a modern data lake and interactive dashboard.

## Architecture Overview

- **Apache Kafka**: Stream ingestion of GitHub PR data
- **MongoDB (Data Lake)**: Raw data and aggregated analytics storage
- **Apache Spark**: Batch processing and time-based analytics
- **Flask-SocketIO**: Real-time streaming API for the dashboard
- **React Dashboard**: Visualization of PR trends and activity
- **Docker Compose**: Orchestration of the complete pipeline

![Architecture Diagram](https://github.com/user-attachments/assets/95063cf7-de87-4c41-aa2c-f1ea6bda5347)

## Features

✅ Real-time ingestion of GitHub PR data  
✅ Streaming updates to an interactive dashboard  
✅ Batch analytics for long-term trends  
✅ Data lake architecture with MongoDB  
✅ Scalable and modular design  

## Pipeline Components

### 1️⃣ GitHub PR Producer

- Python script to fetch PRs from GitHub API
- Streams PR data into Kafka topic: `github-prs-topic`

### 2️⃣ Kafka Broker

- High-throughput streaming backbone
- Decouples data ingestion from processing

### 3️⃣ Kafka Consumer → MongoDB (Data Lake)

- Consumes PR records from Kafka
- Writes raw PR data into `raw_prs` collection
- Enables both real-time and batch access

### 4️⃣ Apache Spark Batch Job

- Periodic batch processing of raw PR data
- Aggregates metrics such as:
  - Average merge time
  - PR volume by time slot and weekday
- Writes analytics into `analytics` collection

### 5️⃣ Flask-SocketIO Backend

- Streams both:
  - Live PR updates from Kafka
  - Aggregated analytics updates from MongoDB
- WebSocket API for real-time dashboard updates

### 6️⃣ React Dashboard

- Interactive visualization of:
  - Live PR events
  - Historical trends (via batch analytics)
- Connects to backend via WebSocket (Socket.IO)

## Running the Pipeline

### Prerequisites

- Docker
- Docker Compose

### Steps

1️⃣ Clone the repository:

```bash
git clone https://github.com/YOUR_USERNAME/github-pr-bigdata-pipeline.git
cd github-pr-bigdata-pipeline
```

2️⃣ Configure GitHub API token:

Edit config/github_config.py and insert your GitHub token.

3️⃣ Start the full pipeline:

```bash
docker-compose up --build
```

4️⃣ Access the dashboard:
```bash
http://localhost:3000
```

5️⃣ Run Spark batch job manually (optional):

```bash
docker-compose exec spark spark-submit /opt/spark/jobs/spark_batch_job.py
```

## Acknowledgments
MIT License.

## License
This project was developed as part of the Big Data Engineering course at the National Institute of Applied Sciences and Technologies (INSAT), University of Carthage, Tunisia.

Team members:
* Alaeddine ACHACH
* Idris SADDI
* Mohamed Yessine ELLINI
* Hatem GHARSALLAH

PS: This project is fully developed by Vibe Coding
