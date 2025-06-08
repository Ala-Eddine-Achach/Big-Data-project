#!/bin/bash
while true; do
  echo "Running Spark batch job at $(date)"
  export PYTHONPATH=$PYTHONPATH:/opt/bitnami/python/lib/python3.11/site-packages
  /opt/bitnami/spark/bin/spark-submit \
    --master local[*] \
    --packages org.mongodb.spark:mongo-spark-connector_2.12:10.5.0 \
    --conf "spark.mongodb.read.connection.uri=mongodb://mongodb:27017/github.raw_prs" \
    --conf "spark.mongodb.write.connection.uri=mongodb://mongodb:27017/github.analytics" \
    /app/spark/spark-batch-job.py
  echo "Spark batch job finished. Sleeping for 1 hour..."
  sleep 60 # Sleep for 1 hour (3600 seconds)
done 