# Aerohive Backend - Supabase Migration Guide

## Overview
This guide explains how to migrate the Aerohive drone e-commerce backend from SQLAlchemy/PostgreSQL to Supabase.

## Prerequisites

1. **Supabase Account**: Create a free account at [https://supabase.com](https://supabase.com)
2. **Python 3.8+**: Ensure you have Python installed
3. **Node.js** (for frontend): Version 16+ recommended

## Step 1: Create Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Choose your organization
4. Fill in project details:
   - Name: `aerohive-drone-store`
   - Database Password: Generate a strong password
   - Region: Choose closest to your users
5. Wait for project to be created (2-3 minutes)

## Step 2: Setup Database Schema

1. In your Supabase dashboard, go to the SQL Editor
2. Copy and paste the entire content from `SUPABASE_SCHEMA.md`
3. Click "Run" to execute all the CREATE TABLE commands
4. Verify tables are created in the "Table Editor" section

## Step 3: Configure Environment Variables

1. In your Supabase dashboard, go to Settings > API
2. Copy the following values:
   - Project URL
   - `anon` key
   - `service_role` key (for backend)

3. Create `.env` file in the backend directory:

```bash
cp .env.example .env
```

4. Edit `.env` file with your Supabase credentials:

```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
SECRET_KEY=your-custom-secret-key-for-jwt
ENVIRONMENT=development
```

## Step 4: Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

## Step 5: Update Backend Code

### Key Changes Made:

1. **Database Layer** (`database.py`):
   - Replaced SQLAlchemy with Supabase client
   - Added helper methods for CRUD operations
   - Integrated Supabase Auth

2. **Models** (`schemas_supabase.py`):
   - Converted SQLAlchemy models to Pydantic schemas
   - Changed ID types from `int` to `UUID`
   - Updated field validations

3. **Authentication** (`auth.py`):
   - Integrated Supabase Auth
   - Updated token verification
   - Simplified user management

4. **API Routes**:
   - Updated to use Supabase queries
   - Changed response formats
   - Added proper error handling

### File Structure:
```
backend/
├── database.py                 # Supabase client configuration
├── schemas_supabase.py        # Pydantic models for Supabase
├── auth.py                    # Updated authentication
├── routers/
│   ├── orders_supabase.py    # Supabase-compatible orders
│   └── ...                   # Other routers (to be updated)
├── main.py                   # Updated FastAPI app
├── requirements.txt          # Updated dependencies
├── .env.example             # Environment template
└── SUPABASE_SCHEMA.md       # Database schema
```

## Step 6: Start the Backend

```bash
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Step 7: Setup Row Level Security (Optional but Recommended)

In Supabase SQL Editor, enable RLS for sensitive tables:

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own cart" ON cart_items FOR SELECT USING (auth.uid() = user_id);
```

## Step 8: Migrate Data (If Existing)

If you have existing data, you can:

1. **Export from old database**:
```bash
pg_dump your_old_database > backup.sql
```

2. **Transform data format**:
   - Convert integer IDs to UUIDs
   - Adjust data types as needed

3. **Import to Supabase**:
   - Use Supabase dashboard's import feature
   - Or run transformed SQL in SQL Editor

## Step 9: Update Frontend (Next.js)

Update your frontend to work with new API:

1. **Environment Variables** (`.env.local`):
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=http://localhost:8000
```

2. **API calls**: Update to handle UUID instead of integer IDs

## Step 10: Testing

1. **API Testing**:
```bash
# Test health endpoint
curl http://localhost:8000/health

# Test user registration
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "testpass123", "first_name": "Test", "last_name": "User"}'
```

2. **Frontend Testing**:
   - Test user registration/login
   - Test product browsing
   - Test cart functionality
   - Test order placement

## Key Benefits of Supabase Migration

1. **Real-time Features**: Built-in real-time subscriptions
2. **Authentication**: Integrated auth with social providers
3. **Auto-generated APIs**: Instant REST and GraphQL APIs
4. **File Storage**: Built-in file storage for images
5. **Edge Functions**: Serverless functions for custom logic
6. **Dashboard**: User-friendly database management
7. **Scaling**: Automatic scaling and backups

## Troubleshooting

### Common Issues:

1. **UUID Conversion Errors**:
   - Ensure all ID references use UUID format
   - Update frontend API calls accordingly

2. **Authentication Errors**:
   - Verify Supabase keys in environment
   - Check token expiration settings

3. **RLS Policy Errors**:
   - Review RLS policies if queries fail
   - Use service role key for admin operations

4. **Migration Data Issues**:
   - Verify foreign key relationships
   - Check data type compatibility

### Useful Supabase Commands:

```sql
-- Check table structure
\d table_name

-- View RLS policies
SELECT * FROM pg_policies WHERE tablename = 'your_table';

-- Reset table (careful!)
DELETE FROM table_name;
ALTER SEQUENCE table_name_id_seq RESTART WITH 1;
```

## Production Deployment

1. **Environment Setup**:
   - Use production Supabase project
   - Set proper environment variables
   - Configure domain and SSL

2. **Security**:
   - Enable RLS on all sensitive tables
   - Review and test all policies
   - Use proper secrets management

3. **Performance**:
   - Add database indexes as needed
   - Monitor query performance
   - Set up proper caching

4. **Backup**:
   - Configure automated backups
   - Test restore procedures

## Support

For issues specific to this migration:
1. Check Supabase documentation: [https://supabase.com/docs](https://supabase.com/docs)
2. Review the schema in `SUPABASE_SCHEMA.md`
3. Test endpoints with the provided examples

The migration maintains all existing functionality while providing the benefits of Supabase's modern database platform.
