import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { shortId: string } }
) {
  try {
    const { shortId } = params

    // Get the original URL from storage
    const { data, error } = await supabase
      .from('image_storage')
      .select('original_url, mime_type')
      .eq('short_id', shortId)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 })
    }

    // If it's a data URL, extract and return the image data
    if (data.original_url.startsWith('data:')) {
      const [header, base64Data] = data.original_url.split(',')
      const mimeType = header.match(/data:([^;]+)/)?.[1] || 'image/jpeg'
      
      const buffer = Buffer.from(base64Data, 'base64')
      
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': mimeType,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      })
    }

    // For regular URLs, redirect to the original URL
    return NextResponse.redirect(data.original_url)

  } catch (error) {
    console.error('Error serving image:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}