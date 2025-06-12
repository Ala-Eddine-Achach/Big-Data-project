# GitHub Pull Request Big Data Analytics Pipeline

**Mini-Project for Big Data Course**  
**Instructor:** Mrs. Lilia Sfaxi  
**Author:** Ala Eddine Achach  
**Collaborators:**   
- Idris Saddi  
- Hatem Gharsallah  
- Mohamed Yassine Ellini  

---

## 📄 Project Context & Motivation

The software development process on platforms like GitHub generates a wealth of valuable data—especially from Pull Requests (PRs). Analyzing PR activity at scale can reveal insights into development velocity, team collaboration, and project health.

This mini-project demonstrates a modern **Big Data pipeline** that ingests, stores, processes, and visualizes GitHub PR data in real time and batch. It leverages top open-source big data tools and cloud-native orchestration to simulate a scalable architecture used in industry.

---

## 🔎 Objective

- **Automate ingestion** of PR events from the GitHub API.
- **Stream and store** raw data for both real-time and historical analysis.
- **Compute analytics** on PR activity: volume, merge times, trends.
- **Provide a live dashboard** for interactive visualization.

---

## 📊 Big Data Tools & Technologies

| Layer                   | Tool/Tech           | Role / Description                                                         |
|-------------------------|---------------------|----------------------------------------------------------------------------|
| Ingestion               | **Python**          | Fetches PR data from GitHub API                                            |
| Streaming Backbone      | **Apache Kafka**    | Reliable, scalable message broker for PR events                            |
| Data Lake / Storage     | **MongoDB**         | Stores raw PRs and analytics; supports flexible schema                     |
| Batch Analytics         | **Apache Spark**    | Processes raw PRs, computes aggregations and trends                        |
| API / Real Time Stream  | **Flask-SocketIO**  | Serves analytics and live data via WebSocket/REST                          |
| Dashboard UI            | **React**           | Interactive web interface for visualization                                |
| Orchestration           | **Docker Compose**  | Containerizes and connects all services                                    |

---

## 🔁 Data Flow Diagram

```mermaid 

flowchart TD
    Producer --> Kafka
    Kafka --> Consumer
    Consumer --> MongoDB_Raw
    MongoDB_Raw --> Spark
    Spark --> MongoDB_Analytics
    MongoDB_Analytics --> API
    MongoDB_Raw --> API
    API --> Dashboard
    
---

## 📦 Containerized Architecture

All components run as isolated containers using **Docker Compose**.  
**Benefits:**  
- Easy setup & teardown
- Consistent development/testing environment
- Scalable and reproducible

**Containers:**
- `github_pr_producer` (Python): Fetches PRs and streams to Kafka
- `kafka_broker` + `zookeeper`: Kafka backbone
- `kafka_to_mongo_consumer` (Python): Writes PRs to MongoDB
- `mongodb`: Data lake for both raw and analytics data
- `spark_batch_job`: Runs hourly analytics batch jobs
- `backend_api` (Flask-SocketIO): Serves data to dashboard
- `dashboard`: React UI for visualization

---

## ⚡️ How the Pipeline Works

1. **GitHub PR Producer**  
   - Periodically fetches PRs using the GitHub API
   - Streams each PR as a JSON message into a Kafka topic

2. **Kafka Broker**  
   - Buffers and streams PR messages to downstream consumers

3. **Kafka Consumer → MongoDB**  
   - Consumes PRs from Kafka
   - Stores them as documents in the `raw_prs` collection in MongoDB

4. **Spark Batch Job**  
   - Runs every hour (or manually)
   - Reads raw PRs, computes metrics (e.g., average merge time, PR trends)
   - Writes results to the `analytics` collection in MongoDB

5. **Flask-SocketIO Backend**  
   - Watches MongoDB for live analytics changes (change streams)
   - Consumes live PR events from Kafka
   - Streams both to the React dashboard via WebSocket

6. **React Dashboard**  
   - Connects to backend via WebSocket
   - Shows live and historical PR analytics in interactive charts

---

## 🚀 How to Run the Project

### 1. Prerequisites

- [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)

### 2. Clone the Repo

```bash
git clone https://github.com/Ala-Eddine-Achach/Big-Data-project.git
cd Big-Data-project
```

### 3. Set your GitHub API Token

- Copy `.env.example` to `.env` and fill in your GitHub token and repo details:
    ```bash
    cp .env.example .env
    # Edit .env with your preferred editor
    ```

### 4. Build & Start the Pipeline

```bash
docker compose up --build
```

- The **dashboard** will be available at [http://localhost:5051](http://localhost:5051)
- The **backend API** is at [http://localhost:5050](http://localhost:5050)

### 5. (Optional) Trigger Batch Analytics Manually

You can run the Spark job manually inside its container:

```bash
docker compose exec spark_batch_job bash
# Then inside the container:
python /app/spark/spark-batch-job.py
```

---

## 🎥 Demo Video

> [!NOTE]  
> If a demo video is available, it should be linked here.  
> _You may upload your video to Google Drive, YouTube (as unlisted), or another platform and provide the link._

**Demo Video:**  
[Watch the pipeline in action (Google Drive link)](https://drive.google.com/file/d/1GRQApTXgWJOQIzSoocW60hanYbzODO4H/view)

---

## 👨‍👩‍👦‍👦 Team Members

- **Ala Eddine Achach** (author, presenter)
- Idris Saddi
- Hatem Gharsallah
- Mohamed Yassine Ellini

---

## 📚 License

MIT License.  
Project developed for the Big Data Engineering course, INSAT (University of Carthage, Tunisia).
