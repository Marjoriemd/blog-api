import { Response } from 'express';
import { FeedService } from '../services/feed.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import { sendSuccess } from '../utils/response';

const feedService = new FeedService();

export async function getFeed(_req: AuthRequest, res: Response): Promise<void> {
  const comments = await feedService.getComments();
  sendSuccess(res, 200, { comments });
}

export async function createComment(req: AuthRequest, res: Response): Promise<void> {
  const comment = await feedService.createComment(req.user!.userId, req.body);
  sendSuccess(res, 200, {
    message: 'Comment created successfully',
    comment,
  });
}
