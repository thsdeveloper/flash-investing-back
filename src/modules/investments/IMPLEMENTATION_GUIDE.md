# Guia de Implementação Completa - Módulo de Investimentos

## Status Atual ✅

### Já Implementado:
- ✅ Estrutura modular completa
- ✅ Entidades de domínio (Portfolio, Asset, Position, Recommendation)
- ✅ Contratos/Interfaces dos repositórios
- ✅ Schemas Zod para validação
- ✅ Use cases básicos
- ✅ Rotas HTTP com documentação Swagger
- ✅ Modelos do Prisma (schema.prisma atualizado)

## Próximos Passos para Completar 🚧

### 1. Implementar Repositórios com Prisma

```typescript
// src/modules/investments/infrastructure/repositories/prisma-investment-portfolio-repository.ts
import { PrismaClient } from '@prisma/client';
import { InvestmentPortfolio } from '../../domain/entities/investment-portfolio';
import { InvestmentPortfolioRepository } from '../../domain/contracts/investment-portfolio-repository';

export class PrismaInvestmentPortfolioRepository implements InvestmentPortfolioRepository {
  constructor(private prisma: PrismaClient) {}

  async create(portfolio: InvestmentPortfolio): Promise<InvestmentPortfolio> {
    const data = await this.prisma.investmentPortfolio.create({
      data: portfolio.toPlainObject(),
    });
    return InvestmentPortfolio.restore(data);
  }

  async findByUserId(userId: string): Promise<InvestmentPortfolio[]> {
    const portfolios = await this.prisma.investmentPortfolio.findMany({
      where: { userId },
    });
    return portfolios.map(p => InvestmentPortfolio.restore(p));
  }

  // ... outros métodos
}
```

### 2. Configurar Injeção de Dependências

```typescript
// src/modules/investments/infrastructure/container.ts
import { PrismaClient } from '@prisma/client';
import { PrismaInvestmentPortfolioRepository } from './repositories/prisma-investment-portfolio-repository';
import { CreateInvestmentPortfolioUseCase } from '../application/use-cases/create-investment-portfolio';

export class InvestmentContainer {
  constructor(private prisma: PrismaClient) {}

  createInvestmentPortfolioUseCase(): CreateInvestmentPortfolioUseCase {
    const repository = new PrismaInvestmentPortfolioRepository(this.prisma);
    return new CreateInvestmentPortfolioUseCase(repository);
  }
}
```

### 3. Conectar Use Cases nas Rotas

```typescript
// Atualizar src/modules/investments/routes/investment-portfolios.ts
handler: async (request: AuthenticatedRequest, reply) => {
  const userId = request.user.id;
  const body = request.body as any;

  const container = new InvestmentContainer(fastify.prisma);
  const createPortfolioUseCase = container.createInvestmentPortfolioUseCase();
  const portfolio = await createPortfolioUseCase.execute({ ...body, userId });
  
  return reply.status(201).send(portfolio.toPlainObject());
},
```

### 4. Executar Migração do Banco

```bash
# Criar migração
npx prisma migrate dev --name add_investment_tables

# Ou fazer push direto (desenvolvimento)
npx prisma db:push
```

### 5. Implementar Validações de Negócio

```typescript
// src/modules/investments/domain/services/investment-validation.ts
export class InvestmentValidationService {
  validatePortfolioCreation(userId: string, portfolioData: any): void {
    // Validar se usuário pode criar portfolio
    // Verificar limites, permissões, etc.
  }

  validateAssetPurchase(portfolioId: string, assetId: string, quantity: number): void {
    // Validar se compra é permitida
    // Verificar saldo, limites de risco, etc.
  }
}
```

### 6. Adicionar Testes

```typescript
// tests/modules/investments/entities/investment-portfolio.test.ts
import { InvestmentPortfolio } from '../../../../src/modules/investments/domain/entities/investment-portfolio';

describe('InvestmentPortfolio', () => {
  it('should create a portfolio with correct properties', () => {
    const portfolio = InvestmentPortfolio.create({
      name: 'Test Portfolio',
      userId: 'user-id',
      totalValue: 0,
    });

    expect(portfolio.name).toBe('Test Portfolio');
    expect(portfolio.totalValue).toBe(0);
  });
});
```

## Integração com APIs Externas

### 1. Provedor de Cotações

```typescript
// src/modules/investments/infrastructure/providers/quote-provider.ts
export interface QuoteProvider {
  getCurrentPrice(symbol: string): Promise<number>;
  getBatchPrices(symbols: string[]): Promise<Record<string, number>>;
}

export class AlphaVantageQuoteProvider implements QuoteProvider {
  async getCurrentPrice(symbol: string): Promise<number> {
    // Implementar integração com Alpha Vantage ou similar
  }
}
```

### 2. Atualizador de Preços

```typescript
// src/modules/investments/application/services/price-updater.ts
export class PriceUpdaterService {
  constructor(
    private quoteProvider: QuoteProvider,
    private assetRepository: InvestmentAssetRepository,
    private positionRepository: PortfolioPositionRepository
  ) {}

  async updateAllAssetPrices(): Promise<void> {
    const assets = await this.assetRepository.findActive();
    const symbols = assets.map(a => a.symbol);
    const prices = await this.quoteProvider.getBatchPrices(symbols);

    for (const asset of assets) {
      const newPrice = prices[asset.symbol];
      if (newPrice) {
        asset.updatePrice(newPrice);
        await this.assetRepository.update(asset);
      }
    }
  }
}
```

## Funcionalidades Avançadas

### 1. Sistema de Alertas

```typescript
// src/modules/investments/domain/entities/price-alert.ts
export class PriceAlert {
  constructor(
    private userId: string,
    private assetId: string,
    private targetPrice: number,
    private condition: 'ABOVE' | 'BELOW'
  ) {}

  shouldTrigger(currentPrice: number): boolean {
    return this.condition === 'ABOVE' 
      ? currentPrice >= this.targetPrice
      : currentPrice <= this.targetPrice;
  }
}
```

### 2. Análise de Performance

```typescript
// src/modules/investments/application/use-cases/calculate-portfolio-performance.ts
export class CalculatePortfolioPerformanceUseCase {
  async execute(portfolioId: string, period: 'DAILY' | 'MONTHLY' | 'YEARLY'): Promise<PerformanceReport> {
    // Calcular retorno, volatilidade, Sharpe ratio, etc.
  }
}
```

### 3. Rebalanceamento Automático

```typescript
// src/modules/investments/domain/services/rebalancing-service.ts
export class RebalancingService {
  calculateRebalancingActions(
    portfolio: InvestmentPortfolio,
    targetAllocations: Record<string, number>
  ): RebalancingAction[] {
    // Calcular compras/vendas necessárias para rebalancear
  }
}
```

## Como Testar a Implementação

### 1. Testar Endpoints Básicos

```bash
# Criar portfólio
curl -X POST http://localhost:3001/investments/portfolios \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Meu Portfólio", "description": "Portfólio de teste"}'

# Listar portfólios
curl -X GET http://localhost:3001/investments/portfolios \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 2. Verificar Documentação

Acesse: http://localhost:3001/documentation

Procure pela seção "Investment Portfolios", "Investment Assets", etc.

### 3. Testar com Dados Reais

```typescript
// Script de seed para popular dados de teste
const seedAssets = [
  { symbol: 'PETR4', name: 'Petrobras PN', type: 'STOCK', riskLevel: 'HIGH' },
  { symbol: 'VALE3', name: 'Vale ON', type: 'STOCK', riskLevel: 'MEDIUM' },
  { symbol: 'TESOURO_SELIC', name: 'Tesouro Selic', type: 'BOND', riskLevel: 'LOW' },
];
```

## Possíveis Melhorias Futuras

1. **Cache Redis** para cotações em tempo real
2. **WebSockets** para atualizações de preço em tempo real
3. **Machine Learning** para recomendações inteligentes
4. **Backtesting** de estratégias
5. **API de Notificações** push/email
6. **Dashboard** com gráficos interativos
7. **Importação** de dados de corretoras
8. **Simulador** de investimentos

## Observações Importantes

- As rotas já estão configuradas com autenticação JWT
- Todas as validações usam Zod para type safety
- A estrutura segue Clean Architecture
- Os modelos do Prisma estão prontos para uso
- A documentação Swagger é gerada automaticamente
- Cada endpoint está taggeado apropriadamente

Para completar a implementação, foque em:
1. Implementar os repositórios Prisma
2. Conectar use cases nas rotas
3. Executar as migrações
4. Testar os endpoints

O módulo está estruturado para ser facilmente extensível e manutenível! 🚀