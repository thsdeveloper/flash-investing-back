import { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { userResponseSchema } from '../../schemas/auth';
import { authMiddleware, AuthenticatedRequest } from '../../infrastructure/http/middlewares/auth-middleware';

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
        401: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Missing authorization header' }
          },
          description: 'Token JWT não fornecido ou inválido'
        },
      },
    },
    handler: async (request: AuthenticatedRequest, reply) => {
      return request.user!;
    },
  });
};

export default userRoutes;
export const autoPrefix = '/users';