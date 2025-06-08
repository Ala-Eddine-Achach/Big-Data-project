#!/bin/bash
while true; do
  echo "Running Spark batch job at $(date)"
  python spark/spark-bacth-job.py
  echo "Spark batch job finished. Sleeping for 1 hour..."
  sleep 3600 # Sleep for 1 hour (3600 seconds)
done 