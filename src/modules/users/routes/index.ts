import { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { userResponseSchema } from '@src/modules/auth/schemas/auth';
import { errorResponseSchema } from '@src/modules/shared/schemas/common';
import { authMiddleware } from '@src/modules/shared/infrastructure/middlewares/auth-middleware';
import { AuthenticatedRequest } from '@src/modules/shared/types/authenticated-request';

const userRoutes: FastifyPluginAsync = async function (fastify) {
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/me',
    preHandler: authMiddleware,
    schema: {
      description: 'Get current user profile',
      tags: ['Users'],
      security: [{ bearerAuth: [] }],
      response: {
        200: userResponseSchema.describe('Perfil do usuário autenticado'),
        401: errorResponseSchema.describe('Token JWT não fornecido ou inválido')
      },
    },
    handler: async (request, reply) => {
      return (request as AuthenticatedRequest).user;
    },
  });
};

export default userRoutes;
export const autoPrefix = '/users';