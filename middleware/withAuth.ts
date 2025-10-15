import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../pages/api/auth/[...nextauth]';
import { errorResponse } from '../lib/api-utils';

type Handler = (
  req: NextApiRequest,
  res: NextApiResponse,
  user: any
) => Promise<void> | void;

export function withAuth(handler: Handler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const session = await getServerSession(req, res, authOptions);

      if (!session?.user) {
        return errorResponse(res, 'Unauthorized', 401);
      }

      return handler(req, res, session.user);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return errorResponse(res, 'Authentication error', 500);
    }
  };
}

type AdminHandler = (
  req: NextApiRequest,
  res: NextApiResponse,
  user: any
) => Promise<void> | void;

export function withAdmin(handler: AdminHandler) {
  return withAuth(async (req, res, user) => {
    if (user.role !== 'ADMIN') {
      return errorResponse(res, 'Forbidden: Admin access required', 403);
    }
    return handler(req, res, user);
  });
}
