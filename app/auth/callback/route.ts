import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    try {
      // Exchange the code for a session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error('Email confirmation error:', error)
        return NextResponse.redirect(
          new URL('/?error=confirmation-failed', requestUrl.origin)
        )
      }

      if (data.user) {
        console.log('✅ Email confirmed for user:', data.user.id, data.user.email)

        // Update user profile to set is_active = true
        const { error: updateError } = await supabase
          .from('users')
          .update({ is_active: true })
          .eq('id', data.user.id)

        if (updateError) {
          console.error('Error activating user profile:', updateError)
        } else {
          console.log('✅ User profile activated')
        }

        // Redirect to homepage with success message
        return NextResponse.redirect(
          new URL('/?message=email-confirmed', requestUrl.origin)
        )
      }
    } catch (err) {
      console.error('Callback error:', err)
      return NextResponse.redirect(
        new URL('/?error=confirmation-error', requestUrl.origin)
      )
    }
  }

  // Fallback redirect
  return NextResponse.redirect(new URL('/', requestUrl.origin))
}
