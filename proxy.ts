import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  // Add global headers if needed
  const response = NextResponse.next()
  
  response.headers.set('x-custom-platform', 'smart-picks-india')
  
  return response
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
