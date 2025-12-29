# Image Upload Setup Guide

This guide walks you through setting up the image upload feature for your gift editor.

## What's Been Implemented

✅ **Database Migration** - Assets table for tracking uploaded images
✅ **Server Actions** - Upload, delete, and Unsplash search functionality
✅ **ImagePicker Component** - Unified interface for Unsplash, Upload, and Manual URL
✅ **AddScreenDialog** - Create new screens with image support
✅ **Enhanced Node List** - Add screens at any position with "+" buttons
✅ **Enhanced Node Editor** - Replace images using ImagePicker

## Setup Steps

### 1. Run Database Migration

Apply the new migration to create the `assets` table:

```bash
# If using Supabase CLI locally
supabase migration up

# Or apply directly in Supabase Dashboard:
# Go to SQL Editor and run the migration file:
# supabase/migrations/002_add_assets_table.sql
```

### 2. Create Supabase Storage Bucket

You need to create the `project-assets` storage bucket:

#### Option A: Via Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **New bucket**
4. Set the following:
   - **Name**: `project-assets`
   - **Public bucket**: ✅ Enable (for published projects)
   - **File size limit**: 5MB (or your preference)
5. Click **Create bucket**

#### Option B: Via SQL (Advanced)

Run this SQL in the Supabase SQL Editor:

```sql
-- Insert storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-assets', 'project-assets', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for storage
CREATE POLICY "Users can upload to own folder"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'project-assets' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Anyone can view public assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'project-assets');

CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'project-assets' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

### 3. Verify Setup

To verify everything is working:

1. Start your development server: `npm run dev`
2. Navigate to an existing project in the editor
3. Try the "Add Screen" button
4. Select a screen type with image support (Hero, Reveal, or Media)
5. Test each ImagePicker tab:
   - **Unsplash**: Search and select an image
   - **Upload**: Drag/drop or browse for a file
   - **URL**: Paste an image URL

## Features

### Manual Screen Creation

- **Add at End**: Click "Add Screen" button at bottom of node list
- **Insert Between**: Hover between nodes, click "Add Screen Here" button
- **Empty State**: If no screens exist, click "Add First Screen"

### Image Selection Options

1. **Unsplash Tab** - Search millions of free stock photos
2. **Upload Tab** - Upload personal images (max 5MB, JPEG/PNG/WebP/GIF)
3. **URL Tab** - Link to external images

### Image Editing

- Click **Edit** button on any screen with an image
- Use ImagePicker to change from Unsplash to upload (or vice versa)
- Images are tracked with source metadata for better management

## File Structure

```
src/
├── app/actions/
│   ├── nodes.ts              # Added addNodeAction
│   ├── upload-image.ts       # NEW - Image upload server action
│   └── search-unsplash.ts    # NEW - Unsplash search server action
├── components/editor/
│   ├── image-picker.tsx      # NEW - Reusable image selection component
│   ├── add-screen-dialog.tsx # NEW - Manual screen creation dialog
│   ├── node-list.tsx         # ENHANCED - Add screen buttons
│   └── node-editor.tsx       # ENHANCED - Uses ImagePicker
├── types/
│   ├── assets.ts             # NEW - Asset and image types
│   └── flow.ts               # UPDATED - ImageSchema with source tracking
└── supabase/migrations/
    └── 002_add_assets_table.sql # NEW - Assets table migration
```

## Configuration

### Upload Limits (Configurable)

Edit `/src/types/assets.ts`:

```typescript
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_IMAGE_DIMENSION = 2000; // Max width/height
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
```

### Storage Path Structure

Images are stored with this path pattern:
```
{userId}/{projectId}/{timestamp}_{filename}
```

Benefits:
- User isolation (RLS enforcement)
- Project organization
- Unique filenames (timestamp prefix)
- Easy cleanup per project

## Security Features

✅ **Server-side validation** - File type checked by magic numbers
✅ **Row Level Security** - Users can only access own uploads
✅ **File size limits** - Prevents abuse (5MB default)
✅ **Type validation** - Only allowed image formats
✅ **User folder isolation** - RLS enforces storage paths

## Troubleshooting

### "Failed to upload" error
- Check Supabase Storage bucket exists (`project-assets`)
- Verify bucket is public
- Check file size < 5MB
- Ensure file type is allowed (JPEG, PNG, WebP, GIF)

### "Unauthorized" error
- User must be logged in
- Check RLS policies are configured correctly
- Verify auth session is valid

### Images not displaying
- Check Supabase Storage URL is publicly accessible
- Verify bucket name matches (`project-assets`)
- Check browser console for CORS errors

### Migration errors
- Ensure UUID extension is enabled (`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`)
- Verify profiles table exists (from 001_initial_schema.sql)
- Check for naming conflicts with existing tables

## Next Steps

### Optional Enhancements

1. **Image Optimization**
   - Add Sharp library for server-side compression
   - Generate thumbnails automatically
   - Convert to WebP for smaller file sizes

2. **Asset Management**
   - Dashboard to view all uploads
   - Bulk delete unused assets
   - Storage quota tracking per user

3. **Background Cleanup**
   - Cron job to find orphaned assets
   - Automatic deletion of assets from deleted projects
   - Archive old assets after expiration

4. **Advanced Features**
   - Image cropping/resizing in UI
   - Multiple image upload at once
   - Drag-and-drop reordering of images
   - Image filters and effects

## Support

If you encounter issues:
1. Check browser console for errors
2. Check Supabase logs in dashboard
3. Verify all migration steps were completed
4. Ensure environment variables are set correctly
