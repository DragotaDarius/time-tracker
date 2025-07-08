# 🚀 TimeTracker Setup Guide

Follow this guide to set up your TimeTracker application with Supabase.

## Step 1: Create Supabase Project

1. **Go to [supabase.com](https://supabase.com)** and sign up/login
2. **Create a new project**:
   - Click "New Project"
   - Choose your organization
   - Enter project name (e.g., "timetracker")
   - Enter database password (save this!)
   - Choose region closest to you
   - Click "Create new project"

3. **Wait for setup** (usually 2-3 minutes)

## Step 2: Get Your Supabase Credentials

1. **Go to Settings > API** in your Supabase dashboard
2. **Copy these values**:
   - **Project URL** (looks like: `https://abcdefghijklmnop.supabase.co`)
   - **anon public key** (starts with `eyJ...`)
   - **service_role secret key** (starts with `eyJ...`)

## Step 3: Update Environment Variables

1. **Open `.env.local`** in your project root
2. **Replace the placeholder values**:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret_key

# Google OAuth (optional - can skip for now)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## Step 4: Run Database Migrations

1. **Login to Supabase CLI**:
```bash
supabase login
```

2. **Link your project** (replace with your project ref):
```bash
supabase link --project-ref your-project-ref
```

3. **Push the database schema**:
```bash
supabase db push
```

## Step 5: Generate NextAuth Secret

Run this command to generate a secure secret:
```bash
openssl rand -base64 32
```

Copy the output and replace `your_random_secret_key` in `.env.local`.

## Step 6: Test the Application

1. **Start the development server**:
```bash
npm run dev
```

2. **Visit http://localhost:3000**

3. **Test signup**:
   - Click "Get Started"
   - Fill in the form with your details
   - Create an organization
   - You should be redirected to the dashboard

## Step 7: Verify Database Setup

1. **Go to your Supabase dashboard**
2. **Check Table Editor**
3. **You should see these tables**:
   - `organizations`
   - `user_profiles`
   - `projects`
   - `work_sessions`
   - `breaks`
   - `tasks`

## Troubleshooting

### Common Issues:

1. **"Invalid API key" error**:
   - Double-check your Supabase URL and keys
   - Make sure you copied the full keys

2. **"Database connection failed"**:
   - Verify your Supabase project is active
   - Check if migrations ran successfully

3. **"User profile not found"**:
   - Run `supabase db push` again
   - Check if RLS policies are applied

4. **"Organization subdomain already taken"**:
   - Use a unique subdomain name
   - Or delete the organization from Supabase dashboard

### Getting Help:

- Check the Supabase logs in your dashboard
- Review the browser console for errors
- Ensure all environment variables are set correctly

## Next Steps

Once authentication is working:

1. **Test the dashboard** - Should show your user info
2. **Create a project** - Test project management
3. **Try time tracking** - Test clock in/out functionality
4. **Explore admin features** - Test user management

## Optional: Google OAuth Setup

If you want Google sign-in:

1. **Go to [Google Cloud Console](https://console.cloud.google.com)**
2. **Create a new project or select existing**
3. **Enable Google+ API**
4. **Create OAuth 2.0 credentials**
5. **Add authorized redirect URIs**:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://your-domain.com/api/auth/callback/google` (for production)
6. **Copy Client ID and Secret to `.env.local`**

---

🎉 **Congratulations!** Your TimeTracker application should now be fully functional with authentication and database persistence. 