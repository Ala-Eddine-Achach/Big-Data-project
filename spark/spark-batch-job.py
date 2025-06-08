import sys
from pyspark.sql import SparkSession
from pyspark.sql.functions import col, unix_timestamp, avg, count, hour, date_format
import os
from dotenv import load_dotenv

load_dotenv()

if len(sys.argv) > 1:
    mongo_url = sys.argv[1]
else:
    # Fallback to environment variable if not provided as argument (though argument is preferred)
    mongo_url = os.getenv("MONGO_URL", "mongodb://localhost:27017/") 

spark = SparkSession.builder \
    .appName("GitHubPRBatchJob") \
    .config("spark.mongodb.input.uri", f"{mongo_url}github.raw_prs") \
    .config("spark.mongodb.output.uri", f"{mongo_url}github.analytics") \
    .getOrCreate()

df = spark.read.format("mongodb")\
    .load()
print(f"INFO: Number of documents read from raw_prs: {df.count()}", flush=True)

df_merged = df.filter(col("merged_at").isNotNull())

df_merged = df_merged.withColumn(
    "merge_time_hours",
    (unix_timestamp("merged_at") - unix_timestamp("created_at")) / 3600
)

df_merged = df_merged.withColumn("hour", hour("merged_at"))
df_merged = df_merged.withColumn("slot", (col("hour") / 4).cast("int") * 4)
df_merged = df_merged.withColumn("weekday", date_format("merged_at", "E"))

agg = df_merged.groupBy("weekday", "slot").agg(
    count("*").alias("merged_count"),
    avg("merge_time_hours").alias("avg_merge_time_hours")
)
print(f"INFO: Number of documents in aggregated DataFrame: {agg.count()}", flush=True)

agg.write.format("mongodb")\
    .mode("overwrite")\
    .save()

spark.stop()