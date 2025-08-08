# Flash Investing Backend - Test Suite

Este diretório contém a estrutura completa de testes de integração para o backend do Flash Investing, construído com **Vitest**, **Supertest** e **PostgreSQL** para isolamento completo entre testes.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Estrutura de Arquivos](#estrutura-de-arquivos)
- [Configuração do Ambiente](#configuração-do-ambiente)
- [Como Executar os Testes](#como-executar-os-testes)
- [Escrevendo Novos Testes](#escrevendo-novos-testes)
- [Padrões e Convenções](#padrões-e-convenções)
- [Helpers Disponíveis](#helpers-disponíveis)
- [Factories](#factories)
- [Troubleshooting](#troubleshooting)

## 🔍 Visão Geral

A suíte de testes implementa:

- **Isolamento completo**: Cada teste usa schemas PostgreSQL separados
- **Ambiente controlado**: Setup e teardown automáticos
- **Factories de dados**: Geração consistente de dados de teste
- **Helpers especializados**: Para autenticação, database e configuração de ambiente
- **Testes de integração**: Cobertura completa das rotas da API
- **Performance otimizada**: Execução sequencial para evitar conflitos

## 🗂️ Estrutura de Arquivos

```
test/
├── helpers/           # Utilitários e helpers para testes
│   ├── test-env.ts    # Configuração de ambiente isolado
│   ├── database.ts    # Helpers para operações de banco
│   ├── auth.ts        # Helpers para autenticação
│   └── test-app.ts    # Configuração da aplicação Fastify para testes
├── factories/         # Factories para criação de dados de teste
│   ├── index.ts       # Exportações e coleção de factories
│   ├── user-factory.ts
│   ├── transaction-factory.ts
│   └── financial-account-factory.ts
├── routes/            # Testes de integração das rotas
│   └── auth.test.ts   # Exemplo: testes das rotas de autenticação
├── setup.ts           # Configuração global do Vitest
└── README.md          # Esta documentação
```

## ⚙️ Configuração do Ambiente

### Pré-requisitos

1. **PostgreSQL** rodando localmente ou em container
2. **Node.js** versão 20+ 
3. **Yarn** como package manager

### Variáveis de Ambiente

Configure o arquivo `.env.test` na raiz do projeto:

```env
# Configuração obrigatória
NODE_ENV=test
DATABASE_URL="postgresql://user:password@localhost:5432/flash_investing_test"

# JWT para testes
JWT_SECRET="test-jwt-secret-key-minimum-32-characters-long-for-testing-purposes"
JWT_REFRESH_SECRET="test-refresh-secret-key-minimum-32-characters-long-for-testing"

# Configurações otimizadas para testes
BCRYPT_ROUNDS=4
PORT=3002
```

### Banco de Dados de Teste

1. Crie um banco de dados específico para testes:
```sql
CREATE DATABASE flash_investing_test;
```

2. Execute as migrations no banco de teste:
```bash
yarn test:setup
```

## 🚀 Como Executar os Testes

### Comandos Disponíveis

```bash
# Executar todos os testes uma vez
yarn test

# Executar testes em modo watch (desenvolvimento)
yarn test:watch

# Executar testes com interface UI
yarn test:ui

# Executar testes com coverage
yarn test:coverage

# Executar apenas testes de integração
yarn test:integration

# Executar testes de integração em modo watch
yarn test:integration:watch

# Resetar banco de dados de teste
yarn test:db:reset
```

### Primeiro Uso

1. Configure as variáveis de ambiente
2. Configure o banco de dados de teste
3. Execute as migrations:
   ```bash
   yarn test:setup
   ```
4. Execute os testes:
   ```bash
   yarn test
   ```

## ✍️ Escrevendo Novos Testes

### Exemplo Básico

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createFactories } from '../factories';
import { createAuthHelper } from '../helpers/auth';

describe('MinhaRota', () => {
  let factories: ReturnType<typeof createFactories>;
  let authHelper: ReturnType<typeof createAuthHelper>;

  beforeEach(() => {
    factories = createFactories(global.testEnv.prisma);
    authHelper = createAuthHelper(global.testEnv.prisma);
    factories.resetAllCounters();
  });

  it('should handle GET request', async () => {
    const user = await factories.user.create();
    
    const response = await request(global.testApp.server)
      .get('/minha-rota')
      .expect(200);
      
    expect(response.body.success).toBe(true);
  });
});
```

### Testes com Autenticação

```typescript
it('should require authentication', async () => {
  const user = await authHelper.createAuthenticatedUser();
  
  const response = await request(global.testApp.server)
    .get('/rota-protegida')
    .set('Authorization', `Bearer ${user.tokens.accessToken}`)
    .expect(200);
    
  expect(response.body.data.user.id).toBe(user.id);
});
```

## 📐 Padrões e Convenções

### Estrutura de Testes

1. **Arrange**: Prepare os dados de teste usando factories
2. **Act**: Execute a ação (requisição HTTP)
3. **Assert**: Verifique o resultado e efeitos colaterais

### Nomenclatura

- Arquivos de teste: `*.test.ts`
- Describe blocks: Nome da rota ou funcionalidade
- Test cases: Começar com "should" + ação esperada

### Limpeza de Dados

- Use `beforeEach` para resetar contadores de factory
- O cleanup global é automático entre testes
- Use helpers de database para limpezas específicas

### Tratamento de Erros

```typescript
it('should return 400 with invalid data', async () => {
  const response = await request(global.testApp.server)
    .post('/rota')
    .send({ dadoInvalido: 'valor' })
    .expect(400);
    
  expect(response.body.success).toBe(false);
  expect(response.body.errors).toContain('VALIDATION_ERROR');
});
```

## 🛠️ Helpers Disponíveis

### TestEnvironmentManager
- Criação de ambientes isolados com schemas separados
- Cleanup automático de recursos

### DatabaseTestHelper
```typescript
const dbHelper = createDatabaseHelper(global.testEnv);

// Limpar tabelas específicas
await dbHelper.cleanTables(['users', 'transactions']);

// Limpar todos os dados
await dbHelper.cleanAllData();

// Executar com rollback
await dbHelper.withRollback(async (tx) => {
  // Operações que serão revertidas
});
```

### AuthTestHelper
```typescript
const authHelper = createAuthHelper(global.testEnv.prisma);

// Criar usuário autenticado
const user = await authHelper.createAuthenticatedUser();

// Gerar tokens
const tokens = authHelper.generateTokens(user);

// Headers de autenticação
const headers = authHelper.getAuthHeader(tokens.accessToken);
```

## 🏭 Factories

### UserFactory
```typescript
const userFactory = createUserFactory(prisma);

// Usuário simples
const user = await userFactory.create();

// Usuário com dados específicos
const customUser = await userFactory.create({
  name: 'Nome Específico',
  email: 'email@especifico.com'
});

// Usuário com setup financeiro completo
const { user, accounts, categories } = await userFactory.createWithCompleteFinanceSetup();
```

### TransactionFactory
```typescript
const transactionFactory = createTransactionFactory(prisma);

// Transação de receita
const income = await transactionFactory.createIncome({ userId: user.id });

// Transações em período
const transactions = await transactionFactory.createForDateRange(
  startDate, endDate, 10, { userId: user.id }
);
```

### FinancialAccountFactory
```typescript
const accountFactory = createFinancialAccountFactory(prisma);

// Set típico de contas
const accounts = await accountFactory.createTypicalSet(user.id);

// Conta com transações
const { account, transactions } = await accountFactory.createWithTransactions({
  userId: user.id
}, 5);
```

## 🔧 Troubleshooting

### Problemas Comuns

1. **"Database connection failed"**
   - Verifique se PostgreSQL está rodando
   - Confirme a string de conexão no `.env.test`
   - Execute `yarn test:setup`

2. **"Schema already exists"**
   - Execute `yarn test:db:reset` para limpar schemas órfãos
   - Reinicie os testes

3. **"Port already in use"**
   - Mude a porta no `.env.test`
   - Verifique se não há outros processos usando a porta

4. **Testes falhando intermitentemente**
   - Verifique se há vazamentos de dados entre testes
   - Use `factories.resetAllCounters()` em `beforeEach`

### Performance

- **Testes lentos**: Verifique se `BCRYPT_ROUNDS` está em 4 no `.env.test`
- **Timeout**: Aumente `testTimeout` no `vitest.config.ts`
- **Memory leaks**: Use o helper `withRollback` para operações que não precisam persistir

### Debugging

```typescript
// Log dados de teste
console.log('Test user:', user);

// Verificar estado do banco
const count = await global.testEnv.prisma.user.count();
console.log('Users in DB:', count);

// Usar Prisma Studio para inspeção
yarn db:studio
```

## 📈 Coverage e Relatórios

Execute com coverage:
```bash
yarn test:coverage
```

Os relatórios são salvos em `./coverage/` com formatos:
- HTML: `coverage/index.html`
- JSON: `coverage/coverage.json`
- Text: output no console

## 🤝 Contribuindo

1. Siga os padrões estabelecidos
2. Adicione testes para novas funcionalidades
3. Mantenha coverage alto (>80%)
4. Documente helpers complexos
5. Use factories para dados de teste

## 📚 Recursos Adicionais

- [Vitest Documentation](https://vitest.dev/)
- [Supertest Documentation](https://github.com/ladjs/supertest)
- [Fastify Testing](https://fastify.dev/docs/latest/Guides/Testing/)
- [Prisma Testing Guide](https://www.prisma.io/docs/guides/testing/integration-testing)