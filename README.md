# Novelty - Journal of Academic Novelty

A professional bilingual Next.js template for an academic journal website, inspired by Nature.com's design.

## Features

- Clean, modern design inspired by Nature.com
- Bilingual Chinese-English interface
- Responsive layout with article browsing and filtering
- Research stage categorization system
- Article detail pages with metadata
- **Complete submission system** with Chinese language support
- **PDF upload** with file validation (max 10MB) and Supabase Storage
- **Downloadable submission template**
- Supabase authentication integration with email OTP
- **Admin dashboard** for managing submissions
- **Status tracking** (pending, under review, accepted, rejected)
- **Role-based access control** for admin users
- Professional typography and color scheme

## Tech Stack

- Next.js 14 with App Router
- React 18
- Supabase for authentication
- CSS with modern design system
- Bilingual content support

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set up Supabase

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Copy your project URL and anon key from Settings > API
4. Copy `.env.example` to `.env` and add your credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## Authentication

The site includes email-based authentication with OTP verification powered by Supabase:

- **Register**: Create a new account with email and password
- **Email Verification**: Users receive a 6-digit OTP code via email
- **Verify**: Enter the OTP code to activate the account
- **Login**: Sign in with verified credentials
- **Protected Routes**: The submit page requires authentication
- **User Menu**: Logged-in users see their email and can log out

### Authentication Flow

1. **Registration**: User enters email and password
2. **OTP Code Sent**: Supabase sends a 6-digit verification code to the email
3. **Verification Page**: User is redirected to enter the OTP code
4. **Account Activated**: After successful verification, user can log in
5. **Resend Code**: Users can request a new code if needed (60s cooldown)

### Default Setup

- Email OTP verification is required for new accounts
- Minimum password length: 6 characters
- OTP codes expire after a set time (configurable in Supabase)
- Session management handled automatically
- Secure email delivery via Supabase

## Submission System

The platform includes a complete Chinese-language paper submission system:

### Submission Requirements

- **Language**: Papers must be written in Chinese
- **Format**: PDF only (max 10MB)
- **Template**: Must follow journal formatting guidelines

### Submission Form Fields

- Paper title (Chinese, max 50 characters)
- First author name
- Corresponding author (optional)
- Contact email
- Research field (dropdown selection)
- Keywords (semicolon-separated)
- Abstract (max 100 characters)
- PDF file upload

### Review Process Timeline

1. **Initial Review** (3 working days)
2. **Expert Peer Review** (2-4 weeks)
3. **Revision Submission** (as needed)
4. **Final Decision** (1 week)

### Template Download

Users can download the submission template which includes:
- Formatting guidelines (A4, margins, line spacing)
- Font requirements (黑体, 宋体, 楷体)
- Section structure requirements
- Figure and table formatting
- Reference style (GB/T 7714-2015)

## Admin System

The platform includes a complete admin management system for reviewing and processing submissions:

### Admin Setup

1. **Run the Database Schema**: Execute the SQL in `supabase-schema.sql` in your Supabase SQL Editor
   - Creates `submissions` table for storing paper submissions
   - Creates `admin_users` table for admin privileges
   - Sets up Row Level Security (RLS) policies
   - Creates storage bucket for PDF files

2. **Add Admin Users**: Insert admin user IDs into the `admin_users` table
   ```sql
   INSERT INTO admin_users (user_id) VALUES ('your-user-id-here');
   ```
   You can find your user ID by logging in and checking the `auth.users` table

3. **Access Admin Dashboard**: Visit `/admin` (only accessible to admin users)

### Admin Features

- **View All Submissions**: See all paper submissions with filtering by status
- **Submission Details**: View complete submission information including:
  - Paper metadata (title, authors, email, field, keywords, abstract)
  - PDF file download
  - Submission timestamps
- **Status Management**: Update submission status:
  - 待审核 (Pending) - Initial submission state
  - 审核中 (Under Review) - Currently being reviewed
  - 已接受 (Accepted) - Paper accepted for publication
  - 已拒绝 (Rejected) - Paper rejected
- **Real-time Updates**: All status changes are immediately reflected in the database

### Submission Storage

- **Database**: Submission metadata stored in Supabase `submissions` table
- **File Storage**: PDF files stored in Supabase Storage `submissions` bucket
- **Security**: Row Level Security ensures users can only see their own submissions, admins can see all

## Project Structure

- `/app` - Next.js pages and layouts
  - `/login` - Authentication page (login/register)
  - `/verify-email` - Email OTP verification page
  - `/submit` - Protected submission page with full form
  - `/admin` - Admin dashboard for managing submissions
- `/components` - Reusable React components
  - `Header.js` - Navigation with user menu
  - `ProtectedRoute.js` - Route protection wrapper
- `/contexts` - React Context providers
  - `AuthContext.js` - Authentication state and methods
  - `LanguageContext.js` - Bilingual language switching
- `/lib` - Data and utilities
  - `supabase.js` - Supabase client configuration
- `/public/templates` - Downloadable templates
  - `submission-template.md` - Paper submission guidelines
- `/app/globals.css` - Global styles with design tokens
- `supabase-schema.sql` - Database schema for submissions and admin system
