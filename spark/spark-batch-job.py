from pyspark.sql import SparkSession
from pyspark.sql.functions import col, unix_timestamp, avg, count, hour, date_format
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_SPARK_INPUT_URI = os.getenv("MONGO_SPARK_INPUT_URI", "mongodb://localhost:27017/github.raw_prs")
MONGO_SPARK_OUTPUT_URI = os.getenv("MONGO_SPARK_OUTPUT_URI", "mongodb://localhost:27017/github.analytics")

spark = SparkSession.builder \
    .appName("GitHubPRBatchJob") \
    .config("spark.mongodb.input.uri", MONGO_SPARK_INPUT_URI) \
    .config("spark.mongodb.output.uri", MONGO_SPARK_OUTPUT_URI) \
    .getOrCreate()

df = spark.read.format("mongo").load()

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

agg.write.format("mongo").mode("overwrite").save()

spark.stop()