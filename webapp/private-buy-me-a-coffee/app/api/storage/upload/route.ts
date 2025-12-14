import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// Simple file storage - in production, use IPFS, web3.storage, or similar
export async function POST(request: NextRequest) {
  try {
    const { file, filename } = await request.json();

    if (!file || !filename) {
      return NextResponse.json(
        { error: 'File and filename are required' },
        { status: 400 }
      );
    }

    // Decode base64 file data
    const fileData = Buffer.from(file, 'base64');

    // Create storage directory if it doesn't exist
    const storageDir = join(process.cwd(), 'public', 'storage');
    if (!existsSync(storageDir)) {
      await mkdir(storageDir, { recursive: true });
    }

    // Save file
    const filePath = join(storageDir, filename);
    await writeFile(filePath, fileData);

    // Return public URL
    const url = `/storage/${filename}`;

    return NextResponse.json({ url });
  } catch (error: any) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload file' },
      { status: 500 }
    );
  }
}
