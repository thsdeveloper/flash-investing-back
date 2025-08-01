import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { DomainError } from '@src/modules/shared/domain/errors/domain-error';
import { ResponseHelper } from '@src/modules/shared/utils/response-helper';
import { ZodError } from 'zod';

/**
 * Middleware global de tratamento de erros
 * Centraliza o tratamento de todos os tipos de erro da aplicação
 */
export async function errorHandlerMiddleware(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) {
  // Log do erro para debugging
  console.error('Error caught by middleware:', {
    error: error.message,
    stack: error.stack,
    url: request.url,
    method: request.method,
    statusCode: error.statusCode
  });

  // Erro de validação do Zod
  if (error instanceof ZodError) {
    const validationErrors = (error as any).errors.map((err: any) => {
      const path = err.path.join('.');
      return `${path}: ${err.message}`;
    });
    
    return reply.status(400).send(
      ResponseHelper.validationError(validationErrors)
    );
  }

  // Erro de domínio customizado
  if (error instanceof DomainError) {
    const statusCode = getStatusCodeFromDomainError(error);
    const response = getResponseFromDomainError(error);
    
    return reply.status(statusCode).send(response);
  }

  // Erro de validação do Fastify
  if (error.validation) {
    const validationErrors = error.validation.map(err => `${err.instancePath}: ${err.message}`);
    
    return reply.status(400).send(
      ResponseHelper.validationError(validationErrors)
    );
  }

  // Erro 404 - Not Found
  if (error.statusCode === 404) {
    return reply.status(404).send(
      ResponseHelper.notFound('Endpoint')
    );
  }

  // Erro 401 - Unauthorized
  if (error.statusCode === 401) {
    return reply.status(401).send(
      ResponseHelper.unauthorized()
    );
  }

  // Erro 403 - Forbidden
  if (error.statusCode === 403) {
    return reply.status(403).send(
      ResponseHelper.error('Acesso negado', ['FORBIDDEN'])
    );
  }

  // Erro 429 - Too Many Requests
  if (error.statusCode === 429) {
    return reply.status(429).send(
      ResponseHelper.error('Muitas solicitações', ['TOO_MANY_REQUESTS'])
    );
  }

  // Erro 413 - Payload Too Large
  if (error.statusCode === 413) {
    return reply.status(413).send(
      ResponseHelper.error('Payload muito grande', ['PAYLOAD_TOO_LARGE'])
    );
  }

  // Outros erros HTTP conhecidos
  if (error.statusCode && error.statusCode >= 400 && error.statusCode < 500) {
    return reply.status(error.statusCode).send(
      ResponseHelper.error(error.message || 'Erro na requisição', [error.code || 'CLIENT_ERROR'])
    );
  }

  // Erro interno do servidor
  return reply.status(500).send(
    ResponseHelper.internalServerError(error)
  );
}

/**
 * Mapeia códigos de erro de domínio para status codes HTTP
 */
function getStatusCodeFromDomainError(error: DomainError): number {
  switch (error.code) {
    case 'USER_NOT_FOUND':
    case 'FINANCIAL_ACCOUNT_NOT_FOUND':
    case 'TRANSACTION_NOT_FOUND':
    case 'CREDIT_CARD_NOT_FOUND':
    case 'DEBT_NOT_FOUND':
    case 'NEGOTIATION_NOT_FOUND':
    case 'CATEGORY_NOT_FOUND':
      return 404;

    case 'USER_ALREADY_EXISTS':
    case 'INVALID_CREDENTIALS':
    case 'INVALID_PASSWORD':
    case 'EMAIL_ALREADY_EXISTS':
      return 400;

    case 'UNAUTHORIZED':
    case 'INVALID_TOKEN':
    case 'TOKEN_EXPIRED':
      return 401;

    case 'FORBIDDEN':
    case 'INSUFFICIENT_PERMISSIONS':
      return 403;

    case 'VALIDATION_ERROR':
    case 'INVALID_EMAIL':
    case 'WEAK_PASSWORD':
    case 'PAYMENT_EXCEEDS_DEBT':
    case 'DEBTS_NOT_FOUND':
      return 422;

    default:
      return 400;
  }
}

/**
 * Mapeia erros de domínio para respostas padronizadas
 */
function getResponseFromDomainError(error: DomainError) {
  switch (error.code) {
    case 'USER_NOT_FOUND':
      return ResponseHelper.notFound('Usuário');

    case 'FINANCIAL_ACCOUNT_NOT_FOUND':
      return ResponseHelper.notFound('Conta financeira');

    case 'TRANSACTION_NOT_FOUND':
      return ResponseHelper.notFound('Transação');

    case 'CREDIT_CARD_NOT_FOUND':
      return ResponseHelper.notFound('Cartão de crédito');

    case 'DEBT_NOT_FOUND':
      return ResponseHelper.notFound('Dívida');

    case 'NEGOTIATION_NOT_FOUND':
      return ResponseHelper.notFound('Negociação');

    case 'CATEGORY_NOT_FOUND':
      return ResponseHelper.notFound('Categoria');

    case 'UNAUTHORIZED':
    case 'INVALID_TOKEN':
    case 'TOKEN_EXPIRED':
      return ResponseHelper.unauthorized();

    default:
      return ResponseHelper.error(error.message, [error.code]);
  }
}

/**
 * Handler específico para erros de rota não encontrada
 */
export async function notFoundHandler(request: FastifyRequest, reply: FastifyReply) {
  return reply.status(404).send(
    ResponseHelper.notFound(`Endpoint ${request.method} ${request.url}`)
  );
}