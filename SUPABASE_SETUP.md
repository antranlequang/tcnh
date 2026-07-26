# Supabase Setup Guide

This project uses Supabase for multiple features:
1. **Blog Comment System** - Realtime comments with AI moderation
2. **A80 Message System** - Vietnamese flag pixel display with student messages
3. **Content Management** - Achievements, activities, partners, and structure departments managed from `/admin`

Follow these steps to set up the complete database system.

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be created (takes about 2-3 minutes)
3. Note down your project URL and anon public key from the API settings

## 2. Set up Environment Variables

Create a `.env.local` file in the root directory with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_public_key
```

## 3. Create Database Tables

In your Supabase dashboard, go to the SQL Editor and run this SQL:

```sql
-- Comments table schema for Blog section
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  comment TEXT NOT NULL,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  is_anonymous BOOLEAN DEFAULT FALSE,
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Submissions table for A80 page (Vietnamese flag messages)
CREATE TABLE submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  student_id TEXT,
  class_name TEXT,
  faculty TEXT,
  email TEXT,
  content TEXT NOT NULL,
  image_url TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_comments_created_at ON comments(created_at);
CREATE INDEX idx_comments_parent_id ON comments(parent_id);
CREATE INDEX submissions_created_at_idx ON submissions(created_at DESC);
CREATE INDEX submissions_is_anonymous_idx ON submissions(is_anonymous);

-- Enable Row Level Security (RLS)
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Policies for comments table
CREATE POLICY "Anyone can view comments" ON comments
  FOR SELECT USING (true);
CREATE POLICY "Anyone can insert comments" ON comments
  FOR INSERT WITH CHECK (true);

-- Policies for submissions table
CREATE POLICY "Allow public read access" ON submissions
  FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON submissions
  FOR INSERT WITH CHECK (true);

-- Create storage bucket for submission images
INSERT INTO storage.buckets (id, name, public) VALUES ('submission-images', 'submission-images', true);

-- Storage policies
CREATE POLICY "Allow public upload" ON storage.objects 
  FOR INSERT WITH CHECK (bucket_id = 'submission-images');
CREATE POLICY "Allow public read" ON storage.objects 
  FOR SELECT USING (bucket_id = 'submission-images');

-- Enable realtime for tables
ALTER publication supabase_realtime ADD TABLE comments;
ALTER publication supabase_realtime ADD TABLE submissions;
```

For the current website content management features, also run the schema in [supabase-schema.sql](supabase-schema.sql).

The current [supabase-schema.sql](supabase-schema.sql) automatically removes legacy Google Drive and Google Sheets columns before creating or updating current resources.

Minimum extra resources required by the current codebase:

1. Tables:
  - `achievements`
  - `activities`
  - `partners`
  - `structure_departments`
2. Public Storage buckets:
  - `home-images`
  - `submission-images`
  - `application-form-images`
  - `application-form-photos`
  - `achievements`
  - `activities`
  - `partners`
  - `structure`

Create the buckets in Supabase Storage UI, or run:

```sql
insert into storage.buckets (id, name, public)
values
  ('home-images', 'home-images', true),
  ('submission-images', 'submission-images', true),
  ('application-form-images', 'application-form-images', true),
  ('application-form-photos', 'application-form-photos', true),
  ('achievements', 'achievements', true),
  ('activities', 'activities', true),
  ('partners', 'partners', true),
  ('structure', 'structure', true)
on conflict (id) do nothing;
```

Image storage layout used by the app:

1. `home-images`: `banner/...` or `intro/...`
2. `submission-images`: `timestamp-random.webp`
3. `application-form-images`: `slot/timestamp-uuid.webp`
4. `application-form-photos`: `templateId/timestamp-uuid.webp`
5. `achievements`: `achievementId/image.webp`
6. `activities`: `activityId/image-0.webp`, `image-1.webp`, ...
7. `partners`: `partnerId/logo.webp`
8. `structure`: `departmentId/image-0.webp`, `image-1.webp`, ...

## 3.1 Upgrade Existing Projects

If your Supabase project was created before the Google Drive and Google Sheets cleanup, apply this order:

1. Run the latest base schema from [supabase-schema.sql](supabase-schema.sql).
2. Create any missing storage buckets listed above if the schema could not create them.
3. Redeploy the app with the current Supabase-only environment variables.

The current runtime no longer reads or writes any Google Drive or Google Sheets settings.

## Google login for the admin page

The admin page supports both the existing admin password and Google login through
Supabase Auth. Before using role-based admin management, rerun the latest
[supabase-schema.sql](supabase-schema.sql) to create `admin_accounts` and
`admin_user_profiles`.

Google login always grants protected super-admin access to these two accounts:

- `dktaichinhnganhang@st.uel.edu.vn`
- `tranlequangan2308@gmail.com`

To enable Google login:

1. In Google Auth Platform, create an OAuth client with application type
   **Web application**.
2. Add the website origin and the local development origin
   `http://localhost:9002` under **Authorized JavaScript origins**.
3. Copy the Supabase callback URL shown under
   **Supabase Dashboard → Authentication → Providers → Google** into Google's
   **Authorized redirect URIs**.
4. Paste the Google Client ID and Client Secret into that Supabase Google
   provider and enable it.
5. Under **Supabase Dashboard → Authentication → URL Configuration**, set the
   production Site URL and add these redirect URLs:
   - `http://localhost:9002/admin`
   - `https://YOUR-PRODUCTION-DOMAIN/admin`

Only the standard `openid`, email, and profile scopes are required. Google
Sheets, Google Drive, and their API credentials are not used by this login
flow.

After signing in with Google, the **Personal Profile** page changes according to
the authenticated email:

- A protected super admin sees the admin list, can add/remove regular admins,
  and can inspect each person's profile.
- A regular admin sees only their own editable profile.
- Password login does not show the Personal Profile page and cannot manage
  admin accounts.

Removing a regular admin immediately prevents that email's existing Google
session from accessing protected admin APIs. For a standalone upgrade, run
[docs/sql/2026-07-26_admin_roles_and_profiles.sql](docs/sql/2026-07-26_admin_roles_and_profiles.sql).

## 4. Test the System

### Blog Comments:
1. Start your development server: `npm run dev`
2. Go to the blog page at `/blog`
3. Try posting a comment (both anonymous and with name)
4. Try replying to comments
5. Open the page in multiple tabs to see realtime updates

### A80 Message System:
1. Go to the A80 page at `/a80`
2. Click the floating message button in the bottom-right
3. Try submitting both anonymous and named messages
4. Watch the Vietnamese flag display update with new pixels
5. Test image uploads (optional feature)
6. Visit `/admin-a80` to manage submissions and export data

## Features

### ✅ **Realtime Comments**
- Comments appear instantly without page refresh
- Live updates when other users post comments
- Nested replies with proper threading

### ✅ **Anonymous Support**
- Users can choose to post anonymously
- Anonymous comments show "Ẩn danh" with a "?" avatar
- Actual names are still stored for moderation purposes

### ✅ **AI Content Moderation**
- All comments go through AI moderation before posting
- Inappropriate content is blocked automatically
- Safe comments are posted immediately

### ✅ **Threaded Replies**
- Users can reply to any comment
- Replies are visually nested and indented
- Chronological ordering (newest comments first, oldest replies first)

### ✅ **Responsive Design**
- Works on desktop and mobile
- Clean, modern UI with timestamps
- Loading states and error handling

## Database Structure

The comments table has the following columns:

- `id`: UUID primary key
- `name`: User's name (nullable for anonymous users)  
- `comment`: The comment text (required)
- `parent_id`: UUID reference to parent comment (for replies)
- `is_anonymous`: Boolean flag for anonymous comments
- `avatar`: URL to user's avatar (optional)
- `created_at`: Timestamp when comment was created

## How it Works

1. **User submits comment** → Form validation → AI moderation
2. **If safe** → Insert into Supabase → Realtime notification to all users
3. **If unsafe** → Show error message with reason
4. **Realtime updates** → All connected users see new comments instantly
5. **Tree structure** → Comments are organized hierarchically with replies

The system is production-ready and will scale with your user base!
