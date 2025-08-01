# Flash Investing - Modular Architecture

Este documento descreve a organização modular da aplicação Flash Investing API.

## 📋 Visão Geral

A arquitetura foi refatorada de um monolito para uma estrutura modular, mantendo todos os benefícios de uma aplicação única, mas com melhor organização de código e separação de responsabilidades.

## 🏗️ Estrutura dos Módulos

Cada módulo segue o padrão **Clean Architecture** com **Domain-Driven Design (DDD)**:

```
src/modules/
├── investments/        # 🏦 Módulo de Investimentos
├── auth/              # 🔐 Módulo de Autenticação  
├── debts/             # 💸 Módulo de Gestão de Dívidas
├── credit-cards/      # 💳 Módulo de Cartões de Crédito
├── users/             # 👤 Módulo de Usuários
├── transactions/      # 💰 Módulo de Transações
└── financial-accounts/ # 🏛️ Módulo de Contas Financeiras
```

### Estrutura Padrão de Cada Módulo

```
module-name/
├── domain/                 # 📐 Lógica de Negócio
│   ├── entities/          # Entidades de domínio
│   ├── contracts/         # Interfaces de repositórios
│   ├── services/          # Serviços de domínio
│   └── value-objects/     # Objetos de valor
├── application/           # 🔄 Casos de Uso
│   ├── use-cases/         # Casos de uso
│   └── dtos/             # Data Transfer Objects
├── infrastructure/        # 🏗️ Infraestrutura
│   └── repositories/      # Implementações dos repositórios
├── routes/               # 🛣️ Rotas HTTP
│   └── index.ts          # Agregador de rotas do módulo
└── schemas/              # ✅ Validações Zod
```

## 🎯 Benefícios da Arquitetura Modular

### 1. **Organização Clara**
- Cada funcionalidade em seu próprio módulo
- Fácil localização de código relacionado
- Separação clara de responsabilidades

### 2. **Manutenibilidade**
- Mudanças isoladas por módulo
- Menor acoplamento entre funcionalidades
- Facilita refatorações

### 3. **Escalabilidade**
- Possibilidade futura de extrair módulos para microserviços
- Facilita crescimento da equipe
- Deploy independente (futuro)

### 4. **Testabilidade**
- Testes isolados por módulo
- Mocking mais simples
- Cobertura de testes mais granular

### 5. **Documentação Swagger Organizada**
- Endpoints agrupados logicamente
- Documentação mais limpa e navegável
- Tags organizadas por módulo

## 📊 Swagger Documentation

A documentação agora está organizada em grupos:

- **🏦 Investments Module**
  - 📊 Investment Portfolios
  - 💰 Investment Assets  
  - 🎯 Investment Recommendations

- **🔐 Authentication**
  - Registro e login de usuários

- **💰 Financial Management**
  - Contas financeiras
  - Transações
  - Categorias financeiras
  - Cartões de crédito
  - Transações de cartão de crédito
  - Gestão de dívidas
  - Configurações de orçamento

## 🚀 Como Adicionar um Novo Módulo

1. **Criar estrutura de diretórios:**
```bash
mkdir -p src/modules/nome-modulo/{domain/{entities,contracts,services},application/{use-cases,dtos},infrastructure/repositories,routes,schemas}
```

2. **Implementar as camadas:**
   - **Domain**: Entidades e regras de negócio
   - **Application**: Casos de uso
   - **Infrastructure**: Repositórios com Prisma
   - **Routes**: Endpoints HTTP com Fastify
   - **Schemas**: Validações com Zod

3. **Criar index das rotas:**
```typescript
// src/modules/nome-modulo/routes/index.ts
import { FastifyPluginAsync } from 'fastify';
// imports...

const nomeModuloRoutes: FastifyPluginAsync = async function (fastify) {
  // registrar rotas
};

export default nomeModuloRoutes;
export const autoPrefix = '/nome-modulo';
```

4. **Registrar no índice principal:**
```typescript
// src/modules/index.ts
export { default as nomeModuloRoutes, autoPrefix as nomeModuloPrefix } from './nome-modulo/routes';
```

5. **Atualizar Swagger tags:**
```typescript
// src/plugins/swagger.ts
tags: [
  // ... outras tags
  {
    name: 'Nome Módulo',
    description: 'Descrição do módulo'
  }
]
```

## 🔧 Padrões de Desenvolvimento

### Naming Conventions
- **Módulos**: kebab-case (`investments`, `credit-cards`)
- **Arquivos**: kebab-case (`investment-portfolio.ts`)
- **Classes**: PascalCase (`InvestmentPortfolio`)
- **Variáveis/Funções**: camelCase (`createPortfolio`)
- **Constantes**: SCREAMING_SNAKE_CASE (`DEFAULT_PAGE_SIZE`)

### Import Patterns
```typescript
// ✅ Bom - usar imports relativos dentro do módulo
import { InvestmentPortfolio } from '../domain/entities/investment-portfolio';

// ✅ Bom - usar imports absolutos para dependências compartilhadas
import { prisma } from '../../../infrastructure/database/prisma-client';

// ❌ Evitar - imports entre módulos diferentes (quebra encapsulamento)
import { DebtRepository } from '../debts/domain/contracts/debt-repository';
```

### Response Pattern
Todos os endpoints seguem o padrão de resposta unificado:

```typescript
{
  success: boolean,
  data: T | null,
  message: string,
  errors: string[] | null,
  meta: {
    timestamp: string,
    version: string
  }
}
```

## 📈 Status da Migração

- ✅ **Investments Module** - Completo
- ✅ **Auth Module** - Migrado
- ✅ **Debts Module** - Migrado  
- ✅ **Credit Cards Module** - Migrado
- ✅ **Users Module** - Migrado
- ✅ **Transactions Module** - Migrado
- ✅ **Financial Accounts Module** - Migrado
- ✅ **Financial Categories Module** - Migrado
- ✅ **User Finance Settings Module** - Migrado
- ✅ **Pluggy Integration Module** - Migrado

## 🎛️ Swagger Configuration

A documentação agora possui:
- **Tags organizadas** por módulo
- **Grupos visuais** (`x-tagGroups`)
- **Ícones** para melhor identificação
- **Filtros de busca** habilitados
- **Seções colapsáveis** para melhor navegação

### Exemplo de acesso:
- **URL**: http://localhost:3001/documentation
- **JSON Schema**: http://localhost:3001/documentation/json

## 📝 Próximos Passos

1. Completar migração dos módulos restantes
2. Implementar testes unitários por módulo
3. Configurar CI/CD por módulo
4. Documentar APIs específicas de cada módulo
5. Avaliar extração para microserviços (futuro)

---

Esta arquitetura modular proporciona uma base sólida para o crescimento sustentável da aplicação Flash Investing, mantendo a qualidade do código e facilitando a manutenção a longo prazo.