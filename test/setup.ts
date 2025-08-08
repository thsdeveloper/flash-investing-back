import { beforeAll, afterAll, beforeEach } from 'vitest';
import { FastifyInstance } from 'fastify';
import { TestEnvironmentManager, TestEnvironment } from './helpers/test-env';
import { DatabaseTestHelper } from './helpers/database';
import { createTestApp } from './helpers/test-app';

declare global {
  var testApp: FastifyInstance;
  var testEnv: TestEnvironment;
  var dbHelper: DatabaseTestHelper;
}

let envManager: TestEnvironmentManager;

beforeAll(async () => {
  try {
    // Initialize test environment manager
    envManager = TestEnvironmentManager.getInstance();
    
    // Create isolated test environment
    global.testEnv = await envManager.createTestEnvironment('global-test-suite');
    
    // Create database helper
    global.dbHelper = new DatabaseTestHelper(global.testEnv.prisma);
    
    // Create and initialize test app
    global.testApp = await createTestApp();
    
    console.log('Test environment initialized successfully');
  } catch (error) {
    console.error('Failed to initialize test environment:', error);
    throw error;
  }
});

afterAll(async () => {
  try {
    // Close test app
    if (global.testApp) {
      await global.testApp.close();
    }

    // Cleanup test environment
    if (envManager) {
      await envManager.cleanupAll();
    }

    console.log('Test environment cleaned up successfully');
  } catch (error) {
    console.error('Failed to cleanup test environment:', error);
  }
});

beforeEach(async () => {
  // Clean database before each test to ensure isolation
  if (global.dbHelper) {
    await global.dbHelper.cleanAllData();
  }
});