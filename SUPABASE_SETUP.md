# Supabase Comment System Setup

This project now uses Supabase for the realtime comment system in the blog section. Follow these steps to set up the database and get comments working.

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

## 3. Create Comments Table

In your Supabase dashboard, go to the SQL Editor and run this SQL:

```sql
-- Comments table schema for Supabase
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  comment TEXT NOT NULL,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  is_anonymous BOOLEAN DEFAULT FALSE,
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_comments_created_at ON comments(created_at);
CREATE INDEX idx_comments_parent_id ON comments(parent_id);

-- Enable Row Level Security (RLS)
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Policy to allow anyone to read comments
CREATE POLICY "Anyone can view comments" ON comments
  FOR SELECT USING (true);

-- Policy to allow anyone to insert comments
CREATE POLICY "Anyone can insert comments" ON comments
  FOR INSERT WITH CHECK (true);

-- Enable realtime for the comments table
ALTER publication supabase_realtime ADD TABLE comments;
```

## 4. Test the System

1. Start your development server: `npm run dev`
2. Go to the blog page at `/blog`
3. Try posting a comment (both anonymous and with name)
4. Try replying to comments
5. Open the page in multiple tabs to see realtime updates

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