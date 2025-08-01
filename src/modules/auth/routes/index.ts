import { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { 
  registerUserSchema, 
  loginSchema, 
  authResponseSchema
} from '../schemas/auth';
import { errorResponseSchema } from '@src/modules/shared/schemas/common';
import {PrismaUserRepository} from "@src/modules/users/infrastructure/repositories/prisma-user-repository";
import {RegisterUserUseCase} from "@src/modules/auth/application/use-cases/register-user";
import {JwtProviderImpl} from "@src/modules/shared/infrastructure/providers/jwt-provider";
import {prisma} from "@src/infrastructure/database/prisma-client";
import {DomainError} from "@src/modules/shared/domain/errors/domain-error";
import {LoginUserUseCase} from "@src/modules/auth/application/use-cases/login-user";

const authRoutes: FastifyPluginAsync = async function (fastify) {
  const userRepository = new PrismaUserRepository(prisma);
  const jwtProvider = new JwtProviderImpl();

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/register',
    schema: {
      description: 'Register a new user',
      tags: ['Authentication'],
      body: registerUserSchema,
      response: {
        201: authResponseSchema.describe('Usuário registrado com sucesso'),
        400: errorResponseSchema.describe('Erro de validação'),
      },
    },
    handler: async (request, reply) => {
      try {
        const registerUseCase = new RegisterUserUseCase(userRepository, jwtProvider);
        const result = await registerUseCase.execute(request.body);
        
        return reply.status(201).send(result);
      } catch (error) {
        if (error instanceof DomainError) {
          return reply.status(400).send({
            error: error.message,
          });
        }
        throw error;
      }
    },
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/login',
    schema: {
      description: 'Authenticate user',
      tags: ['Authentication'],
      body: loginSchema,
      response: {
        200: authResponseSchema.describe('Login realizado com sucesso'),
        401: errorResponseSchema.describe('Credenciais inválidas'),
      },
    },
    handler: async (request, reply) => {
      try {
        const loginUseCase = new LoginUserUseCase(userRepository, jwtProvider);
        const result = await loginUseCase.execute(request.body);
        
        return result;
      } catch (error) {
        if (error instanceof DomainError) {
          return reply.status(401).send({
            error: error.message,
          });
        }
        throw error;
      }
    },
  });
};

export default authRoutes;
export const autoPrefix = '/auth';