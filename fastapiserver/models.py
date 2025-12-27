# models.py
from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime

# Clients
class ClientBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    company: str
    status: Optional[str] = "active"
    lastContact: Optional[datetime] = None

class ClientCreate(ClientBase):
    pass

class Client(ClientBase):
    id: str
    createdAt: Optional[datetime] = None

# FollowUp
class FollowUpBase(BaseModel):
    clientId: str
    title: str
    description: Optional[str] = None
    scheduledDate: datetime
    completed: Optional[bool] = False
    completedAt: Optional[datetime] = None
    type: str

class FollowUpCreate(FollowUpBase):
    pass

class FollowUp(FollowUpBase):
    id: str
    createdAt: Optional[datetime] = None

# Task
class TaskBase(BaseModel):
    clientId: Optional[str] = None
    title: str
    description: Optional[str] = None
    dueDate: Optional[datetime] = None
    completed: Optional[bool] = False
    completedAt: Optional[datetime] = None
    priority: Optional[str] = "medium"

class TaskCreate(TaskBase):
    pass

class Task(TaskBase):
    id: str
    createdAt: Optional[datetime] = None

# Interaction
class InteractionBase(BaseModel):
    clientId: str
    type: str
    subject: str
    notes: Optional[str] = None

class InteractionCreate(InteractionBase):
    pass

class Interaction(InteractionBase):
    id: str
    createdAt: Optional[datetime] = None

# Supermarket
class SupermarketBase(BaseModel):
    name: str
    location: str
    city: str
    region: str
    size: str
    type: str

class SupermarketCreate(SupermarketBase):
    pass

class Supermarket(SupermarketBase):
    id: str
    createdAt: Optional[datetime] = None

# Sales
class SalesBase(BaseModel):
    supermarketId: str
    date: datetime
    category: str
    product: str
    quantity: int
    unitPrice: int
    totalAmount: int
    paymentMethod: str
    customerAge: Optional[int] = None
    customerGender: Optional[str] = None

class SalesCreate(SalesBase):
    pass

class Sales(SalesBase):
    id: str
    createdAt: Optional[datetime] = None

# Inventory
class InventoryBase(BaseModel):
    supermarketId: str
    product: str
    category: str
    currentStock: int
    minimumStock: int
    lastRestocked: Optional[datetime] = None
    supplier: str
    costPrice: int
    sellingPrice: int

class InventoryCreate(InventoryBase):
    pass

class Inventory(InventoryBase):
    id: str
    createdAt: Optional[datetime] = None

# CustomerTraffic
class CustomerTrafficBase(BaseModel):
    supermarketId: str
    date: datetime
    hour: int
    visitorCount: int
    avgTransactionValue: int

class CustomerTrafficCreate(CustomerTrafficBase):
    pass

class CustomerTraffic(CustomerTrafficBase):
    id: str
    createdAt: Optional[datetime] = None
