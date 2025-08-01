import { z } from 'zod';

// Schemas para API (sem transformações, compatíveis com Swagger)
export const financialAccountQuerySchema = z.object({
  tipo: z.enum(['conta_corrente', 'conta_poupanca', 'carteira', 'investimento', 'outras']).optional().describe('Filtrar por tipo de conta'),
  ativa: z.enum(['true', 'false']).optional().describe('Filtrar por contas ativas'),
});

export const financialAccountParamsSchema = z.object({
  id: z.string().uuid().describe('ID da conta financeira'),
});

export const financialAccountTypeSchema = z.enum([
  'conta_corrente',
  'conta_poupanca', 
  'carteira',
  'investimento',
  'outras'
]);

// Schema limpo para Swagger (sem transforms)
export const createFinancialAccountSchema = z.object({
  nome: z.string().min(1).max(255).describe('Nome da conta financeira'),
  tipo: financialAccountTypeSchema.describe('Tipo da conta financeira'),
  instituicao: z.string().max(255).optional().describe('Instituição financeira'),
  saldo_inicial: z.number().default(0).describe('Saldo inicial da conta'),
  cor: z.string().max(7).optional().describe('Cor da conta em hexadecimal'),
  icone: z.string().max(50).optional().describe('Ícone da conta'),
  observacoes: z.string().max(1000).optional().describe('Observações sobre a conta'),
});

// Schema limpo para Swagger (sem transforms)
export const updateFinancialAccountSchema = z.object({
  nome: z.string().min(1).max(255).optional().describe('Nome da conta financeira'),
  tipo: financialAccountTypeSchema.optional().describe('Tipo da conta financeira'),
  instituicao: z.string().max(255).optional().describe('Instituição financeira'),
  saldo_inicial: z.number().optional().describe('Saldo inicial da conta'),
  saldo_atual: z.number().optional().describe('Saldo atual da conta'),
  cor: z.string().max(7).optional().describe('Cor da conta em hexadecimal'),
  icone: z.string().max(50).optional().describe('Ícone da conta'),
  ativa: z.boolean().optional().describe('Se a conta está ativa'),
  observacoes: z.string().max(1000).optional().describe('Observações sobre a conta'),
});

// Schema limpo para Swagger (sem transforms)
export const financialAccountResponseSchema = z.object({
  id: z.string().uuid().describe('ID único da conta financeira'),
  nome: z.string().describe('Nome da conta financeira'),
  tipo: financialAccountTypeSchema.describe('Tipo da conta financeira'),
  instituicao: z.string().nullable().optional().describe('Instituição financeira'),
  saldo_inicial: z.number().describe('Saldo inicial da conta'),
  saldo_atual: z.number().describe('Saldo atual da conta'),
  cor: z.string().nullable().optional().describe('Cor da conta em hexadecimal'),
  icone: z.string().nullable().optional().describe('Ícone da conta'),
  ativa: z.boolean().describe('Se a conta está ativa'),
  observacoes: z.string().nullable().optional().describe('Observações sobre a conta'),
  user: z.string().uuid().describe('ID do usuário proprietário'),
  date_created: z.string().datetime().describe('Data de criação'),
  date_updated: z.string().datetime().describe('Data de atualização'),
});

export const financialAccountListResponseSchema = z.object({
  data: z.array(financialAccountResponseSchema),
  meta: z.object({
    total_count: z.number().describe('Total de registros'),
    filter_count: z.number().describe('Registros após filtros'),
  }),
});

// Schema limpo para Swagger (sem transforms)
export const accountTransferSchema = z.object({
  conta_origem_id: z.string().uuid().describe('ID da conta de origem'),
  conta_destino_id: z.string().uuid().describe('ID da conta de destino'),
  valor: z.number().positive().describe('Valor da transferência'),
  descricao: z.string().max(255).optional().describe('Descrição da transferência'),
  data: z.string().datetime().optional().describe('Data da transferência'),
});

export const errorResponseSchema = z.object({
  error: z.string().describe('Mensagem de erro'),
});