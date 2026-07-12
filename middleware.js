import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

export async function middleware(req) {
  const path = req.nextUrl.pathname;
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  const isAuthPage = path === '/login' || path === '/signup';
  const isAdminPath = path.startsWith('/admin');
  const isDashboardPath = path.startsWith('/dashboard');

  // Define public admin subroutes
  const isPublicAdminPath =
    path === '/admin/login' ||
    path === '/admin/signup' ||
    path === '/admin/forgot-password' ||
    path === '/admin/reset-password' ||
    path === '/admin/register-invited';

  // 1. If not authenticated
  if (!token) {
    // Protected admin paths → /admin/login (not the general user /login)
    if (isAdminPath && !isPublicAdminPath) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
    // Protected dashboard paths → regular user /login
    if (isDashboardPath) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    return NextResponse.next();
  }

  // 2. If authenticated
  const userRole = token.role || 'user';

  // Prevent authenticated users from accessing login or signup pages
  if (isAuthPage || path === '/admin/login' || path === '/admin/signup') {
    if (userRole === 'admin') {
      return NextResponse.redirect(new URL('/admin', req.url));
    } else {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  // Authorize /admin paths
  if (isAdminPath && !isPublicAdminPath) {
    if (userRole !== 'admin') {
      // Regular user trying to access admin panel -> redirect to dashboard
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  // Authorize /dashboard paths
  if (isDashboardPath) {
    if (userRole === 'admin') {
      // Admin trying to access regular dashboard -> redirect to admin panel
      return NextResponse.redirect(new URL('/admin', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
    '/login',
    '/signup',
  ],
};
