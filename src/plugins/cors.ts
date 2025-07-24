import fp from 'fastify-plugin';
import { fastifyCors } from '@fastify/cors';

export default fp(async function (fastify) {
  await fastify.register(fastifyCors, {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  });
}, {
  name: 'cors-plugin'
});