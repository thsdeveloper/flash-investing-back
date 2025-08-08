import { fastify, FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { ResponseHelper } from '../../src/modules/shared/utils/response-helper';
import { PrismaUserRepository } from '../../src/modules/users/infrastructure/repositories/prisma-user-repository';
import { RegisterUserUseCase } from '../../src/modules/auth/application/use-cases/register-user';
import { JwtProviderImpl } from '../../src/modules/shared/infrastructure/providers/jwt-provider';
import { LoginUserUseCase } from '../../src/modules/auth/application/use-cases/login-user';
import { DomainError } from '../../src/modules/shared/domain/errors/domain-error';
import { PrismaFinancialAccountRepository } from '../../src/modules/financial-accounts/infrastructure/repositories/prisma-financial-account-repository';
import { CreateFinancialAccountUseCase } from '../../src/modules/financial-accounts/application/use-cases/create-financial-account';
import { GetFinancialAccountsUseCase } from '../../src/modules/financial-accounts/application/use-cases/get-financial-accounts';
import { GetFinancialAccountByIdUseCase } from '../../src/modules/financial-accounts/application/use-cases/get-financial-account-by-id';
import { UpdateFinancialAccountUseCase } from '../../src/modules/financial-accounts/application/use-cases/update-financial-account';
import { DeleteFinancialAccountUseCase } from '../../src/modules/financial-accounts/application/use-cases/delete-financial-account';
import { PrismaTransactionRepository } from '../../src/modules/transactions/infrastructure/repositories/prisma-transaction-repository';
import { PrismaCreditCardRepository } from '../../src/modules/credit-cards/infrastructure/repositories/prisma-credit-card-repository';
import { authMiddleware } from '../../src/modules/shared/infrastructure/middlewares/auth-middleware';
import { AuthenticatedRequest } from '../../src/modules/shared/types/authenticated-request';

export async function createTestApp(): Promise<FastifyInstance> {
  const app = fastify({
    logger: false, // Disable logging in tests
  });

  try {
    // Register CORS
    await app.register(cors);

    // Decorate app with Prisma instance
    app.decorate('prisma', global.testEnv.prisma);

    // Set up repositories and services
    const userRepository = new PrismaUserRepository(global.testEnv.prisma);
    const financialAccountRepository = new PrismaFinancialAccountRepository(global.testEnv.prisma);
    const transactionRepository = new PrismaTransactionRepository(global.testEnv.prisma);
    const creditCardRepository = new PrismaCreditCardRepository(global.testEnv.prisma);
    const jwtProvider = new JwtProviderImpl();

    // Auth middleware (simplified version for tests)
    const testAuthMiddleware = async (request: any, reply: any) => {
      try {
        const authHeader = request.headers.authorization;
        
        if (!authHeader) {
          return reply.status(401).send(ResponseHelper.unauthorized());
        }

        const [bearer, token] = authHeader.split(' ');
        
        if (bearer !== 'Bearer' || !token) {
          return reply.status(401).send(ResponseHelper.unauthorized());
        }

        const payload = jwtProvider.verifyAccessToken(token);

        (request as AuthenticatedRequest).user = {
          id: payload.sub,
          name: payload.name,
          email: payload.email,
        };
      } catch (error) {
        return reply.status(401).send(ResponseHelper.unauthorized());
      }
    };

    // Register route (simplified without schema validation)
    app.route({
      method: 'POST',
      url: '/auth/register',
      handler: async (request, reply) => {
        try {
          const registerUseCase = new RegisterUserUseCase(userRepository, jwtProvider);
          const result = await registerUseCase.execute(request.body as any);
          
          const response = ResponseHelper.success(
            result,
            { message: 'Usuário registrado com sucesso' }
          );
          
          return reply.status(201).send(response as any);
        } catch (error) {
          if (error instanceof DomainError) {
            const response = ResponseHelper.error(error.message, [error.code]);
            return reply.status(400).send(response as any);
          }
          throw error;
        }
      },
    });

    // Login route (simplified without schema validation)
    app.route({
      method: 'POST',
      url: '/auth/login',
      handler: async (request, reply) => {
        try {
          const loginUseCase = new LoginUserUseCase(userRepository, jwtProvider);
          const result = await loginUseCase.execute(request.body as any);
          
          const response = ResponseHelper.success(
            result,
            { message: 'Login realizado com sucesso' }
          );
          
          return reply.status(200).send(response as any);
        } catch (error) {
          if (error instanceof DomainError) {
            const response = ResponseHelper.unauthorized();
            return reply.status(401).send(response as any);
          }
          throw error;
        }
      },
    });

    // Financial Accounts Routes
    
    // GET /financial_accounts - List financial accounts
    app.route({
      method: 'GET',
      url: '/financial_accounts',
      preHandler: testAuthMiddleware,
      handler: async (request, reply) => {
        const authRequest = request as AuthenticatedRequest;
        try {
          const getAccountsUseCase = new GetFinancialAccountsUseCase(financialAccountRepository);
          const result = await getAccountsUseCase.execute({
            userId: authRequest.user.id,
          });
          
          const response = ResponseHelper.success(
            result.data,
            { message: 'Contas financeiras recuperadas com sucesso' }
          );
          
          return reply.status(200).send(response as any);
        } catch (error) {
          if (error instanceof DomainError) {
            const response = ResponseHelper.error(error.message, [error.code || 'DOMAIN_ERROR']);
            return reply.status(400).send(response as any);
          }
          
          const response = ResponseHelper.internalServerError(error instanceof Error ? error : undefined);
          return reply.status(500).send(response as any);
        }
      },
    });

    // GET /financial_accounts/:id - Get financial account by ID
    app.route({
      method: 'GET',
      url: '/financial_accounts/:id',
      preHandler: testAuthMiddleware,
      handler: async (request, reply) => {
        const authRequest = request as AuthenticatedRequest;
        try {
          const { id } = request.params as { id: string };
          
          // Validate UUID format
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          if (!uuidRegex.test(id)) {
            const response = ResponseHelper.error('ID deve ser um UUID válido', ['VALIDATION_ERROR']);
            return reply.status(400).send(response as any);
          }
          
          const getAccountUseCase = new GetFinancialAccountByIdUseCase(financialAccountRepository);
          const result = await getAccountUseCase.execute(id, authRequest.user.id);
          
          const response = ResponseHelper.success(
            result,
            { message: 'Conta financeira recuperada com sucesso' }
          );
          
          return reply.status(200).send(response as any);
        } catch (error) {
          if (error instanceof DomainError) {
            if (error.code === 'FINANCIAL_ACCOUNT_NOT_FOUND') {
              const response = ResponseHelper.notFound('Conta financeira');
              return reply.status(404).send(response as any);
            }
            
            const response = ResponseHelper.error(error.message, [error.code || 'DOMAIN_ERROR']);
            return reply.status(400).send(response as any);
          }
          
          const response = ResponseHelper.internalServerError(error instanceof Error ? error : undefined);
          return reply.status(500).send(response as any);
        }
      },
    });

    // POST /financial_accounts - Create financial account
    app.route({
      method: 'POST',
      url: '/financial_accounts',
      preHandler: testAuthMiddleware,
      handler: async (request, reply) => {
        const authRequest = request as AuthenticatedRequest;
        try {
          const body = request.body as any;
          
          // Basic validation for tests
          if (!body.nome || typeof body.nome !== 'string' || body.nome.trim() === '') {
            const response = ResponseHelper.error('Nome é obrigatório', ['VALIDATION_ERROR']);
            return reply.status(400).send(response as any);
          }
          
          if (!body.tipo || !['conta_corrente', 'conta_poupanca', 'carteira', 'investimento', 'outras'].includes(body.tipo)) {
            const response = ResponseHelper.error('Tipo é obrigatório e deve ser válido', ['VALIDATION_ERROR']);
            return reply.status(400).send(response as any);
          }
          
          if (body.nome.length > 255) {
            const response = ResponseHelper.error('Nome não pode ter mais de 255 caracteres', ['VALIDATION_ERROR']);
            return reply.status(400).send(response as any);
          }
          
          if (body.instituicao && body.instituicao.length > 255) {
            const response = ResponseHelper.error('Instituição não pode ter mais de 255 caracteres', ['VALIDATION_ERROR']);
            return reply.status(400).send(response as any);
          }
          
          if (body.observacoes && body.observacoes.length > 1000) {
            const response = ResponseHelper.error('Observações não podem ter mais de 1000 caracteres', ['VALIDATION_ERROR']);
            return reply.status(400).send(response as any);
          }
          
          if (body.icone && body.icone.length > 50) {
            const response = ResponseHelper.error('Ícone não pode ter mais de 50 caracteres', ['VALIDATION_ERROR']);
            return reply.status(400).send(response as any);
          }
          
          if (body.cor && !/^#[0-9A-Fa-f]{6}$/.test(body.cor)) {
            const response = ResponseHelper.error('Cor deve estar no formato hexadecimal #FFFFFF', ['VALIDATION_ERROR']);
            return reply.status(400).send(response as any);
          }
          
          let saldoInicial = body.saldo_inicial || 0;
          
          // Handle string values
          if (typeof body.saldo_inicial === 'string') {
            const parsed = parseFloat(body.saldo_inicial);
            if (isNaN(parsed)) {
              const response = ResponseHelper.error('Saldo inicial deve ser um número válido', ['VALIDATION_ERROR']);
              return reply.status(400).send(response as any);
            }
            saldoInicial = parsed;
          }
          
          if (saldoInicial < 0) {
            const response = ResponseHelper.error('Saldo inicial não pode ser negativo', ['VALIDATION_ERROR']);
            return reply.status(400).send(response as any);
          }
          
          const createAccountUseCase = new CreateFinancialAccountUseCase(financialAccountRepository);
          const result = await createAccountUseCase.execute({
            nome: body.nome,
            tipo: body.tipo,
            instituicao: body.instituicao,
            saldoInicial: saldoInicial,
            cor: body.cor,
            icone: body.icone,
            observacoes: body.observacoes,
            userId: authRequest.user.id,
          });
          
          const response = ResponseHelper.success(
            result,
            { message: 'Conta financeira criada com sucesso' }
          );
          
          return reply.status(201).send(response as any);
        } catch (error) {
          if (error instanceof DomainError) {
            const response = ResponseHelper.error(error.message, [error.code || 'DOMAIN_ERROR']);
            return reply.status(400).send(response as any);
          }
          
          const response = ResponseHelper.internalServerError(error instanceof Error ? error : undefined);
          return reply.status(500).send(response as any);
        }
      },
    });

    // PATCH /financial_accounts/:id - Update financial account
    app.route({
      method: 'PATCH',
      url: '/financial_accounts/:id',
      preHandler: testAuthMiddleware,
      handler: async (request, reply) => {
        const authRequest = request as AuthenticatedRequest;
        try {
          const body = request.body as any;
          const { id } = request.params as { id: string };
          
          // Basic validation for tests (only validate fields that are provided)
          if (body.nome !== undefined && (!body.nome || typeof body.nome !== 'string' || body.nome.trim() === '')) {
            const response = ResponseHelper.error('Nome não pode ser vazio se fornecido', ['VALIDATION_ERROR']);
            return reply.status(400).send(response as any);
          }
          
          if (body.tipo !== undefined && (!body.tipo || !['conta_corrente', 'conta_poupanca', 'carteira', 'investimento', 'outras'].includes(body.tipo))) {
            const response = ResponseHelper.error('Tipo deve ser válido se fornecido', ['VALIDATION_ERROR']);
            return reply.status(400).send(response as any);
          }
          
          if (body.nome && body.nome.length > 255) {
            const response = ResponseHelper.error('Nome não pode ter mais de 255 caracteres', ['VALIDATION_ERROR']);
            return reply.status(400).send(response as any);
          }
          
          if (body.cor !== undefined && body.cor !== null && !/^#[0-9A-Fa-f]{6}$/.test(body.cor)) {
            const response = ResponseHelper.error('Cor deve estar no formato hexadecimal #FFFFFF', ['VALIDATION_ERROR']);
            return reply.status(400).send(response as any);
          }
          
          // Validate balance fields
          let saldoInicial = undefined;
          let saldoAtual = undefined;
          
          if (body.saldo_inicial !== undefined) {
            if (typeof body.saldo_inicial === 'string') {
              const parsed = parseFloat(body.saldo_inicial);
              if (isNaN(parsed)) {
                const response = ResponseHelper.error('Saldo inicial deve ser um número válido', ['VALIDATION_ERROR']);
                return reply.status(400).send(response as any);
              }
              saldoInicial = parsed;
            } else {
              saldoInicial = body.saldo_inicial;
            }
          }
          
          if (body.saldo_atual !== undefined) {
            if (typeof body.saldo_atual === 'string') {
              const parsed = parseFloat(body.saldo_atual);
              if (isNaN(parsed)) {
                const response = ResponseHelper.error('Saldo atual deve ser um número válido', ['VALIDATION_ERROR']);
                return reply.status(400).send(response as any);
              }
              saldoAtual = parsed;
            } else {
              saldoAtual = body.saldo_atual;
            }
          }
          
          const updateAccountUseCase = new UpdateFinancialAccountUseCase(financialAccountRepository);
          const result = await updateAccountUseCase.execute(
            id,
            {
              nome: body.nome,
              tipo: body.tipo,
              instituicao: body.instituicao,
              saldoInicial: saldoInicial,
              saldoAtual: saldoAtual,
              cor: body.cor,
              icone: body.icone,
              ativa: body.ativa,
              observacoes: body.observacoes,
            },
            authRequest.user.id
          );
          
          const response = ResponseHelper.success(
            result,
            { message: 'Conta financeira atualizada com sucesso' }
          );
          
          return reply.status(200).send(response as any);
        } catch (error) {
          if (error instanceof DomainError) {
            if (error.code === 'FINANCIAL_ACCOUNT_NOT_FOUND') {
              const response = ResponseHelper.notFound('Conta financeira');
              return reply.status(404).send(response as any);
            }
            
            const response = ResponseHelper.error(error.message, [error.code || 'DOMAIN_ERROR']);
            return reply.status(400).send(response as any);
          }
          
          const response = ResponseHelper.internalServerError(error instanceof Error ? error : undefined);
          return reply.status(500).send(response as any);
        }
      },
    });

    // DELETE /financial_accounts/:id - Delete financial account
    app.route({
      method: 'DELETE',
      url: '/financial_accounts/:id',
      preHandler: testAuthMiddleware,
      handler: async (request, reply) => {
        const authRequest = request as AuthenticatedRequest;
        try {
          const query = request.query as any;
          const { id } = request.params as { id: string };
          const deleteAccountUseCase = new DeleteFinancialAccountUseCase(
            financialAccountRepository,
            transactionRepository,
            creditCardRepository
          );
          await deleteAccountUseCase.execute(
            id,
            authRequest.user.id,
            query.hard !== 'true' // If hard=true, softDelete=false
          );
          
          const response = ResponseHelper.success(
            null,
            { message: 'Conta financeira removida com sucesso' }
          );
          
          return reply.status(200).send(response as any);
        } catch (error) {
          if (error instanceof DomainError) {
            if (error.code === 'FINANCIAL_ACCOUNT_NOT_FOUND') {
              const response = ResponseHelper.notFound('Conta financeira');
              return reply.status(404).send(response as any);
            }
            
            if (error.code === 'ACCOUNT_HAS_TRANSACTIONS' || error.code === 'ACCOUNT_HAS_CREDIT_CARDS') {
              const response = ResponseHelper.error(error.message, [error.code]);
              return reply.status(409).send(response as any); // 409 Conflict
            }
            
            const response = ResponseHelper.error(error.message, [error.code || 'DOMAIN_ERROR']);
            return reply.status(400).send(response as any);
          }
          
          const response = ResponseHelper.internalServerError(error instanceof Error ? error : undefined);
          return reply.status(500).send(response as any);
        }
      },
    });

    // Initialize the app without listening on a port
    await app.ready();
    
    return app;
  } catch (error) {
    console.error('Failed to create test app:', error);
    await app.close();
    throw error;
  }
}

export async function createIsolatedTestApp(): Promise<FastifyInstance> {
  // For tests that need a completely fresh app instance
  return createTestApp();
}