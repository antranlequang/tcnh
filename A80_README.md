# A80 - Vietnamese Flag Message System

A special page where students can send messages to ceremonies in Hanoi, creating a collaborative Vietnamese flag display with individual message pixels.

## 🎯 Features

### Main Features
- **Vietnamese Flag Display**: Messages appear as pixels forming the Vietnamese flag
- **Anonymous & Named Submissions**: Support for both anonymous and identified messages
- **Image Upload Support**: Optional image attachments with submissions
- **Real-time Updates**: Flag display updates automatically with new submissions
- **Responsive Design**: Works on desktop and mobile devices

### Admin Features
- **Admin Dashboard**: Manage all submissions at `/admin-a80`
- **Excel Export**: Download all submissions as XLSX file
- **Message Management**: View, filter, and delete individual messages
- **Statistics Dashboard**: Track submission counts and types

## 🖼️ How the Flag Works

1. **Target**: 1000 messages to complete the Vietnamese flag
2. **Pixel System**: Each message represents one pixel in the flag display
3. **Auto-scaling**: When submissions exceed 1000, pixels automatically resize to maintain flag proportions
4. **Visual Progress**: Progress indicator shows completion status

## 📝 Form Fields

### Required Fields
- **Name**: Student's name (or "Ẩn danh" for anonymous)
- **Content**: Message content (required)

### Optional Fields
- **Student ID**: MSSV
- **Class**: Lớp học
- **Faculty**: Khoa
- **Email**: Contact email
- **Image**: Photo attachment
- **Anonymous**: Toggle for anonymous submission

## 🛠️ Technical Implementation

### Frontend Components
- **Main Page**: `/src/app/a80/page.tsx`
- **Admin Page**: `/src/app/admin-a80/page.tsx`
- **Vietnamese Flag Canvas**: HTML5 Canvas with dynamic pixel rendering

### API Routes
- **GET/POST** `/api/a80/submissions` - Fetch and create submissions
- **DELETE** `/api/a80/submissions/[id]` - Delete specific submission
- **GET** `/api/a80/export` - Export submissions to Excel

### Database Schema (Supabase)
```sql
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
```

### Storage
- **Images**: Stored in Supabase Storage bucket `submission-images`
- **Data Persistence**: All submissions saved to Supabase database
- **Public Access**: Read-only public access for displaying flag

## 🚀 Setup Instructions

### 1. Database Setup
Follow the instructions in `SUPABASE_SETUP.md` to:
- Create Supabase project
- Set up database tables
- Configure storage bucket
- Set environment variables

### 2. Required Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Install Dependencies
```bash
npm install @supabase/supabase-js xlsx
```

### 4. Test the System
1. Start development server: `npm run dev`
2. Visit `/a80` to submit messages
3. Visit `/admin-a80` to manage submissions

## 📊 Admin Dashboard Features

### Statistics Cards
- **Total Messages**: Count of all submissions
- **Named Submissions**: Messages with identified users
- **Anonymous Submissions**: Messages submitted anonymously  
- **With Images**: Messages that include image attachments

### Filtering Options
- **Search**: Filter by name, content, email, or student ID
- **Type Filter**: Show/hide anonymous and named submissions
- **Real-time Refresh**: Update data without page reload

### Export Functionality
- **Excel Export**: Download comprehensive XLSX file
- **Include All Data**: Names, contact info, content, timestamps
- **Formatted Columns**: Proper column widths and Vietnamese labels

## 🎨 Vietnamese Flag Rendering

### Canvas Implementation
- **Dynamic Sizing**: Responsive to container dimensions
- **Pixel Calculation**: Automatic grid calculation based on submission count
- **Star Overlay**: Accurate 5-pointed star in center
- **Color Scheme**: Official Vietnamese flag colors (#DA251D red, #FFD700 yellow)

### Scaling Logic
```javascript
if (submissions <= 1000) {
  // Optimal pixel size for clear visibility
  pixelSize = calculateOptimalSize();
} else {
  // Scale down to fit all submissions
  pixelSize = calculateScaledSize(submissions.length);
}
```

## 🔒 Security Features

### Data Protection
- **Row Level Security**: Enabled on Supabase tables
- **Public Policies**: Allow read/insert, restrict delete
- **Input Validation**: Server-side validation for all fields
- **File Upload Security**: Type restrictions and size limits

### Privacy Features
- **Anonymous Option**: Hide personal information
- **Optional Fields**: Minimal required data
- **Admin-Only Deletion**: Only admin can remove messages

## 📱 Mobile Responsive

- **Touch-Friendly**: Large buttons and inputs
- **Responsive Grid**: Adaptive layout for all screen sizes
- **Popup Forms**: Optimized for mobile interaction
- **Performance**: Optimized canvas rendering for mobile devices

## 🔧 Maintenance

### Regular Tasks
- Monitor submission count approaching 1000
- Clean up old image files if storage becomes full
- Export data regularly for backup
- Monitor database performance

### Scaling Considerations
- Current limit: ~10,000 submissions before performance impact
- Image storage: Monitor Supabase storage quotas
- Database: Consider archiving old submissions if needed

## 📞 Support

For technical issues or questions:
1. Check the `SUPABASE_SETUP.md` guide
2. Verify environment variables are set
3. Check browser console for errors
4. Monitor Supabase dashboard for quota limits

## 🎉 Success Metrics

- **Completion Goal**: 1000 messages to complete the flag
- **Engagement**: Track anonymous vs named submission ratio
- **Usage**: Monitor daily submission patterns
- **Performance**: Canvas rendering speed and responsiveness