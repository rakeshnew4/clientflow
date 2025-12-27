import psycopg2
from psycopg2.extras import RealDictCursor

# -------------------------------------------------------------------
# DATABASE CONNECTION
# -------------------------------------------------------------------

def get_connection():
    """Create and return a new PostgreSQL connection."""
    return psycopg2.connect(
        host="108.181.187.227",
        port=5432,
        dbname="mydatabase",
        user="myuser",
        password="mypassword"
    )


# -------------------------------------------------------------------
# DROP + RECREATE ALL TABLES
# -------------------------------------------------------------------

def drop_and_create_tables():
    drop_sql = """
    DROP TABLE IF EXISTS cart_items CASCADE;
    DROP TABLE IF EXISTS order_items CASCADE;
    DROP TABLE IF EXISTS orders CASCADE;
    DROP TABLE IF EXISTS products CASCADE;
    """

    create_sql = """
    -- Products table
    CREATE TABLE products (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      price NUMERIC(10,2) NOT NULL,
      category TEXT,
      image_url TEXT,
      rating NUMERIC(2,1),
      review_count INT DEFAULT 0,
      in_stock NUMERIC(10,1),
      colors TEXT[],
      dimensions TEXT,
      materials TEXT
    );

    -- Orders table
    CREATE TABLE orders (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_info JSONB NOT NULL,
  shipping_address JSONB NOT NULL,
  total_amount NUMERIC(10,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT now()
);


    -- Order Items table
    CREATE TABLE order_items (
      id SERIAL PRIMARY KEY,
      order_id TEXT,
      product_id INT REFERENCES products(id),
      product_name TEXT,
      product_price NUMERIC(10,2),
      quantity INT NOT NULL
    );

    -- Cart Items table
    CREATE TABLE cart_items (
      id SERIAL PRIMARY KEY,
      session_id TEXT NOT NULL,
      product_id INT REFERENCES products(id),
      name TEXT,
      price NUMERIC(10,2),
      image_url TEXT,
      quantity INT NOT NULL
    );
    """

    conn = get_connection()
    cur = conn.cursor()
    cur.execute(drop_sql)
    cur.execute(create_sql)
    conn.commit()
    cur.close()
    conn.close()

    print("✅ Tables dropped and recreated successfully!")


# -------------------------------------------------------------------
# INSERT CART ITEMS
# -------------------------------------------------------------------

def insert_cart_items(insert_sql):
    

    conn = get_connection()
    cur = conn.cursor()
    cur.execute(insert_sql)
    conn.commit()
    cur.close()
    conn.close()

    print("✅ Cart items inserted successfully!")


# -------------------------------------------------------------------
# READ PRODUCTS
# -------------------------------------------------------------------

import json
from psycopg2.extras import RealDictCursor

import json
import datetime
from decimal import Decimal
from psycopg2.extras import RealDictCursor


# Custom JSON encoder to convert Decimal, datetime, etc.
def json_converter(o):
    if isinstance(o, Decimal):
        return float(o)
    if isinstance(o, (datetime.date, datetime.datetime)):
        return o.isoformat()
    return str(o)


def export_table_to_json(table_name: str):
    # Validate table name
    if not table_name.replace("_", "").isalnum():
        raise ValueError("Invalid table name")

    conn = get_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    sql = f"SELECT * FROM {table_name};"
    cur.execute(sql)
    rows = cur.fetchall()

    file_name = f"{table_name}.json"

    with open(file_name, "w") as f:
        json.dump(rows, f, indent=4, default=json_converter)

    cur.close()
    conn.close()

    return {
        "status": "success",
        "file": file_name,
        "rows": len(rows)
    }




if __name__ == "__main__":
    # drop_and_create_tables()
    table_name = "products"
    table_name = "orders"
    print("\n📦 PRODUCT LIST:")
    rows = export_table_to_json(table_name)
    for row in rows:
        print(row)
