import fp from 'fastify-plugin';
import fastifySwagger, { SwaggerOptions } from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import { env } from '@src/infrastructure/config/env';
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler
} from 'fastify-type-provider-zod';

export default fp(async function (fastify) {
  // Configurar provedor de tipos
  fastify.setValidatorCompiler(validatorCompiler);
  fastify.setSerializerCompiler(serializerCompiler);

  // Registrar Swagger
  await fastify.register(fastifySwagger as any, {
    openapi: {
      openapi: '3.0.0',
      info: {
        title: 'Flash Investing API',
        description: 'API completa para gestão financeira pessoal, investimentos e controle de orçamento',
        version: '1.0.0',
        contact: {
          name: 'Suporte Flash Investing API',
          email: 'support@flashinvesting.com',
          url: 'https://flashinvesting.com/support'
        },
        license: {
          name: 'MIT',
          url: 'https://opensource.org/licenses/MIT'
        },
        termsOfService: 'https://flashinvesting.com/terms'
      },
      servers: [
        {
          url: `http://localhost:${env.PORT}`,
          description: 'Servidor Local'
        },
        {
          url: 'https://flash-investing-back-develop.up.railway.app',
          description: 'Servidor de desenvolvimento'
        }
      ],
      tags: [
        {
          name: 'Authentication',
          description: '🔐 Autenticação de usuários, registro e gerenciamento de tokens JWT',
          'x-displayName': '🔐 Autenticação'
        },
        {
          name: 'Users',
          description: '👤 Gerenciamento de perfil do usuário e configurações',
          'x-displayName': '👤 Usuários'
        },
        {
          name: 'Financial Accounts',
          description: '🏦 Gerenciamento de contas bancárias, carteiras e contas de investimento',
          'x-displayName': '🏦 Contas'
        },
        {
          name: 'Transactions',
          description: '💸 Gerenciamento de transações de receita, despesa e transferência',
          'x-displayName': '💸 Transações'
        },
        {
          name: 'Financial Categories',
          description: '📂 Categorização de transações e regras de orçamento (50/30/20)',
          'x-displayName': '📂 Categorias'
        },
        {
          name: 'Credit Cards',
          description: '💳 Gerenciamento de cartões de crédito e rastreamento de faturas',
          'x-displayName': '💳 Cartões de Crédito'
        },
        {
          name: 'Credit Card Transactions',
          description: '🛒 Compras com cartão de crédito e rastreamento de pagamentos',
          'x-displayName': '🛒 Transações de Cartão'
        },
        {
          name: 'Investment Portfolios',
          description: '📊 Criação e gerenciamento de portfólios de investimento',
          'x-displayName': '📊 Portfólios'
        },
        {
          name: 'Investment Assets',
          description: '💰 Gerenciamento de ações, títulos, ETFs e criptomoedas',
          'x-displayName': '💰 Ativos'
        },
        {
          name: 'Investment Recommendations',
          description: '🎯 Recomendações de investimento e análises com IA',
          'x-displayName': '🎯 Recomendações'
        },
        {
          name: 'Debt Management',
          description: '📋 Rastreamento de dívidas, planos de pagamento e gerenciamento de negociações',
          'x-displayName': '📋 Dívidas'
        },
        {
          name: 'Budget & Finance Settings',
          description: '⚙️ Configuração de orçamento do usuário e planejamento financeiro',
          'x-displayName': '⚙️ Configurações de Orçamento'
        },
      ],
      'x-tagGroups': [
        {
          name: '🔐 Autenticação/Users',
          tags: ['Authentication', 'Users']
        },
        {
          name: '💰 Gestão Financeira',
          tags: ['Financial Accounts', 'Transactions', 'Financial Categories', 'Budget & Finance Settings', 'Credit Cards', 'Credit Card Transactions', 'Debt Management']
        },
        {
          name: '📊 Investimentos',
          tags: ['Investment Portfolios', 'Investment Assets', 'Investment Recommendations']
        }
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        }
      }
    },
    transform: jsonSchemaTransform
  });

  // Registrar Swagger UI
  await fastify.register(fastifySwaggerUi, {
    routePrefix: '/documentation',
    uiConfig: {
      docExpansion: 'list', // Mostrar tags expandidas mas operações colapsadas
      deepLinking: true,
      persistAuthorization: true,
      displayRequestDuration: true,
      tryItOutEnabled: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      displayOperationId: false,
      showExtensions: true,
      showCommonExtensions: true,
      filter: true,
      // Customização profissional
      defaultModelsExpandDepth: 2,
      defaultModelExpandDepth: 2,
      supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch']
    },
    staticCSP: true,
    transformSpecificationClone: true,
    // Título HTML customizado e favicon
    uiHooks: {
      onRequest: async (request, reply) => {
        // Adiciona cabeçalhos customizados para aparência profissional
        reply.header('x-api-documentation', 'Flash Investing API v1.0.0');
      }
    }
  });
}, {
  name: 'swagger-plugin'
});