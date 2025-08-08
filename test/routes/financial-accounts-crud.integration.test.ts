import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createFactories } from '../factories';
import { createAuthHelper } from '../helpers/auth';

describe('Financial Accounts CRUD Integration Tests', () => {
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

  describe('PATCH /financial_accounts/:id - Update Financial Account', () => {
    let testAccount: any;

    beforeEach(async () => {
      testAccount = await factories.financialAccount.create({
        userId: testUser.id,
        nome: 'Conta Original',
        tipo: 'conta_corrente',
        saldoInicial: 1000,
        instituicao: 'Banco Original',
        cor: '#FF0000',
      });
    });

    describe('✅ Positive Update Scenarios', () => {
      it('should update account name successfully', async () => {
        const updateData = {
          nome: 'Conta Atualizada',
        };

        const response = await request(global.testApp.server)
          .patch(`/financial_accounts/${testAccount.id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.nome).toBe(updateData.nome);
        expect(response.body.data.id).toBe(testAccount.id);
        
        // Verify other fields remained unchanged
        expect(response.body.data.tipo).toBe(testAccount.tipo);
        expect(response.body.data.saldo_inicial).toBe(Number(testAccount.saldoInicial));
        expect(response.body.data.instituicao).toBe(testAccount.instituicao);
      });

      it('should update multiple fields simultaneously', async () => {
        const updateData = {
          nome: 'Conta Totalmente Nova',
          tipo: 'conta_poupanca',
          instituicao: 'Novo Banco',
          cor: '#00FF00',
          icone: 'new-icon',
          observacoes: 'Observações atualizadas',
        };

        const response = await request(global.testApp.server)
          .patch(`/financial_accounts/${testAccount.id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toMatchObject({
          id: testAccount.id,
          nome: updateData.nome,
          tipo: updateData.tipo,
          instituicao: updateData.instituicao,
          cor: updateData.cor,
          icone: updateData.icone,
          observacoes: updateData.observacoes,
        });
      });

      it('should update account balance', async () => {
        const updateData = {
          saldo_atual: 2500,
        };

        const response = await request(global.testApp.server)
          .patch(`/financial_accounts/${testAccount.id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.saldo_atual).toBe(updateData.saldo_atual);
        expect(response.body.data.saldo_inicial).toBe(Number(testAccount.saldoInicial)); // Should remain unchanged
      });

      it('should activate/deactivate account', async () => {
        // First deactivate
        const deactivateData = { ativa: false };
        
        const deactivateResponse = await request(global.testApp.server)
          .patch(`/financial_accounts/${testAccount.id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(deactivateData)
          .expect(200);

        expect(deactivateResponse.body.data.ativa).toBe(false);

        // Then activate again
        const activateData = { ativa: true };
        
        const activateResponse = await request(global.testApp.server)
          .patch(`/financial_accounts/${testAccount.id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(activateData)
          .expect(200);

        expect(activateResponse.body.data.ativa).toBe(true);
      });

      it('should allow updating with empty optional fields', async () => {
        const updateData = {
          instituicao: null,
          cor: null,
          icone: null,
          observacoes: null,
        };

        const response = await request(global.testApp.server)
          .patch(`/financial_accounts/${testAccount.id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData)
          .expect(200);

        expect(response.body.success).toBe(true);
        // These fields should be null or undefined in response
        expect(response.body.data.instituicao).toBeFalsy();
        expect(response.body.data.cor).toBeFalsy();
        expect(response.body.data.icone).toBeFalsy();
        expect(response.body.data.observacoes).toBeFalsy();
      });
    });

    describe('❌ Negative Update Scenarios', () => {
      it('should return 404 when account does not exist', async () => {
        const nonExistentId = 'c0d1f1c8-2345-4567-8901-123456789abc';
        
        const response = await request(global.testApp.server)
          .patch(`/financial_accounts/${nonExistentId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ nome: 'New Name' })
          .expect(404);

        expect(response.body.success).toBe(false);
      });

      it('should return 404 when trying to update another user account', async () => {
        // Create account for another user
        const otherUser = await factories.user.create({
          email: 'other@example.com',
        });
        
        const otherUserAccount = await factories.financialAccount.create({
          userId: otherUser.id,
          nome: 'Other User Account',
        });

        const response = await request(global.testApp.server)
          .patch(`/financial_accounts/${otherUserAccount.id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ nome: 'Hacked Name' })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.errors).toContain('UNAUTHORIZED');
      });

      it('should return 401 without authentication', async () => {
        await request(global.testApp.server)
          .patch(`/financial_accounts/${testAccount.id}`)
          .send({ nome: 'New Name' })
          .expect(401);
      });

      it('should return 400 with invalid account type', async () => {
        const updateData = {
          tipo: 'tipo_invalido',
        };

        const response = await request(global.testApp.server)
          .patch(`/financial_accounts/${testAccount.id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData)
          .expect(400);

        expect(response.body.success).toBe(false);
      });

      it('should return 400 when name is empty string', async () => {
        const updateData = {
          nome: '',
        };

        const response = await request(global.testApp.server)
          .patch(`/financial_accounts/${testAccount.id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData)
          .expect(400);

        expect(response.body.success).toBe(false);
      });

      it('should return 400 with invalid color format', async () => {
        const updateData = {
          cor: 'invalid-color',
        };

        const response = await request(global.testApp.server)
          .patch(`/financial_accounts/${testAccount.id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData)
          .expect(400);

        expect(response.body.success).toBe(false);
      });
    });

    describe('🔄 Update Race Conditions', () => {
      it('should handle concurrent updates correctly', async () => {
        const updatePromises = [
          request(global.testApp.server)
            .patch(`/financial_accounts/${testAccount.id}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({ nome: 'Updated Name 1' }),
          request(global.testApp.server)
            .patch(`/financial_accounts/${testAccount.id}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({ observacoes: 'Updated Notes 2' }),
        ];

        const responses = await Promise.all(updatePromises);
        
        // Both should succeed
        responses.forEach(response => {
          expect(response.status).toBe(200);
          expect(response.body.success).toBe(true);
        });

        // Verify final state
        const finalResponse = await request(global.testApp.server)
          .get(`/financial_accounts/${testAccount.id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(finalResponse.body.data.id).toBe(testAccount.id);
      });
    });
  });

  describe('DELETE /financial_accounts/:id - Delete Financial Account', () => {
    let testAccount: any;

    beforeEach(async () => {
      testAccount = await factories.financialAccount.create({
        userId: testUser.id,
        nome: 'Conta para Deletar',
        tipo: 'conta_corrente',
      });
    });

    describe('✅ Positive Delete Scenarios', () => {
      it('should soft delete account by default', async () => {
        const response = await request(global.testApp.server)
          .delete(`/financial_accounts/${testAccount.id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toContain('removida com sucesso');

        // Verify account still exists in database but is inactive
        const accountInDb = await global.testEnv.prisma.financialAccount.findUnique({
          where: { id: testAccount.id },
        });
        
        expect(accountInDb).toBeTruthy();
        expect(accountInDb!.ativa).toBe(false); // Should be deactivated
      });

      it('should hard delete account when hard=true', async () => {
        const response = await request(global.testApp.server)
          .delete(`/financial_accounts/${testAccount.id}?hard=true`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);

        // Verify account is completely removed from database
        const accountInDb = await global.testEnv.prisma.financialAccount.findUnique({
          where: { id: testAccount.id },
        });
        
        expect(accountInDb).toBeNull();
      });

      it('should keep soft delete when hard=false explicitly', async () => {
        const response = await request(global.testApp.server)
          .delete(`/financial_accounts/${testAccount.id}?hard=false`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);

        // Verify account still exists but is inactive
        const accountInDb = await global.testEnv.prisma.financialAccount.findUnique({
          where: { id: testAccount.id },
        });
        
        expect(accountInDb).toBeTruthy();
        expect(accountInDb!.ativa).toBe(false);
      });
    });

    describe('❌ Negative Delete Scenarios', () => {
      it('should return 404 when account does not exist', async () => {
        const nonExistentId = 'c0d1f1c8-2345-4567-8901-123456789abc';
        
        const response = await request(global.testApp.server)
          .delete(`/financial_accounts/${nonExistentId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(404);

        expect(response.body.success).toBe(false);
      });

      it('should return 404 when trying to delete another user account', async () => {
        // Create account for another user
        const otherUser = await factories.user.create({
          email: 'other@example.com',
        });
        
        const otherUserAccount = await factories.financialAccount.create({
          userId: otherUser.id,
          nome: 'Other User Account',
        });

        const response = await request(global.testApp.server)
          .delete(`/financial_accounts/${otherUserAccount.id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.errors).toContain('UNAUTHORIZED');
      });

      it('should return 401 without authentication', async () => {
        await request(global.testApp.server)
          .delete(`/financial_accounts/${testAccount.id}`)
          .expect(401);
      });

      it('should return 409 when account has associated transactions', async () => {
        // Create a transaction associated with the account
        await global.testEnv.prisma.transaction.create({
          data: {
            descricao: 'Test Transaction',
            valor: 100,
            tipo: 'despesa',
            data: new Date(),
            status: 'completed',
            contaFinanceiraId: testAccount.id,
            userId: testUser.id,
          },
        });

        const response = await request(global.testApp.server)
          .delete(`/financial_accounts/${testAccount.id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(409);

        expect(response.body.success).toBe(false);
        expect(response.body.errors).toContain('ACCOUNT_HAS_TRANSACTIONS');
      });

      it('should return 409 when account has associated credit cards', async () => {
        // Create a credit card associated with the account
        await global.testEnv.prisma.creditCard.create({
          data: {
            nome: 'Test Credit Card',
            bandeira: 'visa',
            ultimosDigitos: '1234',
            limiteTotal: 5000,
            limiteDisponivel: 5000,
            diaFechamento: 5,
            diaVencimento: 15,
            contaFinanceiraId: testAccount.id,
            userId: testUser.id,
          },
        });

        const response = await request(global.testApp.server)
          .delete(`/financial_accounts/${testAccount.id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(409);

        expect(response.body.success).toBe(false);
        expect(response.body.errors).toContain('ACCOUNT_HAS_CREDIT_CARDS');
      });
    });

    describe('🔐 Referential Integrity Tests', () => {
      it('should prevent deletion of account with both transactions and credit cards', async () => {
        // Create both transaction and credit card
        await global.testEnv.prisma.transaction.create({
          data: {
            descricao: 'Test Transaction',
            valor: 100,
            tipo: 'despesa',
            data: new Date(),
            status: 'completed',
            contaFinanceiraId: testAccount.id,
            userId: testUser.id,
          },
        });

        await global.testEnv.prisma.creditCard.create({
          data: {
            nome: 'Test Credit Card',
            bandeira: 'visa',
            ultimosDigitos: '1234',
            limiteTotal: 5000,
            limiteDisponivel: 5000,
            diaFechamento: 5,
            diaVencimento: 15,
            contaFinanceiraId: testAccount.id,
            userId: testUser.id,
          },
        });

        const response = await request(global.testApp.server)
          .delete(`/financial_accounts/${testAccount.id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(409);

        expect(response.body.success).toBe(false);
        // Should fail on the first check (transactions) before checking credit cards
        expect(response.body.errors).toContain('ACCOUNT_HAS_TRANSACTIONS');
      });

      it('should allow deletion after removing all dependencies', async () => {
        // Create transaction and credit card
        const transaction = await global.testEnv.prisma.transaction.create({
          data: {
            descricao: 'Test Transaction',
            valor: 100,
            tipo: 'despesa',
            data: new Date(),
            status: 'completed',
            contaFinanceiraId: testAccount.id,
            userId: testUser.id,
          },
        });

        const creditCard = await global.testEnv.prisma.creditCard.create({
          data: {
            nome: 'Test Credit Card',
            bandeira: 'visa',
            ultimosDigitos: '1234',
            limiteTotal: 5000,
            limiteDisponivel: 5000,
            diaFechamento: 5,
            diaVencimento: 15,
            contaFinanceiraId: testAccount.id,
            userId: testUser.id,
          },
        });

        // First attempt should fail
        await request(global.testApp.server)
          .delete(`/financial_accounts/${testAccount.id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(409);

        // Remove dependencies
        await global.testEnv.prisma.transaction.delete({
          where: { id: transaction.id },
        });

        await global.testEnv.prisma.creditCard.delete({
          where: { id: creditCard.id },
        });

        // Now deletion should succeed
        const response = await request(global.testApp.server)
          .delete(`/financial_accounts/${testAccount.id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
      });
    });
  });

  describe('Complete CRUD Workflow', () => {
    it('should handle full account lifecycle: create → read → update → delete', async () => {
      // 1. CREATE
      const createData = {
        nome: 'Lifecycle Account',
        tipo: 'conta_corrente',
        saldo_inicial: 1000,
        instituicao: 'Test Bank',
        cor: '#0066CC',
      };

      const createResponse = await request(global.testApp.server)
        .post('/financial_accounts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createData)
        .expect(201);

      const accountId = createResponse.body.data.id;
      expect(createResponse.body.data).toMatchObject({
        nome: createData.nome,
        tipo: createData.tipo,
        saldo_inicial: createData.saldo_inicial,
      });

      // 2. READ
      const readResponse = await request(global.testApp.server)
        .get(`/financial_accounts/${accountId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(readResponse.body.data.id).toBe(accountId);
      expect(readResponse.body.data.nome).toBe(createData.nome);

      // 3. UPDATE
      const updateData = {
        nome: 'Updated Lifecycle Account',
        saldo_atual: 1500,
      };

      const updateResponse = await request(global.testApp.server)
        .patch(`/financial_accounts/${accountId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(updateResponse.body.data.nome).toBe(updateData.nome);
      expect(updateResponse.body.data.saldo_atual).toBe(updateData.saldo_atual);

      // 4. DELETE
      const deleteResponse = await request(global.testApp.server)
        .delete(`/financial_accounts/${accountId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(deleteResponse.body.success).toBe(true);

      // 5. VERIFY DELETION (should be soft deleted)
      const verifyResponse = await request(global.testApp.server)
        .get(`/financial_accounts/${accountId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200); // Soft deleted accounts can still be accessed

      expect(verifyResponse.body.data.ativa).toBe(false);
    });
  });
});