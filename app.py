from flask import Flask, render_template, jsonify, request
import sqlite3
import json

app = Flask(__name__)

# Database connection function
def get_db_connection():
    conn = sqlite3.connect('metav1.db')
    conn.row_factory = sqlite3.Row
    return conn

# Route to render the main page
@app.route('/')
def index():
    return render_template('index.html')

# API to get table names
@app.route('/api/tables')
def get_tables():
    conn = get_db_connection()
    tables = conn.execute('SELECT DISTINCT table_name FROM data_meta_v1').fetchall()
    conn.close()
    return jsonify([table['table_name'] for table in tables])

# API to get features for a selected table
@app.route('/api/features')
def get_features():
    table_name = request.args.get('table_name')
    print(f"Fetching features for table: {table_name}")  # Debug information
    conn = get_db_connection()
    
    # Include the 'anomalies' column in the query
    features = conn.execute('''
        SELECT table_name, analysis_date, feature_name, mean, median, std_dev, min_value, max_value, anomaly_count, anomalies
        FROM data_meta_v1
        WHERE table_name = ?
    ''', (table_name,)).fetchall()
    
    print(f"Query returned {len(features)} rows")  # Debug information
    conn.close()

    # Convert each row to a dict and handle bytes
    def convert_row(row):
        def safe_decode(value):
            if isinstance(value, bytes):
                try:
                    return value.decode('utf-8')
                except UnicodeDecodeError:
                    return value.decode('latin1', errors='ignore')
            return value

        return {key: safe_decode(value) for key, value in dict(row).items()}

    result = [convert_row(row) for row in features]
    print(f"Returning {result}")  # Debug information
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)
