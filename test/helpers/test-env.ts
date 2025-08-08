import { z } from 'zod';
import dotenv from 'dotenv';
import { randomUUID } from 'crypto';
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

// Load test environment variables
dotenv.config({ path: '.env.test' });

const testEnvSchema = z.object({
  NODE_ENV: z.literal('test'),
  PORT: z.coerce.number().default(3002),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),
  BCRYPT_ROUNDS: z.coerce.number().default(4), // Lower for faster tests
  PLUGGY_CLIENT_ID: z.string().default('test-client'),
  PLUGGY_CLIENT_SECRET: z.string().default('test-secret'),
  PLUGGY_BASE_URL: z.string().url().default('https://api.pluggy.ai'),
});

export interface TestEnvironment {
  schema: string;
  databaseUrl: string;
  prisma: PrismaClient;
  cleanup: () => Promise<void>;
}

export class TestEnvironmentManager {
  private static instance: TestEnvironmentManager;
  private environments: Map<string, TestEnvironment> = new Map();

  static getInstance(): TestEnvironmentManager {
    if (!TestEnvironmentManager.instance) {
      TestEnvironmentManager.instance = new TestEnvironmentManager();
    }
    return TestEnvironmentManager.instance;
  }

  async createTestEnvironment(testSuiteName?: string): Promise<TestEnvironment> {
    const schema = `test_${randomUUID().replace(/-/g, '_')}`;
    const env = testEnvSchema.parse(process.env);
    
    // Parse original DATABASE_URL to modify schema
    const originalUrl = new URL(env.DATABASE_URL);
    const databaseUrl = `${originalUrl.protocol}//${originalUrl.username}${originalUrl.password ? ':' + originalUrl.password : ''}@${originalUrl.host}${originalUrl.pathname}?schema=${schema}`;
    
    // Create Prisma client with isolated schema
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
      log: [], // Disable logging in tests
    });

    try {
      // Create schema in database
      await prisma.$executeRawUnsafe(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);
      
      // Deploy migrations to the test schema
      process.env.DATABASE_URL = databaseUrl;
      execSync('npx prisma migrate deploy', { 
        stdio: 'pipe',
        env: { 
          ...process.env, 
          DATABASE_URL: databaseUrl 
        }
      });
      
      // Connect to verify everything works
      await prisma.$connect();
      
    } catch (error) {
      console.error('Failed to create test environment:', error);
      await this.cleanup(schema, prisma);
      throw error;
    }

    const testEnv: TestEnvironment = {
      schema,
      databaseUrl,
      prisma,
      cleanup: () => this.cleanup(schema, prisma),
    };

    if (testSuiteName) {
      this.environments.set(testSuiteName, testEnv);
    }

    return testEnv;
  }

  async getTestEnvironment(testSuiteName: string): Promise<TestEnvironment | undefined> {
    return this.environments.get(testSuiteName);
  }

  private async cleanup(schema: string, prisma: PrismaClient): Promise<void> {
    try {
      // Drop the test schema
      await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
      await prisma.$disconnect();
    } catch (error) {
      console.error(`Failed to cleanup schema ${schema}:`, error);
    }
  }

  async cleanupAll(): Promise<void> {
    const cleanupPromises = Array.from(this.environments.values()).map(env => 
      env.cleanup()
    );
    
    await Promise.allSettled(cleanupPromises);
    this.environments.clear();
  }
}

export function getTestEnv() {
  return testEnvSchema.parse(process.env);
}

export function createIsolatedSchema(): string {
  return `test_${randomUUID().replace(/-/g, '_')}`;
}