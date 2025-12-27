# main.py
from fastapi import FastAPI, HTTPException, Query
from datetime import datetime
from fastapi.responses import PlainTextResponse, StreamingResponse
from typing import List, Optional
import uvicorn
from storage import storage
from models import (
    ClientCreate, Client, FollowUpCreate, FollowUp,
    TaskCreate, Task, InteractionCreate, Interaction,
    SupermarketCreate, Supermarket,
    SalesCreate, Sales,
    InventoryCreate, Inventory,
    CustomerTrafficCreate, CustomerTraffic
)
import io
import csv
import asyncio

app = FastAPI(title="CRM + Supermarket Analytics API")
# Clients
@app.get("/api/clients", response_model=List[dict])
async def get_clients():
    return await storage.get_clients()

@app.get("/api/clients/search", response_model=List[dict])
async def search_clients(q: str = Query(..., min_length=1)):
    return await storage.search_clients(q)

@app.get("/api/clients/{id}", response_model=dict)
async def get_client(id: str):
    client = await storage.get_client(id)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client

@app.post("/api/clients", status_code=201, response_model=dict)
async def create_client(payload: ClientCreate):
    return await storage.create_client(payload.dict())

@app.put("/api/clients/{id}", response_model=dict)
async def update_client(id: str, payload: dict):
    client = await storage.update_client(id, payload)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client

@app.delete("/api/clients/{id}", status_code=204)
async def delete_client(id: str):
    ok = await storage.delete_client(id)
    if not ok:
        raise HTTPException(status_code=404, detail="Client not found")
    return PlainTextResponse(status_code=204)

# Follow-ups
@app.get("/api/follow-ups", response_model=List[dict])
async def get_follow_ups():
    return await storage.get_follow_ups()

@app.get("/api/follow-ups/client/{clientId}", response_model=List[dict])
async def get_follow_ups_by_client(clientId: str):
    return await storage.get_follow_ups_by_client(clientId)

@app.post("/api/follow-ups", status_code=201, response_model=dict)
async def create_follow_up(payload: FollowUpCreate):
    return await storage.create_follow_up(payload.dict())

@app.put("/api/follow-ups/{id}", response_model=dict)
async def update_follow_up(id: str, payload: dict):
    follow = await storage.update_follow_up(id, payload)
    if not follow:
        raise HTTPException(status_code=404, detail="Follow-up not found")
    return follow

@app.post("/api/follow-ups/{id}/complete", response_model=dict)
async def complete_follow_up(id: str):
    follow = await storage.complete_follow_up(id)
    if not follow:
        raise HTTPException(status_code=404, detail="Follow-up not found")
    return follow

@app.delete("/api/follow-ups/{id}", status_code=204)
async def delete_follow_up(id: str):
    ok = await storage.delete_follow_up(id)
    if not ok:
        raise HTTPException(status_code=404, detail="Follow-up not found")
    return PlainTextResponse(status_code=204)

# Tasks
@app.get("/api/tasks", response_model=List[dict])
async def get_tasks():
    return await storage.get_tasks()

@app.get("/api/tasks/client/{clientId}", response_model=List[dict])
async def get_tasks_by_client(clientId: str):
    return await storage.get_tasks_by_client(clientId)

@app.post("/api/tasks", status_code=201, response_model=dict)
async def create_task(payload: TaskCreate):
    return await storage.create_task(payload.dict())

@app.put("/api/tasks/{id}", response_model=dict)
async def update_task(id: str, payload: dict):
    task = await storage.update_task(id, payload)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@app.post("/api/tasks/{id}/complete", response_model=dict)
async def complete_task(id: str):
    task = await storage.complete_task(id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@app.delete("/api/tasks/{id}", status_code=204)
async def delete_task(id: str):
    ok = await storage.delete_task(id)
    if not ok:
        raise HTTPException(status_code=404, detail="Task not found")
    return PlainTextResponse(status_code=204)

# Interactions
@app.get("/api/interactions", response_model=List[dict])
async def get_interactions():
    return await storage.get_interactions()

@app.get("/api/interactions/client/{clientId}", response_model=List[dict])
async def get_interactions_by_client(clientId: str):
    return await storage.get_interactions_by_client(clientId)

@app.post("/api/interactions", status_code=201, response_model=dict)
async def create_interaction(payload: InteractionCreate):
    return await storage.create_interaction(payload.dict())

# Exports (CSV)
@app.get("/api/export/clients/csv")
async def export_clients_csv():
    clients = await storage.get_clients()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Name","Email","Phone","Company","Status","Last Contact","Created At"])
    for c in clients:
        writer.writerow([
            c.get("name",""), c.get("email",""), c.get("phone",""),
            c.get("company",""), c.get("status",""),
            c.get("last_contact").isoformat() if c.get("last_contact") else "",
            c.get("created_at").isoformat() if c.get("created_at") else ""
        ])
    output.seek(0)
    return StreamingResponse(iter([output.getvalue()]),
                             media_type="text/csv",
                             headers={"Content-Disposition":"attachment; filename=clients.csv"})

@app.get("/api/export/follow-ups/csv")
async def export_followups_csv():
    followups = await storage.get_follow_ups()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Title","Type","Scheduled Date","Completed","Client ID","Description"])
    for f in followups:
        writer.writerow([f.get("title",""), f.get("type",""), f.get("scheduled_date").isoformat() if f.get("scheduled_date") else "", f.get("completed"), f.get("client_id"), f.get("description","")])
    output.seek(0)
    return StreamingResponse(iter([output.getvalue()]), media_type="text/csv", headers={"Content-Disposition":"attachment; filename=follow-ups.csv"})

@app.get("/api/export/tasks/csv")
async def export_tasks_csv():
    tasks = await storage.get_tasks()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Title","Priority","Due Date","Completed","Client ID","Description"])
    for t in tasks:
        writer.writerow([t.get("title",""), t.get("priority",""), t.get("due_date").isoformat() if t.get("due_date") else "", t.get("completed"), t.get("client_id",""), t.get("description","")])
    output.seek(0)
    return StreamingResponse(iter([output.getvalue()]), media_type="text/csv", headers={"Content-Disposition":"attachment; filename=tasks.csv"})

# Stats
@app.get("/api/stats")
async def get_stats():
    clients = await storage.get_clients()
    followups = await storage.get_follow_ups()
    tasks = await storage.get_tasks()

    pending_followups = [f for f in followups if not f.get("completed")]
    overdue = [f for f in pending_followups if f.get("scheduled_date") and f.get("scheduled_date") < datetime.utcnow()]
    active_tasks = [t for t in tasks if not t.get("completed")]

    return {
        "totalClients": len(clients),
        "pendingFollowUps": len(pending_followups),
        "overdueFollowUps": len(overdue),
        "activeTasks": len(active_tasks)
    }

# Supermarkets
@app.get("/api/supermarkets")
async def get_supermarkets():
    return await storage.get_supermarkets()

@app.post("/api/supermarkets", status_code=201)
async def create_supermarket(payload: SupermarketCreate):
    return await storage.create_supermarket(payload.dict())

# Analytics endpoints
@app.get("/api/analytics/sales/category")
async def sales_by_category():
    return await storage.get_sales_by_category()

@app.get("/api/analytics/sales/payment-method")
async def sales_by_payment():
    return await storage.get_sales_by_payment_method()

@app.get("/api/analytics/sales/demographics")
async def sales_by_demo():
    return await storage.get_sales_by_demographic()

@app.get("/api/analytics/sales")
async def get_sales():
    return await storage.get_sales()

@app.get("/api/analytics/inventory")
async def get_inventory():
    return await storage.get_inventory()

@app.get("/api/analytics/inventory/low-stock")
async def low_stock_items():
    return await storage.get_low_stock_items()

@app.get("/api/analytics/traffic/hourly")
async def traffic_by_hour():
    return await storage.get_traffic_by_hour()

@app.get("/api/analytics/traffic/supermarkets")
async def traffic_by_supermarket():
    return await storage.get_traffic_by_supermarket()

# Custom analytics endpoint (type, filter, groupBy)
@app.get("/api/analytics/custom")
async def analytics_custom(type: Optional[str] = None, filter: Optional[str] = None, groupBy: Optional[str] = None):
    if type == "sales":
        if groupBy == "category":
            return await storage.get_sales_by_category()
        if groupBy == "payment":
            return await storage.get_sales_by_payment_method()
        if groupBy == "demographics":
            return await storage.get_sales_by_demographic()
        return await storage.get_sales()
    if type == "traffic":
        if groupBy == "hour":
            return await storage.get_traffic_by_hour()
        if groupBy == "supermarket":
            return await storage.get_traffic_by_supermarket()
        return await storage.get_customer_traffic()
    if type == "inventory":
        if filter == "low-stock":
            return await storage.get_low_stock_items()
        return await storage.get_inventory()
    raise HTTPException(status_code=400, detail="Invalid analytics type")

# Run setup/teardown
@app.on_event("startup")
async def startup():
    from db import init_db_pool
    await init_db_pool()

@app.on_event("shutdown")
async def shutdown():
    from db import close_db_pool
    await close_db_pool()

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=5003, reload=True)
# /app
#   main.py
#   db.py
#   models.py
#   routes/
#       sales.py
#       inventory.py
#       clients.py
#       tasks.py
#       followups.py
#       supermarkets.py
#       interactions.py
#   services/
#       sales_service.py
#       inventory_service.py
