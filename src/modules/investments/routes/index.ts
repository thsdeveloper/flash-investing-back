import { FastifyPluginAsync } from 'fastify';
import investmentPortfoliosRoutes from "@src/modules/investments/routes/investment-portfolios";
import investmentAssetsRoutes from "@src/modules/investments/routes/investment-assets";
import investmentRecommendationsRoutes from "@src/modules/investments/routes/investment-recommendations";

const investmentsRoutes: FastifyPluginAsync = async function (fastify) {
  await fastify.register(investmentPortfoliosRoutes, { prefix: '/portfolios' });
  await fastify.register(investmentAssetsRoutes, { prefix: '/assets' });
  await fastify.register(investmentRecommendationsRoutes, { prefix: '/recommendations' });
};

export default investmentsRoutes;
export const autoPrefix = '/investments';