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
  // Set up type provider
  fastify.setValidatorCompiler(validatorCompiler);
  fastify.setSerializerCompiler(serializerCompiler);

  // Register Swagger
  await fastify.register(fastifySwagger as any, {
    openapi: {
      openapi: '3.0.0',
      info: {
        title: 'Flash Investing API',
        version: '1.0.0',
        contact: {
          name: 'Flash Investing API Support',
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
          description: 'Development server'
        },
        {
          url: 'https://api.flashinvesting.com',
          description: 'Production server'
        },
        {
          url: 'https://staging-api.flashinvesting.com',  
          description: 'Staging server'
        }
      ],
      tags: [
        {
          name: 'Authentication',
          description: '🔐 User authentication, registration, and JWT token management',
          'x-displayName': '🔐 Authentication'
        },
        {
          name: 'Users',
          description: '👤 User profile management and settings',
          'x-displayName': '👤 Users'
        },
        {
          name: 'Financial Accounts',
          description: '🏦 Bank accounts, wallets, and investment account management',
          'x-displayName': '🏦 Financial Accounts'
        },
        {
          name: 'Transactions',
          description: '💸 Income, expense, and transfer transaction management',
          'x-displayName': '💸 Transactions'
        },
        {
          name: 'Financial Categories',
          description: '📂 Transaction categorization and budget rules (50/30/20)',
          'x-displayName': '📂 Financial Categories'
        },
        {
          name: 'Credit Cards',
          description: '💳 Credit card management and invoice tracking',
          'x-displayName': '💳 Credit Cards'
        },
        {
          name: 'Credit Card Transactions',
          description: '🛒 Credit card purchases and payment tracking',
          'x-displayName': '🛒 Credit Card Transactions'
        },
        {
          name: 'Investment Portfolios',
          description: '📊 Investment portfolio creation and management',
          'x-displayName': '📊 Investment Portfolios'
        },
        {
          name: 'Investment Assets',
          description: '💰 Stock, bond, ETF, and crypto asset management',
          'x-displayName': '💰 Investment Assets'
        },
        {
          name: 'Investment Recommendations',
          description: '🎯 AI-powered investment recommendations and analysis',
          'x-displayName': '🎯 Investment Recommendations'
        },
        {
          name: 'Debt Management',
          description: '📋 Debt tracking, payment plans, and negotiation management',
          'x-displayName': '📋 Debt Management'
        },
        {
          name: 'Budget & Finance Settings',
          description: '⚙️ User budget configuration and financial planning',
          'x-displayName': '⚙️ Budget & Finance Settings'
        },
        {
          name: 'External Integrations',
          description: '🔗 Bank integrations via Pluggy/Belvo APIs',
          'x-displayName': '🔗 External Integrations'
        }
      ],
      'x-tagGroups': [
        {
          name: '🔐 Core Authentication',
          tags: ['Authentication', 'Users']
        },
        {
          name: '💰 Financial Management',
          tags: ['Financial Accounts', 'Transactions', 'Financial Categories', 'Budget & Finance Settings']
        },
        {
          name: '💳 Credit & Debt',
          tags: ['Credit Cards', 'Credit Card Transactions', 'Debt Management']
        },
        {
          name: '📊 Investment & Portfolio',
          tags: ['Investment Portfolios', 'Investment Assets', 'Investment Recommendations']
        },
        {
          name: '🔗 External Services',
          tags: ['External Integrations']
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

  // Register Swagger UI
  await fastify.register(fastifySwaggerUi, {
    routePrefix: '/documentation',
    uiConfig: {
      docExpansion: 'list', // Show tags expanded but operations collapsed
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
      // Professional customization
      defaultModelsExpandDepth: 2,
      defaultModelExpandDepth: 2,
      supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch']
    },
    staticCSP: true,
    transformSpecificationClone: true,
    // Custom HTML title and favicon
    uiHooks: {
      onRequest: async (request, reply) => {
        // Add custom headers for professional appearance
        reply.header('x-api-documentation', 'Flash Investing API v1.0.0');
      }
    }
  });
}, {
  name: 'swagger-plugin'
});