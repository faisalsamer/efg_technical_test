import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.SESSION_SECRET || 'fallback-secret-change-me')

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Candidate dashboard protection
  if (pathname.startsWith('/dashboard')) {
    const session = request.cookies.get('session')?.value
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    // We can't await in the proxy matcher context synchronously,
    // but we verify the JWT. If invalid, redirect.
    return verifyAndContinue(session, '/login', request)
  }

  // Admin dashboard protection
  if (pathname.startsWith('/admin/dashboard') || pathname.startsWith('/admin/candidates')) {
    const adminSession = request.cookies.get('admin_session')?.value
    if (!adminSession) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    return verifyAndContinue(adminSession, '/admin', request)
  }

  return NextResponse.next()
}

async function verifyAndContinue(
  token: string,
  redirectPath: string,
  request: NextRequest
) {
  try {
    await jwtVerify(token, secret)
    return NextResponse.next()
  } catch {
    const response = NextResponse.redirect(new URL(redirectPath, request.url))
    return response
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/dashboard/:path*', '/admin/candidates/:path*'],
}
