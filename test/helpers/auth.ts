import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { JwtProviderImpl, TokenPayload } from '@src/modules/shared/infrastructure/providers/jwt-provider';
import { getTestEnv } from './test-env';
import { FastifyInstance } from 'fastify';
import request from 'supertest';

export interface TestUser {
  id: string;
  name: string;
  email: string;
  password: string; // Plain text password for testing
  hashedPassword: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthenticatedTestUser extends TestUser {
  tokens: AuthTokens;
}

export class AuthTestHelper {
  private jwtProvider: JwtProviderImpl;
  private env = getTestEnv();

  constructor(private prisma: PrismaClient) {
    this.jwtProvider = new JwtProviderImpl();
  }

  /**
   * Create a test user in the database
   */
  async createTestUser(userData?: Partial<TestUser>): Promise<TestUser> {
    const plainPassword = userData?.password || 'password123';
    const hashedPassword = await bcrypt.hash(plainPassword, this.env.BCRYPT_ROUNDS);

    const defaultData = {
      name: 'Test User',
      email: `test-${Date.now()}@example.com`,
      password: plainPassword,
    };

    const finalUserData = { ...defaultData, ...userData };

    const user = await this.prisma.user.create({
      data: {
        name: finalUserData.name,
        email: finalUserData.email,
        password: hashedPassword,
      },
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      password: plainPassword,
      hashedPassword: hashedPassword,
    };
  }

  /**
   * Generate JWT tokens for a user
   */
  generateTokens(user: Pick<TestUser, 'id' | 'name' | 'email'>): AuthTokens {
    const payload: TokenPayload = {
      sub: user.id,
      name: user.name,
      email: user.email,
    };

    return {
      accessToken: this.jwtProvider.generateAccessToken(payload),
      refreshToken: this.jwtProvider.generateRefreshToken(payload),
    };
  }

  /**
   * Create a user and generate tokens for them
   */
  async createAuthenticatedUser(userData?: Partial<TestUser>): Promise<AuthenticatedTestUser> {
    const user = await this.createTestUser(userData);
    const tokens = this.generateTokens(user);

    // Store refresh token in database
    await this.prisma.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    return {
      ...user,
      tokens,
    };
  }

  /**
   * Login user using the authentication endpoint
   */
  async loginUser(app: FastifyInstance, email: string, password: string): Promise<AuthTokens> {
    const response = await request(app.server)
      .post('/auth/login')
      .send({ email, password })
      .expect(200);

    return {
      accessToken: response.body.data.accessToken,
      refreshToken: response.body.data.refreshToken,
    };
  }

  /**
   * Register a new user using the registration endpoint
   */
  async registerUser(
    app: FastifyInstance,
    userData: { name: string; email: string; password: string }
  ): Promise<{ user: any; tokens: AuthTokens }> {
    const response = await request(app.server)
      .post('/auth/register')
      .send(userData)
      .expect(201);

    return {
      user: response.body.data.user,
      tokens: {
        accessToken: response.body.data.accessToken,
        refreshToken: response.body.data.refreshToken,
      },
    };
  }

  /**
   * Create multiple test users
   */
  async createMultipleUsers(count: number): Promise<TestUser[]> {
    const users: TestUser[] = [];
    
    for (let i = 0; i < count; i++) {
      const user = await this.createTestUser({
        name: `Test User ${i + 1}`,
        email: `test${i + 1}-${Date.now()}@example.com`,
        password: `password${i + 1}`,
      });
      users.push(user);
    }

    return users;
  }

  /**
   * Create multiple authenticated users
   */
  async createMultipleAuthenticatedUsers(count: number): Promise<AuthenticatedTestUser[]> {
    const users: AuthenticatedTestUser[] = [];
    
    for (let i = 0; i < count; i++) {
      const user = await this.createAuthenticatedUser({
        name: `Test User ${i + 1}`,
        email: `test${i + 1}-${Date.now()}@example.com`,
        password: `password${i + 1}`,
      });
      users.push(user);
    }

    return users;
  }

  /**
   * Get authorization header for Bearer token
   */
  getAuthHeader(token: string): Record<string, string> {
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  /**
   * Verify a token and return the payload
   */
  verifyToken(token: string): TokenPayload {
    return this.jwtProvider.verifyAccessToken(token);
  }

  /**
   * Create an expired token for testing
   */
  generateExpiredToken(user: Pick<TestUser, 'id' | 'name' | 'email'>): string {
    // Create token with past expiration
    const payload = {
      sub: user.id,
      name: user.name,
      email: user.email,
      exp: Math.floor(Date.now() / 1000) - 3600, // Expired 1 hour ago
    };

    return this.jwtProvider.generateAccessToken(payload as TokenPayload);
  }

  /**
   * Create an invalid token for testing
   */
  generateInvalidToken(): string {
    return 'invalid.token.here';
  }

  /**
   * Clear all refresh tokens for a user
   */
  async clearUserTokens(userId: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }

  /**
   * Clear all refresh tokens
   */
  async clearAllTokens(): Promise<void> {
    await this.prisma.refreshToken.deleteMany();
  }
}

/**
 * Helper function to create auth header with Bearer token
 */
export function createAuthHeader(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
  };
}

/**
 * Helper function to make authenticated request with supertest
 */
export function authenticatedRequest(app: FastifyInstance, token: string) {
  return request(app.server).set('Authorization', `Bearer ${token}`);
}

/**
 * Create auth helper instance
 */
export function createAuthHelper(prisma: PrismaClient): AuthTestHelper {
  return new AuthTestHelper(prisma);
}