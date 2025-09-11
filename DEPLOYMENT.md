# Deployment Guide

This guide covers deploying EcoShop to production environments.

## Frontend Deployment (Vercel)

### 1. Prepare for Deployment

\`\`\`bash
# Ensure your code is committed and pushed to GitHub
git add .
git commit -m "Ready for deployment"
git push origin main
\`\`\`

### 2. Deploy to Vercel

1. Visit [vercel.com](https://vercel.com) and sign in
2. Click "New Project" and import your GitHub repository
3. Configure environment variables:
   - `NEXT_PUBLIC_API_URL`: Your backend API URL
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key
   - `STRIPE_SECRET_KEY`: Your Stripe secret key

4. Deploy with default settings

### 3. Custom Domain (Optional)

1. Go to your project settings in Vercel
2. Navigate to "Domains"
3. Add your custom domain
4. Update DNS records as instructed

## Backend Deployment (Railway)

### 1. Prepare Backend

\`\`\`bash
cd backend
# Ensure requirements.txt is up to date
pip freeze > requirements.txt
\`\`\`

### 2. Deploy to Railway

1. Visit [railway.app](https://railway.app) and sign in
2. Create new project from GitHub repository
3. Select the `backend` folder as root directory
4. Add environment variables:
   - `DATABASE_URL`: PostgreSQL connection string
   - `SECRET_KEY`: JWT secret key
   - `STRIPE_SECRET_KEY`: Stripe secret key
   - `STRIPE_WEBHOOK_SECRET`: Stripe webhook secret

### 3. Database Setup

Railway provides PostgreSQL addon:
1. Add PostgreSQL service to your project
2. Copy the connection string to `DATABASE_URL`
3. Run migrations via Railway CLI or startup command

## Alternative Deployment Options

### Backend Alternatives
- **Heroku**: Similar to Railway, with PostgreSQL addon
- **DigitalOcean App Platform**: Container-based deployment
- **AWS Elastic Beanstalk**: Scalable Python deployment
- **Google Cloud Run**: Serverless container deployment

### Database Alternatives
- **Supabase**: PostgreSQL with built-in auth and APIs
- **Neon**: Serverless PostgreSQL
- **PlanetScale**: MySQL-compatible serverless database
- **AWS RDS**: Managed PostgreSQL

### Frontend Alternatives
- **Netlify**: Similar to Vercel for static sites
- **AWS Amplify**: Full-stack deployment platform
- **Cloudflare Pages**: Fast global deployment

## Environment Variables Reference

### Production Frontend (.env.production)
\`\`\`env
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
\`\`\`

### Production Backend
\`\`\`env
DATABASE_URL=postgresql://user:pass@host:port/db
SECRET_KEY=your-production-secret-key
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
CORS_ORIGINS=https://your-frontend.vercel.app
\`\`\`

## SSL and Security

### 1. HTTPS Setup
- Vercel and Railway provide SSL certificates automatically
- For custom domains, ensure SSL is enabled

### 2. CORS Configuration
Update backend CORS settings for production:

\`\`\`python
# In backend/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-frontend.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
\`\`\`

### 3. Security Headers
Add security headers in Next.js config:

\`\`\`javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ]
  },
}
\`\`\`

## Monitoring and Analytics

### 1. Error Tracking
- **Sentry**: Error monitoring for both frontend and backend
- **LogRocket**: Session replay and error tracking

### 2. Performance Monitoring
- **Vercel Analytics**: Built-in performance monitoring
- **New Relic**: Application performance monitoring

### 3. Uptime Monitoring
- **Uptime Robot**: Free uptime monitoring
- **Pingdom**: Advanced monitoring and alerts

## Backup Strategy

### 1. Database Backups
- Enable automatic backups on your database provider
- Set up daily backups with retention policy

### 2. Code Backups
- Use Git for version control
- Consider multiple remote repositories

### 3. Media Backups
- Use cloud storage (AWS S3, Cloudinary) for user uploads
- Enable versioning and backup policies

## Scaling Considerations

### 1. Frontend Scaling
- Vercel handles scaling automatically
- Consider CDN for global performance

### 2. Backend Scaling
- Railway provides auto-scaling
- Consider load balancers for high traffic

### 3. Database Scaling
- Use read replicas for read-heavy workloads
- Consider database sharding for very large datasets

## Troubleshooting

### Common Issues
1. **CORS Errors**: Check allowed origins in backend
2. **Environment Variables**: Ensure all required vars are set
3. **Database Connections**: Verify connection strings and firewall rules
4. **Stripe Webhooks**: Update webhook URLs for production

### Debugging Tools
- Vercel function logs
- Railway deployment logs
- Browser developer tools
- Database query logs
