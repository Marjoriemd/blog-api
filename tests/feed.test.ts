import request from 'supertest';
import app from '../src/app';
import prisma from '../src/config/database';
import { hashPassword } from '../src/utils/password';
import { signToken } from '../src/utils/jwt';

let authToken: string;
let userId: number;

beforeAll(async () => {
  await prisma.comment.deleteMany();
  await prisma.user.deleteMany();

  const hashed = await hashPassword('Password123!');
  const user = await prisma.user.create({
    data: {
      name: 'Feed Test User',
      email: 'feedtest@example.com',
      username: 'feedtestuser',
      password: hashed,
      avatar: 'https://example.com/avatar.png',
    },
  });

  userId = user.id;
  authToken = signToken({ userId: user.id, username: user.username });

  await prisma.comment.createMany({
    data: [
      { content: 'First comment', userId: user.id },
      { content: 'Second comment', userId: user.id },
    ],
  });
});

afterAll(async () => {
  await prisma.comment.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

describe('GET /feed', () => {
  it('returns 200 with comments list when token is valid', async () => {
    const res = await request(app)
      .get('/feed')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('comments');
    expect(Array.isArray(res.body.comments)).toBe(true);
    expect(res.body.comments.length).toBeGreaterThan(0);
  });

  it('returns 403 when authorization header is missing', async () => {
    const res = await request(app).get('/feed');
    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 401 with invalid token', async () => {
    const res = await request(app)
      .get('/feed')
      .set('Authorization', 'Bearer invalidtoken');

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });
});

describe('POST /feed', () => {
  it('returns 200 when comment is created successfully', async () => {
    const res = await request(app)
      .post('/feed')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ content: 'A new test comment' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('comment');
    expect(res.body.comment).toHaveProperty('content', 'A new test comment');
    expect(res.body.comment).toHaveProperty('user');
  });

  it('returns 400 when content is empty', async () => {
    const res = await request(app)
      .post('/feed')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ content: '' });

    expect(res.status).toBe(400);
  });

  it('returns 400 when content is missing', async () => {
    const res = await request(app)
      .post('/feed')
      .set('Authorization', `Bearer ${authToken}`)
      .send({});

    expect(res.status).toBe(400);
  });

  it('returns 403 when authorization header is missing', async () => {
    const res = await request(app)
      .post('/feed')
      .send({ content: 'Test' });

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 401 with invalid token', async () => {
    const res = await request(app)
      .post('/feed')
      .set('Authorization', 'Bearer badtoken')
      .send({ content: 'Test' });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });
});
