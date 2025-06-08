import sys
from pyspark.sql import SparkSession
from pyspark.sql.functions import col, unix_timestamp, avg, count, hour, date_format
from pyspark.sql.types import TimestampType
import os

spark = SparkSession.builder \
    .appName("GitHubPRBatchJob") \
    .config("spark.mongodb.read.connection.uri", "mongodb://mongodb:27017/github.raw_prs") \
    .config("spark.mongodb.write.connection.uri", "mongodb://mongodb:27017/github.analytics") \
    .getOrCreate()

df = spark.read.format("mongodb")\
    .option("database", "github")\
    .option("collection", "raw_prs")\
    .load()
print(f"INFO: Number of documents read from raw_prs: {df.count()}", flush=True)

df_merged = df.filter(col("merged_at").isNotNull())

df_merged = df_merged.withColumn(
    "created_at_ts", col("created_at").cast(TimestampType())
).withColumn(
    "merged_at_ts", col("merged_at").cast(TimestampType())
).withColumn(
    "merge_time_hours",
    (unix_timestamp("merged_at_ts") - unix_timestamp("created_at_ts")) / 3600
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
    .option("database", "github")\
    .option("collection", "analytics")\
    .mode("overwrite")\
    .save()

spark.stop()