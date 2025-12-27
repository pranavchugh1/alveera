from fastapi import FastAPI, APIRouter, HTTPException, Query, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta

from auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    decode_token,
    AdminLogin,
    Token,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    # Customer user imports
    User,
    UserCreate,
    UserLogin,
    UserToken,
    UserTokenData,
    decode_user_token,
    create_user_access_token
)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")
admin_router = APIRouter(prefix="/api/admin")
auth_router = APIRouter(prefix="/api/auth")  # Customer auth router

security = HTTPBearer()
optional_security = HTTPBearer(auto_error=False)  # For optional auth

# Logging setup
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# =============================================================================
# Database Indexes - Runs on startup for performance optimization
# =============================================================================

async def create_indexes():
    """
    Create MongoDB indexes for optimal query performance.
    This function runs once on application startup.
    
    Indexes created:
    - Products: category, price, unique design_no
    - Orders: compound index on (created_at desc, status) for dashboard sorting
    - Admins: unique email for fast authentication lookups
    - Users: unique email for customer authentication
    """
    try:
        # Products indexes
        await db.products.create_index("category")
        await db.products.create_index("price")
        await db.products.create_index("design_no", unique=True, sparse=True)
        await db.products.create_index("name")  # For search
        logger.info("Products indexes created successfully")
        
        # Orders indexes - compound index for fast dashboard queries
        await db.orders.create_index([("created_at", -1), ("status", 1)])
        await db.orders.create_index("status")  # For filtering
        await db.orders.create_index("customer_email")  # For customer lookup
        await db.orders.create_index("user_id")  # For user order history
        logger.info("Orders indexes created successfully")
        
        # Admins indexes
        await db.admins.create_index("email", unique=True)
        logger.info("Admins indexes created successfully")
        
        # Users indexes (customer accounts)
        await db.users.create_index("email", unique=True)
        logger.info("Users indexes created successfully")
        
        logger.info("All database indexes created/verified successfully")
    except Exception as e:
        logger.error(f"Error creating indexes: {e}")
        # Don't raise - indexes are for optimization, app should still work

# =============================================================================
# Models
# =============================================================================

class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    design_no: str
    name: str
    description: str
    price: float
    material: str
    color: str
    images: List[str]
    image_url: str  # Kept for backward compatibility, returns images[0]
    category: str
    in_stock: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProductCreate(BaseModel):
    design_no: str
    name: str
    description: str
    price: float
    material: str
    color: str
    images: List[str]
    category: str

class ProductUpdate(BaseModel):
    design_no: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    material: Optional[str] = None
    color: Optional[str] = None
    images: Optional[List[str]] = None
    category: Optional[str] = None
    in_stock: Optional[bool] = None

class CartItem(BaseModel):
    product_id: str
    quantity: int

class OrderItem(BaseModel):
    """Order item with snapshot of product at time of purchase."""
    product_id: str
    quantity: int
    # Product snapshot - preserves historical data
    product_name: str
    product_image: str
    product_price: float

class Cart(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    items: List[CartItem]
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_name: str
    customer_email: str
    customer_phone: str
    user_id: Optional[str] = None  # Link to registered user account (if logged in)
    items: List[OrderItem]  # Changed to OrderItem with product snapshots
    total: float
    payment_method: str
    status: str = "pending"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class OrderCreate(BaseModel):
    customer_name: str
    customer_email: str
    customer_phone: str
    items: List[CartItem]  # Cart items from frontend (product_id + quantity)
    total: float
    payment_method: str

class OrderStatusUpdate(BaseModel):
    status: str  # pending, confirmed, shipped, delivered, cancelled

class AdminStats(BaseModel):
    total_revenue: float
    total_orders: int
    total_products: int
    pending_orders: int
    recent_orders: List[dict]

# =============================================================================
# Auth Dependency
# =============================================================================

async def get_current_admin(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    """Dependency to validate JWT token and get current admin user."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    token = credentials.credentials
    token_data = decode_token(token)
    
    if token_data is None:
        raise credentials_exception
    
    # Verify admin exists in database
    admin = await db.admins.find_one({"email": token_data.email}, {"_id": 0})
    if admin is None:
        raise credentials_exception
    
    if not admin.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin account is disabled"
        )
    
    return admin

# =============================================================================
# Auth Routes
# =============================================================================

@api_router.post("/admin/login", response_model=Token)
async def admin_login(login_data: AdminLogin):
    """Authenticate admin user and return JWT token."""
    admin = await db.admins.find_one({"email": login_data.email}, {"_id": 0})
    
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    if not verify_password(login_data.password, admin["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    if not admin.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin account is disabled"
        )
    
    # Create access token
    access_token = create_access_token(
        data={"sub": admin["email"], "admin_id": admin["id"]},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return Token(
        access_token=access_token,
        admin={
            "id": admin["id"],
            "email": admin["email"],
            "full_name": admin["full_name"]
        }
    )

@api_router.get("/admin/me")
async def get_admin_profile(current_admin: dict = Depends(get_current_admin)):
    """Get current admin profile."""
    return {
        "id": current_admin["id"],
        "email": current_admin["email"],
        "full_name": current_admin["full_name"]
    }

# =============================================================================
# Public Product Routes
# =============================================================================

@api_router.get("/products", response_model=List[Product])
async def get_products(
    category: Optional[str] = None,
    material: Optional[str] = None,
    color: Optional[str] = None,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    include_description: bool = Query(default=False, description="Include full description in response")
):
    """
    Get products with optional filtering.
    
    Optimization: By default, description field is excluded from list view
    to reduce payload size. Set include_description=true to fetch full details.
    """
    query = {}
    if category:
        query["category"] = category
    if material:
        query["material"] = material
    if color:
        query["color"] = color
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]
    if min_price is not None or max_price is not None:
        price_query = {}
        if min_price is not None:
            price_query["$gte"] = min_price
        if max_price is not None:
            price_query["$lte"] = max_price
        query["price"] = price_query
    
    # Projection: Exclude description for lightweight list view
    projection = {"_id": 0}
    if not include_description:
        projection["description"] = 0  # Exclude description to reduce payload
    
    products = await db.products.find(query, projection).to_list(1000)
    for p in products:
        if isinstance(p.get('created_at'), str):
            p['created_at'] = datetime.fromisoformat(p['created_at'])
        # Set empty description if excluded (to satisfy Pydantic model)
        if not include_description and 'description' not in p:
            p['description'] = ""
    return products

@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if isinstance(product.get('created_at'), str):
        product['created_at'] = datetime.fromisoformat(product['created_at'])
    return product

# =============================================================================
# Protected Admin Product Routes
# =============================================================================

@api_router.post("/products", response_model=Product)
async def create_product(
    product: ProductCreate,
    current_admin: dict = Depends(get_current_admin)
):
    """Create a new product (admin only)."""
    product_dict = product.model_dump()
    # Backward compatibility: Populate image_url from first image
    if product_dict['images']:
        product_dict['image_url'] = product_dict['images'][0]
    else:
        product_dict['image_url'] = ''
        
    product_obj = Product(**product_dict)
    doc = product_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.products.insert_one(doc)
    logger.info(f"Product created by admin {current_admin['email']}: {product_obj.id}")
    return product_obj

@api_router.put("/products/{product_id}", response_model=Product)
async def update_product(
    product_id: str,
    product_update: ProductUpdate,
    current_admin: dict = Depends(get_current_admin)
):
    """Update an existing product (admin only)."""
    existing = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Build update dict with only provided fields
    update_data = {k: v for k, v in product_update.model_dump().items() if v is not None}
    
    # Backward compatibility: Update image_url if images is updated
    if 'images' in update_data and update_data['images']:
        update_data['image_url'] = update_data['images'][0]
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    await db.products.update_one({"id": product_id}, {"$set": update_data})
    
    updated = await db.products.find_one({"id": product_id}, {"_id": 0})
    if isinstance(updated.get('created_at'), str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    
    logger.info(f"Product updated by admin {current_admin['email']}: {product_id}")
    return updated

@api_router.delete("/products/{product_id}")
async def delete_product(
    product_id: str,
    current_admin: dict = Depends(get_current_admin)
):
    """Delete a product (admin only)."""
    existing = await db.products.find_one({"id": product_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Product not found")
    
    await db.products.delete_one({"id": product_id})
    logger.info(f"Product deleted by admin {current_admin['email']}: {product_id}")
    
    return {"message": "Product deleted successfully", "id": product_id}

# =============================================================================
# Public Order Routes
# =============================================================================

@api_router.post("/orders", response_model=Order)
async def create_order(order: OrderCreate):
    """
    Create a new order with product snapshots.
    
    Product details (name, image, price) are snapshot at the time of purchase
    to preserve historical accuracy and eliminate N+1 query problems.
    """
    # Fetch product details for each item and create snapshots
    order_items = []
    for cart_item in order.items:
        product = await db.products.find_one(
            {"id": cart_item.product_id}, 
            {"_id": 0, "name": 1, "image_url": 1, "price": 1}
        )
        
        if not product:
            raise HTTPException(
                status_code=400, 
                detail=f"Product not found: {cart_item.product_id}"
            )
        
        # Create OrderItem with product snapshot
        order_item = OrderItem(
            product_id=cart_item.product_id,
            quantity=cart_item.quantity,
            product_name=product["name"],
            product_image=product["image_url"],
            product_price=product["price"]
        )
        order_items.append(order_item)
    
    # Create order with snapshot items
    order_obj = Order(
        customer_name=order.customer_name,
        customer_email=order.customer_email,
        customer_phone=order.customer_phone,
        items=order_items,
        total=order.total,
        payment_method=order.payment_method
    )
    
    doc = order_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    # Convert items to dicts for MongoDB
    doc['items'] = [item.model_dump() for item in order_items]
    
    await db.orders.insert_one(doc)
    logger.info(f"Order created: {order_obj.id} for {order.customer_email}")
    
    return order_obj

@api_router.get("/orders/{order_id}", response_model=Order)
async def get_order(order_id: str):
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if isinstance(order.get('created_at'), str):
        order['created_at'] = datetime.fromisoformat(order['created_at'])
    return order

# =============================================================================
# Admin Dashboard & Order Management Routes
# =============================================================================

@api_router.get("/admin/stats", response_model=AdminStats)
async def get_admin_stats(current_admin: dict = Depends(get_current_admin)):
    """
    Get dashboard statistics (admin only).
    
    Optimized using MongoDB aggregation for revenue calculation
    instead of fetching all documents.
    """
    
    # Total products
    total_products = await db.products.count_documents({})
    
    # Total orders count
    total_orders = await db.orders.count_documents({})
    
    # Total revenue using aggregation pipeline (efficient for large datasets)
    revenue_pipeline = [
        {"$group": {"_id": None, "total_revenue": {"$sum": "$total"}}}
    ]
    revenue_result = await db.orders.aggregate(revenue_pipeline).to_list(1)
    total_revenue = revenue_result[0]["total_revenue"] if revenue_result else 0.0
    
    # Pending orders count
    pending_orders = await db.orders.count_documents({"status": "pending"})
    
    # Recent orders (last 10) - uses compound index (created_at, status)
    recent_orders_cursor = db.orders.find({}, {"_id": 0}).sort("created_at", -1).limit(10)
    recent_orders = await recent_orders_cursor.to_list(10)
    
    # Parse dates
    for order in recent_orders:
        if isinstance(order.get('created_at'), str):
            order['created_at'] = datetime.fromisoformat(order['created_at']).isoformat()
    
    return AdminStats(
        total_revenue=total_revenue,
        total_orders=total_orders,
        total_products=total_products,
        pending_orders=pending_orders,
        recent_orders=recent_orders
    )

@api_router.get("/admin/orders")
async def get_all_orders(
    status: Optional[str] = None,
    limit: int = Query(default=50, le=200),
    offset: int = Query(default=0, ge=0),
    current_admin: dict = Depends(get_current_admin)
):
    """
    Get all orders with optional filtering (admin only).
    
    Optimization: Orders now include product snapshots (name, image, price)
    embedded at purchase time, eliminating N+1 query problems.
    Uses compound index (created_at DESC, status) for efficient sorting.
    """
    query = {}
    if status:
        query["status"] = status
    
    total = await db.orders.count_documents(query)
    # Uses compound index for efficient sorting
    orders = await db.orders.find(query, {"_id": 0}).sort("created_at", -1).skip(offset).limit(limit).to_list(limit)
    
    for order in orders:
        if isinstance(order.get('created_at'), str):
            order['created_at'] = datetime.fromisoformat(order['created_at']).isoformat()
    
    return {
        "orders": orders,
        "total": total,
        "limit": limit,
        "offset": offset
    }

@api_router.put("/admin/orders/{order_id}/status")
async def update_order_status(
    order_id: str,
    status_update: OrderStatusUpdate,
    current_admin: dict = Depends(get_current_admin)
):
    """Update order status (admin only)."""
    valid_statuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"]
    
    if status_update.status not in valid_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
        )
    
    existing = await db.orders.find_one({"id": order_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Order not found")
    
    await db.orders.update_one(
        {"id": order_id},
        {"$set": {"status": status_update.status}}
    )
    
    updated = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if isinstance(updated.get('created_at'), str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at']).isoformat()
    
    logger.info(f"Order {order_id} status updated to {status_update.status} by admin {current_admin['email']}")
    
    return updated

# =============================================================================
# Categories
# =============================================================================

@api_router.get("/categories")
async def get_categories():
    return [
        {"id": "new-arrivals", "name": "New Arrivals"},
        {"id": "festive", "name": "Festive Anecdotes"},
        {"id": "silk", "name": "Exquisite Silk"}
    ]

# =============================================================================
# App Configuration
# =============================================================================

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    """Initialize database indexes on application startup."""
    logger.info("Application starting up...")
    await create_indexes()
    logger.info("Application startup complete")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
