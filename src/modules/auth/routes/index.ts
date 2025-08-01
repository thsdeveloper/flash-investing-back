import { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { 
  registerUserSchema, 
  loginSchema, 
  authResponseSchema
} from '../schemas/auth';
import { 
  standardSuccessResponseSchema,
  standardError400Schema,
  standardError401Schema,
  standardError500Schema
} from '@src/modules/shared/schemas/common';
import { ResponseHelper } from '@src/modules/shared/utils/response-helper';
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
      description: 'Registrar um novo usuário',
      tags: ['Authentication'],
      body: registerUserSchema,
      response: {
        201: standardSuccessResponseSchema(authResponseSchema),
        400: standardError400Schema,
        500: standardError500Schema
      },
    },
    handler: async (request, reply) => {
      try {
        const registerUseCase = new RegisterUserUseCase(userRepository, jwtProvider);
        const result = await registerUseCase.execute(request.body as any);
        
        const response = ResponseHelper.success(
          result,
          { message: 'Usuário registrado com sucesso' }
        );
        
        return reply.status(201).send(response as any as any);
      } catch (error) {
        if (error instanceof DomainError) {
          const response = ResponseHelper.error(error.message, [error.code]);
          return reply.status(400).send(response as any as any);
        }
        throw error;
      }
    },
  });

  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/login',
    schema: {
      description: 'Autenticar usuário',
      tags: ['Authentication'],
      body: loginSchema,
      response: {
        200: standardSuccessResponseSchema(authResponseSchema),
        401: standardError401Schema,
        500: standardError500Schema
      },
    },
    handler: async (request, reply) => {
      try {
        const loginUseCase = new LoginUserUseCase(userRepository, jwtProvider);
        const result = await loginUseCase.execute(request.body as any);
        
        const response = ResponseHelper.success(
          result,
          { message: 'Login realizado com sucesso' }
        );
        
        return reply.status(200).send(response as any as any);
      } catch (error) {
        if (error instanceof DomainError) {
          const response = ResponseHelper.unauthorized();
          return reply.status(401).send(response as any as any);
        }
        throw error;
      }
    },
  });
};

export default authRoutes;
export const autoPrefix = '/auth';