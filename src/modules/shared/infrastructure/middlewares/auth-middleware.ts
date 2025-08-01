import { FastifyReply, FastifyRequest, preHandlerHookHandler } from 'fastify';
import {JwtProviderImpl} from "@src/modules/shared/infrastructure/providers/jwt-provider";

export interface AuthenticatedRequest extends FastifyRequest {
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export const authMiddleware: preHandlerHookHandler = async (
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> => {
  try {
    const authHeader = request.headers.authorization;
    
    if (!authHeader) {
      return reply.status(401).send({
        success: false,
        data: null,
        message: 'Missing authorization header',
        errors: ['MISSING_AUTHORIZATION_HEADER'],
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0.0'
        }
      });
    }

    const [bearer, token] = authHeader.split(' ');
    
    if (bearer !== 'Bearer' || !token) {
      return reply.status(401).send({
        success: false,
        data: null,
        message: 'Invalid authorization format',
        errors: ['INVALID_AUTHORIZATION_FORMAT'],
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0.0'
        }
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
      success: false,
      data: null,
      message: 'Invalid or expired token',
      errors: ['INVALID_OR_EXPIRED_TOKEN'],
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }
    });
  }
};