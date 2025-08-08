import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createFactories } from '../factories';
import { createAuthHelper } from '../helpers/auth';

describe('Financial Accounts Security Integration Tests', () => {
  let factories: ReturnType<typeof createFactories>;
  let authHelper: ReturnType<typeof createAuthHelper>;
  let testUser: any;
  let otherUser: any;
  let authToken: string;
  let otherAuthToken: string;

  beforeEach(async () => {
    factories = createFactories(global.testEnv.prisma);
    authHelper = createAuthHelper(global.testEnv.prisma);
    
    factories.resetAllCounters();

    // Create test users
    testUser = await factories.user.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });

    otherUser = await factories.user.create({
      name: 'Other User', 
      email: 'other@example.com',
      password: 'password123',
    });

    // Generate tokens
    authToken = authHelper.generateToken({
      id: testUser.id,
      email: testUser.email,
      name: testUser.name,
    });

    otherAuthToken = authHelper.generateToken({
      id: otherUser.id,
      email: otherUser.email,
      name: otherUser.name,
    });
  });

  describe('🔐 Authentication and Authorization', () => {
    describe('Token-based Authentication', () => {
      it('should reject requests without Authorization header', async () => {
        const response = await request(global.testApp.server)
          .get('/financial_accounts')
          .expect(401);

        expect(response.body.success).toBe(false);
      });

      it('should reject requests with malformed Authorization header', async () => {
        const malformedHeaders = [
          'Bearer', // Missing token
          'InvalidScheme token123', // Wrong scheme
          'Bearer ', // Empty token
          'token123', // Missing Bearer
        ];

        for (const header of malformedHeaders) {
          const response = await request(global.testApp.server)
            .get('/financial_accounts')
            .set('Authorization', header)
            .expect(401);

          expect(response.body.success).toBe(false);
        }
      });

      it('should reject requests with invalid JWT token', async () => {
        const invalidTokens = [
          'invalid.jwt.token',
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature',
          'expired.token.here',
        ];

        for (const token of invalidTokens) {
          const response = await request(global.testApp.server)
            .get('/financial_accounts')
            .set('Authorization', `Bearer ${token}`)
            .expect(401);

          expect(response.body.success).toBe(false);
        }
      });

      it('should reject requests with expired JWT token', async () => {
        // Create token that expires immediately
        const expiredToken = authHelper.generateToken({
          id: testUser.id,
          email: testUser.email,
          name: testUser.name,
        }, '0s');

        // Wait to ensure token is expired
        await new Promise(resolve => setTimeout(resolve, 100));

        const response = await request(global.testApp.server)
          .get('/financial_accounts')
          .set('Authorization', `Bearer ${expiredToken}`)
          .expect(401);

        expect(response.body.success).toBe(false);
      });

      it('should accept requests with valid JWT token', async () => {
        const response = await request(global.testApp.server)
          .get('/financial_accounts')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
      });
    });

    describe('User Isolation and Data Access Control', () => {
      let testUserAccount: any;
      let otherUserAccount: any;

      beforeEach(async () => {
        testUserAccount = await factories.financialAccount.create({
          userId: testUser.id,
          nome: 'Test User Account',
        });

        otherUserAccount = await factories.financialAccount.create({
          userId: otherUser.id,
          nome: 'Other User Account',
        });
      });

      it('should only return accounts belonging to authenticated user', async () => {
        // Test user should only see their account
        const testUserResponse = await request(global.testApp.server)
          .get('/financial_accounts')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(testUserResponse.body.data).toHaveLength(1);
        expect(testUserResponse.body.data[0].id).toBe(testUserAccount.id);
        expect(testUserResponse.body.data[0].user).toBe(testUser.id);

        // Other user should only see their account
        const otherUserResponse = await request(global.testApp.server)
          .get('/financial_accounts')
          .set('Authorization', `Bearer ${otherAuthToken}`)
          .expect(200);

        expect(otherUserResponse.body.data).toHaveLength(1);
        expect(otherUserResponse.body.data[0].id).toBe(otherUserAccount.id);
        expect(otherUserResponse.body.data[0].user).toBe(otherUser.id);
      });

      it('should prevent accessing other user accounts by ID', async () => {
        // Test user tries to access other user's account
        const response = await request(global.testApp.server)
          .get(`/financial_accounts/${otherUserAccount.id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(400); // API returns 400 for unauthorized access

        expect(response.body.success).toBe(false);
        expect(response.body.errors).toContain('UNAUTHORIZED');
      });

      it('should prevent updating other user accounts', async () => {
        const updateData = {
          nome: 'Hacked Account Name',
        };

        const response = await request(global.testApp.server)
          .patch(`/financial_accounts/${otherUserAccount.id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.errors).toContain('UNAUTHORIZED');

        // Verify the account wasn't modified
        const accountInDb = await global.testEnv.prisma.financialAccount.findUnique({
          where: { id: otherUserAccount.id },
        });

        expect(accountInDb!.nome).toBe('Other User Account'); // Original name
      });

      it('should prevent deleting other user accounts', async () => {
        const response = await request(global.testApp.server)
          .delete(`/financial_accounts/${otherUserAccount.id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.errors).toContain('UNAUTHORIZED');

        // Verify the account still exists and is active
        const accountInDb = await global.testEnv.prisma.financialAccount.findUnique({
          where: { id: otherUserAccount.id },
        });

        expect(accountInDb).toBeTruthy();
        expect(accountInDb!.ativa).toBe(true);
      });
    });

    describe('JWT Token Security', () => {
      it('should reject token with invalid signature', async () => {
        // Create token with valid payload but wrong signature
        const validPayload = authHelper.generateToken({
          id: testUser.id,
          email: testUser.email,
          name: testUser.name,
        });

        // Tamper with signature
        const parts = validPayload.split('.');
        const tamperedToken = parts[0] + '.' + parts[1] + '.' + 'tampered_signature';

        const response = await request(global.testApp.server)
          .get('/financial_accounts')
          .set('Authorization', `Bearer ${tamperedToken}`)
          .expect(401);

        expect(response.body.success).toBe(false);
      });

      it('should reject token with tampered payload', async () => {
        // Create a token for different user but keep original signature
        const validToken = authHelper.generateToken({
          id: testUser.id,
          email: testUser.email,
          name: testUser.name,
        });

        // Tamper with payload (try to change user ID)
        const parts = validToken.split('.');
        const decodedPayload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
        decodedPayload.sub = otherUser.id; // Change user ID
        
        const tamperedPayload = Buffer.from(JSON.stringify(decodedPayload)).toString('base64url');
        const tamperedToken = parts[0] + '.' + tamperedPayload + '.' + parts[2];

        const response = await request(global.testApp.server)
          .get('/financial_accounts')
          .set('Authorization', `Bearer ${tamperedToken}`)
          .expect(401);

        expect(response.body.success).toBe(false);
      });

      it('should handle concurrent requests with same token safely', async () => {
        const requestPromises = Array.from({ length: 10 }, () =>
          request(global.testApp.server)
            .get('/financial_accounts')
            .set('Authorization', `Bearer ${authToken}`)
        );

        const responses = await Promise.all(requestPromises);

        // All requests should succeed
        responses.forEach(response => {
          expect(response.status).toBe(200);
          expect(response.body.success).toBe(true);
        });
      });
    });
  });

  describe('🛡️ Input Validation and Sanitization', () => {
    describe('SQL Injection Prevention', () => {
      it('should prevent SQL injection in account name', async () => {
        const maliciousNames = [
          "'; DROP TABLE financial_accounts; --",
          "' OR '1'='1",
          "'; UPDATE users SET password = 'hacked'; --",
          "admin'/*",
          "'; INSERT INTO users (name, email) VALUES ('hacker', 'hack@evil.com'); --",
        ];

        for (const maliciousName of maliciousNames) {
          const accountData = {
            nome: maliciousName,
            tipo: 'conta_corrente',
            saldo_inicial: 1000,
          };

          const response = await request(global.testApp.server)
            .post('/financial_accounts')
            .set('Authorization', `Bearer ${authToken}`)
            .send(accountData);

          if (response.status === 201) {
            // If the account was created, verify the name is stored as-is (not executed as SQL)
            expect(response.body.data.nome).toBe(maliciousName);
            
            // Verify database integrity - should still have the same structure
            const userCount = await global.testEnv.prisma.user.count();
            expect(userCount).toBeGreaterThanOrEqual(2); // Our test users should still exist
          } else {
            // If validation prevented creation, that's also acceptable
            expect(response.status).toBe(400);
          }
        }
      });

      it('should prevent SQL injection in institution field', async () => {
        const maliciousInstitutions = [
          "'; DROP TABLE users; --",
          "' UNION SELECT * FROM users; --",
          "'; DELETE FROM financial_accounts; --",
        ];

        for (const maliciousInstitution of maliciousInstitutions) {
          const accountData = {
            nome: 'Test Account',
            tipo: 'conta_corrente',
            saldo_inicial: 1000,
            instituicao: maliciousInstitution,
          };

          const response = await request(global.testApp.server)
            .post('/financial_accounts')
            .set('Authorization', `Bearer ${authToken}`)
            .send(accountData);

          if (response.status === 201) {
            expect(response.body.data.instituicao).toBe(maliciousInstitution);
          }

          // Verify users table is intact
          const userExists = await global.testEnv.prisma.user.findUnique({
            where: { id: testUser.id },
          });
          expect(userExists).toBeTruthy();
        }
      });
    });

    describe('XSS Prevention', () => {
      it('should handle script tags in account fields', async () => {
        const xssPayloads = [
          '<script>alert("XSS")</script>',
          '<img src="x" onerror="alert(1)">',
          'javascript:alert("XSS")',
          '<svg onload="alert(1)">',
          '"><script>alert("XSS")</script>',
        ];

        for (const payload of xssPayloads) {
          const accountData = {
            nome: `Account ${payload}`,
            tipo: 'conta_corrente',
            saldo_inicial: 1000,
            observacoes: `Notes: ${payload}`,
          };

          const response = await request(global.testApp.server)
            .post('/financial_accounts')
            .set('Authorization', `Bearer ${authToken}`)
            .send(accountData);

          if (response.status === 201) {
            // Data should be stored as-is (sanitization happens on output, not input)
            expect(response.body.data.nome).toBe(`Account ${payload}`);
            expect(response.body.data.observacoes).toBe(`Notes: ${payload}`);
          }
        }
      });
    });

    describe('Parameter Tampering Prevention', () => {
      it('should ignore attempts to set user ID in request body', async () => {
        const accountData = {
          nome: 'Tampered Account',
          tipo: 'conta_corrente',
          saldo_inicial: 1000,
          userId: otherUser.id, // Attempt to create account for different user
          user: otherUser.id, // Alternative field name
        };

        const response = await request(global.testApp.server)
          .post('/financial_accounts')
          .set('Authorization', `Bearer ${authToken}`)
          .send(accountData)
          .expect(201);

        // Account should be created for the authenticated user, not the tampered user
        expect(response.body.data.user).toBe(testUser.id);
        expect(response.body.data.user).not.toBe(otherUser.id);
      });

      it('should ignore attempts to set account ID in creation request', async () => {
        const accountData = {
          id: otherUser.id, // Attempt to set specific ID
          nome: 'ID Tampered Account',
          tipo: 'conta_corrente',
          saldo_inicial: 1000,
        };

        const response = await request(global.testApp.server)
          .post('/financial_accounts')
          .set('Authorization', `Bearer ${authToken}`)
          .send(accountData)
          .expect(201);

        // Should generate new UUID, not use provided ID
        expect(response.body.data.id).not.toBe(otherUser.id);
        expect(response.body.data.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
      });
    });
  });

  describe('🔒 Data Privacy and Isolation', () => {
    describe('Multi-tenant Data Isolation', () => {
      it('should not leak account data between users in error messages', async () => {
        const otherUserAccount = await factories.financialAccount.create({
          userId: otherUser.id,
          nome: 'Secret Account Information',
        });

        // Try to access other user's account - error should not reveal account details
        const response = await request(global.testApp.server)
          .get(`/financial_accounts/${otherUserAccount.id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(400);

        // Error message should be generic, not revealing account exists or details
        expect(response.body.success).toBe(false);
        expect(response.body.errors).toContain('UNAUTHORIZED');
        expect(response.body.message).not.toContain('Secret Account Information');
        expect(response.body.message).not.toContain(otherUser.email);
        expect(response.body.message).not.toContain(otherUser.name);
      });

      it('should maintain data isolation under concurrent load', async () => {
        // Create multiple accounts for different users concurrently
        const accountPromises = Array.from({ length: 20 }, (_, i) => {
          const user = i % 2 === 0 ? testUser : otherUser;
          const token = i % 2 === 0 ? authToken : otherAuthToken;
          
          return request(global.testApp.server)
            .post('/financial_accounts')
            .set('Authorization', `Bearer ${token}`)
            .send({
              nome: `Concurrent Account ${i}`,
              tipo: 'conta_corrente',
              saldo_inicial: i * 100,
            });
        });

        const responses = await Promise.all(accountPromises);

        // Verify each account belongs to correct user
        responses.forEach((response, i) => {
          expect(response.status).toBe(201);
          const expectedUserId = i % 2 === 0 ? testUser.id : otherUser.id;
          expect(response.body.data.user).toBe(expectedUserId);
        });

        // Verify user isolation in list endpoints
        const testUserAccounts = await request(global.testApp.server)
          .get('/financial_accounts')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        const otherUserAccounts = await request(global.testApp.server)
          .get('/financial_accounts')
          .set('Authorization', `Bearer ${otherAuthToken}`)
          .expect(200);

        // Each user should see only their accounts
        testUserAccounts.body.data.forEach((account: any) => {
          expect(account.user).toBe(testUser.id);
        });

        otherUserAccounts.body.data.forEach((account: any) => {
          expect(account.user).toBe(otherUser.id);
        });
      });
    });

    describe('Sensitive Data Handling', () => {
      it('should not expose internal database IDs in URLs unnecessarily', async () => {
        const account = await factories.financialAccount.create({
          userId: testUser.id,
          nome: 'Test Account',
        });

        const response = await request(global.testApp.server)
          .get(`/financial_accounts/${account.id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        // UUIDs are acceptable to expose as they're not sequential
        expect(response.body.data.id).toMatch(/^[0-9a-f-]{36}$/);
      });

      it('should handle user data consistently across all endpoints', async () => {
        const account = await factories.financialAccount.create({
          userId: testUser.id,
          nome: 'Consistency Test Account',
        });

        // Get account via list endpoint
        const listResponse = await request(global.testApp.server)
          .get('/financial_accounts')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        const accountFromList = listResponse.body.data.find((a: any) => a.id === account.id);

        // Get account via detail endpoint
        const detailResponse = await request(global.testApp.server)
          .get(`/financial_accounts/${account.id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        const accountFromDetail = detailResponse.body.data;

        // Both should return consistent user data
        expect(accountFromList.user).toBe(accountFromDetail.user);
        expect(accountFromList.user).toBe(testUser.id);
        expect(accountFromDetail.user).toBe(testUser.id);
      });
    });
  });

  describe('⚡ Rate Limiting and Abuse Prevention', () => {
    it('should handle rapid successive requests gracefully', async () => {
      const rapidRequests = Array.from({ length: 50 }, () =>
        request(global.testApp.server)
          .get('/financial_accounts')
          .set('Authorization', `Bearer ${authToken}`)
      );

      const startTime = Date.now();
      const responses = await Promise.all(rapidRequests);
      const endTime = Date.now();

      // All requests should succeed (no rate limiting implemented yet)
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      // Should complete within reasonable time
      expect(endTime - startTime).toBeLessThan(30000); // 30 seconds max
    });

    it('should handle malformed requests without crashing', async () => {
      const malformedRequests = [
        // Malformed JSON
        request(global.testApp.server)
          .post('/financial_accounts')
          .set('Authorization', `Bearer ${authToken}`)
          .set('Content-Type', 'application/json')
          .send('{"nome": "Test", "tipo":}'),
        
        // Wrong content type
        request(global.testApp.server)
          .post('/financial_accounts')
          .set('Authorization', `Bearer ${authToken}`)
          .set('Content-Type', 'text/plain')
          .send('This is not JSON'),
        
        // Very large payload
        request(global.testApp.server)
          .post('/financial_accounts')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            nome: 'A'.repeat(100000), // Very long name
            tipo: 'conta_corrente',
            saldo_inicial: 1000,
          }),
      ];

      for (const requestPromise of malformedRequests) {
        const response = await requestPromise;
        expect(response.status).toBeGreaterThanOrEqual(400);
        expect(response.status).toBeLessThan(500); // Should be client error, not server error
      }
    });
  });
});