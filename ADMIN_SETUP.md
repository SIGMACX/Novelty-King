# Admin System Setup Guide

## Overview

The Novelty Journal admin system allows designated users to view and manage all paper submissions, including status updates and PDF downloads.

## Setup Steps

### 1. Initialize Database Schema

Execute the SQL schema in your Supabase SQL Editor:

```bash
# Open your Supabase project dashboard
# Navigate to: SQL Editor > New Query
# Copy and paste the contents of supabase-schema.sql
# Run the query
```

This will create:
- `submissions` table for paper data
- `admin_users` table for admin privileges
- Storage bucket for PDF files
- Row Level Security (RLS) policies
- Triggers for automatic timestamp updates

### 2. Add Admin Users

After creating a user account through the normal registration flow, you need to grant admin privileges:

```sql
-- First, find your user ID
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- Then, add to admin_users table
INSERT INTO admin_users (user_id)
VALUES ('your-user-id-from-above-query');
```

### 3. Access Admin Dashboard

Admin users will see an "Admin Dashboard / 管理后台" link in their account dropdown menu in the header.

Direct URL: `http://localhost:3001/admin`

## Admin Features

### Submissions List
- View all submissions with status badges
- Filter by status (all, pending, under review, accepted, rejected)
- Click any submission to view details
- Shows: title, author, email, submission date

### Submission Details
- Complete paper metadata
- Author information
- Research field and keywords
- Abstract
- PDF download button
- Submission timestamps

### Status Management
Four status options:
1. **待审核 (Pending)** - Initial state after submission
2. **审核中 (Under Review)** - Currently being reviewed by experts
3. **已接受 (Accepted)** - Paper accepted for publication
4. **已拒绝 (Rejected)** - Paper rejected

### Security
- Only admin users can access `/admin` route
- Non-admin users are redirected to homepage
- RLS policies ensure data protection:
  - Regular users can only see their own submissions
  - Admins can see all submissions
  - Only admins can update submission status

## Submission Storage

### Database (`submissions` table)
Stores all submission metadata:
- Paper details (title, authors, email, field, keywords, abstract)
- PDF information (filename, size, URL)
- Status tracking
- Timestamps (created_at, updated_at)
- User relationship (user_id foreign key)

### File Storage (Supabase Storage)
- Bucket: `submissions`
- Path structure: `{user_id}/{timestamp}.pdf`
- Access: Users can access their own PDFs, admins can access all
- Max file size: 10MB (enforced client-side)

## User Workflow

### For Regular Users:
1. Register and verify email
2. Login
3. Navigate to Submit page
4. Fill out submission form
5. Upload PDF
6. Submit
7. Wait for admin review

### For Admin Users:
1. Login
2. Click "Admin Dashboard" in account menu
3. View all submissions
4. Filter by status if needed
5. Click submission to view details
6. Download PDF if needed
7. Update status as appropriate

## Troubleshooting

### "Access Denied" when visiting /admin
- Verify your user ID is in the `admin_users` table
- Check you're logged in
- Clear browser cache and cookies

### Submission not appearing in admin dashboard
- Check the submission was successful (user should see success message)
- Verify RLS policies are enabled
- Check Supabase logs for errors

### PDF upload failing
- Ensure file is PDF format
- Check file size is under 10MB
- Verify Supabase storage bucket exists
- Check storage policies are configured

### Status update not working
- Verify admin user has proper permissions
- Check RLS policies for UPDATE operation
- Review browser console for errors

## Development Notes

### Key Files
- `/app/admin/page.js` - Admin dashboard component
- `/contexts/AuthContext.js` - Added `checkIsAdmin()` method
- `/app/submit/page.js` - Updated to store in database
- `/components/Header.js` - Added admin link for admin users
- `supabase-schema.sql` - Complete database schema

### API Calls
All using Supabase client:
- `supabase.from('submissions').select()` - Fetch submissions
- `supabase.from('submissions').update()` - Update status
- `supabase.storage.from('submissions').upload()` - Upload PDF
- `supabase.from('admin_users').select()` - Check admin status

## Future Enhancements

Possible additions:
- Admin notes/comments on submissions
- Email notifications for status changes
- Bulk status updates
- Search/sort functionality
- Export submissions to CSV
- Review assignment system
- Reviewer accounts separate from admins
