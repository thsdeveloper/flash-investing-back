# Flash Investing Backend

<div align="center">

![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Fastify](https://img.shields.io/badge/fastify-%23000000.svg?style=for-the-badge&logo=fastify&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/postgresql-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)

**🚀 API REST para gestão financeira completa com Clean Architecture e DDD**

[Documentação](#-documentação) •
[Instalação](#-instalação-rápida) •
[API Docs](#-api-documentation) •
[Arquitetura](#-arquitetura) •
[Deploy](#-deploy)

</div>

---

## ✨ Características

- 🏗️ **Clean Architecture** + Domain-Driven Design (DDD)
- 🔐 **Autenticação JWT** com refresh tokens
- 💳 **Gestão Completa de Finanças**: contas, transações, cartões de crédito
- 📊 **Regra 50/30/20** para orçamento pessoal
- 🏦 **Integração Bancária** via Pluggy/Belvo APIs
- ⚡ **Alta Performance** com Fastify v5
- 🔄 **Auto-loading** inteligente de rotas e plugins
- 📊 **Validação Type-safe** com Zod
- 📚 **OpenAPI 3.0** com Swagger UI interativo
- 🗃️ **PostgreSQL** + Prisma ORM com migrações
- 🧪 **TypeScript** com tipagem rigorosa

---

## 🚀 Instalação Rápida

### Pré-requisitos

- Node.js 20+
- Yarn 1.22+ ou npm
- PostgreSQL 13+

### Setup

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/flash-investing-back.git
cd flash-investing-back

# 2. Instale dependências
yarn install

# 3. Configure ambiente
cp .env.example .env
# Edite as variáveis no arquivo .env

# 4. Configure banco de dados
yarn db:generate    # Gera Prisma client
yarn db:migrate     # Executa migrações
yarn db:push        # Sincroniza schema (desenvolvimento)

# 5. Execute aplicação
yarn dev           # Modo desenvolvimento (porta 3001)
```

### Acesso Rápido

- **API**: http://localhost:3001
- **Swagger UI**: http://localhost:3001/documentation
- **Prisma Studio**: `yarn db:studio`

---

## 📚 Documentação

### 📋 Documentos Principais

| Documento | Descrição |
|-----------|-----------|
| [**CLAUDE.md**](./CLAUDE.md) | 🤖 Guia completo para desenvolvimento com Claude Code |
| [**API Documentation**](#-api-documentation) | 📡 Endpoints disponíveis e exemplos de uso |
| [**Architecture**](#-arquitetura) | 🏗️ Estrutura e design patterns utilizados |

---

## 🎯 API Documentation

### Swagger UI Interativo

Acesse a documentação completa da API em: **http://localhost:3001/documentation**

### Endpoints Principais

#### 🔐 Autenticação

```http
POST /auth/register    # Registro de usuário
POST /auth/login       # Login de usuário
```

#### 👤 Gestão de Usuários

```http
GET  /users/me         # Perfil do usuário autenticado
PUT  /users/profile    # Atualizar perfil
```

#### 💰 Contas Financeiras

```http
GET    /financial-accounts        # Listar contas
POST   /financial-accounts        # Criar conta
GET    /financial-accounts/:id    # Detalhes da conta
PUT    /financial-accounts/:id    # Atualizar conta
DELETE /financial-accounts/:id    # Remover conta
```

#### 📈 Transações

```http
GET    /transactions             # Listar transações
POST   /transactions             # Criar transação
GET    /transactions/:id         # Detalhes da transação
PUT    /transactions/:id         # Atualizar transação
DELETE /transactions/:id         # Remover transação
GET    /transactions/summary     # Resumo financeiro
```

#### 💳 Cartões de Crédito

```http
GET    /credit-cards             # Listar cartões
POST   /credit-cards             # Adicionar cartão
GET    /credit-cards/:id         # Detalhes do cartão
PUT    /credit-cards/:id         # Atualizar cartão
DELETE /credit-cards/:id         # Remover cartão
```

#### 🛍️ Transações de Cartão

```http
GET    /credit-card-transactions      # Listar compras
POST   /credit-card-transactions      # Registrar compra
PUT    /credit-card-transactions/:id  # Atualizar compra
DELETE /credit-card-transactions/:id  # Remover compra
```

#### 📂 Categorias Financeiras

```http
GET    /financial-categories     # Listar categorias
POST   /financial-categories     # Criar categoria
PUT    /financial-categories/:id # Atualizar categoria
DELETE /financial-categories/:id # Remover categoria
```

#### ⚙️ Configurações de Orçamento

```http
GET  /user-finance-settings      # Obter configurações
PUT  /user-finance-settings      # Atualizar configurações
```

#### 🏦 Integração Bancária (Pluggy)

```http
POST /pluggy/connect             # Conectar conta bancária
GET  /pluggy/accounts            # Listar contas conectadas
POST /pluggy/sync                # Sincronizar transações
```

### Exemplos de Uso

```bash
# 1. Registrar usuário
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao.silva@email.com",
    "password": "senhaSegura123"
  }'

# 2. Login
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao.silva@email.com",
    "password": "senhaSegura123"
  }'

# 3. Criar conta financeira (use o token retornado)
curl -X POST http://localhost:3001/financial-accounts \
  -H "Authorization: Bearer <seu_token_jwt>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Conta Corrente",
    "type": "BANK",
    "balance": 1000.00,
    "institution": "Banco do Brasil"
  }'
```

---

## 🏗️ Arquitetura

### Clean Architecture + DDD

```mermaid
graph TB
    subgraph "Cliente"
        A[Web/Mobile App]
        B[Swagger UI]
    end
    
    subgraph "API Layer"
        C[Fastify Server]
        D[Routes & Plugins]
        E[Auth Middleware]
    end
    
    subgraph "Application"
        F[Use Cases]
        G[DTOs]
    end
    
    subgraph "Domain"
        H[Entities]
        I[Value Objects]
        J[Business Rules]
    end
    
    subgraph "Infrastructure"
        K[Repositories]
        L[External APIs]
        M[Database]
    end
    
    A --> C
    B --> C
    C --> D
    D --> E
    E --> F
    F --> H
    H --> I
    F --> J
    J --> K
    K --> M
    L --> F
```

### Camadas da Aplicação

| Camada | Responsabilidade | Exemplos |
|--------|------------------|----------|
| **API** | Rotas HTTP, validação, docs | Fastify routes, Zod schemas |
| **Application** | Casos de uso, orquestração | CreateTransaction, LoginUser |
| **Domain** | Regras de negócio, entidades | User, Transaction, Account |
| **Infrastructure** | Integrações externas | Prisma, JWT, Pluggy API |

---

## 📁 Estrutura do Projeto

```
src/
├── 🌐 server.ts                    # Entry point com auto-loading
├── 🔌 plugins/                     # Plugins globais
│   ├── cors.ts                    # CORS configuration
│   ├── database.ts                # Prisma client decorator
│   ├── swagger.ts                 # API documentation
│   └── zod.ts                     # Validation setup
├── 🛣️  routes/                     # Endpoints da API
│   ├── auth/                      # Autenticação
│   ├── users/                     # Gestão de usuários
│   ├── financial-accounts/        # Contas financeiras
│   ├── transactions/              # Transações
│   ├── credit-cards/              # Cartões de crédito
│   ├── financial-categories/      # Categorias
│   └── pluggy/                    # Integração bancária
├── 📋 schemas/                     # Schemas de validação Zod
├── 🎯 domain/                      # Núcleo do negócio
│   ├── entities/                  # Entidades de domínio
│   ├── value-objects/             # Objetos de valor
│   ├── errors/                    # Erros de domínio
│   ├── contracts/                 # Interfaces
│   └── services/                  # Serviços de domínio
├── 🔄 application/                 # Lógica de aplicação
│   ├── use-cases/                 # Casos de uso
│   ├── dtos/                      # Data Transfer Objects
│   └── contracts/                 # Interfaces da aplicação
├── 🏗️  infrastructure/             # Implementações técnicas
│   ├── database/                  # Repositórios Prisma
│   ├── http/middlewares/          # Middlewares HTTP
│   ├── providers/                 # Integrações externas
│   └── config/                    # Configurações
└── 🛠️  shared/                     # Código compartilhado
```

---

## 🛠️ Comandos Disponíveis

### Desenvolvimento

```bash
yarn dev              # Servidor desenvolvimento (porta 3001)
yarn build            # Build para produção
yarn start            # Servidor produção
```

### Banco de Dados

```bash
yarn db:generate      # Gerar Prisma client
yarn db:migrate       # Executar migrações
yarn db:push          # Sincronizar schema (dev)
yarn db:studio        # Abrir Prisma Studio
yarn db:reset         # Reset completo do banco
```

### Verificação de Tipos

```bash
npx tsc --noEmit      # Verificar tipos TypeScript
```

---

## 🔐 Segurança

### Implementações de Segurança

- ✅ **Autenticação JWT** com tokens de acesso e refresh
- ✅ **Bcrypt** para hash de senhas (10 rounds)
- ✅ **Validação rigorosa** de entrada com Zod
- ✅ **CORS configurado** para requisições cross-origin
- ✅ **Variáveis de ambiente** validadas na inicialização
- ✅ **SQL Injection Prevention** via Prisma ORM
- ✅ **Rate limiting** (em desenvolvimento)

### Configuração de Ambiente

```bash
# .env.example
NODE_ENV=development
PORT=3001

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/flash_investing"

# JWT
JWT_SECRET="your-super-secret-key-min-32-chars"
JWT_EXPIRES_IN="7d"
JWT_REFRESH_SECRET="your-refresh-secret-key-min-32-chars"
JWT_REFRESH_EXPIRES_IN="30d"

# Bcrypt
BCRYPT_ROUNDS=10

# External APIs (Optional)
BELVO_SECRET_ID="your-belvo-secret-id"
BELVO_SECRET_PASSWORD="your-belvo-secret-password"
BELVO_BASE_URL="https://api.belvo.com"
```

---

## 💼 Regras de Negócio

### Regra 50/30/20

O sistema implementa a regra de orçamento pessoal 50/30/20:

- **50% Necessidades**: Despesas essenciais (aluguel, contas, mercado)
- **30% Desejos**: Despesas não essenciais (lazer, restaurantes)
- **20% Poupança**: Economia e pagamento de dívidas

### Gestão de Transações

- Toda transação deve estar vinculada a uma conta financeira
- Transações de cartão de crédito geram automaticamente entradas na fatura
- Categorias definem se a despesa é necessidade, desejo ou poupança
- Transferências entre contas criam transações pareadas

### Cartões de Crédito

- Transações de cartão são separadas das transações regulares
- Faturas são geradas mensalmente com data de vencimento
- Suporte para parcelamento de compras
- Pagamento de fatura cria transação na conta vinculada

---

## 🚀 Deploy

### Opções de Deploy

| Plataforma | Configuração | Tempo |
|------------|--------------|-------|
| **Railway** | Automático via GitHub | ~3min |
| **Render** | Dockerfile incluído | ~5min |
| **Heroku** | Buildpack Node.js | ~5min |
| **VPS** | Docker Compose | ~10min |

### Deploy com Docker

```bash
# Build e execução
docker build -t flash-investing-api .
docker run -p 3001:3001 --env-file .env flash-investing-api

# Ou com Docker Compose
docker-compose up -d
```

### Variáveis de Ambiente em Produção

Certifique-se de configurar todas as variáveis de ambiente necessárias no seu provedor de hospedagem.

---

## 🧪 Testes

### Testando com Swagger UI

1. Acesse http://localhost:3001/documentation
2. Registre um novo usuário no endpoint `/auth/register`
3. Faça login no endpoint `/auth/login`
4. Copie o `accessToken` retornado
5. Clique no botão "Authorize" 🔒
6. Cole o token no formato: `Bearer seu_token_aqui`
7. Teste os endpoints protegidos

### Health Check

```bash
curl http://localhost:3001/health
```

---

## 📊 Monitoramento e Logs

### Logs Estruturados

O Fastify fornece logs estruturados em JSON:

```json
{
  "level": 30,
  "time": 1752551000000,
  "pid": 12345,
  "hostname": "server",
  "reqId": "req-1",
  "req": {
    "method": "POST",
    "url": "/auth/login",
    "remoteAddress": "127.0.0.1"
  },
  "msg": "incoming request"
}
```

### Métricas Disponíveis

- Tempo de resposta por endpoint
- Taxa de sucesso/erro por rota
- Número de usuários ativos
- Volume de transações processadas

---

## 🤝 Contribuindo

### Como Contribuir

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Padrões de Código

- TypeScript com modo strict
- Clean Architecture e DDD
- Commits seguindo Conventional Commits
- Código auto-documentado
- Testes para novas features

---

## 📄 Licença

Este projeto está licenciado sob a MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

## 🔗 Links Úteis

- 📖 [Documentação Fastify](https://www.fastify.io/)
- 🗃️ [Documentação Prisma](https://www.prisma.io/docs/)
- 🔐 [JWT.io](https://jwt.io/)
- 📋 [Zod Documentation](https://zod.dev/)
- 🏦 [Pluggy API Docs](https://docs.pluggy.ai/)

---

<div align="center">

**⭐ Se este projeto foi útil, considere dar uma estrela!**

**Desenvolvido com ❤️ para a comunidade de desenvolvedores**

</div>