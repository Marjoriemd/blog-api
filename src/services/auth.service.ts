import prisma from '../config/database';
import { hashPassword, comparePassword } from '../utils/password';
import { signToken, getTokenExpiration } from '../utils/jwt';
import { LoginInput, RegisterInput, ChangePasswordInput } from '../schemas/auth.schema';

export class AuthService {
  async login(data: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { username: data.username },
    });

    if (!user) {
      return null;
    }

    const isValid = await comparePassword(data.password, user.password);
    if (!isValid) {
      return null;
    }

    const token = signToken({ userId: user.id, username: user.username });

    return {
      token_type: 'Bearer',
      expiration: getTokenExpiration(),
      access_token: token,
    };
  }

  async register(data: RegisterInput) {
    const existingByEmail = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingByEmail) {
      throw new ConflictError('Email is already registered');
    }

    const existingByUsername = await prisma.user.findUnique({ where: { username: data.username } });
    if (existingByUsername) {
      throw new ConflictError('Username is already taken');
    }

    const hashedPassword = await hashPassword(data.password);

    await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        username: data.username,
        password: hashedPassword,
        avatar: data.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.username}`,
      },
    });

    return {
      message: 'Account created successfully. Please log in.',
      redirect: '/login',
    };
  }

  async getProfile(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        avatar: true,
        createdAt: true,
      },
    });

    return user;
  }

  async changePassword(userId: number, data: ChangePasswordInput) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return false;

    const isCurrentValid = await comparePassword(data.current_password, user.password);
    if (!isCurrentValid) {
      throw new InvalidPasswordError('Current password is incorrect');
    }

    const newHashed = await hashPassword(data.new_password);

    await prisma.user.update({
      where: { id: userId },
      data: { password: newHashed },
    });

    return true;
  }
}

export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
  }
}

export class InvalidPasswordError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidPasswordError';
  }
}
