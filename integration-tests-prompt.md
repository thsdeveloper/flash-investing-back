# Prompt para Implementação de Testes de Integração

Preciso implementar testes de integração completos em um projeto Node.js que usa Fastify, Prisma e PostgreSQL.

## ✅ STATUS DA IMPLEMENTAÇÃO (COMPLETO)

**Data de Implementação**: 07/08/2025  
**Framework Utilizado**: Vitest (substituindo Jest devido à compatibilidade com Node.js 23.x)  
**Status**: ✅ IMPLEMENTAÇÃO COMPLETA

### ✅ Itens Implementados:
- ✅ Estrutura completa de pastas de teste
- ✅ Ambiente isolado com schemas PostgreSQL separados
- ✅ Helpers para autenticação, database e configuração
- ✅ Factories para geração de dados de teste
- ✅ Configuração do Vitest otimizada
- ✅ Testes de exemplo para rotas de autenticação
- ✅ Arquivo .env.test com configurações
- ✅ Scripts npm/yarn para execução dos testes
- ✅ Documentação completa (test/README.md)

### 📦 Dependências Instaladas:
- vitest@3.2.4
- supertest@7.1.4
- @types/supertest@6.0.3

### 🗂️ Estrutura Final Criada:
```
test/
  ├── helpers/
  │   ├── test-env.ts       # ✅ Configuração do ambiente de teste
  │   ├── auth.ts           # ✅ Helpers de autenticação
  │   ├── database.ts       # ✅ Helpers de banco de dados
  │   └── test-app.ts       # ✅ Configuração da aplicação Fastify
  ├── factories/
  │   ├── index.ts          # ✅ Índice das factories
  │   ├── user-factory.ts   # ✅ Factory para criar usuários
  │   ├── transaction-factory.ts # ✅ Factory para transações
  │   └── financial-account-factory.ts # ✅ Factory para contas financeiras
  ├── routes/
  │   └── auth.test.ts      # ✅ Testes de exemplo (autenticação)
  ├── setup.ts              # ✅ Setup global do Vitest
  └── README.md             # ✅ Documentação completa
```

### 🎯 Como Usar:
```bash
# Configurar ambiente de teste
cp .env.test.example .env.test  # Configure sua DATABASE_URL

# Executar testes
yarn test                    # Executar todos os testes
yarn test:watch             # Modo watch para desenvolvimento
yarn test:coverage          # Com coverage
yarn test:integration       # Apenas testes de integração
``` 

## Contexto do Projeto
- Framework: Fastify
- ORM: Prisma
- Banco de dados: PostgreSQL
- Linguagem: JavaScript/TypeScript
- Estrutura esperada de pastas: src/ para código fonte, test/ ou tests/ para testes

## Requisitos da Implementação

### 1. Configuração do Ambiente de Testes
- Use Jest como framework de testes principal
- Configure isolamento completo entre testes usando schemas separados do PostgreSQL
- Implemente setup e teardown globais para preparar/limpar o ambiente
- Use variáveis de ambiente específicas para testes (.env.test)
- Considere usar Testcontainers para subir containers Docker do PostgreSQL durante os testes (opcional, mas recomendado para isolamento total)

### 2. Estrutura de Arquivos de Teste
Crie a seguinte estrutura:
```
test/
  ├── helpers/
  │   ├── test-env.js       # Configuração do ambiente de teste
  │   ├── auth.js           # Helpers de autenticação
  │   └── database.js       # Helpers de banco de dados
  ├── factories/
  │   ├── user-factory.js   # Factory para criar usuários
  │   └── [outras-factories].js
  ├── routes/
  │   └── [testes-por-rota].test.js
  ├── setup.js              # Setup global do Jest
  └── jest.config.js        # Configuração do Jest
```

### 3. Implementações Necessárias

#### test/helpers/test-env.js
- Função para criar schema isolado para cada suíte de testes
- Aplicar migrations do Prisma no schema de teste
- Retornar configuração para limpeza posterior
- (Opcional) Configurar Testcontainers para PostgreSQL:
  ```javascript
  import { PostgreSqlContainer } from '@testcontainers/postgresql'
  
  const container = await new PostgreSqlContainer()
    .withDatabase('testdb')
    .withUsername('test')
    .withPassword('test')
    .start()
  ```

#### test/setup.js
- beforeAll: criar schema, rodar migrations, inicializar app Fastify
- afterAll: fechar app, limpar schema, desconectar Prisma
- Configurar globalSetup e globalTeardown do Jest se necessário

#### test/factories/
- Criar factories para todas as entidades principais do sistema
- Usar dados aleatórios mas válidos (emails únicos, etc)
- Permitir override de propriedades

#### test/helpers/auth.js
- Função authenticateUser() que faz login e retorna token JWT
- Outras funções auxiliares de autenticação conforme necessário

### 4. Padrões de Teste

Para cada arquivo de teste:
```javascript
const { describe, it, expect, beforeEach } = require('@jest/globals')
// ou se usar ESM: import { describe, it, expect, beforeEach } from '@jest/globals'

const { app } = require('@/app')

describe('Nome do Recurso', () => {
  beforeEach(async () => {
    // Limpar dados específicos se necessário
  })

  describe('POST /recurso', () => {
    it('should create resource with valid data', async () => {
      // Arrange: preparar dados
      // Act: fazer requisição
      // Assert: verificar resposta e efeitos colaterais
    })

    it('should return 400 with invalid data', async () => {
      // Teste de validação
    })

    it('should return 401 without authentication', async () => {
      // Teste de autenticação
    })
  })

  // Testes para outros métodos HTTP
})
```

### 5. Configurações Adicionais

#### jest.config.js (se usar Jest)
```javascript
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./test/setup.js'],
  testMatch: ['**/test/**/*.test.js'],
  moduleNameMapper: {
    '^@/(.*)

### 6. Testes de Fluxo Completo (E2E)
Criar pelo menos um teste que cubra um fluxo completo crítico do sistema, como:
- Cadastro → Login → Ação principal → Verificação de resultado

### 7. Helpers Adicionais
- Função para limpar tabelas específicas
- Função para fazer seed de dados de teste
- Helpers para verificar emails enviados (se aplicável)
- Helpers para verificar jobs em fila (se aplicável)

### 8. Tratamento de Dependências Externas
- Mockar serviços externos (APIs, envio de email, etc)
- Usar variáveis de ambiente para desabilitar integrações em testes

### 9. Performance e Paralelização
- Configurar pool de conexões do Prisma adequado para testes
- Use --runInBand no Jest para evitar conflitos entre testes paralelos
- Garantir que cada teste tenha seu próprio schema isolado
- Usar transações quando possível para rollback rápido

### 10. Documentação
Adicionar README.md na pasta de testes explicando:
- Como rodar os testes
- Como adicionar novos testes
- Convenções e padrões adotados

## Observações Importantes
- Verifique a estrutura atual do projeto antes de criar arquivos
- Adapte os imports conforme o sistema de módulos usado (CommonJS ou ESM)
- Se o projeto usa TypeScript, adicione tipos apropriados
- Mantenha consistência com o estilo de código existente
- Não delete arquivos existentes sem confirmar
- Se encontrar testes existentes, integre a nova estrutura gradualmente
- Se optar por usar Testcontainers, certifique-se de que o Docker está instalado no ambiente de CI/CD

## Dependências Sugeridas
```json
{
  "devDependencies": {
    "jest": "^29.0.0",
    "@jest/globals": "^29.0.0",
    "supertest": "^6.3.0",
    "@testcontainers/postgresql": "^10.0.0" // opcional
  }
}
```

Por favor, implemente essa estrutura completa de testes de integração, criando todos os arquivos necessários e adaptando conforme a estrutura específica do meu projeto.: '<rootDir>/src/$1'
  }
}
```

#### vitest.config.js (se usar Vitest - não precisa do Vite)
```javascript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./test/setup.js'],
    alias: {
      '@': './src'
    }
  }
})
```

#### package.json scripts
Para Jest:
- "test:integration": "jest --runInBand"
- "test:integration:watch": "jest --watch"

Para Vitest:
- "test:integration": "vitest run"
- "test:integration:watch": "vitest"
- "test:integration:ui": "vitest --ui"

### 6. Testes de Fluxo Completo (E2E)
Criar pelo menos um teste que cubra um fluxo completo crítico do sistema, como:
- Cadastro → Login → Ação principal → Verificação de resultado

### 7. Helpers Adicionais
- Função para limpar tabelas específicas
- Função para fazer seed de dados de teste
- Helpers para verificar emails enviados (se aplicável)
- Helpers para verificar jobs em fila (se aplicável)

### 8. Tratamento de Dependências Externas
- Mockar serviços externos (APIs, envio de email, etc)
- Usar variáveis de ambiente para desabilitar integrações em testes

### 9. Performance e Paralelização
- Configurar pool de conexões do Prisma adequado para testes
- Garantir que testes possam rodar em paralelo sem conflitos
- Usar transações quando possível para rollback rápido

### 10. Documentação
Adicionar README.md na pasta de testes explicando:
- Como rodar os testes
- Como adicionar novos testes
- Convenções e padrões adotados

## Observações Importantes
- Verifique a estrutura atual do projeto antes de criar arquivos
- Adapte os imports conforme o sistema de módulos usado (CommonJS ou ESM)
- Se o projeto usa TypeScript, adicione tipos apropriados
- Mantenha consistência com o estilo de código existente
- Não delete arquivos existentes sem confirmar
- Se encontrar testes existentes, integre a nova estrutura gradualmente

Por favor, implemente essa estrutura completa de testes de integração, criando todos os arquivos necessários e adaptando conforme a estrutura específica do meu projeto.