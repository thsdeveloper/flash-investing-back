import { fastify } from 'fastify';
import autoLoad from '@fastify/autoload';
import { join } from 'path';
import { env } from './infrastructure/config/env';

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

    // Auto-load routes
    await app.register(autoLoad, {
      dir: join(__dirname, 'routes'),
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