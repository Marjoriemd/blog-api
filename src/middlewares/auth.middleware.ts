import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/jwt';
import { sendError } from '../utils/response';

export interface AuthRequest extends Request {
  user?: TokenPayload;
}

function extractBearerToken(authHeader: string | undefined): string | null {
  if (!authHeader) return null;
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') return null;
  return parts[1];
}

export function requireAuth(status403OnMissing = false) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      const statusCode = status403OnMissing ? 403 : 400;
      const message = status403OnMissing
        ? 'Access forbidden: authorization header required'
        : 'Authorization header is missing';
      sendError(res, statusCode, message);
      return;
    }

    const token = extractBearerToken(authHeader);

    if (!token) {
      sendError(res, 401, 'Invalid authorization format. Expected: Bearer <token>');
      return;
    }

    try {
      const payload = verifyToken(token);
      req.user = payload;
      next();
    } catch {
      sendError(res, 401, 'Invalid or expired token');
    }
  };
}
