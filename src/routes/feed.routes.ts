import { Router } from 'express';
import { getFeed, createComment } from '../controllers/feed.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createCommentSchema } from '../schemas/feed.schema';

const router = Router();

router.get('/feed', requireAuth(true), getFeed);
router.post('/feed', requireAuth(true), validate(createCommentSchema), createComment);

export default router;
