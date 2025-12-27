# db.py
from typing import AsyncIterator
import os
import asyncpg
from contextlib import asynccontextmanager

DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql://myuser:mypassword@localhost:5432/supermarket")

pool: asyncpg.pool.Pool | None = None

async def init_db_pool():
    global pool
    if pool is None:
        pool = await asyncpg.create_pool(DATABASE_URL, min_size=1, max_size=10)
    return pool

async def close_db_pool():
    global pool
    if pool:
        await pool.close()
        pool = None

@asynccontextmanager
async def get_conn():
    """
    Async context manager that yields a connection from the pool.
    Usage:
      async with get_conn() as conn:
          await conn.fetch(...)
    """
    if pool is None:
        await init_db_pool()
    async with pool.acquire() as conn:
        yield conn
