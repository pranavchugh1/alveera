#!/usr/bin/env python3
"""
Seed script to create initial admin user for Alveera E-Commerce Store.
Run this script once to create the default admin account.

Usage: python seed_admin.py
"""

import asyncio
import os
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
import uuid
from datetime import datetime, timezone

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Import auth utilities
from auth import get_password_hash

# Default admin credentials
DEFAULT_ADMIN_EMAIL = "admin@alveera.com"
DEFAULT_ADMIN_PASSWORD = "Admin123!"
DEFAULT_ADMIN_NAME = "Alveera Admin"

async def seed_admin():
    """Create the initial admin user if not exists."""
    
    mongo_url = os.environ.get('MONGO_URL')
    db_name = os.environ.get('DB_NAME')
    
    if not mongo_url or not db_name:
        print("Error: MONGO_URL or DB_NAME not set in environment")
        return False
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    try:
        # Check if admin already exists
        existing_admin = await db.admins.find_one({"email": DEFAULT_ADMIN_EMAIL})
        
        if existing_admin:
            print(f"Admin user already exists: {DEFAULT_ADMIN_EMAIL}")
            return True
        
        # Create new admin user
        admin_doc = {
            "id": str(uuid.uuid4()),
            "email": DEFAULT_ADMIN_EMAIL,
            "hashed_password": get_password_hash(DEFAULT_ADMIN_PASSWORD),
            "full_name": DEFAULT_ADMIN_NAME,
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.admins.insert_one(admin_doc)
        
        print("="*50)
        print("Admin user created successfully!")
        print("="*50)
        print(f"Email: {DEFAULT_ADMIN_EMAIL}")
        print(f"Password: {DEFAULT_ADMIN_PASSWORD}")
        print("="*50)
        print("IMPORTANT: Change this password in production!")
        print("="*50)
        
        return True
        
    except Exception as e:
        print(f"Error creating admin user: {e}")
        return False
    finally:
        client.close()

if __name__ == "__main__":
    result = asyncio.run(seed_admin())
    sys.exit(0 if result else 1)
