import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createFactories } from '../factories';

describe('Authentication Routes - Simple Tests', () => {
  let factories: ReturnType<typeof createFactories>;

  beforeEach(() => {
    factories = createFactories(global.testEnv.prisma);
    factories.resetAllCounters();
  });

  describe('POST /auth/register', () => {
    it('should register a new user with valid data', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'password123',
      };

      const response = await request(global.testApp.server)
        .post('/auth/register')
        .send(userData)
        .expect(201);

      // Basic response structure check
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.name).toBe(userData.name);
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();

      // Verify user was created in database
      const createdUser = await global.testEnv.prisma.user.findUnique({
        where: { email: userData.email },
      });
      
      expect(createdUser).toBeTruthy();
      expect(createdUser!.name).toBe(userData.name);
      expect(createdUser!.email).toBe(userData.email);
    });

    it('should return 400 when email already exists', async () => {
      // Create user first
      const existingUser = await factories.user.create({
        email: 'existing@example.com',
      });

      const userData = {
        name: 'Another User',
        email: existingUser.email,
        password: 'password123',
      };

      const response = await request(global.testApp.server)
        .post('/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /auth/login', () => {
    it('should login user with valid credentials', async () => {
      // Create test user
      const testUser = await factories.user.create({
        email: 'login@example.com',
        password: 'password123',
      });

      const loginData = {
        email: testUser.email,
        password: testUser.password, // Plain text password from factory
      };

      const response = await request(global.testApp.server)
        .post('/auth/login')
        .send(loginData)
        .expect(200);

      // Verify response structure
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.id).toBe(testUser.id);
      expect(response.body.data.user.name).toBe(testUser.name);
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
    });

    it('should return 401 with invalid email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      const response = await request(global.testApp.server)
        .post('/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 with wrong password', async () => {
      // Create test user
      const testUser = await factories.user.create({
        email: 'user@example.com',
        password: 'correctpassword',
      });

      const loginData = {
        email: testUser.email,
        password: 'wrongpassword',
      };

      const response = await request(global.testApp.server)
        .post('/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Database Integration', () => {
    it('should clean database between tests', async () => {
      // Check database is clean
      const userCount = await global.testEnv.prisma.user.count();
      expect(userCount).toBe(0);

      // Create a user
      const user = await factories.user.create();
      expect(user).toBeDefined();
      expect(user.id).toBeDefined();

      // Verify user exists in database
      const dbUser = await global.testEnv.prisma.user.findUnique({
        where: { id: user.id },
      });
      expect(dbUser).toBeTruthy();
    });

    it('should handle database operations correctly', async () => {
      // Test various database operations
      const user1 = await factories.user.create({ name: 'User 1' });
      const user2 = await factories.user.create({ name: 'User 2' });

      const totalUsers = await global.testEnv.prisma.user.count();
      expect(totalUsers).toBe(2);

      const foundUser = await global.testEnv.prisma.user.findFirst({
        where: { name: 'User 1' },
      });
      expect(foundUser?.id).toBe(user1.id);
    });
  });
});