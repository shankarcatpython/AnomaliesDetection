import sqlite3
from datetime import datetime
import random
import json  # Import the json module

# Connect to SQLite database (or create it if it doesn't exist)
conn = sqlite3.connect('metav1.db')

# Create a cursor object
cur = conn.cursor()

# Create the data_meta table
cur.execute('''
CREATE TABLE IF NOT EXISTS data_meta_v1 (
    table_name    TEXT,
    analysis_date TEXT,
    feature_name  TEXT,
    mean          REAL,
    median        REAL,
    std_dev       REAL,
    min_value     REAL,
    max_value     REAL,
    anomaly_count INTEGER,
    anomalies     TEXT
)
''')

# Function to generate random data
def generate_random_data():
    table_names = ['vehicles', 'customers', 'sales']
    feature_names = ['price', 'age', 'mileage', 'rating', 'discount']
    
    table_name = random.choice(table_names)
    analysis_date = datetime.now().strftime('%Y-%m-%d')
    feature_name = random.choice(feature_names)
    mean = random.uniform(0, 100000)
    median = random.uniform(0, 100000)
    std_dev = random.uniform(0, 100000)
    min_value = random.uniform(0, 1000)
    max_value = random.uniform(1000, 1000000)
    anomaly_count = random.randint(0, 100)
    anomalies = json.dumps([{"id": random.randint(1000, 9999), "value": random.uniform(0, 1000)} for _ in range(anomaly_count)])

    return (table_name, analysis_date, feature_name, mean, median, std_dev, min_value, max_value, anomaly_count, anomalies)

# Insert random data into the data_meta table
for _ in range(10):  # Insert 10 rows of random data
    data = generate_random_data()
    cur.execute('''
    INSERT INTO data_meta_v1 (table_name, analysis_date, feature_name, mean, median, std_dev, min_value, max_value, anomaly_count, anomalies)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', data)

# Commit the transaction
conn.commit()

# Close the connection
conn.close()

print("Database setup and data insertion complete.")
