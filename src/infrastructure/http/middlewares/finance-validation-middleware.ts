import { FastifyReply, FastifyRequest, preHandlerHookHandler } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { FinanceBusinessRules } from '../../../domain/services/finance-business-rules'
import { UserFinanceSettings } from '../../../domain/entities/user-finance-settings'
import { FinancialCategory } from '../../../domain/entities/financial-category'
import { FinancialAccount } from '../../../domain/entities/financial-account'
import { AuthenticatedRequest } from '../../../shared/types/authenticated-request'

export class FinanceValidationMiddleware {
  constructor(private prisma: PrismaClient) {}

  /**
   * Middleware para validar criação de categorias
   */
  validateCategoryCreation: preHandlerHookHandler = async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    try {
      const { ruleCategory } = request.body as { ruleCategory: 'necessidades' | 'desejos' | 'futuro' }
      
      // Buscar configurações de orçamento do usuário
      const userFinanceSettingsData = await this.prisma.userFinanceSettings.findFirst({
        where: { userId: (request as AuthenticatedRequest).user.id }
      })

      let userFinanceSettings: UserFinanceSettings | null = null
      if (userFinanceSettingsData) {
        userFinanceSettings = UserFinanceSettings.create({
          id: userFinanceSettingsData.id,
          salary: Number(userFinanceSettingsData.salary),
          fixed: userFinanceSettingsData.fixed,
          variable: userFinanceSettingsData.variable,
          investments: userFinanceSettingsData.investments,
          userId: userFinanceSettingsData.userId,
          createdAt: userFinanceSettingsData.createdAt,
          updatedAt: userFinanceSettingsData.updatedAt
        })
      }

      // Aplicar regras de negócio
      FinanceBusinessRules.validateCategoryCreation(userFinanceSettings, ruleCategory)
      
    } catch (error) {
      reply.status(400).send({ 
        error: error instanceof Error ? error.message : 'Erro de validação' 
      })
      return reply
    }
  }

  /**
   * Middleware para validar criação de transações
   */
  validateTransactionCreation: preHandlerHookHandler = async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    try {
      let { 
        contaFinanceiraId, 
        categoria, 
        categoriaId,
        valor, 
        tipo 
      } = request.body as { 
        contaFinanceiraId?: string
        categoria?: string  // Mantido para compatibilidade
        categoriaId?: string  // Nova FK
        valor: number
        tipo: 'receita' | 'despesa' | 'transferencia'
      }
      
      // Se categoria for um UUID, mapear para categoriaId
      if (categoria && 
          typeof categoria === 'string' &&
          categoria.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        categoriaId = categoria
        categoria = undefined
      }

      // Buscar conta financeira
      let account: FinancialAccount | null = null
      if (contaFinanceiraId) {
        const accountData = await this.prisma.financialAccount.findFirst({
          where: { 
            id: contaFinanceiraId,
            userId: (request as AuthenticatedRequest).user.id 
          }
        })

        if (accountData) {
          account = new FinancialAccount({
            id: accountData.id,
            nome: accountData.nome,
            tipo: accountData.tipo as any,
            instituicao: accountData.instituicao || undefined,
            saldoInicial: Number(accountData.saldoInicial),
            saldoAtual: Number(accountData.saldoAtual),
            cor: accountData.cor || undefined,
            icone: accountData.icone || undefined,
            ativa: accountData.ativa,
            observacoes: accountData.observacoes || undefined,
            userId: accountData.userId,
            createdAt: accountData.createdAt,
            updatedAt: accountData.updatedAt
          })
        }
      }

      // Buscar categoria
      let categoryEntity: FinancialCategory | null = null
      let categoryData: any = null // Move to broader scope
      const categoryIdentifier = categoriaId || categoria  // Priorizar categoriaId
      
      if (categoryIdentifier) {
        console.log(`🔍 [validateTransactionCreation] Usando: ${categoriaId ? 'categoriaId (FK)' : 'categoria (nome)'}`)
        console.log(`🔍 [validateTransactionCreation] Tipo: ${typeof categoryIdentifier}`)
        console.log(`🔍 [validateTransactionCreation] É UUID?: ${categoryIdentifier.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i) !== null}`)
        
        // Buscar categoria
        if (categoriaId) {
          // Se foi fornecido categoriaId, buscar diretamente por ID
          categoryData = await this.prisma.financialCategory.findUnique({
            where: { id: categoriaId }
          })
          // Verificar se pertence ao usuário
          if (categoryData && categoryData.userId !== (request as AuthenticatedRequest).user.id) {
            categoryData = null
          }
        } else {
          // Se foi fornecido categoria (nome), buscar por nome ou ID (compatibilidade)
          categoryData = await this.prisma.financialCategory.findFirst({
            where: { 
              userId: (request as AuthenticatedRequest).user.id,
              OR: [
                { id: categoria },      // Buscar por ID se for UUID
                { nome: categoria }     // Buscar por nome se for string
              ]
            }
          })
        }

        console.log(`[DEBUG] Categoria encontrada:`, categoryData ? 'Sim' : 'Não')
        
        // Debug adicional se não encontrar
        if (!categoryData) {
          const totalCategories = await this.prisma.financialCategory.count({
            where: { userId: (request as AuthenticatedRequest).user.id }
          })
          console.log(`[DEBUG] Total de categorias do usuário: ${totalCategories}`)
        }
        
        if (categoryData) {
          console.log('🏷️ [DEBUG] Criando entidade categoria:', {
            id: categoryData.id,
            nome: categoryData.nome,
            ruleCategory: categoryData.ruleCategory,
            tipo: categoryData.tipo
          })
          
          categoryEntity = FinancialCategory.create({
            id: categoryData.id,
            nome: categoryData.nome,
            descricao: categoryData.descricao || undefined,
            icone: categoryData.icone || undefined,
            cor: categoryData.cor || undefined,
            tipo: categoryData.tipo as 'receita' | 'despesa',
            ativa: categoryData.ativa,
            ruleCategory: categoryData.ruleCategory as any,
            sort: categoryData.sort ? Number(categoryData.sort) : 0,
            status: categoryData.status as any,
            userId: categoryData.userId,
            createdAt: categoryData.createdAt,
            updatedAt: categoryData.updatedAt
          })
          
          console.log('✅ [DEBUG] Entidade criada com ruleCategory:', categoryEntity.getRuleCategory())
        }
      }

      // Aplicar regras de negócio
      FinanceBusinessRules.validateTransactionCreation(account, categoryEntity, valor, tipo)

      // Validar orçamento se for despesa
      console.log('🔍 [DEBUG] Verificando se precisa validar orçamento:', {
        tipo,
        temCategoryEntity: !!categoryEntity,
        ruleCategory: categoryEntity?.getRuleCategory()
      })
      
      if (tipo === 'despesa' && categoryEntity && categoryEntity.getRuleCategory()) {
        console.log('💰 [DEBUG] Iniciando validação de orçamento...')
        const userFinanceSettingsData = await this.prisma.userFinanceSettings.findFirst({
          where: { userId: (request as AuthenticatedRequest).user.id }
        })

        if (userFinanceSettingsData) {
          const userFinanceSettings = UserFinanceSettings.create({
            id: userFinanceSettingsData.id,
            salary: Number(userFinanceSettingsData.salary),
            fixed: userFinanceSettingsData.fixed,
            variable: userFinanceSettingsData.variable,
            investments: userFinanceSettingsData.investments,
            userId: userFinanceSettingsData.userId,
            createdAt: userFinanceSettingsData.createdAt,
            updatedAt: userFinanceSettingsData.updatedAt
          })

          // Calcular gastos atuais da categoria no mês
          const now = new Date()
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
          const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

          // Buscar gastos atuais da categoria - usar FK se disponível
          let currentSpentQuery
          if (categoriaId) {
            currentSpentQuery = {
              userId: (request as AuthenticatedRequest).user.id,
              categoriaId: categoriaId,
              tipo: 'despesa' as const,
              data: {
                gte: startOfMonth,
                lte: endOfMonth
              }
            }
          } else {
            currentSpentQuery = {
              userId: (request as AuthenticatedRequest).user.id,
              OR: [
                { categoria: categoria },
                { categoriaId: categoryData?.id }
              ].filter(Boolean),
              tipo: 'despesa' as const,
              data: {
                gte: startOfMonth,
                lte: endOfMonth
              }
            }
          }
          
          const currentSpent = await this.prisma.transaction.aggregate({
            where: currentSpentQuery,
            _sum: {
              valor: true
            }
          })

          const currentSpentValue = currentSpent._sum?.valor ? Number(currentSpent._sum.valor) : 0
          const budgets = userFinanceSettings.calculateBudgets()
          
          console.log('💰 [DEBUG] Validação de orçamento:', {
            categoria: categoryEntity.getRuleCategory(),
            gastoAtual: currentSpentValue,
            novaTransacao: valor,
            total: currentSpentValue + valor,
            orcamento: categoryEntity.getRuleCategory() === 'necessidades' ? budgets.fixed : 
                      categoryEntity.getRuleCategory() === 'desejos' ? budgets.variable : budgets.investments,
            limite110: (categoryEntity.getRuleCategory() === 'necessidades' ? budgets.fixed : 
                       categoryEntity.getRuleCategory() === 'desejos' ? budgets.variable : budgets.investments) * 1.1
          })

          const budgetCheck = FinanceBusinessRules.validateBudgetCompliance(
            userFinanceSettings,
            categoryEntity.getRuleCategory()!,
            currentSpentValue,
            valor
          )

          if (!budgetCheck.isValid) {
            return reply.status(400).send({ 
              error: budgetCheck.message,
              budgetInfo: {
                percentage: budgetCheck.percentage,
                exceeded: true
              }
            })
          }

          // Se passou na validação mas tem aviso, adicionar ao contexto
          if (budgetCheck.percentage > 80) {
            (request as any).budgetWarning = budgetCheck.message
          }
        }
      }

    } catch (error) {
      reply.status(400).send({ 
        error: error instanceof Error ? error.message : 'Erro de validação' 
      })
      return reply
    }
  }

  /**
   * Middleware para validar se usuário tem orçamento configurado
   */
  validateBudgetRequired: preHandlerHookHandler = async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    try {
      const userFinanceSettings = await this.prisma.userFinanceSettings.findFirst({
        where: { userId: (request as AuthenticatedRequest).user.id }
      })

      if (!userFinanceSettings) {
        return reply.status(400).send({ 
          error: 'Para usar esta funcionalidade, primeiro configure seu orçamento mensal',
          action: 'configure_budget',
          redirect: '/api/user-finance-settings'
        })
      }

    } catch (error) {
      return reply.status(500).send({ 
        error: 'Erro ao verificar configurações de orçamento' 
      })
    }
  }

  /**
   * Middleware para validar se usuário tem pelo menos uma conta
   */
  validateAccountRequired: preHandlerHookHandler = async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    try {
      // Verificar contas ativas
      const activeAccountCount = await this.prisma.financialAccount.count({
        where: { 
          userId: (request as AuthenticatedRequest).user.id,
          ativa: true
        }
      })

      // Debug: verificar todas as contas (ativas e inativas)
      const totalAccountCount = await this.prisma.financialAccount.count({
        where: { 
          userId: (request as AuthenticatedRequest).user.id
        }
      })

      console.log(`[DEBUG] User ID: ${(request as AuthenticatedRequest).user.id}`)
      console.log(`[DEBUG] Total accounts: ${totalAccountCount}`)
      console.log(`[DEBUG] Active accounts: ${activeAccountCount}`)

      if (activeAccountCount === 0) {
        let errorMessage = 'Transação deve estar vinculada a uma conta. Crie uma conta primeiro.'
        
        if (totalAccountCount > 0) {
          errorMessage = `Você tem ${totalAccountCount} conta(s) inativa(s). Ative pelo menos uma conta para criar transações.`
        }
        
        return reply.status(400).send({ 
          error: errorMessage,
          action: totalAccountCount > 0 ? 'activate_account' : 'create_account',
          redirect: '/api/financial-accounts'
        })
      }

    } catch (error) {
      console.error('[DEBUG] Error in validateAccountRequired:', error)
      return reply.status(500).send({ 
        error: 'Erro ao verificar contas financeiras' 
      })
    }
  }

  /**
   * Middleware para validar exclusão de categoria
   */
  validateCategoryDeletion: preHandlerHookHandler = async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    try {
      const { id } = request.params as { id: string }
      console.log('🔍 [validateCategoryDeletion] Validando exclusão da categoria:', id)

      // Buscar categoria
      const categoryData = await this.prisma.financialCategory.findFirst({
        where: { 
          id,
          userId: (request as AuthenticatedRequest).user.id 
        }
      })

      if (!categoryData) {
        console.log('❌ [validateCategoryDeletion] Categoria não encontrada:', id)
        return reply.status(404).send({ error: 'Categoria não encontrada' })
      }

      console.log('✅ [validateCategoryDeletion] Categoria encontrada:', {
        id: categoryData.id,
        nome: categoryData.nome,
        userId: categoryData.userId
      })

      const category = FinancialCategory.create({
        id: categoryData.id,
        nome: categoryData.nome,
        descricao: categoryData.descricao || undefined,
        icone: categoryData.icone || undefined,
        cor: categoryData.cor || undefined,
        tipo: categoryData.tipo as 'receita' | 'despesa',
        ativa: categoryData.ativa,
        ruleCategory: categoryData.ruleCategory as any,
        sort: categoryData.sort ? Number(categoryData.sort) : 0,
        status: categoryData.status as any,
        userId: categoryData.userId,
        createdAt: categoryData.createdAt,
        updatedAt: categoryData.updatedAt
      })

      // Verificar se tem transações associadas usando a FK categoriaId
      const transactionCount = await this.prisma.transaction.count({
        where: { 
          categoriaId: categoryData.id,
          userId: (request as AuthenticatedRequest).user.id 
        }
      })
      
      // Verificar também por nome (campo legado) para compatibilidade
      const transactionCountByName = await this.prisma.transaction.count({
        where: { 
          categoria: categoryData.nome,
          userId: (request as AuthenticatedRequest).user.id 
        }
      })
      
      console.log('📊 [validateCategoryDeletion] Transações encontradas:', {
        porFK: transactionCount,
        porNome: transactionCountByName,
        categoriaId: categoryData.id,
        categoriaNome: categoryData.nome
      })

      // Verificar transações em cartão de crédito também
      const creditCardTransactionCount = await this.prisma.creditCardTransaction.count({
        where: { 
          categoriaId: categoryData.id,
          userId: (request as AuthenticatedRequest).user.id 
        }
      })
      
      const creditCardTransactionCountByName = await this.prisma.creditCardTransaction.count({
        where: { 
          categoria: categoryData.nome,
          userId: (request as AuthenticatedRequest).user.id 
        }
      })
      
      console.log('💳 [validateCategoryDeletion] Transações de cartão encontradas:', {
        porFK: creditCardTransactionCount,
        porNome: creditCardTransactionCountByName
      })

      const totalTransactions = transactionCount + transactionCountByName + 
                               creditCardTransactionCount + creditCardTransactionCountByName
                               
      console.log('📈 [validateCategoryDeletion] Total de transações:', totalTransactions)

      // Aplicar regras de negócio
      FinanceBusinessRules.validateCategoryDeletion(category, totalTransactions > 0)
      
      console.log('✅ [validateCategoryDeletion] Validação passou, categoria pode ser excluída')

    } catch (error) {
      console.log('❌ [validateCategoryDeletion] Erro na validação:', error instanceof Error ? error.message : 'Erro desconhecido')
      return reply.status(400).send({ 
        error: error instanceof Error ? error.message : 'Erro de validação' 
      })
    }
  }

  /**
   * Middleware para validar exclusão de conta
   */
  validateAccountDeletion: preHandlerHookHandler = async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    try {
      const { id } = request.params as { id: string }

      // Buscar conta
      const accountData = await this.prisma.financialAccount.findFirst({
        where: { 
          id,
          userId: (request as AuthenticatedRequest).user.id 
        }
      })

      if (!accountData) {
        return reply.status(404).send({ error: 'Conta não encontrada' })
      }

      const account = new FinancialAccount({
        id: accountData.id,
        nome: accountData.nome,
        tipo: accountData.tipo as any,
        instituicao: accountData.instituicao || undefined,
        saldoInicial: Number(accountData.saldoInicial),
        saldoAtual: Number(accountData.saldoAtual),
        cor: accountData.cor || undefined,
        icone: accountData.icone || undefined,
        ativa: accountData.ativa,
        observacoes: accountData.observacoes || undefined,
        userId: accountData.userId,
        createdAt: accountData.createdAt,
        updatedAt: accountData.updatedAt
      })

      // Verificar se tem transações associadas
      const transactionCount = await this.prisma.transaction.count({
        where: { 
          contaFinanceiraId: id,
          userId: (request as AuthenticatedRequest).user.id 
        }
      })

      // Verificar se tem cartões associados
      const creditCardCount = await this.prisma.creditCard.count({
        where: { 
          contaFinanceiraId: id,
          userId: (request as AuthenticatedRequest).user.id 
        }
      })

      // Aplicar regras de negócio
      FinanceBusinessRules.validateAccountDeletion(account, transactionCount > 0, creditCardCount > 0)

    } catch (error) {
      reply.status(400).send({ 
        error: error instanceof Error ? error.message : 'Erro de validação' 
      })
      return reply
    }
  }
}