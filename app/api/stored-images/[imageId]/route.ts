import { NextRequest, NextResponse } from 'next/server'
import { getStoredImageData } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { imageId: string } }
) {
  try {
    const { imageId } = params

    // Get the stored image data
    const imageData = await getStoredImageData(imageId)

    if (!imageData) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 })
    }

    // Convert base64 back to binary data
    const buffer = Buffer.from(imageData.image_data, 'base64')
    
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': imageData.mime_type,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Disposition': `inline; filename="${imageData.filename}"`,
      },
    })

  } catch (error) {
    console.error('Error serving stored image:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}