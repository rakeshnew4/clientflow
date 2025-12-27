import psycopg2
from psycopg2.extras import execute_values
from faker import Faker
import random
from datetime import datetime, timedelta

fake = Faker()

DB_CONFIG = {
    "dbname": "supermarket",
    "user": "myuser",
    "password": "mypassword",
    "host": "localhost",
    "port": 5432
}

# Number of dummy rows per table
ROWS_PER_TABLE = {
    "clients": 1,
    "follow_ups": 20,
    "tasks": 20,
    "interactions": 2,
    "supermarkets": 2,
    "sales": 3500,
    "inventory": 300,
    "customer_traffic": 12
}

# ---------- Utility: Create random values based on PostgreSQL types ----------
def generate_value(pg_type, column_name=""):
    if pg_type.startswith("character") or pg_type == "text" or pg_type == "varchar":
        if "email" in column_name:
            return fake.email()
        if "phone" in column_name:
            return fake.phone_number()
        if "name" in column_name:
            return fake.name()
        if "company" in column_name:
            return fake.company()
        if "category" in column_name:
            return random.choice(["groceries", "electronics", "clothing", "toys"])
        if "product" in column_name:
            return fake.word()
        if "location" in column_name or "city" in column_name:
            return fake.city()
        return fake.sentence(nb_words=4)

    if pg_type == "boolean":
        return random.choice([True, False])

    if pg_type == "integer":
        if "quantity" in column_name:
            return random.randint(1, 50)
        if "price" in column_name or "amount" in column_name or "value" in column_name:
            return random.randint(100, 5000)
        return random.randint(1, 100)

    if pg_type.startswith("timestamp"):
        return datetime.now() - timedelta(days=random.randint(0, 365))

    # UUID / id fields handled by DEFAULT in table (so return None)
    if column_name == "id":
        return None

    return None  # fallback


# ---------- Fetch schema from PostgreSQL ----------
def get_schema(cursor):
    cursor.execute("""
        SELECT table_name, column_name, data_type
        FROM information_schema.columns
        WHERE table_schema='public'
        ORDER BY table_name, ordinal_position;
    """)
    schema = {}
    for table, col, dtype in cursor.fetchall():
        if table not in schema:
            schema[table] = []
        schema[table].append((col, dtype))
    return schema


# ---------- Generate Dummy Rows for a Table ----------
def create_dummy_rows(table, columns):
    rows = []
    for _ in range(ROWS_PER_TABLE.get(table, 5)):
        row = []
        for col, dtype in columns:
            value = generate_value(dtype, col)
            row.append(value)
        rows.append(row)
    return rows


# ---------- Insert Dummy Data ----------
def insert_dummy_data():
    conn = psycopg2.connect(**DB_CONFIG)
    cursor = conn.cursor()

    schema = get_schema(cursor)

    for table, columns in schema.items():

        # Skip tables not in our insert list
        if table not in ROWS_PER_TABLE:
            continue

        print(f"Inserting into {table}...")

        col_names = [c[0] for c in columns]

        rows = create_dummy_rows(table, columns)

        sql = f"""
            INSERT INTO {table} ({", ".join(col_names)})
            VALUES %s
        """

        execute_values(cursor, sql, rows)

        conn.commit()

    cursor.close()
    conn.close()
    print("🎉 Dummy data inserted successfully!")


if __name__ == "__main__":
    insert_dummy_data()
