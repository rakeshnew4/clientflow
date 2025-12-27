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
      id SERIAL PRIMARY KEY,
      customer_info JSONB NOT NULL,
      shipping_address JSONB NOT NULL,
      total_amount NUMERIC(10,2) NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Order Items table
    CREATE TABLE order_items (
      id SERIAL PRIMARY KEY,
      order_id INT REFERENCES orders(id) ON DELETE CASCADE,
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

def get_all_products(table):
    conn = get_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("SELECT * FROM {};".format(table))
    products = cur.fetchall()

    cur.close()
    conn.close()
    return products


insert_sql = """
    INSERT INTO cart_items (session_id, product_id, name, price, image_url, quantity)
    VALUES
    ('session_abc123', 2, 'Galaxy Coaster Set', 599.99, '/attached_assets/generated_images/Galaxy_coaster_set.png', 2),
    ('session_xyz789', 1, 'Ocean Wave Resin Art', 899.99, '/attached_assets/generated_images/Ocean_wave_resin_wall_art_2d8ce367.png', 1);
    """

if __name__ == "__main__":
    # drop_and_create_tables()
    # insert_cart_items(query)
    table_name = "products"
    print("\n📦 PRODUCT LIST:")
    rows = get_all_products(table_name)
    for row in rows:
        print(row)
