import { z } from 'zod';

export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, 'Comment content is required')
    .max(1000, 'Comment must be at most 1000 characters'),
  parentId: z.number().int().positive().optional(),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
