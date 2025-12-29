import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE } from '@/types/assets';

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

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 1. Authenticate user - try both methods
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    console.log('Session check:', { session: session?.user?.id, sessionError });
    console.log('Auth check:', { user: user?.id, error: authError });

    if (authError || !user) {
      console.error('Authentication failed:', { authError, sessionError });
      return NextResponse.json({
        error: 'Unauthorized',
        details: { authError, sessionError }
      }, { status: 401 });
    }

    // 2. Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const projectId = formData.get('projectId') as string | null;
    const altText = formData.get('altText') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // 3. Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // 4. Validate file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type as any)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed' },
        { status: 400 }
      );
    }

    // 5. Validate magic number (server-side verification)
    const arrayBuffer = await file.arrayBuffer();
    if (!checkMagicNumber(arrayBuffer, file.type)) {
      return NextResponse.json(
        { error: 'File type mismatch. The file content does not match its extension' },
        { status: 400 }
      );
    }

    // 6. Generate storage path
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = projectId
      ? `${user.id}/${projectId}/${timestamp}_${sanitizedFileName}`
      : `${user.id}/temp/${timestamp}_${sanitizedFileName}`;

    // 7. Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('project-assets')
      .upload(storagePath, arrayBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { error: `Upload failed: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // 8. Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('project-assets')
      .getPublicUrl(storagePath);

    // 9. Insert into assets table
    const assetData = {
      user_id: user.id,
      project_id: projectId || null,
      storage_path: storagePath,
      storage_bucket: 'project-assets',
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type,
      width: null,
      height: null,
      alt_text: altText || file.name,
      attribution: null,
    };

    console.log('Inserting asset with user_id:', user.id);
    console.log('Asset data:', assetData);

    const { data: asset, error: dbError } = await supabase
      .from('assets')
      .insert(assetData)
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      console.error('Database error details:', JSON.stringify(dbError, null, 2));
      // Try to clean up uploaded file
      await supabase.storage.from('project-assets').remove([storagePath]);
      return NextResponse.json(
        { error: `Database error: ${dbError.message}` },
        { status: 500 }
      );
    }

    // 10. Return success response
    return NextResponse.json({
      success: true,
      asset: {
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
      },
      publicUrl,
    });
  } catch (error) {
    console.error('Unexpected error in upload:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// Configure route segment config for larger body sizes
export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds max
