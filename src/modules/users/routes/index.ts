import { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { userResponseSchema } from '@src/modules/auth/schemas/auth';
import { 
  standardSuccessResponseSchema,
  standardError401Schema,
  standardError500Schema
} from '@src/modules/shared/schemas/common';
import { ResponseHelper } from '@src/modules/shared/utils/response-helper';
import { authMiddleware } from '@src/modules/shared/infrastructure/middlewares/auth-middleware';
import { AuthenticatedRequest } from '@src/modules/shared/types/authenticated-request';

const userRoutes: FastifyPluginAsync = async function (fastify) {
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/me',
    preHandler: authMiddleware,
    schema: {
      description: 'Obtém o perfil do usuário autenticado',
      tags: ['Users'],
      security: [{ bearerAuth: [] }],
      response: {
        200: standardSuccessResponseSchema(userResponseSchema).describe('Perfil do usuário autenticado'),
        401: standardError401Schema.describe('Token JWT não fornecido ou inválido'),
        500: standardError500Schema.describe('Erro interno do servidor')
      },
    },
    handler: async (request: AuthenticatedRequest, reply) => {
      try {
        const user = request.user;
        
        return reply.status(200).send(
          ResponseHelper.success(user, {
            message: 'Perfil do usuário recuperado com sucesso'
          })
        );
      } catch (error) {
        return reply.status(500).send(
          ResponseHelper.internalServerError(error as Error)
        );
      }
    },
  });
};

export default userRoutes;
export const autoPrefix = '/users';