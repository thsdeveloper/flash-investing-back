import { FastifyReply, FastifyRequest, preHandlerHookHandler } from 'fastify';
import { JwtProviderImpl } from '../../providers/jwt-provider';
import { AuthenticatedRequest } from '../../../shared/types/authenticated-request';

export const authMiddleware: preHandlerHookHandler = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> => {
  try {
    const authHeader = request.headers.authorization;
    
    if (!authHeader) {
      return reply.status(401).send({
        error: 'Missing authorization header',
      });
    }

    const [bearer, token] = authHeader.split(' ');
    
    if (bearer !== 'Bearer' || !token) {
      return reply.status(401).send({
        error: 'Invalid authorization format',
      });
    }

    const jwtProvider = new JwtProviderImpl();
    const payload = jwtProvider.verifyAccessToken(token);

    (request as AuthenticatedRequest).user = {
      id: payload.sub,
      name: payload.name,
      email: payload.email,
    };
  } catch (error) {
    return reply.status(401).send({
      error: 'Invalid or expired token',
    });
  }
};