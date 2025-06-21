import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Define public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/auth/login',
    '/auth/register', 
    '/auth/forgot-password',
    '/contact',
    '/sponsors',
    '/about',
    '/privacy',
    '/terms'
  ];
  
  // Define protected routes that require authentication
  const protectedRoutes = [
    '/dashboard',
    '/patients',
    '/vitals',
    '/alerts',
    '/analytics',
    '/settings',
    '/appointments',
    '/referrals'
  ];
  
  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.includes(pathname);
  
  // If it's a protected route, check for authentication
  if (isProtectedRoute) {
    // In client-side routing, we'll handle auth checks in the layout
    // For now, just continue to the route and let the client handle the redirect
    return NextResponse.next();
  }
  
  // Allow access to public routes and static assets
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}; 