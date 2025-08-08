import { fastify, FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { ResponseHelper } from '../../src/modules/shared/utils/response-helper';
import { PrismaUserRepository } from '../../src/modules/users/infrastructure/repositories/prisma-user-repository';
import { RegisterUserUseCase } from '../../src/modules/auth/application/use-cases/register-user';
import { JwtProviderImpl } from '../../src/modules/shared/infrastructure/providers/jwt-provider';
import { LoginUserUseCase } from '../../src/modules/auth/application/use-cases/login-user';
import { DomainError } from '../../src/modules/shared/domain/errors/domain-error';

export async function createTestApp(): Promise<FastifyInstance> {
  const app = fastify({
    logger: false, // Disable logging in tests
  });

  try {
    // Register CORS
    await app.register(cors);

    // Decorate app with Prisma instance
    app.decorate('prisma', global.testEnv.prisma);

    // Set up auth routes manually
    const userRepository = new PrismaUserRepository(global.testEnv.prisma);
    const jwtProvider = new JwtProviderImpl();

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