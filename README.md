# GitHub PR Big Data Pipeline

## Components
- **GitHub PR Fetcher**: Fetches PRs from GitHub API, sends to Kafka
- **Kafka**: Streams PRs
- **Kafka Consumer**: Reads from Kafka, upserts into MongoDB
- **MongoDB**: Data lake for raw PRs
- **Spark Batch Job**: Aggregates/analyses data, writes analytics
- **Dashboard**: Visualizes results

## How To Run

1. **Start services:**  
   `docker-compose up -d`
2. **Install Python deps:**  
   `pip install requests kafka-python pymongo`
3. **Start producer:**  
   `python github_pr_producer.py`
4. **Start consumer:**  
   `python kafka_to_mongo_consumer.py`
5. **(Optional) Run Spark batch job:**  
   `spark-submit spark_batch_job.py`
6. **Setup dashboard:**  
   Follow `DASHBOARD.md`

## Customization
- Change GitHub repo/owner/token in `github_pr_producer.py`
- Adjust Spark logic for more analytics

## Notes
- All data is stored in MongoDB (`github.raw_prs` and `github.analytics`)
- Kafka is used for real-time streaming
- Spark for batch analytics

---

**This project is modular: you can swap Python for Kafka Connect, or MongoDB for SQL if needed!**