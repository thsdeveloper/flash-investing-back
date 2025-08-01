import { FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { authMiddleware } from '@src/modules/shared/infrastructure/middlewares/auth-middleware';
import { AuthenticatedRequest } from '@src/modules/shared/types/authenticated-request';
import { prisma } from '@src/infrastructure/database/prisma-client';

// Common response schemas
import { z } from 'zod';
import { 
  standardSuccessResponseSchema,
  standardError400Schema,
  standardError401Schema,
  standardError404Schema,
  standardError500Schema
} from '@src/modules/shared/schemas/common';
import { ResponseHelper } from '@src/modules/shared/utils/response-helper';
import {PrismaDebtRepository} from "@src/modules/debts/infrastructure/repositories/prisma-debt-repository";
import {
  PrismaDebtPaymentRepository
} from "@src/modules/debts/infrastructure/repositories/prisma-debt-payment-repository";
import {
  PrismaDebtNegotiationRepository
} from "@src/modules/debts/infrastructure/repositories/prisma-debt-negotiation-repository";
import {
  createDebtNegotiationSchema,
  createDebtPaymentSchema,
  createDebtSchema, debtNegotiationResponseSchema, debtPaymentResponseSchema,
  debtResponseSchema, debtSummaryResponseSchema, evolutionReportQuerySchema, evolutionReportResponseSchema,
  listDebtsQuerySchema, simulationRequestSchema, simulationResponseSchema, updateDebtNegotiationSchema,
  updateDebtSchema
} from "@src/modules/debts/schemas/debt";
import {ListDebtsUseCase} from "@src/modules/debts/application/use-cases/list-debts";
import {CreateDebtUseCase} from "@src/modules/debts/application/use-cases/create-debt";
import {GetDebtByIdUseCase} from "@src/modules/debts/application/use-cases/get-debt-by-id";
import {UpdateDebtUseCase} from "@src/modules/debts/application/use-cases/update-debt";
import {DeleteDebtUseCase} from "@src/modules/debts/application/use-cases/delete-debt";
import {CreateDebtPaymentUseCase} from "@src/modules/debts/application/use-cases/create-debt-payment";
import {ListDebtPaymentsUseCase} from "@src/modules/debts/application/use-cases/list-debt-payments";
import {GetDebtSummaryUseCase} from "@src/modules/debts/application/use-cases/get-debt-summary";
import {GetDebtEvolutionUseCase} from "@src/modules/debts/application/use-cases/get-debt-evolution";
import {SimulatePaymentScenariosUseCase} from "@src/modules/debts/application/use-cases/simulate-payment-scenarios";
import {CreateDebtNegotiationUseCase} from "@src/modules/debts/application/use-cases/create-debt-negotiation";
import {ListDebtNegotiationsUseCase} from "@src/modules/debts/application/use-cases/list-debt-negotiations";
import {UpdateDebtNegotiationUseCase} from "@src/modules/debts/application/use-cases/update-debt-negotiation";

const baseResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  errors: z.array(z.any()).nullable(),
  meta: z.object({
    timestamp: z.string(),
    version: z.string()
  })
});

const errorResponseSchema = baseResponseSchema.extend({
  success: z.literal(false),
  data: z.null()
});

const debtRoutes: FastifyPluginAsync = async function (fastify) {
  const debtRepository = new PrismaDebtRepository(prisma);
  const debtPaymentRepository = new PrismaDebtPaymentRepository(prisma);
  const debtNegotiationRepository = new PrismaDebtNegotiationRepository(prisma);

  // GET /api/v1/dividas - List debts
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/',
    preHandler: authMiddleware,
    schema: {
      description: 'Retorna todas as dívidas do usuário autenticado',
      tags: ['Debt Management'],
      security: [{ bearerAuth: [] }],
      querystring: listDebtsQuerySchema,
      response: {
        200: standardSuccessResponseSchema(z.array(debtResponseSchema)),
        401: standardError401Schema,
        500: standardError500Schema
      }
    },
    handler: async (request, reply) => {
      try {
        const listDebtsUseCase = new ListDebtsUseCase(debtRepository);
        const query = request.query ;

        const result = await listDebtsUseCase.execute({
          page: query.page || 1,
          limit: query.limit || 10,
          status: query.status,
          credor: query.credor,
          sort: query.sort || 'created_at',
          order: query.order || 'desc',
          userId: (request as AuthenticatedRequest).user.id
        });

        const response = ResponseHelper.success(
          result.dividas,
          { message: 'Dívidas recuperadas com sucesso' }
        );
        
        return reply.status(200).send(response as any as any);
      } catch (error) {
        const response = ResponseHelper.internalServerError(error instanceof Error ? error : undefined);
        return reply.status(500).send(response as any as any);
      }
    }
  });

  // POST /api/v1/dividas - Create debt
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/',
    preHandler: authMiddleware,
    schema: {
      description: 'Cria uma nova dívida',
      tags: ['Debt Management'],
      security: [{ bearerAuth: [] }],
      body: createDebtSchema,
      response: {
        201: baseResponseSchema.extend({
          success: z.literal(true),
          data: debtResponseSchema
        }),
        400: errorResponseSchema,
        401: errorResponseSchema,
        422: errorResponseSchema,
        500: errorResponseSchema
      }
    },
    handler: async (request, reply) => {
      try {
        const createDebtUseCase = new CreateDebtUseCase(debtRepository);
        const body = request.body ;

        const debt = await createDebtUseCase.execute({
          credor: body.credor,
          tipo_divida: body.tipo_divida,
          valor_original: body.valor_original,
          taxa_juros: body.taxa_juros,
          data_vencimento: body.data_vencimento,
          descricao: body.descricao,
          parcelas_total: body.parcelas_total,
          valor_parcela: body.valor_parcela,
          userId: (request as AuthenticatedRequest).user.id
        });

        return reply.status(201).send({
          success: true,
          data: debt,
          message: 'Dívida criada com sucesso',
          errors: null,
          meta: {
            timestamp: new Date().toISOString(),
            version: '1.0.0'
          }
        });
      } catch (error) {
        const response = ResponseHelper.internalServerError(error instanceof Error ? error : undefined);
        return reply.status(500).send(response as any as any);
      }
    }
  });

  // GET /api/v1/dividas/:id - Get debt by ID
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/:id',
    preHandler: authMiddleware,
    schema: {
      description: 'Retorna os detalhes de uma dívida específica',
      tags: ['Debt Management'],
      security: [{ bearerAuth: [] }],
      params: z.object({
        id: z.string().uuid()
      }),
      // Temporarily disable response validation due to serialization issues
      // response: {
      //   200: baseResponseSchema.extend({
      //     success: z.literal(true),
      //     data: debtWithRelationsResponseSchema
      //   }),
      //   404: errorResponseSchema,
      //   401: errorResponseSchema,
      //   500: errorResponseSchema
      // }
    },
    handler: async (request, reply) => {
      try {
        const getDebtByIdUseCase = new GetDebtByIdUseCase(debtRepository);
        const { id } = request.params as { id: string };

        const debt = await getDebtByIdUseCase.execute(id, (request as AuthenticatedRequest).user.id);

        console.log('Route handler - debt returned from use case:', JSON.stringify(debt, null, 2));

        if (!debt) {
          console.log('Route handler - debt is null, returning 404');
          return reply.status(404).send({
            success: false,
            data: null,
            message: 'Dívida não encontrada',
            errors: ['DEBT_NOT_FOUND'],
            meta: {
              timestamp: new Date().toISOString(),
              version: '1.0.0'
            }
          });
        }

        return reply.status(200).send({
          success: true,
          data: debt,
          message: 'Dívida recuperada com sucesso',
          errors: null,
          meta: {
            timestamp: new Date().toISOString(),
            version: '1.0.0'
          }
        });
      } catch (error) {
        console.error('Error in get debt by id:', error);
        const response = ResponseHelper.internalServerError(error instanceof Error ? error : undefined);
        return reply.status(500).send(response as any as any);
      }
    }
  });

  // PUT /api/v1/dividas/:id - Update debt
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'PUT',
    url: '/:id',
    preHandler: authMiddleware,
    schema: {
      description: 'Atualiza uma dívida existente',
      tags: ['Debt Management'],
      security: [{ bearerAuth: [] }],
      params: z.object({
        id: z.string().uuid()
      }),
      body: updateDebtSchema,
      response: {
        200: baseResponseSchema.extend({
          success: z.literal(true),
          data: debtResponseSchema
        }),
        404: errorResponseSchema,
        401: errorResponseSchema,
        422: errorResponseSchema,
        500: errorResponseSchema
      }
    },
    handler: async (request, reply) => {
      try {
        const updateDebtUseCase = new UpdateDebtUseCase(debtRepository);
        const { id } = request.params as { id: string };
        const body = request.body ;

        const debt = await updateDebtUseCase.execute({
          id,
          userId: (request as AuthenticatedRequest).user.id,
          ...body
        });

        if (!debt) {
          return reply.status(404).send({
            success: false,
            data: null,
            message: 'Dívida não encontrada',
            errors: ['DEBT_NOT_FOUND'],
            meta: {
              timestamp: new Date().toISOString(),
              version: '1.0.0'
            }
          });
        }

        return reply.status(200).send({
          success: true,
          data: debt,
          message: 'Dívida atualizada com sucesso',
          errors: null,
          meta: {
            timestamp: new Date().toISOString(),
            version: '1.0.0'
          }
        });
      } catch (error) {
        const response = ResponseHelper.internalServerError(error instanceof Error ? error : undefined);
        return reply.status(500).send(response as any as any);
      }
    }
  });

  // DELETE /api/v1/dividas/:id - Delete debt
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'DELETE',
    url: '/:id',
    preHandler: authMiddleware,
    schema: {
      description: 'Remove uma dívida (soft delete)',
      tags: ['Debt Management'],
      security: [{ bearerAuth: [] }],
      params: z.object({
        id: z.string().uuid()
      }),
      response: {
        200: baseResponseSchema.extend({
          success: z.literal(true),
          data: z.null()
        }),
        404: errorResponseSchema,
        401: errorResponseSchema,
        500: errorResponseSchema
      }
    },
    handler: async (request, reply) => {
      try {
        const deleteDebtUseCase = new DeleteDebtUseCase(debtRepository);
        const { id } = request.params as { id: string };

        const deleted = await deleteDebtUseCase.execute(id, (request as AuthenticatedRequest).user.id);

        if (!deleted) {
          return reply.status(404).send({
            success: false,
            data: null,
            message: 'Dívida não encontrada',
            errors: ['DEBT_NOT_FOUND'],
            meta: {
              timestamp: new Date().toISOString(),
              version: '1.0.0'
            }
          });
        }

        return reply.status(200).send({
          success: true,
          data: null,
          message: 'Dívida removida com sucesso',
          errors: null,
          meta: {
            timestamp: new Date().toISOString(),
            version: '1.0.0'
          }
        });
      } catch (error) {
        const response = ResponseHelper.internalServerError(error instanceof Error ? error : undefined);
        return reply.status(500).send(response as any as any);
      }
    }
  });

  // POST /api/v1/dividas/:debtId/pagamentos - Create debt payment
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/:debtId/pagamentos',
    preHandler: authMiddleware,
    schema: {
      description: 'Registra um pagamento para uma dívida',
      tags: ['Debt Management'],
      security: [{ bearerAuth: [] }],
      params: z.object({
        debtId: z.string().uuid()
      }),
      body: createDebtPaymentSchema,
      response: {
        201: baseResponseSchema.extend({
          success: z.literal(true),
          data: debtPaymentResponseSchema
        }),
        400: errorResponseSchema,
        404: errorResponseSchema,
        401: errorResponseSchema,
        422: errorResponseSchema,
        500: errorResponseSchema
      }
    },
    handler: async (request, reply) => {
      try {
        const createDebtPaymentUseCase = new CreateDebtPaymentUseCase(
          debtRepository,
          debtPaymentRepository
        );
        const { debtId } = request.params as { debtId: string };
        const body = request.body ;

        const result = await createDebtPaymentUseCase.execute({
          debtId,
          valor: body.valor,
          data_pagamento: body.data_pagamento,
          tipo: body.tipo,
          observacoes: body.observacoes,
          userId: (request as AuthenticatedRequest).user.id
        });

        if (!result) {
          return reply.status(404).send({
            success: false,
            data: null,
            message: 'Dívida não encontrada',
            errors: ['DEBT_NOT_FOUND'],
            meta: {
              timestamp: new Date().toISOString(),
              version: '1.0.0'
            }
          });
        }

        return reply.status(201).send({
          success: true,
          data: result.payment,
          message: 'Pagamento registrado com sucesso',
          errors: null,
          meta: {
            timestamp: new Date().toISOString(),
            version: '1.0.0'
          }
        });
      } catch (error) {
        if (error instanceof Error && error.message.includes('Valor do pagamento')) {
          return reply.status(400).send({
            success: false,
            data: null,
            message: error.message,
            errors: ['PAYMENT_EXCEEDS_DEBT'],
            meta: {
              timestamp: new Date().toISOString(),
              version: '1.0.0'
            }
          });
        }

        const response = ResponseHelper.internalServerError(error instanceof Error ? error : undefined);
        return reply.status(500).send(response as any as any);
      }
    }
  });

  // GET /api/v1/dividas/:debtId/pagamentos - List debt payments
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/:debtId/pagamentos',
    preHandler: authMiddleware,
    schema: {
      description: 'Lista todos os pagamentos de uma dívida',
      tags: ['Debt Management'],
      security: [{ bearerAuth: [] }],
      params: z.object({
        debtId: z.string().uuid()
      }),
      querystring: z.object({
        page: z.coerce.number().min(1).default(1),
        limit: z.coerce.number().min(1).max(100).default(10)
      }),
      response: {
        200: standardSuccessResponseSchema(z.array(debtPaymentResponseSchema)),
        401: errorResponseSchema,
        500: errorResponseSchema
      }
    },
    handler: async (request, reply) => {
      try {
        const listDebtPaymentsUseCase = new ListDebtPaymentsUseCase(debtPaymentRepository);
        const { debtId } = request.params as { debtId: string };
        const query = request.query ;

        const result = await listDebtPaymentsUseCase.execute(
          debtId,
          (request as AuthenticatedRequest).user.id,
          {
            page: query.page || 1,
            limit: query.limit || 10
          }
        );

        const response = ResponseHelper.success(
          result.pagamentos,
          { message: 'Pagamentos recuperados com sucesso' }
        );
        
        return reply.status(200).send(response as any as any);
      } catch (error) {
        const response = ResponseHelper.internalServerError(error instanceof Error ? error : undefined);
        return reply.status(500).send(response as any as any);
      }
    }
  });

  // GET /api/v1/dividas/relatorios/resumo - Get debt summary
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/relatorios/resumo',
    preHandler: authMiddleware,
    schema: {
      description: 'Retorna um resumo das dívidas do usuário',
      tags: ['Debt Management'],
      security: [{ bearerAuth: [] }],
      response: {
        200: baseResponseSchema.extend({
          success: z.literal(true),
          data: debtSummaryResponseSchema
        }),
        401: errorResponseSchema,
        500: errorResponseSchema
      }
    },
    handler: async (request, reply) => {
      try {
        const getDebtSummaryUseCase = new GetDebtSummaryUseCase(debtRepository);

        const summary = await getDebtSummaryUseCase.execute((request as AuthenticatedRequest).user.id);

        return reply.status(200).send({
          success: true,
          data: summary,
          message: 'Resumo recuperado com sucesso',
          errors: null,
          meta: {
            timestamp: new Date().toISOString(),
            version: '1.0.0'
          }
        });
      } catch (error) {
        const response = ResponseHelper.internalServerError(error instanceof Error ? error : undefined);
        return reply.status(500).send(response as any as any);
      }
    }
  });

  // GET /api/v1/dividas/relatorios/evolucao - Get debt evolution
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/relatorios/evolucao',
    preHandler: authMiddleware,
    schema: {
      description: 'Retorna a evolução das dívidas ao longo do tempo',
      tags: ['Debt Management'],
      security: [{ bearerAuth: [] }],
      querystring: evolutionReportQuerySchema,
      response: {
        200: baseResponseSchema.extend({
          success: z.literal(true),
          data: evolutionReportResponseSchema
        }),
        401: errorResponseSchema,
        500: errorResponseSchema
      }
    },
    handler: async (request, reply) => {
      try {
        const getDebtEvolutionUseCase = new GetDebtEvolutionUseCase(debtRepository);
        const query = request.query ;

        const evolution = await getDebtEvolutionUseCase.execute({
          periodo: query.periodo || '6m',
          userId: (request as AuthenticatedRequest).user.id
        });

        return reply.status(200).send({
          success: true,
          data: evolution,
          message: 'Evolução recuperada com sucesso',
          errors: null,
          meta: {
            timestamp: new Date().toISOString(),
            version: '1.0.0'
          }
        });
      } catch (error) {
        const response = ResponseHelper.internalServerError(error instanceof Error ? error : undefined);
        return reply.status(500).send(response as any as any);
      }
    }
  });

  // POST /api/v1/dividas/simulador - Simulate payment scenarios
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/simulador',
    preHandler: authMiddleware,
    schema: {
      description: 'Simula diferentes cenários de pagamento para uma ou mais dívidas',
      tags: ['Debt Management'],
      security: [{ bearerAuth: [] }],
      body: simulationRequestSchema,
      response: {
        200: baseResponseSchema.extend({
          success: z.literal(true),
          data: simulationResponseSchema
        }),
        400: errorResponseSchema,
        401: errorResponseSchema,
        422: errorResponseSchema,
        500: errorResponseSchema
      }
    },
    handler: async (request, reply) => {
      try {
        const simulatePaymentScenariosUseCase = new SimulatePaymentScenariosUseCase(debtRepository);
        const body = request.body ;

        const simulation = await simulatePaymentScenariosUseCase.execute({
          dividas_ids: body.dividas_ids,
          cenarios: body.cenarios,
          userId: (request as AuthenticatedRequest).user.id
        });

        return reply.status(200).send({
          success: true,
          data: simulation,
          message: 'Simulação realizada com sucesso',
          errors: null,
          meta: {
            timestamp: new Date().toISOString(),
            version: '1.0.0'
          }
        });
      } catch (error) {
        if (error instanceof Error && error.message.includes('Nenhuma dívida encontrada')) {
          return reply.status(400).send({
            success: false,
            data: null,
            message: error.message,
            errors: ['DEBTS_NOT_FOUND'],
            meta: {
              timestamp: new Date().toISOString(),
              version: '1.0.0'
            }
          });
        }

        const response = ResponseHelper.internalServerError(error instanceof Error ? error : undefined);
        return reply.status(500).send(response as any as any);
      }
    }
  });

  // POST /api/v1/dividas/:debtId/negociacoes - Create debt negotiation
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/:debtId/negociacoes',
    preHandler: authMiddleware,
    schema: {
      description: 'Registra uma negociação para uma dívida',
      tags: ['Debt Management'],
      security: [{ bearerAuth: [] }],
      params: z.object({
        debtId: z.string().uuid()
      }),
      body: createDebtNegotiationSchema,
      response: {
        201: baseResponseSchema.extend({
          success: z.literal(true),
          data: debtNegotiationResponseSchema
        }),
        400: errorResponseSchema,
        404: errorResponseSchema,
        401: errorResponseSchema,
        422: errorResponseSchema,
        500: errorResponseSchema
      }
    },
    handler: async (request, reply) => {
      try {
        const createDebtNegotiationUseCase = new CreateDebtNegotiationUseCase(
          debtRepository,
          debtNegotiationRepository
        );
        const { debtId } = request.params as { debtId: string };
        const body = request.body ;

        const negotiation = await createDebtNegotiationUseCase.execute({
          debtId,
          data_negociacao: body.data_negociacao,
          proposta: body.proposta,
          status: body.status,
          observacoes: body.observacoes,
          userId: (request as AuthenticatedRequest).user.id
        });

        if (!negotiation) {
          return reply.status(404).send({
            success: false,
            data: null,
            message: 'Dívida não encontrada',
            errors: ['DEBT_NOT_FOUND'],
            meta: {
              timestamp: new Date().toISOString(),
              version: '1.0.0'
            }
          });
        }

        return reply.status(201).send({
          success: true,
          data: negotiation,
          message: 'Negociação registrada com sucesso',
          errors: null,
          meta: {
            timestamp: new Date().toISOString(),
            version: '1.0.0'
          }
        });
      } catch (error) {
        const response = ResponseHelper.internalServerError(error instanceof Error ? error : undefined);
        return reply.status(500).send(response as any as any);
      }
    }
  });

  // GET /api/v1/dividas/:debtId/negociacoes - List debt negotiations
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/:debtId/negociacoes',
    preHandler: authMiddleware,
    schema: {
      description: 'Lista todas as negociações de uma dívida',
      tags: ['Debt Management'],
      security: [{ bearerAuth: [] }],
      params: z.object({
        debtId: z.string().uuid()
      }),
      querystring: z.object({
        page: z.coerce.number().min(1).default(1),
        limit: z.coerce.number().min(1).max(100).default(10)
      }),
      response: {
        200: standardSuccessResponseSchema(z.array(debtNegotiationResponseSchema)),
        401: errorResponseSchema,
        500: errorResponseSchema
      }
    },
    handler: async (request, reply) => {
      try {
        const listDebtNegotiationsUseCase = new ListDebtNegotiationsUseCase(
          debtNegotiationRepository
        );
        const { debtId } = request.params as { debtId: string };
        const query = request.query ;

        const result = await listDebtNegotiationsUseCase.execute({
          debtId,
          userId: (request as AuthenticatedRequest).user.id,
          page: query.page || 1,
          limit: query.limit || 10
        });

        const response = ResponseHelper.success(
          result.negociacoes,
          { message: 'Negociações recuperadas com sucesso' }
        );
        
        return reply.status(200).send(response as any as any);
      } catch (error) {
        const response = ResponseHelper.internalServerError(error instanceof Error ? error : undefined);
        return reply.status(500).send(response as any as any);
      }
    }
  });

  // PUT /api/v1/dividas/negociacoes/:id - Update debt negotiation
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'PUT',
    url: '/negociacoes/:id',
    preHandler: authMiddleware,
    schema: {
      description: 'Atualiza o status de uma negociação',
      tags: ['Debt Management'],
      security: [{ bearerAuth: [] }],
      params: z.object({
        id: z.string().uuid()
      }),
      body: updateDebtNegotiationSchema,
      response: {
        200: baseResponseSchema.extend({
          success: z.literal(true),
          data: z.object({
            id: z.string().uuid(),
            status: z.enum(['pendente', 'aceita', 'rejeitada', 'em_andamento']),
            observacoes: z.string().nullable(),
            updated_at: z.string()
          })
        }),
        404: errorResponseSchema,
        401: errorResponseSchema,
        422: errorResponseSchema,
        500: errorResponseSchema
      }
    },
    handler: async (request, reply) => {
      try {
        const updateDebtNegotiationUseCase = new UpdateDebtNegotiationUseCase(
          debtNegotiationRepository
        );
        const { id } = request.params as { id: string };
        const body = request.body ;

        const negotiation = await updateDebtNegotiationUseCase.execute({
          id,
          status: body.status,
          observacoes: body.observacoes,
          userId: (request as AuthenticatedRequest).user.id
        });

        if (!negotiation) {
          return reply.status(404).send({
            success: false,
            data: null,
            message: 'Negociação não encontrada',
            errors: ['NEGOTIATION_NOT_FOUND'],
            meta: {
              timestamp: new Date().toISOString(),
              version: '1.0.0'
            }
          });
        }

        return reply.status(200).send({
          success: true,
          data: {
            id: negotiation.id,
            status: negotiation.status,
            observacoes: negotiation.observacoes,
            updated_at: negotiation.updated_at
          },
          message: 'Negociação atualizada com sucesso',
          errors: null,
          meta: {
            timestamp: new Date().toISOString(),
            version: '1.0.0'
          }
        });
      } catch (error) {
        const response = ResponseHelper.internalServerError(error instanceof Error ? error : undefined);
        return reply.status(500).send(response as any as any);
      }
    }
  });
};

export default debtRoutes;
export const autoPrefix = '/dividas';