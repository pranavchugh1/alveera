
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

products_data = [
    {
        "id": str(uuid.uuid4()),
        "design_no": "D.NO.1490",
        "name": "Alveera Midnight Blue Embroidered Saree",
        "description": "Exquisitely designed saree with intricate floral and abstract patterns in a navy blue base. Charming embroidery and beautiful design, offering a majestic glance. Paired with turquoise blouse.",
        "price": 2499.00,
        "material": "Georgette",
        "color": "Navy Blue",
        "images": [
            "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600",
            "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600",
            "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600"
        ],
        "image_url": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600",
        "category": "festive",
        "in_stock": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "design_no": "D.NO.1491",
        "name": "Alveera Fanta Orange Abstract Stripe Saree",
        "description": "Vibrant saree with multi-colored diagonal stripes on orange base. Pure comfort meets elegant style. Perfect for festive occasions.",
        "price": 2299.00,
        "material": "Chiffon",
        "color": "Orange",
        "images": [
            "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600",
            "https://images.unsplash.com/photo-1654764745869-545a2316a169?w=600",
            "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600"
        ],
        "image_url": "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600",
        "category": "new-arrivals",
        "in_stock": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "design_no": "D.NO.1492",
        "name": "Alveera Pink Dream Abstract Saree",
        "description": "Stunning pink saree featuring abstract patterns in yellow and pink. Lightweight fabric with graceful draping. Paired with fuchsia blouse.",
        "price": 2199.00,
        "material": "Georgette",
        "color": "Pink",
        "images": [
            "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600",
            "https://images.unsplash.com/photo-1638964327749-53436bcccdca?w=600",
            "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600"
        ],
        "image_url": "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600",
        "category": "new-arrivals",
        "in_stock": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "design_no": "D.NO.1493",
        "name": "Alveera Crimson Swirl Georgette Saree",
        "description": "Bold red saree with dynamic flowing stripes in various colors. Charming embroidery creating a majestic appearance. Perfect for special occasions.",
        "price": 2599.00,
        "material": "Georgette",
        "color": "Red",
        "images": [
            "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600",
            "https://images.unsplash.com/photo-1654764745869-545a2316a169?w=600",
            "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600"
        ],
        "image_url": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600",
        "category": "festive",
        "in_stock": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "design_no": "D.NO.1494",
        "name": "Alveera Mint Geometric Saree",
        "description": "Contemporary light green saree with geometric hexagon-like pattern. Modern ethnic fusion design. Paired with pink blouse.",
        "price": 2399.00,
        "material": "Chiffon",
        "color": "Green",
        "images": [
            "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600",
            "https://images.unsplash.com/photo-1638964327749-53436bcccdca?w=600",
            "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600"
        ],
        "image_url": "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600",
        "category": "new-arrivals",
        "in_stock": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "design_no": "D.NO.1495",
        "name": "Alveera Sunset Orange Stripe Saree",
        "description": "Bright orange saree with colorful diagonal stripes. Lightweight and comfortable with elegant draping. Perfect for daytime events.",
        "price": 2299.00,
        "material": "Georgette",
        "color": "Orange",
        "images": [
            "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600",
            "https://images.unsplash.com/photo-1654764745869-545a2316a169?w=600",
            "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600"
        ],
        "image_url": "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600",
        "category": "festive",
        "in_stock": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "design_no": "D.NO.1496",
        "name": "Alveera Golden Yellow Celebration Saree",
        "description": "Radiant yellow saree with lively colorful stripes. Exquisite design for celebrations. Paired with contrasting red blouse.",
        "price": 2499.00,
        "material": "Silk Blend",
        "color": "Yellow",
        "images": [
            "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600",
            "https://images.unsplash.com/photo-1638964327749-53436bcccdca?w=600",
            "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600"
        ],
        "image_url": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600",
        "category": "silk",
        "in_stock": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "design_no": "D.NO.1497",
        "name": "Alveera Royal Purple Floral Saree",
        "description": "Luxurious deep purple saree with dense floral and abstract print. Rich colors and majestic design. Perfect for grand occasions.",
        "price": 2799.00,
        "material": "Silk",
        "color": "Purple",
        "images": [
            "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600",
            "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600",
            "https://images.unsplash.com/photo-1654764745869-545a2316a169?w=600"
        ],
        "image_url": "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600",
        "category": "silk",
        "in_stock": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "design_no": "D.NO.1498",
        "name": "Alveera Rose Pink Border Saree",
        "description": "Elegant pink saree with abstract print and distinct yellow patterned border. Sophisticated ethnic allure. Paired with yellow blouse.",
        "price": 2399.00,
        "material": "Georgette",
        "color": "Pink",
        "images": [
            "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600",
            "https://images.unsplash.com/photo-1638964327749-53436bcccdca?w=600",
            "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600"
        ],
        "image_url": "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600",
        "category": "new-arrivals",
        "in_stock": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "design_no": "D.NO.1499",
        "name": "Alveera Emerald Green Stripe Saree",
        "description": "Striking green saree with colorful diagonal stripes. Contemporary design with traditional elegance. Perfect for modern ethnic look.",
        "price": 2299.00,
        "material": "Chiffon",
        "color": "Green",
        "images": [
            "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600",
            "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600",
            "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600"
        ],
        "image_url": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600",
        "category": "festive",
        "in_stock": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
]

async def seed_products():
    await db.products.delete_many({})
    if products_data:
        await db.products.insert_many(products_data)
        print(f"Seeded {len(products_data)} products successfully!")
    else:
        print("No products to seed.")

if __name__ == "__main__":
    asyncio.run(seed_products())
    client.close()