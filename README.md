# ALVEERA ETHNIC ALLURE - Luxury E-Commerce Store

A production-ready headless e-commerce platform built with FastAPI, React, and MongoDB, featuring the "Royal Minimalism" aesthetic for ALVEERA's luxury ethnic wear brand.

## 🌟 Features

### Frontend
- **Hero Slider**: Full-width image carousel with automatic transitions
- **Product Catalog**: Filterable grid with sidebar filters (Category, Material, Color, Price)
- **Product Details**: Image zoom, quantity selector, WhatsApp inquiry button
- **Shopping Cart**: Persistent cart with localStorage, quantity management
- **Checkout Flow**: Guest checkout with Stripe/Razorpay integration (test mode)
- **Order Confirmation**: Professional order confirmation page
- **Responsive Design**: Mobile-first approach with Tailwind CSS

### Backend
- **Cart Management**: Real-time cart updates with persistence
- **User Authentication**: Secure Signup/Login with JWT
- **User Profile**: Order history and profile management
- **Protected Checkout**: Verification required for order placement
- **Admin Dashboard**: Comprehensive analytics & order management
- **MongoDB Integration**: Using Motor async driver
- **CORS Enabled**: Ready for production deployment

### Design Features
- **Royal Minimalism Aesthetic**: Clean white backgrounds, bronze accents (#C5A059)
- **Typography**: Playfair Display (headings) + Lato (body)
- **Sharp Edges**: No rounded corners for royal feel
- **Generous Spacing**: Premium spacing throughout
- **Smooth Animations**: Framer Motion for entrance effects
- **Image Zoom**: React Medium Image Zoom on product pages

## 📦 Tech Stack

- **Backend**: FastAPI + Motor (MongoDB async)
- **Frontend**: React 19 + React Router
- **Styling**: Tailwind CSS + Custom CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React + React Icons
- **UI Components**: Shadcn UI
- **State Management**: React Context API (Cart)
- **Database**: MongoDB

## 🚀 Installation

### Prerequisites
- Python 3.8+
- Node.js 16+
- MongoDB (local or remote)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Configure environment variables in `.env`:
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=alveera_store
CORS_ORIGINS=*
```

4. Seed the database with products:
```bash
python seed_products.py
```

5. Start the backend server:
```bash
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
yarn install
```

3. Configure environment variables in `.env`:
```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

4. Start the development server:
```bash
yarn start
```

The application will be available at `http://localhost:3000`

## 🎨 Design Customization

### Logo
Replace the logo URL in `/frontend/src/components/Navbar.js`:
```javascript
<img src="YOUR_LOGO_URL" alt="Alveera Logo" />
```

### Colors
Update colors in `/frontend/tailwind.config.js`:
```javascript
colors: {
  primary: '#C5A059', // Bronze/Gold
  secondary: '#F9F5F0', // Royal Cream
}
```

### Typography
Fonts are loaded from Google Fonts in `/frontend/src/App.css`. To change:
```css
@import url('https://fonts.googleapis.com/css2?family=YOUR_FONT');
```

## 🔧 Configuration

### WhatsApp Integration
Update the phone number in `/frontend/src/pages/ProductDetailPage.js`:
```javascript
const phone = '+91XXXXXXXXXX'; // Replace with your WhatsApp Business number
```

### Payment Integration

#### Stripe (Test Mode)
- Test card: `4242 4242 4242 4242`
- Any future expiry date
- Any 3-digit CVC

#### Razorpay (Placeholder)
- Indian payment methods placeholder
- Configure with your Razorpay keys for production

### Adding Products

1. **Via Database Seeding**:
Edit `/backend/seed_products.py` and run:
```bash
python seed_products.py
```

2. **Via API**:
```bash
curl -X POST http://localhost:8001/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "design_no": "D.NO.XXXX",
    "name": "Product Name",
    "description": "Product Description",
    "price": 2499.00,
    "material": "Silk",
    "color": "Red",
    "images": [
      "https://example.com/image1.jpg",
      "https://example.com/image2.jpg"
    ],
    "image_url": "https://example.com/image1.jpg",
    "category": "festive"
  }'
```

## 📱 API Endpoints

### Products
- `GET /api/products` - List all products (with filters)
  - Query params: `category`, `material`, `color`, `min_price`, `max_price`, `search`
- `GET /api/products/{id}` - Get single product
- `POST /api/products` - Create product

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/{id}` - Get order details

### Categories
- `GET /api/categories` - List all categories

## 🌐 Deployment

### Frontend (Vercel)
1. Push code to GitHub
2. Import project in Vercel
3. Set environment variable:
   - `REACT_APP_BACKEND_URL`: Your backend URL

### Backend (Railway/Heroku)
1. Push code to GitHub
2. Create new project in Railway/Heroku
3. Set environment variables:
   - `MONGO_URL`: Your MongoDB connection string
   - `DB_NAME`: Database name
   - `CORS_ORIGINS`: Your frontend URL

### Database (MongoDB Atlas)
1. Create free cluster at mongodb.com/atlas
2. Get connection string
3. Update `MONGO_URL` in backend `.env`

## 📊 Product Data Structure

```json
{
  "id": "uuid",
  "design_no": "D.NO.1490",
  "name": "Alveera Midnight Blue Embroidered Saree",
  "description": "Exquisitely designed saree...",
  "price": 2499.00,
  "material": "Georgette",
  "color": "Navy Blue",
  "images": ["https://...", "https://..."],
  "image_url": "https://...",
  "category": "festive",
  "in_stock": true,
  "created_at": "2025-01-01T00:00:00Z"
}
```

## 🎯 Categories

- `new-arrivals`: New Arrivals
- `festive`: Festive Anecdotes
- `silk`: Exquisite Silk

## 🔐 Security Notes

**Important**: This is a demo application with placeholder payment integration.

For production:
1. Implement proper authentication (JWT/OAuth)
2. Add input validation and sanitization
3. Configure real payment gateway keys
4. Enable HTTPS
5. Add rate limiting
6. Implement proper error handling
7. Add logging and monitoring

## 🤝 Support

For questions or issues:
- Email: info@alveeraethnic.com
- Phone: +91-XXXXXXXXXX

## 📄 License

Copyright © 2025 Alveera Ethnic Allure. All rights reserved.

## 🙏 Acknowledgments

- Product data extracted from SUJAL VOL-7 catalog
- Design inspired by luxury ethnic wear brands
- Built with modern web technologies for optimal performance
