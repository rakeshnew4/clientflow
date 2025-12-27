import json
import psycopg2
from psycopg2.extras import RealDictCursor

# ------------------------------------------------
# Database connection
# ------------------------------------------------
def get_connection():
    return psycopg2.connect(
        host="108.181.187.227",
        port=5432,
        dbname="mydatabase",
        user="myuser",
        password="mypassword"
    )

# ------------------------------------------------
# Generic function: load JSON from file
# ------------------------------------------------
def load_json(filename):
    with open(filename, "r") as f:
        return json.load(f)

# ------------------------------------------------
# Generic function: Insert rows from JSON
# ------------------------------------------------
def insert_or_update_json_rows(table, rows):
    """Insert or update multiple rows based on id using ON CONFLICT."""
    conn = get_connection()
    cur = conn.cursor()

    for row in rows:
        columns = list(row.keys())
        values = [row[c] for c in columns]

        # Build SQL
        column_names = ", ".join(columns)
        placeholders = ", ".join(["%s"] * len(values))

        # Build update clause: "col = EXCLUDED.col"
        update_clause = ", ".join(
            [f"{col} = EXCLUDED.{col}" for col in columns if col != "id"]
        )

        sql = f"""
            INSERT INTO {table} ({column_names})
            VALUES ({placeholders})
            ON CONFLICT (id)
            DO UPDATE SET
            {update_clause};
        """

        cur.execute(sql, values)

    conn.commit()
    cur.close()
    conn.close()
    print(f"✅ Upserted {len(rows)} rows into {table}")

# ------------------------------------------------
# Specialized wrappers (optional)
# ------------------------------------------------

def insert_products():
    rows = load_json("products.json")
    insert_or_update_json_rows("products", rows)

def insert_cart_items():
    rows = load_json("cart_items.json")
    insert_or_update_json_rows("cart_items", rows)

# ------------------------------------------------
# Example run
# ------------------------------------------------
if __name__ == "__main__":
    insert_products()
    # insert_cart_items()

    print("\n📦 Products inserted successfully!")
