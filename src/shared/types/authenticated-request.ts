import { FastifyRequest } from 'fastify';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
}

export interface AuthenticatedRequest extends FastifyRequest {
  user: AuthenticatedUser;
}

// Type for use with ZodTypeProvider
export type AuthenticatedRequestWithTypes<T = unknown, Q = unknown, P = unknown> = FastifyRequest<{
  Body: T;
  Querystring: Q;
  Params: P;
}> & {
  user: AuthenticatedUser;
};