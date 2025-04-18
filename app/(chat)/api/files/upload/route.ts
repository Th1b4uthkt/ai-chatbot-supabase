import { NextResponse } from 'next/server';

import { corsHeaders } from '@/app/api/cors-middleware';
import { upload } from '@/db/storage';
import { createClient, validateToken } from '@/lib/supabase/server';

import type { Database } from '@/lib/supabase/types';

function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9.-]/g, '_').toLowerCase();
}

async function getUser(request: Request) {
  // Vérifier d'abord le jeton Bearer (mobile)
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const { data, error } = await validateToken(token);
    if (!error && data.user) {
      return data.user;
    }
  }

  // Sinon, utiliser l'authentification basée sur les cookies (web)
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  return user;
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const chatId = formData.get('chatId') as string;

    console.log('Upload request:', {
      fileName: file?.name,
      fileType: file?.type,
      fileSize: file?.size,
      chatId,
    });

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { 
        status: 400,
        headers: corsHeaders()
      });
    }

    if (!chatId) {
      return NextResponse.json({ error: 'No chatId provided' }, { 
        status: 400,
        headers: corsHeaders()
      });
    }

    // Vérifier l'authentification avec support mobile
    const user = await getUser(req);
    
    if (!user) {
      console.error('Authentication failed');
      return NextResponse.json({ error: 'Unauthorized' }, { 
        status: 401,
        headers: corsHeaders()
      });
    }

    try {
      // Create folder structure with user ID for RLS
      const sanitizedFileName = sanitizeFileName(file.name);
      const filePath = [user.id, chatId, sanitizedFileName];

      console.log('Sanitized file details:', {
        originalName: file.name,
        sanitizedName: sanitizedFileName,
        path: filePath.join('/'),
        userId: user.id,
      });

      // Ensure bucket exists
      const supabase = await createClient();
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
      console.log('Storage buckets:', {
        availableBuckets: buckets?.map((b: any) => ({
          id: b.id,
          public: b.public,
        })),
        error: bucketError,
      });

      // Create bucket if it doesn't exist
      if (!buckets?.some((b: any) => b.id === 'chat_attachments')) {
        console.log('Creating bucket...');
        const { error: createError } = await supabase.storage.createBucket(
          'chat_attachments',
          {
            public: true,
            fileSizeLimit: 1024 * 1024 * 5, // 5MB
          }
        );
        if (createError) {
          console.error('Bucket creation error:', createError);
        }
      }

      const publicUrl = await upload(supabase, {
        file,
        path: filePath,
      });

      console.log('Upload successful:', { publicUrl });

      // Check if file already exists
      const { data: existingFile } = await supabase
        .from('file_uploads')
        .select('url')
        .match({
          user_id: user.id,
          chat_id: chatId,
          storage_path: filePath.join('/'),
        })
        .order('version', { ascending: false })
        .limit(1)
        .single();

      if (existingFile) {
        // Return the existing file URL
        return NextResponse.json({
          url: existingFile.url,
          path: filePath.join('/'),
        }, { headers: corsHeaders() });
      }

      // Insert new file record
      const { error: dbError } = await supabase.from('file_uploads').insert({
        user_id: user.id,
        chat_id: chatId,
        bucket_id: 'chat_attachments',
        storage_path: filePath.join('/'),
        filename: sanitizedFileName,
        original_name: file.name,
        content_type: file.type,
        size: file.size,
        url: publicUrl,
        version: 1, // Will be auto-incremented by trigger if needed
      });

      if (dbError) {
        console.error('Database insert error:', {
          code: dbError.code,
          message: dbError.message,
          details: dbError.details,
          hint: dbError.hint,
        });
        throw dbError;
      }

      console.log('File record created successfully');

      // Log RLS details if needed
      const { data: policies } = await supabase
        .from('postgres_policies')
        .select('*')
        .eq('table', 'storage.objects');
      console.log('Current storage policies:', policies);

      return NextResponse.json(
        {
          url: publicUrl,
          path: filePath.join('/'),
          name: file.name,
          size: file.size,
          chatId,
        },
        { headers: corsHeaders() }
      );
    } catch (uploadError: any) {
      console.error('Upload error details:', {
        error: uploadError,
        message: uploadError.message,
        status: uploadError.status,
        statusCode: uploadError.statusCode,
        name: uploadError.name,
        stack: uploadError.stack,
      });

      if (uploadError.message?.includes('row-level security')) {
        // Log RLS details
        console.error('RLS policy violation. Current user:', user);
      }

      return NextResponse.json(
        {
          error: 'File upload failed',
          details: uploadError.message,
        },
        { status: 500, headers: corsHeaders() }
      );
    }
  } catch (error: any) {
    console.error('Request handler error:', {
      error,
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500, headers: corsHeaders() }
    );
  }
}

// Ajouter le gestionnaire OPTIONS pour les requêtes préliminaires CORS
export { OPTIONS } from '@/app/api/cors-middleware';
