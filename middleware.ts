import { withAuth } from './middleware/withAuth';

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
  ]
};