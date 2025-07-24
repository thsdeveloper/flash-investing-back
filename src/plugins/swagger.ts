import fp from 'fastify-plugin';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import { env } from '../infrastructure/config/env';

export default fp(async function (fastify) {
  // Register Swagger
  await fastify.register(fastifySwagger, {
    openapi: {
      openapi: '3.0.0',
      info: {
        title: 'Flash Investing API',
        description: 'API documentation for Flash Investing backend',
        version: '1.0.0'
      },
      servers: [
        {
          url: `http://localhost:${env.PORT}`,
          description: 'Development server'
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
    transform: ({ schema, url }) => {
      // Add examples to specific endpoints
      if (url === '/auth/register' && schema.body) {
        (schema.body as any).example = {
          name: 'João Silva',
          email: 'joao.silva@email.com',
          password: 'senhaSegura123'
        };
      }
      if (url === '/auth/login' && schema.body) {
        (schema.body as any).example = {
          email: 'joao.silva@email.com',
          password: 'senhaSegura123'
        };
      }
      return { schema, url };
    }
  });

  // Register Swagger UI
  await fastify.register(fastifySwaggerUi, {
    routePrefix: '/documentation',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
      persistAuthorization: true,
      displayRequestDuration: true,
      tryItOutEnabled: true
    },
    staticCSP: true,
    transformSpecificationClone: true
  });
}, {
  name: 'swagger-plugin'
});