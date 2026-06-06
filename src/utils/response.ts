import { Response } from 'express';

export function sendError(res: Response, status: number, message: string, details?: unknown) {
  return res.status(status).json({
    error: {
      status,
      message,
      ...(details ? { details } : {}),
    },
  });
}

export function sendSuccess(res: Response, status: number, data: unknown) {
  return res.status(status).json(data);
}
