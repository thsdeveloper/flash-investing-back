import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { errorHandlerMiddleware, notFoundHandler } from '@src/modules/shared/infrastructure/middlewares/error-handler-middleware';

/**
 * Plugin para configurar o tratamento de erros global
 */
const errorHandlerPlugin: FastifyPluginAsync = async function (fastify) {
  // Registra o handler de erro global
  fastify.setErrorHandler(errorHandlerMiddleware);

  // Registra o handler para rotas não encontradas
  fastify.setNotFoundHandler(notFoundHandler);

  // Hook para capturar erros não tratados
  fastify.addHook('onError', async (request, reply, error) => {
    // Log adicional para erros críticos
    if (!reply.sent) {
      console.error('Unhandled error in hook:', {
        error: error.message,
        stack: error.stack,
        url: request.url,
        method: request.method,
        headers: request.headers,
        body: request.body
      });
    }
  });

  // Hook para interceptar respostas e garantir que seguem o padrão
  fastify.addHook('onSend', async (request, reply, payload) => {
    // Se a resposta já está no formato padronizado, não modifica
    if (typeof payload === 'string') {
      try {
        const parsed = JSON.parse(payload);
        if (parsed.hasOwnProperty('success') && parsed.hasOwnProperty('meta')) {
          return payload;
        }
      } catch {
        // Se não conseguir fazer parse, continua
      }
    }

    // Se não está no formato padronizado e não é um erro, mantém como está
    // (para compatibilidade com endpoints que ainda não foram migrados)
    return payload;
  });
};

export default fp(errorHandlerPlugin, {
  name: 'error-handler'
});