# Módulo de Investimentos

Este módulo implementa funcionalidades relacionadas a investimentos seguindo os princípios de Clean Architecture e Domain-Driven Design (DDD) utilizados no projeto Flash Investing.

## Estrutura do Módulo

```
src/modules/investments/
├── domain/                    # Camada de domínio
│   ├── entities/             # Entidades de negócio
│   │   ├── investment-portfolio.ts      # Portfólio de investimentos
│   │   ├── investment-asset.ts          # Ativo de investimento
│   │   ├── portfolio-position.ts        # Posição no portfólio
│   │   └── investment-recommendation.ts # Recomendação de investimento
│   ├── contracts/            # Interfaces dos repositórios
│   ├── services/             # Serviços de domínio
│   ├── value-objects/        # Objetos de valor
│   └── errors/               # Erros específicos do domínio
├── application/              # Camada de aplicação
│   ├── use-cases/           # Casos de uso
│   └── dtos/                # Data Transfer Objects
├── infrastructure/          # Camada de infraestrutura
│   ├── repositories/        # Implementações dos repositórios
│   └── providers/           # Provedores externos
├── routes/                  # Rotas HTTP
└── schemas/                 # Schemas de validação Zod
```

## Entidades Principais

### InvestmentPortfolio
Representa um portfólio de investimentos do usuário.
- **Propriedades**: id, userId, name, description, totalValue
- **Métodos**: updateTotalValue(), updateName(), updateDescription()

### InvestmentAsset  
Representa um ativo financeiro disponível para investimento.
- **Propriedades**: id, symbol, name, type, riskLevel, sector, currentPrice, currency
- **Tipos de Ativos**: STOCK, BOND, FUND, ETF, REIT, CRYPTO, COMMODITY
- **Níveis de Risco**: LOW, MEDIUM, HIGH, VERY_HIGH

### PortfolioPosition
Representa uma posição de um ativo dentro de um portfólio.
- **Propriedades**: portfolioId, assetId, quantity, averagePrice, currentPrice, profitLoss
- **Métodos**: addQuantity(), removeQuantity(), updateCurrentPrice()

### InvestmentRecommendation
Representa uma recomendação de investimento para um usuário.
- **Tipos**: BUY, SELL, HOLD, STRONG_BUY, STRONG_SELL
- **Razões**: TECHNICAL_ANALYSIS, FUNDAMENTAL_ANALYSIS, MARKET_CONDITIONS, etc.

## Endpoints Disponíveis

### Portfólios (`/investments/portfolios`)
- `POST /` - Criar novo portfólio
- `GET /` - Listar portfólios do usuário
- `GET /:id` - Obter portfólio por ID
- `PUT /:id` - Atualizar portfólio
- `DELETE /:id` - Deletar portfólio

### Ativos (`/investments/assets`)
- `POST /` - Criar novo ativo (admin)
- `GET /` - Listar ativos disponíveis
- `GET /:id` - Obter ativo por ID
- `PUT /:id` - Atualizar ativo

### Recomendações (`/investments/recommendations`)
- `POST /` - Criar nova recomendação
- `GET /` - Listar recomendações do usuário
- `GET /active` - Obter recomendações ativas
- `GET /:id` - Obter recomendação por ID
- `PUT /:id` - Atualizar recomendação
- `PATCH /:id/toggle` - Ativar/desativar recomendação

## Modelos do Banco de Dados

### investment_portfolios
```sql
- id (UUID, PK)
- user_id (UUID, FK → users.id)
- name (String)
- description (String?)
- total_value (Decimal)
- created_at (DateTime)
- updated_at (DateTime)
```

### investment_assets
```sql
- id (UUID, PK)
- symbol (String, UNIQUE)
- name (String)
- type (AssetType)
- risk_level (AssetRiskLevel)
- sector (String?)
- current_price (Decimal)
- currency (String)
- is_active (Boolean)
- created_at (DateTime)
- updated_at (DateTime)
```

### portfolio_positions
```sql
- id (UUID, PK)
- portfolio_id (UUID, FK → investment_portfolios.id)
- asset_id (UUID, FK → investment_assets.id)
- quantity (Decimal)
- average_price (Decimal)
- current_price (Decimal)
- total_invested (Decimal)
- current_value (Decimal)
- profit_loss (Decimal)
- profit_loss_percentage (Decimal)
- created_at (DateTime)
- updated_at (DateTime)
```

### investment_recommendations
```sql
- id (UUID, PK)
- user_id (UUID, FK → users.id)
- asset_id (UUID, FK → investment_assets.id)
- type (RecommendationType)
- reason (RecommendationReason)
- target_price (Decimal?)
- stop_loss (Decimal?)
- confidence (Int 0-100)
- description (String)
- is_active (Boolean)
- expires_at (DateTime?)
- created_at (DateTime)
- updated_at (DateTime)
```

## Como Usar

### 1. Executar Migrações
```bash
yarn db:push  # Para desenvolvimento
# ou
yarn db:migrate  # Para produção
```

### 2. Testar Endpoints
A documentação Swagger estará disponível em:
http://localhost:3001/documentation

### 3. Exemplo de Uso
```typescript
// Criar um portfólio
POST /investments/portfolios
{
  "name": "Meu Portfólio Conservador",
  "description": "Portfólio focado em renda fixa"
}

// Listar ativos
GET /investments/assets?type=STOCK&riskLevel=LOW

// Criar recomendação
POST /investments/recommendations
{
  "assetId": "uuid-do-ativo",
  "type": "BUY",
  "reason": "FUNDAMENTAL_ANALYSIS",
  "confidence": 85,
  "description": "Empresa com fundamentos sólidos"
}
```

## Próximos Passos

### Funcionalidades Futuras
- [ ] Implementar repositórios com Prisma
- [ ] Adicionar serviços de precificação em tempo real
- [ ] Sistema de alertas automáticos
- [ ] Análise de performance do portfólio
- [ ] Integração com APIs de cotações
- [ ] Backtesting de estratégias
- [ ] Relatórios de desempenho
- [ ] Simulador de investimentos

### Melhorias Técnicas
- [ ] Testes unitários
- [ ] Testes de integração
- [ ] Validações de negócio mais robustas
- [ ] Cache para dados de mercado
- [ ] Rate limiting para APIs externas
- [ ] Logs estruturados

## Arquitetura e Padrões

O módulo segue os mesmos padrões arquiteturais do projeto principal:

1. **Clean Architecture**: Separação clara entre domínio, aplicação e infraestrutura
2. **DDD**: Modelagem rica do domínio com entidades e value objects
3. **Repository Pattern**: Abstração do acesso a dados
4. **Use Cases**: Lógica de aplicação isolada
5. **Dependency Injection**: Inversão de dependências entre camadas

Esta estrutura permite:
- Fácil manutenção e evolução
- Testabilidade
- Flexibilidade para mudanças
- Isolamento de responsabilidades
- Reutilização de código