'use server';

import { createClient } from '@/lib/supabase/server';
import { AssetMetadata, ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE } from '@/types/assets';
import { revalidatePath } from 'next/cache';

// File type magic numbers for validation
const MAGIC_NUMBERS: Record<string, string[]> = {
  'image/jpeg': ['ffd8ff'],
  'image/png': ['89504e47'],
  'image/webp': ['52494646'], // "RIFF"
  'image/gif': ['47494638'], // "GIF8"
};

function checkMagicNumber(buffer: ArrayBuffer, mimeType: string): boolean {
  const arr = new Uint8Array(buffer);
  const hex = Array.from(arr.slice(0, 4))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  const validPrefixes = MAGIC_NUMBERS[mimeType];
  if (!validPrefixes) return false;

  return validPrefixes.some((prefix) => hex.startsWith(prefix));
}

// Note: This function is kept for future implementation with sharp library
// async function getImageDimensions(_buffer: ArrayBuffer): Promise<{ width: number; height: number } | null> {
//   try {
//     // For server-side, we'll use the sharp library if available
//     // For now, return null and we can add sharp later
//     return null;
//   } catch (error) {
//     console.error('Error getting image dimensions:', error);
//     return null;
//   }
// }

export async function uploadImageAction(formData: FormData): Promise<
  { success: true; asset: AssetMetadata; publicUrl: string } | { success: false; error: string }
> {
  try {
    const supabase = await createClient();

    // 1. Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    // 2. Extract form data
    const file = formData.get('file') as File | null;
    const projectId = formData.get('projectId') as string | null;
    const altText = formData.get('altText') as string | null;

    if (!file) {
      return { success: false, error: 'No file provided' };
    }

    // 3. Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return { success: false, error: `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB` };
    }

    // 4. Validate file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
      return { success: false, error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed' };
    }

    // 5. Validate magic number (server-side verification)
    const arrayBuffer = await file.arrayBuffer();
    if (!checkMagicNumber(arrayBuffer, file.type)) {
      return { success: false, error: 'File type mismatch. The file content does not match its extension' };
    }

    // 6. Generate storage path
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = projectId
      ? `${user.id}/${projectId}/${timestamp}_${sanitizedFileName}`
      : `${user.id}/temp/${timestamp}_${sanitizedFileName}`;

    // 7. Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('project-assets')
      .upload(storagePath, arrayBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return { success: false, error: `Upload failed: ${uploadError.message}` };
    }

    // 8. Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('project-assets')
      .getPublicUrl(storagePath);

    // 9. Get image dimensions (optional)
    const dimensions = await getImageDimensions(arrayBuffer);

    // 10. Insert into assets table
    const assetData = {
      user_id: user.id,
      project_id: projectId || null,
      storage_path: storagePath,
      storage_bucket: 'project-assets',
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type,
      width: dimensions?.width || null,
      height: dimensions?.height || null,
      alt_text: altText || file.name,
      attribution: null,
    };

    const { data: asset, error: dbError } = await supabase
      .from('assets')
      .insert(assetData)
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      // Try to clean up uploaded file
      await supabase.storage.from('project-assets').remove([storagePath]);
      return { success: false, error: `Database error: ${dbError.message}` };
    }

    // 11. Revalidate paths
    if (projectId) {
      revalidatePath(`/dashboard`);
      revalidatePath(`/editor/${projectId}`);
    }

    // 12. Return asset metadata
    const assetMetadata: AssetMetadata = {
      id: asset.id,
      userId: asset.user_id,
      projectId: asset.project_id,
      storagePath: asset.storage_path,
      storageBucket: asset.storage_bucket,
      fileName: asset.file_name,
      fileSize: asset.file_size,
      mimeType: asset.mime_type,
      width: asset.width,
      height: asset.height,
      altText: asset.alt_text,
      attribution: asset.attribution,
      createdAt: asset.created_at,
    };

    return { success: true, asset: assetMetadata, publicUrl };
  } catch (error) {
    console.error('Unexpected error in uploadImageAction:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function deleteAssetAction(assetId: string): Promise<
  { success: true } | { success: false; error: string }
> {
  try {
    const supabase = await createClient();

    // 1. Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    // 2. Fetch asset metadata
    const { data: asset, error: fetchError } = await supabase
      .from('assets')
      .select('*')
      .eq('id', assetId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !asset) {
      return { success: false, error: 'Asset not found' };
    }

    // 3. Delete from storage
    const { error: storageError } = await supabase.storage
      .from(asset.storage_bucket)
      .remove([asset.storage_path]);

    if (storageError) {
      console.error('Storage deletion error:', storageError);
      // Continue anyway to delete from database
    }

    // 4. Delete from database
    const { error: dbError } = await supabase
      .from('assets')
      .delete()
      .eq('id', assetId)
      .eq('user_id', user.id);

    if (dbError) {
      console.error('Database deletion error:', dbError);
      return { success: false, error: `Database error: ${dbError.message}` };
    }

    // 5. Revalidate paths
    if (asset.project_id) {
      revalidatePath(`/dashboard`);
      revalidatePath(`/editor/${asset.project_id}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error in deleteAssetAction:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}
