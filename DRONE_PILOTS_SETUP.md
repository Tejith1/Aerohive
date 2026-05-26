# Drone Pilots Feature Setup Guide

This guide will help you set up the drone pilots feature with Supabase database integration.

## 📋 Prerequisites

- Supabase account
- Access to your Supabase project dashboard
- `.env.local` file configured with Supabase credentials

## 🗄️ Database Setup

### Step 1: Create the Drone Pilots Table

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy and paste the contents of `scripts/create-drone-pilots-table.sql`
5. Click **Run** to execute the SQL script

This will create:
- `drone_pilots` table with all required columns
- Necessary indexes for performance
- Row Level Security (RLS) policies
- Triggers for automatic timestamp updates

### Step 2: Verify Table Creation

Navigate to **Table Editor** in your Supabase dashboard and verify that the `drone_pilots` table has been created with the following columns:

- `id` (uuid, primary key)
- `user_id` (uuid, foreign key to auth.users)
- `full_name` (varchar)
- `email` (varchar, unique)
- `phone` (varchar)
- `location` (varchar)
- `area` (varchar)
- `experience` (varchar)
- `certifications` (text)
- `specializations` (text)
- `hourly_rate` (integer)
- `about` (text)
- `dgca_number` (varchar, unique)
- `profile_image_url` (text)
- `certificate_image_url` (text)
- `rating` (decimal, default 0.0)
- `completed_jobs` (integer, default 0)
- `is_verified` (boolean, default false)
- `is_active` (boolean, default true)
- `created_at` (timestamp)
- `updated_at` (timestamp)

## 🔒 Security Configuration

The table includes Row Level Security (RLS) policies:

1. **Public Read Access**: Anyone can view verified and active drone pilots
2. **Authenticated Insert**: Logged-in users can register as pilots
3. **Own Profile Update**: Pilots can update their own profiles
4. **Own Profile Delete**: Pilots can delete their own profiles

## 🚀 Features

### Registration
- Navigate to `/drone-pilots/register`
- Fill in all required information:
  - Personal details (name, email, phone)
  - Location and area
  - Experience level
  - DGCA certificate number
  - Certifications (comma-separated)
  - Specializations (comma-separated)
  - Hourly rate
  - About/bio
  - Optional: Profile photo and certificate upload
- Submit the form
- Data is stored in Supabase with `is_verified = false`

### Pilot Directory
- Navigate to `/drone-pilots`
- Browse all verified and active drone pilots
- Filter by:
  - Location (city)
  - Area (locality)
  - Search by name or specialization
- View pilot details including:
  - Profile photo
  - Rating and experience
  - Certifications and specializations
  - Hourly rate
  - Completed jobs count

## 🛠️ Admin Functions

### Approving New Pilots

Administrators need to manually verify new pilot registrations:

1. Go to Supabase Dashboard → Table Editor → `drone_pilots`
2. Find the newly registered pilot
3. Change `is_verified` from `false` to `true`
4. The pilot will now appear in the public directory

### Deactivating Pilots

To remove a pilot from the public directory without deleting their data:

1. Go to Supabase Dashboard → Table Editor → `drone_pilots`
2. Find the pilot
3. Change `is_active` from `true` to `false`

## 📝 Data Format

### Certifications and Specializations

These fields are stored as comma-separated text strings:

Example:
```
certifications: "DGCA Certified, Aerial Photography, Survey Mapping"
specializations: "Real Estate, Wedding Photography, Construction Survey"
```

They are parsed on the frontend using the `parseArray()` function.

### Images

Images are stored as base64-encoded data URLs using the `processAndStoreImage()` function. This allows for:
- No need for separate storage bucket configuration
- Simple implementation
- Direct database storage

## 🔧 Customization

### Adding New Locations/Areas

Update the arrays in `app/drone-pilots/page.tsx`:

```typescript
const locations = ["All Locations", "Bangalore", "Mumbai", "Delhi", ...]
const areas = ["All Areas", "Whitefield", "Koramangala", ...]
```

### Modifying Rating System

Currently, ratings default to 0.0. To implement a rating system:

1. Create a `reviews` or `ratings` table
2. Calculate average ratings
3. Update the `rating` field via triggers or scheduled functions

### Adding Contact Functionality

The "Contact" button is currently a placeholder. To implement:

1. Create a modal with contact form
2. Send email/message to pilot
3. Or display pilot's phone/email (if they opt-in)

## 📊 Sample SQL Queries

### Count Total Pilots
```sql
SELECT COUNT(*) FROM drone_pilots WHERE is_verified = true AND is_active = true;
```

### Top Rated Pilots
```sql
SELECT * FROM drone_pilots 
WHERE is_verified = true AND is_active = true 
ORDER BY rating DESC, completed_jobs DESC 
LIMIT 10;
```

### Pilots by Location
```sql
SELECT location, COUNT(*) as count 
FROM drone_pilots 
WHERE is_verified = true AND is_active = true 
GROUP BY location 
ORDER BY count DESC;
```

## 🐛 Troubleshooting

### Pilots Not Showing Up
- Check if `is_verified = true` and `is_active = true`
- Verify RLS policies are correctly set
- Check browser console for errors

### Image Upload Issues
- Verify the image is under 5MB
- Check that the image is in a supported format (JPEG, PNG)
- Look for errors in the browser console

### Search Not Working
- Ensure the search query has at least 3 characters
- Check if the database connection is active
- Verify the `ilike` operator is working in your Supabase instance

## 📞 Support

For issues related to:
- **Supabase**: Check Supabase documentation
- **Frontend**: Check browser console for errors
- **Database**: Use Supabase SQL Editor to debug queries

## 🎯 Future Enhancements

Potential features to add:
- [ ] Review and rating system
- [ ] Messaging/chat between clients and pilots
- [ ] Booking system with calendar integration
- [ ] Payment integration
- [ ] Pilot dashboard with analytics
- [ ] Email notifications for new registrations
- [ ] Pilot verification workflow
- [ ] Portfolio/work samples gallery
- [ ] Advanced search with multiple filters
- [ ] Map view of pilot locations
