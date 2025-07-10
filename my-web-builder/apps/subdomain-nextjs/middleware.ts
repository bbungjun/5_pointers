import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  console.log('=== Middleware Debug ===');
  console.log('Original URL:', request.url);
  console.log('Hostname:', hostname);
  console.log('Pathname:', request.nextUrl.pathname);
  
  // 포트 제거 후 서브도메인 추출
  const hostnameWithoutPort = hostname.split(':')[0];
  const parts = hostnameWithoutPort.split('.');
  
  console.log('Hostname without port:', hostnameWithoutPort);
  console.log('Parts:', parts);
  
  // 서브도메인이 있는 경우 (localhost 또는 pagecube.net)
  if (parts.length >= 3 && parts[1] === 'pagecube' && parts[2] === 'net') {
    // *.pagecube.net 형태
    const subdomain = parts[0];
    console.log('Detected pagecube subdomain:', subdomain);
    
    // 루트 경로로 접근한 경우에만 rewrite
    if (request.nextUrl.pathname === '/') {
      const rewriteUrl = new URL(`/${subdomain}`, request.url);
      console.log('Rewriting to:', rewriteUrl.toString());
      return NextResponse.rewrite(rewriteUrl);
    }
  } else if (parts.length >= 2 && parts[1] === 'localhost') {
    // *.localhost 형태 (로컬 개발용)
    const subdomain = parts[0];
    console.log('Detected localhost subdomain:', subdomain);
    
    // 루트 경로로 접근한 경우에만 rewrite
    if (request.nextUrl.pathname === '/') {
      const rewriteUrl = new URL(`/${subdomain}`, request.url);
      console.log('Rewriting to:', rewriteUrl.toString());
      return NextResponse.rewrite(rewriteUrl);
    }
  }
  
  console.log('No rewrite needed, proceeding normally');
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
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}