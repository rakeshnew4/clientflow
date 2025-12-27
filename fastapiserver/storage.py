# storage.py
from typing import List, Optional, Dict, Any
from datetime import datetime
from db import get_conn
import asyncpg

# Helper to map asyncpg.Record -> dict
def record_to_dict(r: asyncpg.Record) -> Dict[str, Any]:
    return dict(r)

class Storage:
    # --- Clients ---
    async def get_clients(self) -> List[Dict]:
        async with get_conn() as conn:
            rows = await conn.fetch("SELECT * FROM clients ORDER BY created_at DESC")
            return [record_to_dict(r) for r in rows]

    async def get_client(self, id: str) -> Optional[Dict]:
        async with get_conn() as conn:
            row = await conn.fetchrow("SELECT * FROM clients WHERE id = $1", id)
            return record_to_dict(row) if row else None

    async def create_client(self, payload: Dict) -> Dict:
        async with get_conn() as conn:
            q = """
            INSERT INTO clients (name, email, phone, company, status, last_contact)
            VALUES ($1,$2,$3,$4,$5,$6)
            RETURNING *;
            """
            row = await conn.fetchrow(q, payload.get("name"), payload.get("email"),
                                      payload.get("phone"), payload.get("company"),
                                      payload.get("status"), payload.get("lastContact"))
            return record_to_dict(row)

    async def update_client(self, id: str, payload: Dict) -> Optional[Dict]:
        # Build dynamic SET clause
        keys = list(payload.keys())
        if not keys:
            return await self.get_client(id)
        set_clause = ", ".join([f"{k} = ${i+2}" for i, k in enumerate(keys)])
        values = [payload[k] for k in keys]
        async with get_conn() as conn:
            q = f"UPDATE clients SET {set_clause} WHERE id = $1 RETURNING *"
            row = await conn.fetchrow(q, id, *values)
            return record_to_dict(row) if row else None

    async def delete_client(self, id: str) -> bool:
        async with get_conn() as conn:
            res = await conn.execute("DELETE FROM clients WHERE id = $1", id)
            return res.endswith("DELETE 1")

    async def search_clients(self, q: str) -> List[Dict]:
        pattern = f"%{q}%"
        async with get_conn() as conn:
            rows = await conn.fetch("""
                SELECT * FROM clients
                WHERE name ILIKE $1 OR email ILIKE $1 OR company ILIKE $1
                ORDER BY created_at DESC
            """, pattern)
            return [record_to_dict(r) for r in rows]

    # --- Follow-ups ---
    async def get_follow_ups(self) -> List[Dict]:
        async with get_conn() as conn:
            rows = await conn.fetch("SELECT * FROM follow_ups ORDER BY scheduled_date ASC")
            return [record_to_dict(r) for r in rows]

    async def get_follow_ups_by_client(self, client_id: str) -> List[Dict]:
        async with get_conn() as conn:
            rows = await conn.fetch("SELECT * FROM follow_ups WHERE client_id = $1 ORDER BY scheduled_date ASC", client_id)
            return [record_to_dict(r) for r in rows]

    async def create_follow_up(self, payload: Dict) -> Dict:
        async with get_conn() as conn:
            q = """
            INSERT INTO follow_ups (client_id, title, description, scheduled_date, completed, completed_at, type)
            VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *;
            """
            row = await conn.fetchrow(q, payload.get("clientId"), payload.get("title"),
                                      payload.get("description"), payload.get("scheduledDate"),
                                      payload.get("completed", False), payload.get("completedAt"),
                                      payload.get("type"))
            return record_to_dict(row)

    async def update_follow_up(self, id: str, payload: Dict) -> Optional[Dict]:
        keys = list(payload.keys())
        if not keys:
            return await self.get_follow_up(id)
        set_clause = ", ".join([f"{k} = ${i+2}" for i, k in enumerate(keys)])
        values = [payload[k] for k in keys]
        async with get_conn() as conn:
            q = f"UPDATE follow_ups SET {set_clause} WHERE id = $1 RETURNING *"
            row = await conn.fetchrow(q, id, *values)
            return record_to_dict(row) if row else None

    async def get_follow_up(self, id: str) -> Optional[Dict]:
        async with get_conn() as conn:
            row = await conn.fetchrow("SELECT * FROM follow_ups WHERE id = $1", id)
            return record_to_dict(row) if row else None

    async def complete_follow_up(self, id: str) -> Optional[Dict]:
        async with get_conn() as conn:
            q = "UPDATE follow_ups SET completed = TRUE, completed_at = NOW() WHERE id = $1 RETURNING *"
            row = await conn.fetchrow(q, id)
            return record_to_dict(row) if row else None

    async def delete_follow_up(self, id: str) -> bool:
        async with get_conn() as conn:
            res = await conn.execute("DELETE FROM follow_ups WHERE id = $1", id)
            return res.endswith("DELETE 1")

    # --- Tasks ---
    async def get_tasks(self) -> List[Dict]:
        async with get_conn() as conn:
            rows = await conn.fetch("SELECT * FROM tasks ORDER BY created_at DESC")
            return [record_to_dict(r) for r in rows]

    async def get_tasks_by_client(self, client_id: str) -> List[Dict]:
        async with get_conn() as conn:
            rows = await conn.fetch("SELECT * FROM tasks WHERE client_id = $1 ORDER BY created_at DESC", client_id)
            return [record_to_dict(r) for r in rows]

    async def create_task(self, payload: Dict) -> Dict:
        async with get_conn() as conn:
            q = """
            INSERT INTO tasks (client_id, title, description, due_date, completed, completed_at, priority)
            VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *;
            """
            row = await conn.fetchrow(q, payload.get("clientId"), payload.get("title"),
                                      payload.get("description"), payload.get("dueDate"),
                                      payload.get("completed", False), payload.get("completedAt"),
                                      payload.get("priority", "medium"))
            return record_to_dict(row)

    async def update_task(self, id: str, payload: Dict) -> Optional[Dict]:
        keys = list(payload.keys())
        if not keys:
            return await self.get_task(id)
        set_clause = ", ".join([f"{k} = ${i+2}" for i, k in enumerate(keys)])
        values = [payload[k] for k in keys]
        async with get_conn() as conn:
            q = f"UPDATE tasks SET {set_clause} WHERE id = $1 RETURNING *"
            row = await conn.fetchrow(q, id, *values)
            return record_to_dict(row) if row else None

    async def get_task(self, id: str) -> Optional[Dict]:
        async with get_conn() as conn:
            row = await conn.fetchrow("SELECT * FROM tasks WHERE id = $1", id)
            return record_to_dict(row) if row else None

    async def complete_task(self, id: str) -> Optional[Dict]:
        async with get_conn() as conn:
            q = "UPDATE tasks SET completed = TRUE, completed_at = NOW() WHERE id = $1 RETURNING *"
            row = await conn.fetchrow(q, id)
            return record_to_dict(row) if row else None

    async def delete_task(self, id: str) -> bool:
        async with get_conn() as conn:
            res = await conn.execute("DELETE FROM tasks WHERE id = $1", id)
            return res.endswith("DELETE 1")

    # --- Interactions ---
    async def get_interactions(self) -> List[Dict]:
        async with get_conn() as conn:
            rows = await conn.fetch("SELECT * FROM interactions ORDER BY created_at DESC")
            return [record_to_dict(r) for r in rows]

    async def get_interactions_by_client(self, client_id: str) -> List[Dict]:
        async with get_conn() as conn:
            rows = await conn.fetch("SELECT * FROM interactions WHERE client_id = $1 ORDER BY created_at DESC", client_id)
            return [record_to_dict(r) for r in rows]

    async def create_interaction(self, payload: Dict) -> Dict:
        async with get_conn() as conn:
            q = """
            INSERT INTO interactions (client_id, type, subject, notes)
            VALUES ($1,$2,$3,$4) RETURNING *;
            """
            row = await conn.fetchrow(q, payload.get("clientId"), payload.get("type"), payload.get("subject"), payload.get("notes"))
            return record_to_dict(row)

    # --- Supermarkets ---
    async def get_supermarkets(self) -> List[Dict]:
        async with get_conn() as conn:
            rows = await conn.fetch("SELECT * FROM supermarkets ORDER BY name")
            return [record_to_dict(r) for r in rows]

    async def create_supermarket(self, payload: Dict) -> Dict:
        async with get_conn() as conn:
            q = """
            INSERT INTO supermarkets (name, location, city, region, size, type)
            VALUES ($1,$2,$3,$4,$5,$6) RETURNING *;
            """
            row = await conn.fetchrow(q, payload.get("name"), payload.get("location"),
                                      payload.get("city"), payload.get("region"),
                                      payload.get("size"), payload.get("type"))
            return record_to_dict(row)

    # --- Sales & analytics ---
    async def get_sales(self) -> List[Dict]:
        async with get_conn() as conn:
            rows = await conn.fetch("SELECT * FROM sales ORDER BY date DESC")
            return [record_to_dict(r) for r in rows]

    async def get_sales_by_category(self):
        async with get_conn() as conn:
            rows = await conn.fetch("""
                SELECT category, SUM(total_amount) as total, COUNT(*) as count
                FROM sales
                GROUP BY category
                ORDER BY total DESC
            """)
            return [record_to_dict(r) for r in rows]

    async def get_sales_by_payment_method(self):
        async with get_conn() as conn:
            rows = await conn.fetch("""
                SELECT payment_method as method, SUM(total_amount) as total, COUNT(*) as count
                FROM sales
                GROUP BY payment_method
                ORDER BY total DESC
            """)
            return [record_to_dict(r) for r in rows]

    async def get_sales_by_demographic(self):
        async with get_conn() as conn:
            # Age buckets example
            rows = await conn.fetch("""
                SELECT
                  customer_gender as gender,
                  CASE
                    WHEN customer_age < 25 THEN 'under_25'
                    WHEN customer_age BETWEEN 25 AND 44 THEN '25_44'
                    WHEN customer_age BETWEEN 45 AND 64 THEN '45_64'
                    ELSE '65_plus'
                  END AS age_group,
                  SUM(total_amount) as total,
                  COUNT(*) as count
                FROM sales
                GROUP BY customer_gender, age_group
                ORDER BY total DESC
            """)
            return [record_to_dict(r) for r in rows]

    async def create_sales(self, payload: Dict) -> Dict:
        async with get_conn() as conn:
            q = """
            INSERT INTO sales (supermarket_id, date, category, product, quantity, unit_price, total_amount, payment_method, customer_age, customer_gender)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
            RETURNING *;
            """
            row = await conn.fetchrow(q,
                                      payload.get("supermarketId"),
                                      payload.get("date"),
                                      payload.get("category"),
                                      payload.get("product"),
                                      payload.get("quantity"),
                                      payload.get("unitPrice"),
                                      payload.get("totalAmount"),
                                      payload.get("paymentMethod"),
                                      payload.get("customerAge"),
                                      payload.get("customerGender"))
            return record_to_dict(row)

    # --- Inventory ---
    async def get_inventory(self) -> List[Dict]:
        async with get_conn() as conn:
            rows = await conn.fetch("SELECT * FROM inventory ORDER BY product")
            return [record_to_dict(r) for r in rows]

    async def get_inventory_by_supermarket(self, supermarket_id: str) -> List[Dict]:
        async with get_conn() as conn:
            rows = await conn.fetch("SELECT * FROM inventory WHERE supermarket_id = $1 ORDER BY product", supermarket_id)
            return [record_to_dict(r) for r in rows]

    async def get_low_stock_items(self) -> List[Dict]:
        async with get_conn() as conn:
            rows = await conn.fetch("SELECT * FROM inventory WHERE current_stock <= minimum_stock ORDER BY current_stock ASC")
            return [record_to_dict(r) for r in rows]

    async def create_inventory(self, payload: Dict) -> Dict:
        async with get_conn() as conn:
            q = """
            INSERT INTO inventory (supermarket_id, product, category, current_stock, minimum_stock, last_restocked, supplier, cost_price, selling_price)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *;
            """
            row = await conn.fetchrow(q,
                                      payload.get("supermarketId"),
                                      payload.get("product"),
                                      payload.get("category"),
                                      payload.get("currentStock"),
                                      payload.get("minimumStock"),
                                      payload.get("lastRestocked"),
                                      payload.get("supplier"),
                                      payload.get("costPrice"),
                                      payload.get("sellingPrice"))
            return record_to_dict(row)

    # --- Customer traffic / analytics ---
    async def get_customer_traffic(self) -> List[Dict]:
        async with get_conn() as conn:
            rows = await conn.fetch("SELECT * FROM customer_traffic ORDER BY date DESC, hour DESC")
            return [record_to_dict(r) for r in rows]

    async def get_traffic_by_hour(self):
        async with get_conn() as conn:
            rows = await conn.fetch("""
                SELECT hour, SUM(visitor_count) as totalVisitors, AVG(avg_transaction_value) as avgTransaction
                FROM customer_traffic
                GROUP BY hour
                ORDER BY hour
            """)
            return [record_to_dict(r) for r in rows]

    async def get_traffic_by_supermarket(self):
        async with get_conn() as conn:
            rows = await conn.fetch("""
                SELECT ct.supermarket_id, s.name, SUM(ct.visitor_count) as totalVisitors
                FROM customer_traffic ct
                JOIN supermarkets s ON s.id = ct.supermarket_id
                GROUP BY ct.supermarket_id, s.name
                ORDER BY totalVisitors DESC
            """)
            return [record_to_dict(r) for r in rows]

    async def create_customer_traffic(self, payload: Dict) -> Dict:
        async with get_conn() as conn:
            q = """
            INSERT INTO customer_traffic (supermarket_id, date, hour, visitor_count, avg_transaction_value)
            VALUES ($1,$2,$3,$4,$5) RETURNING *;
            """
            row = await conn.fetchrow(q,
                                      payload.get("supermarketId"),
                                      payload.get("date"),
                                      payload.get("hour"),
                                      payload.get("visitorCount"),
                                      payload.get("avgTransactionValue"))
            return record_to_dict(row)
# create module-level instance for import
storage = Storage()

