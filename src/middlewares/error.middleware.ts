import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error(err.stack);

  res.status(500).json({
    error: {
      status: 500,
      message: 'Internal server error',
    },
  });
}

export function notFound(_req: Request, res: Response): void {
  res.status(404).json({
    error: {
      status: 404,
      message: 'Route not found',
    },
  });
}
