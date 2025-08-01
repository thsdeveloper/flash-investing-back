import { fastify } from 'fastify';
import autoLoad from '@fastify/autoload';
import { join } from 'path';
import { env } from '@src/infrastructure/config/env';

const app = fastify({
  logger: true
});

async function start() {
  try {
    // Auto-load plugins (database, cors, swagger, etc.)
    await app.register(autoLoad, {
      dir: join(__dirname, 'plugins'),
      options: {}
    });

    // Auto-load modular routes
    await app.register(autoLoad, {
      dir: join(__dirname, 'modules'),
      dirNameRoutePrefix: false,
      options: {}
    });

    // Start server
    await app.listen({ port: env.PORT, host: '0.0.0.0' });
    app.log.info(`Server listening on port ${env.PORT}`);
    app.log.info(`Swagger documentation available at http://localhost:${env.PORT}/documentation`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();