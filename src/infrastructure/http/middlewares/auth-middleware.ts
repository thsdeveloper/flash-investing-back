import { FastifyReply, FastifyRequest } from 'fastify';
import { JwtProviderImpl } from '../../providers/jwt-provider';

export interface AuthenticatedRequest extends FastifyRequest {
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export async function authMiddleware(
  request: AuthenticatedRequest,
  reply: FastifyReply
) {
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

    request.user = {
      id: payload.sub,
      name: payload.name,
      email: payload.email,
    };
  } catch (error) {
    return reply.status(401).send({
      error: 'Invalid or expired token',
    });
  }
}