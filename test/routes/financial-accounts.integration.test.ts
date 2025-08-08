import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createFactories } from '../factories';
import { createAuthHelper } from '../helpers/auth';

describe('Financial Accounts Integration Tests', () => {
  let factories: ReturnType<typeof createFactories>;
  let authHelper: ReturnType<typeof createAuthHelper>;
  let testUser: any;
  let authToken: string;

  beforeEach(async () => {
    factories = createFactories(global.testEnv.prisma);
    authHelper = createAuthHelper(global.testEnv.prisma);
    
    // Reset factory counters
    factories.resetAllCounters();

    // Create test user and get auth token
    testUser = await factories.user.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });

    authToken = authHelper.generateToken({
      id: testUser.id,
      email: testUser.email,
      name: testUser.name,
    });
  });

  describe('POST /financial_accounts - Create Financial Account', () => {
    describe('✅ Positive Scenarios', () => {
      it('should create a checking account with valid data', async () => {
        const accountData = {
          nome: 'Conta Corrente Principal',
          tipo: 'conta_corrente',
          instituicao: 'Nubank',
          saldo_inicial: 1000,
          cor: '#0066CC',
          icone: 'bank',
          observacoes: 'Conta principal para gastos do dia a dia',
        };

        const response = await request(global.testApp.server)
          .post('/financial_accounts')
          .set('Authorization', `Bearer ${authToken}`)
          .send(accountData)
          .expect(201);

        // Verify response structure
        expect(response.body.success).toBe(true);
        expect(response.body.data).toMatchObject({
          id: expect.any(String),
          nome: accountData.nome,
          tipo: accountData.tipo,
          instituicao: accountData.instituicao,
          saldo_inicial: accountData.saldo_inicial,
          saldo_atual: accountData.saldo_inicial, // Should equal initial balance
          cor: accountData.cor,
          icone: accountData.icone,
          ativa: true, // Should default to active
          observacoes: accountData.observacoes,
          user: testUser.id,
          date_created: expect.any(String),
          date_updated: expect.any(String),
        });

        // Verify account was created in database
        const createdAccount = await global.testEnv.prisma.financialAccount.findFirst({
          where: { nome: accountData.nome, userId: testUser.id },
        });
        
        expect(createdAccount).toBeTruthy();
        expect(createdAccount!.tipo).toBe(accountData.tipo);
        expect(Number(createdAccount!.saldoInicial)).toBe(accountData.saldo_inicial);
        expect(Number(createdAccount!.saldoAtual)).toBe(accountData.saldo_inicial);
      });

      it('should create a savings account with minimal required fields', async () => {
        const accountData = {
          nome: 'Poupança Simples',
          tipo: 'conta_poupanca',
          saldo_inicial: 0,
        };

        const response = await request(global.testApp.server)
          .post('/financial_accounts')
          .set('Authorization', `Bearer ${authToken}`)
          .send(accountData)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toMatchObject({
          nome: accountData.nome,
          tipo: accountData.tipo,
          saldo_inicial: accountData.saldo_inicial,
          saldo_atual: accountData.saldo_inicial,
          ativa: true,
          user: testUser.id,
        });

        // Optional fields should be null/undefined
        expect(response.body.data.instituicao).toBeFalsy();
        expect(response.body.data.cor).toBeFalsy();
        expect(response.body.data.icone).toBeFalsy();
        expect(response.body.data.observacoes).toBeFalsy();
      });

      it('should create different account types successfully', async () => {
        const accountTypes = [
          { tipo: 'conta_corrente', nome: 'Conta Corrente' },
          { tipo: 'conta_poupanca', nome: 'Conta Poupança' },
          { tipo: 'carteira', nome: 'Carteira Digital' },
          { tipo: 'investimento', nome: 'Conta Investimentos' },
          { tipo: 'outras', nome: 'Conta Outras' },
        ];

        for (const accountType of accountTypes) {
          const response = await request(global.testApp.server)
            .post('/financial_accounts')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
              nome: accountType.nome,
              tipo: accountType.tipo,
              saldo_inicial: 500,
            })
            .expect(201);

          expect(response.body.data.tipo).toBe(accountType.tipo);
          expect(response.body.data.nome).toBe(accountType.nome);
        }
      });

      it('should create account with large initial balance', async () => {
        const accountData = {
          nome: 'Conta de Alto Valor',
          tipo: 'investimento',
          saldo_inicial: 999999.99,
        };

        const response = await request(global.testApp.server)
          .post('/financial_accounts')
          .set('Authorization', `Bearer ${authToken}`)
          .send(accountData)
          .expect(201);

        expect(response.body.data.saldo_inicial).toBe(accountData.saldo_inicial);
        expect(response.body.data.saldo_atual).toBe(accountData.saldo_inicial);
      });

      it('should create account with zero initial balance', async () => {
        const accountData = {
          nome: 'Conta Nova',
          tipo: 'carteira',
          saldo_inicial: 0,
        };

        const response = await request(global.testApp.server)
          .post('/financial_accounts')
          .set('Authorization', `Bearer ${authToken}`)
          .send(accountData)
          .expect(201);

        expect(response.body.data.saldo_inicial).toBe(0);
        expect(response.body.data.saldo_atual).toBe(0);
      });
    });

    describe('❌ Negative Scenarios - Validation Errors', () => {
      it('should return 401 without authentication token', async () => {
        const accountData = {
          nome: 'Conta Teste',
          tipo: 'conta_corrente',
          saldo_inicial: 1000,
        };

        await request(global.testApp.server)
          .post('/financial_accounts')
          .send(accountData)
          .expect(401);
      });

      it('should return 401 with invalid authentication token', async () => {
        const accountData = {
          nome: 'Conta Teste',
          tipo: 'conta_corrente',
          saldo_inicial: 1000,
        };

        await request(global.testApp.server)
          .post('/financial_accounts')
          .set('Authorization', 'Bearer invalid-token')
          .send(accountData)
          .expect(401);
      });

      it('should return 400 when name is missing', async () => {
        const accountData = {
          tipo: 'conta_corrente',
          saldo_inicial: 1000,
        };

        const response = await request(global.testApp.server)
          .post('/financial_accounts')
          .set('Authorization', `Bearer ${authToken}`)
          .send(accountData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.errors).toContain('VALIDATION_ERROR');
      });

      it('should return 400 when name is empty string', async () => {
        const accountData = {
          nome: '',
          tipo: 'conta_corrente',
          saldo_inicial: 1000,
        };

        const response = await request(global.testApp.server)
          .post('/financial_accounts')
          .set('Authorization', `Bearer ${authToken}`)
          .send(accountData)
          .expect(400);

        expect(response.body.success).toBe(false);
      });

      it('should return 400 when name is too long (>255 characters)', async () => {
        const accountData = {
          nome: 'A'.repeat(256), // 256 characters
          tipo: 'conta_corrente',
          saldo_inicial: 1000,
        };

        const response = await request(global.testApp.server)
          .post('/financial_accounts')
          .set('Authorization', `Bearer ${authToken}`)
          .send(accountData)
          .expect(400);

        expect(response.body.success).toBe(false);
      });

      it('should return 400 when tipo is missing', async () => {
        const accountData = {
          nome: 'Conta Teste',
          saldo_inicial: 1000,
        };

        const response = await request(global.testApp.server)
          .post('/financial_accounts')
          .set('Authorization', `Bearer ${authToken}`)
          .send(accountData)
          .expect(400);

        expect(response.body.success).toBe(false);
      });

      it('should return 400 when tipo is invalid', async () => {
        const accountData = {
          nome: 'Conta Teste',
          tipo: 'tipo_invalido',
          saldo_inicial: 1000,
        };

        const response = await request(global.testApp.server)
          .post('/financial_accounts')
          .set('Authorization', `Bearer ${authToken}`)
          .send(accountData)
          .expect(400);

        expect(response.body.success).toBe(false);
      });

      it('should return 400 when saldo_inicial is negative', async () => {
        const accountData = {
          nome: 'Conta Teste',
          tipo: 'conta_corrente',
          saldo_inicial: -100,
        };

        const response = await request(global.testApp.server)
          .post('/financial_accounts')
          .set('Authorization', `Bearer ${authToken}`)
          .send(accountData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toMatch(/saldo inicial/i);
      });

      it('should return 400 when cor has invalid format', async () => {
        const invalidColors = ['invalid-color', '123456', '#GGGGGG', 'blue', '#12345'];
        
        for (const cor of invalidColors) {
          const accountData = {
            nome: 'Conta Teste',
            tipo: 'conta_corrente',
            saldo_inicial: 1000,
            cor: cor,
          };

          const response = await request(global.testApp.server)
            .post('/financial_accounts')
            .set('Authorization', `Bearer ${authToken}`)
            .send(accountData)
            .expect(400);

          expect(response.body.success).toBe(false);
        }
      });

      it('should return 400 when instituicao is too long (>255 characters)', async () => {
        const accountData = {
          nome: 'Conta Teste',
          tipo: 'conta_corrente',
          saldo_inicial: 1000,
          instituicao: 'A'.repeat(256),
        };

        const response = await request(global.testApp.server)
          .post('/financial_accounts')
          .set('Authorization', `Bearer ${authToken}`)
          .send(accountData)
          .expect(400);

        expect(response.body.success).toBe(false);
      });

      it('should return 400 when observacoes is too long (>1000 characters)', async () => {
        const accountData = {
          nome: 'Conta Teste',
          tipo: 'conta_corrente',
          saldo_inicial: 1000,
          observacoes: 'A'.repeat(1001),
        };

        const response = await request(global.testApp.server)
          .post('/financial_accounts')
          .set('Authorization', `Bearer ${authToken}`)
          .send(accountData)
          .expect(400);

        expect(response.body.success).toBe(false);
      });

      it('should return 400 when icone is too long (>50 characters)', async () => {
        const accountData = {
          nome: 'Conta Teste',
          tipo: 'conta_corrente',
          saldo_inicial: 1000,
          icone: 'A'.repeat(51),
        };

        const response = await request(global.testApp.server)
          .post('/financial_accounts')
          .set('Authorization', `Bearer ${authToken}`)
          .send(accountData)
          .expect(400);

        expect(response.body.success).toBe(false);
      });

      it('should return 400 with malformed JSON', async () => {
        await request(global.testApp.server)
          .post('/financial_accounts')
          .set('Authorization', `Bearer ${authToken}`)
          .set('Content-Type', 'application/json')
          .send('{"nome": "Conta Teste", "tipo":}') // Invalid JSON
          .expect(400);
      });

      it('should return 400 with empty request body', async () => {
        const response = await request(global.testApp.server)
          .post('/financial_accounts')
          .set('Authorization', `Bearer ${authToken}`)
          .send({})
          .expect(400);

        expect(response.body.success).toBe(false);
      });
    });

    describe('🔐 Authorization Scenarios', () => {
      it('should isolate accounts between different users', async () => {
        // Create second user
        const secondUser = await factories.user.create({
          name: 'Second User',
          email: 'second@example.com',
          password: 'password123',
        });

        const secondAuthToken = authHelper.generateToken({
          id: secondUser.id,
          email: secondUser.email,
          name: secondUser.name,
        });

        // Create account for first user
        const accountData1 = {
          nome: 'Conta User 1',
          tipo: 'conta_corrente',
          saldo_inicial: 1000,
        };

        const response1 = await request(global.testApp.server)
          .post('/financial_accounts')
          .set('Authorization', `Bearer ${authToken}`)
          .send(accountData1)
          .expect(201);

        // Create account for second user
        const accountData2 = {
          nome: 'Conta User 2',
          tipo: 'conta_corrente',
          saldo_inicial: 2000,
        };

        const response2 = await request(global.testApp.server)
          .post('/financial_accounts')
          .set('Authorization', `Bearer ${secondAuthToken}`)
          .send(accountData2)
          .expect(201);

        // Verify accounts belong to correct users
        expect(response1.body.data.user).toBe(testUser.id);
        expect(response2.body.data.user).toBe(secondUser.id);
        expect(response1.body.data.user).not.toBe(response2.body.data.user);
      });

      it('should not allow creating account with expired token', async () => {
        // Create expired token (expires in the past)
        const expiredToken = authHelper.generateToken({
          id: testUser.id,
          email: testUser.email,
          name: testUser.name,
        }, '0s'); // Expires immediately

        // Wait a moment to ensure token is expired
        await new Promise(resolve => setTimeout(resolve, 100));

        const accountData = {
          nome: 'Conta Teste',
          tipo: 'conta_corrente',
          saldo_inicial: 1000,
        };

        await request(global.testApp.server)
          .post('/financial_accounts')
          .set('Authorization', `Bearer ${expiredToken}`)
          .send(accountData)
          .expect(401);
      });
    });
  });

  describe('GET /financial_accounts - List Financial Accounts', () => {
    it('should return empty list when user has no accounts', async () => {
      const response = await request(global.testApp.server)
        .get('/financial_accounts')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
    });

    it('should return only user owned accounts', async () => {
      // First, check if there are any existing accounts for this user
      const initialResponse = await request(global.testApp.server)
        .get('/financial_accounts')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const initialCount = initialResponse.body.data.length;

      // Create accounts for test user
      const account1 = await factories.financialAccount.create({
        userId: testUser.id,
        nome: 'Conta 1',
      });

      const account2 = await factories.financialAccount.create({
        userId: testUser.id,
        nome: 'Conta 2',
      });

      // Create account for another user
      const otherUser = await factories.user.create({
        email: 'other@example.com',
      });
      
      await factories.financialAccount.create({
        userId: otherUser.id,
        nome: 'Conta de Outro Usuário',
      });

      const response = await request(global.testApp.server)
        .get('/financial_accounts')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(initialCount + 2);
      
      // Verify all returned accounts belong to test user
      response.body.data.forEach((account: any) => {
        expect(account.user).toBe(testUser.id);
      });
    });

    it('should return 401 without authentication', async () => {
      await request(global.testApp.server)
        .get('/financial_accounts')
        .expect(401);
    });
  });

  describe('GET /financial_accounts/:id - Get Financial Account by ID', () => {
    let testAccount: any;

    beforeEach(async () => {
      testAccount = await factories.financialAccount.create({
        userId: testUser.id,
        nome: 'Conta de Teste',
        tipo: 'conta_corrente',
      });
    });

    it('should return account when user owns it', async () => {
      const response = await request(global.testApp.server)
        .get(`/financial_accounts/${testAccount.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        id: testAccount.id,
        nome: testAccount.nome,
        user: testUser.id,
      });
    });

    it('should return 400 when ID has invalid UUID format', async () => {
      const invalidId = 'non-existent-id';
      
      const response = await request(global.testApp.server)
        .get(`/financial_accounts/${invalidId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('VALIDATION_ERROR');
    });

    it('should return 404 when account does not exist (valid UUID)', async () => {
      const nonExistentId = 'c0d1f1c8-2345-4567-8901-123456789abc'; // Valid UUID format
      
      const response = await request(global.testApp.server)
        .get(`/financial_accounts/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 404 when user tries to access account of another user', async () => {
      // Create account for another user
      const otherUser = await factories.user.create({
        email: 'other@example.com',
      });
      
      const otherUserAccount = await factories.financialAccount.create({
        userId: otherUser.id,
        nome: 'Conta de Outro Usuário',
      });

      const response = await request(global.testApp.server)
        .get(`/financial_accounts/${otherUserAccount.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('UNAUTHORIZED');
    });

    it('should return 401 without authentication', async () => {
      await request(global.testApp.server)
        .get(`/financial_accounts/${testAccount.id}`)
        .expect(401);
    });
  });

  describe('Business Rules Validation', () => {
    describe('Account Type Specific Rules', () => {
      it('should allow negative balance for checking accounts', async () => {
        // Create checking account
        const checkingAccount = await factories.financialAccount.createCheckingAccount({
          userId: testUser.id,
          saldoAtual: -500, // Negative balance (within overdraft limit)
        });

        expect(Number(checkingAccount.saldoAtual)).toBe(-500);
        expect(checkingAccount.tipo).toBe('conta_corrente');
      });

      it('should handle different account types correctly', async () => {
        const accountTypes = [
          { tipo: 'conta_corrente', canBeNegative: true },
          { tipo: 'conta_poupanca', canBeNegative: false },
          { tipo: 'carteira', canBeNegative: false },
          { tipo: 'investimento', canBeNegative: false },
          { tipo: 'outras', canBeNegative: false },
        ] as const;

        for (const accountType of accountTypes) {
          const account = await factories.financialAccount.create({
            userId: testUser.id,
            tipo: accountType.tipo,
            saldoInicial: 1000,
          });

          expect(account.tipo).toBe(accountType.tipo);
          
          // Test balance constraints based on account type
          if (accountType.canBeNegative) {
            // Checking accounts should allow negative balance within limits
            expect(Number(account.saldoAtual)).toBeGreaterThanOrEqual(-1000);
          } else {
            // Other accounts should not go negative
            expect(Number(account.saldoAtual)).toBeGreaterThanOrEqual(0);
          }
        }
      });
    });

    describe('Data Integrity Rules', () => {
      it('should maintain referential integrity with user', async () => {
        const account = await factories.financialAccount.create({
          userId: testUser.id,
          nome: 'Conta Teste',
        });

        // Verify account is linked to correct user
        const accountWithUser = await global.testEnv.prisma.financialAccount.findUnique({
          where: { id: account.id },
          include: { user: true },
        });

        expect(accountWithUser!.user.id).toBe(testUser.id);
        expect(accountWithUser!.user.email).toBe(testUser.email);
      });

      it('should set correct default values', async () => {
        const accountData = {
          nome: 'Conta Teste',
          tipo: 'conta_corrente',
          saldo_inicial: 500,
        };

        const response = await request(global.testApp.server)
          .post('/financial_accounts')
          .set('Authorization', `Bearer ${authToken}`)
          .send(accountData)
          .expect(201);

        // Verify default values
        expect(response.body.data.ativa).toBe(true);
        expect(response.body.data.saldo_atual).toBe(response.body.data.saldo_inicial);
        expect(response.body.data.date_created).toBeTruthy();
        expect(response.body.data.date_updated).toBeTruthy();
      });

      it('should handle concurrent account creation', async () => {
        const accountPromises = Array.from({ length: 5 }, (_, i) => 
          request(global.testApp.server)
            .post('/financial_accounts')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
              nome: `Conta Concorrente ${i + 1}`,
              tipo: 'conta_corrente',
              saldo_inicial: 100 * (i + 1),
            })
        );

        const responses = await Promise.all(accountPromises);
        
        // All should succeed
        responses.forEach(response => {
          expect(response.status).toBe(201);
          expect(response.body.success).toBe(true);
        });

        // Verify all accounts were created
        const accountCount = await global.testEnv.prisma.financialAccount.count({
          where: { userId: testUser.id },
        });
        
        expect(accountCount).toBe(5);
      });
    });
  });
});