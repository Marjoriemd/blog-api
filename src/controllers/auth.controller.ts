import { Request, Response } from 'express';
import { AuthService, ConflictError, InvalidPasswordError } from '../services/auth.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import { sendError, sendSuccess } from '../utils/response';

const authService = new AuthService();

export async function login(req: Request, res: Response): Promise<void> {
  const result = await authService.login(req.body);

  if (!result) {
    sendError(res, 401, 'Invalid username or password');
    return;
  }

  sendSuccess(res, 200, result);
}

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const result = await authService.register(req.body);
    sendSuccess(res, 201, result);
  } catch (err) {
    if (err instanceof ConflictError) {
      sendError(res, 400, err.message);
      return;
    }
    throw err;
  }
}

export async function getMe(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const profile = await authService.getProfile(userId);

  if (!profile) {
    sendError(res, 404, 'User not found');
    return;
  }

  sendSuccess(res, 200, { user: profile });
}

export async function changePassword(req: AuthRequest, res: Response): Promise<void> {
  try {
    await authService.changePassword(req.user!.userId, req.body);
    sendSuccess(res, 200, { message: 'Password updated successfully' });
  } catch (err) {
    if (err instanceof InvalidPasswordError) {
      sendError(res, 401, err.message);
      return;
    }
    throw err;
  }
}
