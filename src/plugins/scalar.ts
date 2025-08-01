import fp from 'fastify-plugin';
import scalarApiReference from '@scalar/fastify-api-reference';
import { env } from '@src/infrastructure/config/env';

export default fp(async function (fastify) {
  // Use the official Scalar plugin with custom configuration
  await fastify.register(scalarApiReference as any, {
    routePrefix: '/scalar',
    configuration: {
      theme: 'kepler',
      title: 'Flash Investing API',
    }
  });

  // Redirect /docs to /scalar for compatibility  
  fastify.get('/docs', async (request, reply) => {
    return reply.redirect('/scalar');
  });

}, {
  name: 'scalar-enhanced-plugin',
  dependencies: ['swagger-plugin']
});