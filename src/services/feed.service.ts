import prisma from '../config/database';
import { CreateCommentInput } from '../schemas/feed.schema';

export class FeedService {
  async getComments() {
    const comments = await prisma.comment.findMany({
      where: { parentId: null },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, username: true, avatar: true },
        },
        replies: {
          orderBy: { createdAt: 'asc' },
          include: {
            user: { select: { id: true, name: true, username: true, avatar: true } },
          },
        },
      },
    });

    return comments;
  }

  async createComment(userId: number, data: CreateCommentInput) {
    const comment = await prisma.comment.create({
      data: {
        content: data.content,
        userId,
        parentId: data.parentId,
      },
      include: {
        user: {
          select: { id: true, name: true, username: true, avatar: true },
        },
        replies: {
          orderBy: { createdAt: 'asc' },
          include: {
            user: { select: { id: true, name: true, username: true, avatar: true } },
          },
        },
      },
    });

    return comment;
  }
}
