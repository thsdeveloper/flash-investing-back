import { FastifyPluginAsync } from 'fastify';
import creditCardRoutes from './credit-cards';
import creditCardTransactionRoutes from './credit-card-transactions';

const creditCardModuleRoutes: FastifyPluginAsync = async function (fastify) {
  // Registrar rotas de CRUD de cartões de crédito
  await fastify.register(creditCardRoutes, { prefix: '/credit-cards' });
  
  // Registrar rotas de transações de cartão de crédito
  await fastify.register(creditCardTransactionRoutes, { prefix: '/credit-card-transactions' });
};

export default creditCardModuleRoutes;
export const autoPrefix = '';  // Sem prefixo pois já definimos dentro do plugin