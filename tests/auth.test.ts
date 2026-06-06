import request from 'supertest';
import app from '../src/app';
import prisma from '../src/config/database';
import { hashPassword } from '../src/utils/password';

const TEST_USER = {
  name: 'Test User',
  email: 'test@example.com',
  username: 'testuser',
  password: 'Password123!',
  avatar: 'https://example.com/avatar.png',
};

let authToken: string;

beforeAll(async () => {
  await prisma.comment.deleteMany();
  await prisma.user.deleteMany();

  const hashed = await hashPassword(TEST_USER.password);
  await prisma.user.create({
    data: {
      name: TEST_USER.name,
      email: TEST_USER.email,
      username: TEST_USER.username,
      password: hashed,
      avatar: TEST_USER.avatar,
    },
  });
});

afterAll(async () => {
  await prisma.comment.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

describe('POST /login', () => {
  it('returns 200 and token with valid credentials', async () => {
    const res = await request(app)
      .post('/login')
      .send({ username: TEST_USER.username, password: TEST_USER.password });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token_type', 'Bearer');
    expect(res.body).toHaveProperty('access_token');
    expect(res.body).toHaveProperty('expiration');

    authToken = res.body.access_token;
  });

  it('returns 401 with wrong password', async () => {
    const res = await request(app)
      .post('/login')
      .send({ username: TEST_USER.username, password: 'WrongPass999!' });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 401 with non-existent username', async () => {
    const res = await request(app)
      .post('/login')
      .send({ username: 'nobody', password: 'Password123!' });

    expect(res.status).toBe(401);
  });

  it('returns 400 when password is missing', async () => {
    const res = await request(app)
      .post('/login')
      .send({ username: TEST_USER.username });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 400 when username is missing', async () => {
    const res = await request(app)
      .post('/login')
      .send({ password: TEST_USER.password });

    expect(res.status).toBe(400);
  });

  it('returns 400 when body is empty', async () => {
    const res = await request(app).post('/login').send({});
    expect(res.status).toBe(400);
  });
});

describe('POST /register', () => {
  const newUser = {
    name: 'New User',
    email: 'newuser@example.com',
    username: 'newuser',
    password: 'Secure123!',
    avatar: 'https://example.com/new.png',
  };

  it('returns 201 with all valid data', async () => {
    const res = await request(app).post('/register').send(newUser);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('redirect');
  });

  it('returns 400 when email is already registered', async () => {
    const res = await request(app)
      .post('/register')
      .send({ ...newUser, username: 'different' });

    expect(res.status).toBe(400);
  });

  it('returns 400 when username is already taken', async () => {
    const res = await request(app)
      .post('/register')
      .send({ ...newUser, email: 'another@example.com' });

    expect(res.status).toBe(400);
  });

  it('returns 400 with invalid email format', async () => {
    const res = await request(app)
      .post('/register')
      .send({ ...newUser, email: 'not-an-email', username: 'unique1' });

    expect(res.status).toBe(400);
  });

  it('returns 400 when name contains numbers', async () => {
    const res = await request(app)
      .post('/register')
      .send({ ...newUser, name: 'User123', username: 'unique2', email: 'u2@e.com' });

    expect(res.status).toBe(400);
  });

  it('returns 400 when password is too weak', async () => {
    const res = await request(app)
      .post('/register')
      .send({ ...newUser, password: 'weak', username: 'unique3', email: 'u3@e.com' });

    expect(res.status).toBe(400);
  });

  it('returns 400 when required fields are missing', async () => {
    const res = await request(app)
      .post('/register')
      .send({ name: 'Test' });

    expect(res.status).toBe(400);
  });
});

describe('GET /me', () => {
  it('returns 200 with user data when token is valid', async () => {
    const res = await request(app)
      .get('/me')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toHaveProperty('username', TEST_USER.username);
    expect(res.body.user).not.toHaveProperty('password');
  });

  it('returns 400 when authorization header is missing', async () => {
    const res = await request(app).get('/me');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 401 with an invalid token', async () => {
    const res = await request(app)
      .get('/me')
      .set('Authorization', 'Bearer invalidtoken123');

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 401 with a malformed authorization header', async () => {
    const res = await request(app)
      .get('/me')
      .set('Authorization', 'NotBearer token');

    expect(res.status).toBe(401);
  });
});

describe('PUT /change-password', () => {
  const changePayload = {
    current_password: TEST_USER.password,
    new_password: 'NewPassword456!',
  };

  it('returns 200 when password is changed successfully', async () => {
    const res = await request(app)
      .put('/change-password')
      .set('Authorization', `Bearer ${authToken}`)
      .send(changePayload);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
  });

  it('returns 401 when current password is wrong', async () => {
    const res = await request(app)
      .put('/change-password')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ current_password: 'Wrong123!', new_password: 'Another456!' });

    expect(res.status).toBe(401);
  });

  it('returns 403 when authorization header is missing', async () => {
    const res = await request(app)
      .put('/change-password')
      .send(changePayload);

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 401 with invalid token', async () => {
    const res = await request(app)
      .put('/change-password')
      .set('Authorization', 'Bearer badtoken')
      .send(changePayload);

    expect(res.status).toBe(401);
  });

  it('returns 400 when new password is too weak', async () => {
    const res = await request(app)
      .put('/change-password')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ current_password: 'NewPassword456!', new_password: 'weak' });

    expect(res.status).toBe(400);
  });
});
