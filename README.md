# AeroHive - Premium Drone Marketplace

A full-stack drone e-commerce platform built with Next.js, FastAPI, PostgreSQL, and Stripe payments. Specializing in professional, commercial, and recreational drones with advanced customization capabilities.

## Features

### Frontend (Next.js)
- 🏠 Aviation-themed homepage with drone showcase
- 🛍️ Comprehensive drone catalog with 9+ categories
- 🔧 **Interactive Drone Customization System**
- 🛒 Shopping cart with persistent state
- 💳 Multi-step checkout with Stripe integration
- 👤 User authentication (login/register)
- 📱 Responsive design with aviation-themed UI
- 🎨 Professional drone marketplace aesthetic

### Drone Customization Features
- 📷 **Camera Systems**: 4K, Thermal, Night Vision options
- 🛰️ **GPS & Navigation**: Standard to Military-grade precision
- 🔋 **Battery Configurations**: Extended flight time options
- 📦 **Payload Customization**: Delivery, surveying, specialized equipment
- 💰 **Real-time Pricing**: Dynamic cost calculation
- ⚙️ **Configuration Summary**: Detailed customization overview

### Backend (FastAPI)
- 🔐 JWT-based authentication
- 📦 Complete drone product management API
- 🛒 Cart and order processing with customizations
- ⭐ Product reviews system
- 👥 User management
- 🏷️ Drone category management
- 🔍 Advanced search and filtering capabilities

### Admin Dashboard
- 📊 Sales analytics and metrics
- 📦 Drone inventory management
- 📋 Order tracking with customization details
- 👥 Customer management
- � Revenue and performance insights

## Drone Customization System Location

### 🎯 **Primary Location**: Product Detail Pages
- **File**: `/app/products/[slug]/page.tsx`
- **Component**: `DroneCustomization` from `/components/product/drone-customization.tsx`
- **Access**: Click any drone product → "Customize Your Drone" button

### 🔗 **Access Points**:
1. **Product Cards**: "Customize" button on each drone product
2. **Product Detail Page**: Main customization interface
3. **Products Page**: "NEW: Full Drone Customization Available!" banner

### 📁 **File Structure**:
```
components/product/drone-customization.tsx  # Main customization component
app/products/[slug]/page.tsx                # Product detail pages with customization
app/products/page.tsx                       # Main products page with customization banner
```

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: FastAPI, Python, SQLAlchemy
- **Database**: PostgreSQL
- **Payments**: Stripe
- **State Management**: Zustand
- **UI Components**: shadcn/ui, Radix UI
- **Authentication**: JWT tokens
- **Deployment**: Docker, Vercel (frontend), Railway/Heroku (backend)

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.9+
- PostgreSQL
- Stripe account

### 1. Clone and Setup

\`\`\`bash
git clone <repository-url>
cd ecommerce-app
\`\`\`

### 2. Backend Setup

\`\`\`bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Copy environment file
cp .env.example .env
# Edit .env with your database and Stripe credentials
\`\`\`

### 3. Database Setup

\`\`\`bash
# Create PostgreSQL database
createdb ecommerce_db

# Run migrations
python -c "
from database import engine
from models import Base
Base.metadata.create_all(bind=engine)
"

# Seed sample data (optional)
psql ecommerce_db < scripts/01-create-database-schema.sql
psql ecommerce_db < scripts/02-seed-sample-data.sql
\`\`\`

### 4. Start Backend

\`\`\`bash
uvicorn main:app --reload --port 8000
\`\`\`

### 5. Frontend Setup

\`\`\`bash
# In new terminal, from project root
npm install

# Copy environment file
cp .env.example .env.local
# Add your environment variables
\`\`\`

### 6. Start Frontend

\`\`\`bash
npm run dev
\`\`\`

Visit `http://localhost:3000` to see the application.
 
## Development Features

### 🛠️ Demo Mode
The application includes a built-in **Demo Mode** for local testing without Supabase credentials.
- Auto-activates when `.env.local` is missing or contains placeholder values.
- Allows "Sign Up" and "Login" with mock data.
- **Note**: Does not persist data to a real database.

To enable **Realtime Data Mode**, configure your `.env.local` with valid Supabase keys.

## Environment Variables

### Frontend (.env.local)
\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
\`\`\`

### Backend (.env)
\`\`\`env
DATABASE_URL=postgresql://user:password@localhost/ecommerce_db
SECRET_KEY=your-secret-key-here
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
\`\`\`

## API Documentation

Once the backend is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend (Railway/Heroku)
1. Create new project on Railway or Heroku
2. Connect your GitHub repository
3. Add environment variables
4. Deploy with automatic builds

### Database
- Use Railway PostgreSQL, Supabase, or Neon for production database
- Update DATABASE_URL in backend environment variables

## Project Structure

\`\`\`
ecommerce-app/
├── app/                    # Next.js app directory
│   ├── admin/             # Admin dashboard pages
│   ├── cart/              # Shopping cart page
│   ├── checkout/          # Checkout flow
│   ├── login/             # Authentication pages
│   └── products/          # Product pages
├── components/            # React components
│   ├── admin/            # Admin components
│   ├── cart/             # Cart components
│   ├── checkout/         # Checkout components
│   ├── layout/           # Layout components
│   └── product/          # Product components
├── lib/                  # Utilities and stores
├── backend/              # FastAPI backend
│   ├── routers/         # API route handlers
│   ├── models.py        # Database models
│   ├── schemas.py       # Pydantic schemas
│   └── auth.py          # Authentication logic
└── scripts/             # Database scripts
\`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
