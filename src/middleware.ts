import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Daftar route yang tidak memerlukan autentikasi
const publicRoutes = ['/login', '/register']

export function middleware(request: NextRequest) {
  // Dalam implementasi nyata, Anda akan memeriksa token di cookies
  // Contoh: const token = request.cookies.get('token')?.value
  // Untuk saat ini, kita akan menggunakan mock token
  
  // Asumsikan user belum login (tidak ada token)
  const token = request.cookies.get('auth_token')?.value
  const isAuthPage = publicRoutes.includes(request.nextUrl.pathname)

  if (!token && !isAuthPage) {
    // Jika tidak ada token dan mencoba akses halaman private (seperti / atau /dashboard)
    // Redirect ke halaman login
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (token && isAuthPage) {
    // Jika sudah ada token (sudah login) tapi mencoba akses /login atau /register
    // Redirect ke dashboard (/)
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

// Konfigurasi path mana saja yang akan dilewati middleware ini
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
