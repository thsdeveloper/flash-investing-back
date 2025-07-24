import fp from 'fastify-plugin';
import { connectDatabase, prisma } from '../infrastructure/database/prisma-client';

export default fp(async function (fastify) {
  await connectDatabase();
  
  // Check if prisma decorator already exists to prevent duplicate decoration
  if (!fastify.hasDecorator('prisma')) {
    fastify.decorate('prisma', prisma);
  }
  
  // Add graceful shutdown
  fastify.addHook('onClose', async () => {
    await prisma.$disconnect();
  });
}, {
  name: 'database-plugin'
});

declare module 'fastify' {
  interface FastifyInstance {
    prisma: typeof prisma;
  }
}