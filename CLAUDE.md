# CLAUDE.md - Flash Investing Backend API

This file provides guidance to Claude Code when working with the Flash Investing backend API - a comprehensive financial management and investment tracking platform.

## Application Overview

Flash Investing is a **financial management platform** built with Fastify v5, implementing Clean Architecture with Domain-Driven Design (DDD) principles. The backend provides APIs for:
- Personal finance management (transactions, categories, budgeting)
- Credit card management with invoice tracking
- Multiple financial account types (bank, wallet, investment)
- Budget rules implementation (50/30/20 principle)
- Comprehensive authentication and authorization

## Development Commands

### Available Scripts
```bash
# Development
yarn dev            # Start development server on port 3001 with tsx
yarn build          # TypeScript compilation for production
yarn start          # Start production server

# Database Operations
yarn db:generate    # Generate Prisma client after schema changes
yarn db:migrate     # Run database migrations (production)
yarn db:push        # Push schema changes directly (development)
yarn db:studio      # Open Prisma Studio GUI for data inspection
yarn db:reset       # Reset database and reapply migrations (development only)

# Type Checking & Linting
npx tsc --noEmit    # TypeScript type checking without build
```

## Architecture Overview

### Technology Stack
- **Framework**: Fastify v5 - High-performance Node.js web framework
- **Language**: TypeScript with strict mode enabled
- **Architecture**: Clean Architecture + Domain-Driven Design (DDD)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with bcrypt password hashing
- **Validation**: Zod with fastify-type-provider-zod integration
- **API Documentation**: Swagger/OpenAPI 3.0 auto-generated
- **Runtime**: tsx for development (no build step required)
- **HTTP Client**: Axios for external API calls

### Project Structure
```
src/
├── server.ts                        # Main entry point with auto-loading
├── plugins/                         # Global plugins (auto-loaded)
│   ├── cors.ts                     # CORS configuration
│   ├── database.ts                 # Database connection & Prisma decorator
│   ├── swagger.ts                  # API documentation setup
│   └── zod.ts                      # Zod validation configuration
├── routes/                          # Route plugins (auto-loaded with prefixes)
│   ├── auth/                       # Authentication routes (/auth/*)
│   ├── users/                      # User routes (/users/*)
│   ├── financial-accounts/         # Financial account management (/financial-accounts/*)
│   ├── transactions/               # Transaction management (/transactions/*)
│   ├── credit-cards/               # Credit card management (/credit-cards/*)
│   ├── credit-card-invoices/       # Credit card invoices (/credit-card-invoices/*)
│   ├── credit-card-transactions/   # Credit card transactions (/credit-card-transactions/*)
│   ├── financial-categories/       # Category management (/financial-categories/*)
│   ├── user-finance-settings/      # User budget settings (/user-finance-settings/*)
├── schemas/                         # Reusable Zod schemas
│   ├── auth.ts                     # Authentication schemas
│   ├── common.ts                   # Common schemas (pagination, dates)
│   ├── credit-card.ts              # Credit card schemas
│   ├── financial-account.ts        # Financial account schemas
│   ├── financial-category.ts       # Category schemas
│   ├── transaction.ts              # Transaction schemas
│   └── user.ts                     # User-related schemas
├── domain/                          # Core business logic (framework-independent)
│   ├── entities/                   # Domain entities
│   │   ├── user.ts                 # User entity
│   │   ├── financial-account.ts    # Financial account entity
│   │   ├── transaction.ts          # Transaction entity
│   │   ├── credit-card.ts          # Credit card entity
│   │   └── financial-category.ts   # Category entity
│   ├── value-objects/              # Value objects
│   │   ├── email.ts                # Email value object
│   │   ├── password.ts             # Password value object
│   │   └── money.ts                # Money value object
│   ├── errors/                     # Domain-specific errors
│   ├── contracts/                  # Repository interfaces
│   └── services/                   # Domain services
│       └── finance-validation.ts   # Finance business rules
├── application/                     # Use cases and application logic
│   ├── use-cases/                  # Business use cases
│   │   ├── auth/                   # Authentication use cases
│   │   ├── users/                  # User management use cases
│   │   ├── financial-accounts/     # Account use cases
│   │   ├── transactions/           # Transaction use cases
│   │   └── credit-cards/           # Credit card use cases
│   ├── dtos/                       # Data Transfer Objects
│   └── contracts/                  # Application interfaces
├── infrastructure/                  # External concerns (database, HTTP, providers)
│   ├── database/                   # Database implementation
│   │   ├── repositories/           # Prisma repository implementations
│   │   └── prisma-client.ts        # Database connection
│   ├── http/middlewares/           # HTTP middlewares
│   │   ├── auth-middleware.ts      # JWT authentication
│   │   └── finance-validation.ts   # Finance validation rules
│   ├── providers/                  # External service providers
│   │   ├── jwt-provider.ts         # JWT token management
│   └── config/                     # Configuration
│       └── env.ts                  # Environment validation
├── shared/                         # Shared utilities and types
│   ├── errors/                     # Shared error types
│   ├── types/                      # Shared TypeScript types
│   └── utils/                      # Shared utility functions
└── prisma/                         # Database schema and migrations
    ├── schema.prisma               # Database schema
    └── migrations/                 # Database migration files
```

## Clean Architecture Implementation

### Layer Separation
1. **Domain Layer** (`domain/`):
   - Business logic and rules
   - Framework-independent
   - No external dependencies
   - Contains entities, value objects, and domain services

2. **Application Layer** (`application/`):
   - Use cases and application services
   - Orchestrates domain objects
   - Defines interfaces for external dependencies
   - Contains DTOs and application-specific logic

3. **Infrastructure Layer** (`infrastructure/`):
   - External concerns (database, web framework, external APIs)
   - Implements application interfaces
   - Framework-specific code
   - Database repositories, HTTP controllers, external service clients

### Domain-Driven Design (DDD)

#### Entities (`domain/entities/`)
Domain objects with identity and lifecycle:
```typescript
// Example: User entity
export class User {
  constructor(
    private readonly id: string,
    private readonly name: string,
    private readonly email: Email,
    private readonly password: Password,
    private readonly createdAt: Date
  ) {}
  
  // Business methods
  public changePassword(newPassword: Password): void {
    // Business logic for password change
  }
}
```

#### Value Objects (`domain/value-objects/`)
Immutable objects that describe aspects of the domain:
```typescript
// Example: Email value object
export class Email {
  constructor(private readonly value: string) {
    if (!this.isValid(value)) {
      throw new Error('Invalid email format');
    }
  }
  
  private isValid(email: string): boolean {
    // Email validation logic
  }
}
```

#### Use Cases (`application/use-cases/`)
Application-specific business rules:
```typescript
// Example: RegisterUser use case
export class RegisterUserUseCase {
  constructor(
    private userRepository: UserRepository,
    private jwtProvider: JwtProvider
  ) {}
  
  async execute(dto: RegisterUserDto): Promise<AuthResponse> {
    // Use case implementation
  }
}
```

## Auto-Loading System

### Plugin Auto-Loading
The application uses `@fastify/autoload` for automatic plugin and route registration:

- **Global Plugins**: Files in `src/plugins/` are auto-loaded first
- **Route Plugins**: Files in `src/routes/` are auto-loaded with optional prefixes
- **Loading Order**: Plugins load before routes, ensuring dependencies are available

### Adding New Features

#### 1. Create Domain Logic
```typescript
// src/domain/entities/transaction.ts
export class Transaction {
  constructor(
    private readonly id: string,
    private readonly amount: number,
    private readonly description: string,
    private readonly category: string,
    private readonly userId: string
  ) {}
}
```

#### 2. Define Repository Interface
```typescript
// src/domain/contracts/transaction-repository.ts
export interface TransactionRepository {
  create(transaction: Transaction): Promise<Transaction>;
  findByUserId(userId: string): Promise<Transaction[]>;
}
```

#### 3. Create Use Case
```typescript
// src/application/use-cases/create-transaction.ts
export class CreateTransactionUseCase {
  constructor(private transactionRepository: TransactionRepository) {}
  
  async execute(dto: CreateTransactionDto): Promise<Transaction> {
    // Business logic
  }
}
```

#### 4. Implement Repository
```typescript
// src/infrastructure/database/repositories/prisma-transaction-repository.ts
export class PrismaTransactionRepository implements TransactionRepository {
  constructor(private prisma: PrismaClient) {}
  
  async create(transaction: Transaction): Promise<Transaction> {
    // Prisma implementation
  }
}
```

#### 5. Create Route Plugin
```typescript
// src/routes/transactions/index.ts
const transactionRoutes: FastifyPluginAsync = async function (fastify) {
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/',
    schema: {
      description: 'Create a new transaction',
      tags: ['Transactions'],
      body: createTransactionSchema,
      response: {
        201: transactionResponseSchema
      }
    },
    handler: async (request, reply) => {
      // Route handler implementation
    }
  });
};

export default transactionRoutes;
export const autoPrefix = '/transactions';
```

## Authentication System

### JWT Implementation
- **Access Tokens**: Short-lived (7 days default) for API access
- **Refresh Tokens**: Long-lived (30 days default) for token renewal
- **Password Hashing**: bcrypt with configurable rounds
- **Token Storage**: Refresh tokens stored in database with expiration

### Available Endpoints

#### Authentication (`/auth/*`)
- `POST /auth/register` - User registration
- `POST /auth/login` - User authentication

#### User Management (`/users/*`)
- `GET /users/me` - Get current user profile (protected)
- `PUT /users/profile` - Update user profile (protected)

#### Financial Accounts (`/financial-accounts/*`)
- `GET /financial-accounts` - List user accounts
- `POST /financial-accounts` - Create new account
- `GET /financial-accounts/:id` - Get account details
- `PUT /financial-accounts/:id` - Update account
- `DELETE /financial-accounts/:id` - Delete account

#### Transactions (`/transactions/*`)
- `GET /transactions` - List transactions with filters
- `POST /transactions` - Create transaction
- `GET /transactions/:id` - Get transaction details
- `PUT /transactions/:id` - Update transaction
- `DELETE /transactions/:id` - Delete transaction
- `GET /transactions/summary` - Get transaction summary

#### Credit Cards (`/credit-cards/*`)
- `GET /credit-cards` - List user credit cards
- `POST /credit-cards` - Create credit card
- `GET /credit-cards/:id` - Get card details
- `PUT /credit-cards/:id` - Update card
- `DELETE /credit-cards/:id` - Delete card

#### Credit Card Transactions (`/credit-card-transactions/*`)
- `GET /credit-card-transactions` - List card transactions
- `POST /credit-card-transactions` - Create card transaction
- `PUT /credit-card-transactions/:id` - Update transaction
- `DELETE /credit-card-transactions/:id` - Delete transaction

#### Financial Categories (`/financial-categories/*`)
- `GET /financial-categories` - List categories
- `POST /financial-categories` - Create category
- `PUT /financial-categories/:id` - Update category
- `DELETE /financial-categories/:id` - Delete category

#### User Finance Settings (`/user-finance-settings/*`)
- `GET /user-finance-settings` - Get user budget settings
- `PUT /user-finance-settings` - Update budget settings


### Request/Response Flow
```typescript
// Registration Request
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}

// Authentication Response
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "accessToken": "jwt-token",
  "refreshToken": "refresh-jwt-token"
}
```

### Protected Routes
Use the auth middleware for protected endpoints:
```typescript
import { authMiddleware } from '../../infrastructure/http/middlewares/auth-middleware';

fastify.route({
  method: 'GET',
  url: '/protected',
  preHandler: authMiddleware,
  handler: async (request: AuthenticatedRequest, reply) => {
    const user = request.user; // Authenticated user available
  }
});
```

## Database Integration

### Prisma ORM
- **Schema**: Defined in `prisma/schema.prisma`
- **Client Generation**: Automatic TypeScript client generation
- **Type Safety**: End-to-end type safety from database to API
- **Migrations**: Database schema versioning

### Database Models Overview

The application includes comprehensive financial management models:

1. **User Management**
   - `User` - Main user entity with authentication
   - `RefreshToken` - JWT refresh token storage
   - `UserFinanceSettings` - User budget configuration (50/30/20 rule)

2. **Financial Accounts**
   - `FinancialAccount` - Multiple account types (BANK, WALLET, INVESTMENT)
   - `AccountTransfer` - Transfers between accounts

3. **Transactions**
   - `Transaction` - Financial transactions (INCOME/EXPENSE)
   - `FinancialCategory` - Transaction categorization with budget rules

4. **Credit Cards**
   - `CreditCard` - Credit card management
   - `CreditCardInvoice` - Monthly invoice tracking
   - `CreditCardTransaction` - Credit card purchases

5. **External Integrations**
   - Bank account synchronization

### Database Operations
```bash
# Generate Prisma client after schema changes
npm run db:generate

# Push schema changes to database (development)
npm run db:push

# Create and run migrations (production)
npm run db:migrate

# Reset database (development only)
npm run db:reset

# Open Prisma Studio for data inspection
npm run db:studio
```

## Environment Configuration

### Required Environment Variables
```bash
# Application
NODE_ENV=development
PORT=3001

# Database
DATABASE_URL="postgresql://user:password@host:port/database"

# JWT Configuration
JWT_SECRET="your-super-secret-key-here-min-32-chars"
JWT_EXPIRES_IN="7d"
JWT_REFRESH_SECRET="your-refresh-secret-key-here-min-32-chars"
JWT_REFRESH_EXPIRES_IN="30d"

# Bcrypt
BCRYPT_ROUNDS=10

```

### Environment Validation
The application validates all environment variables at startup using Zod:
```typescript
// src/infrastructure/config/env.ts
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  // ... other variables
});
```

## API Documentation

### Swagger Integration
- **URL**: http://localhost:3001/documentation
- **Auto-Generation**: Schemas automatically generate OpenAPI specs
- **Interactive**: Test endpoints directly from the browser
- **Type-Safe**: Zod schemas ensure consistency

### Schema Definition
```typescript
// Example schema definition
export const createUserSchema = z.object({
  name: z.string().min(3).max(255),
  email: z.string().email(),
  password: z.string().min(8).max(100)
});

export const userResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email()
});
```

## Error Handling

### Domain Errors
```typescript
// src/domain/errors/user-errors.ts
export class UserAlreadyExistsError extends DomainError {
  constructor(email: string) {
    super(`User with email ${email} already exists`, 'USER_ALREADY_EXISTS');
  }
}
```

### HTTP Error Handling
```typescript
// Route handler with error handling
try {
  const result = await useCase.execute(request.body);
  return reply.status(201).send(result);
} catch (error) {
  if (error instanceof DomainError) {
    return reply.status(400).send({ error: error.message });
  }
  throw error; // Let Fastify handle unexpected errors
}
```

## Current Implementation Status

### ✅ Implemented Features
- **Clean Architecture**: Full DDD implementation with clear layer separation
- **Authentication System**: JWT-based auth with access/refresh tokens
- **User Management**: Registration, login, profile management
- **Financial Accounts**: Multiple account types (bank, wallet, investment)
- **Transaction Management**: Income/expense tracking with categories
- **Credit Card System**: Card management with invoice and transaction tracking
- **Budget Management**: 50/30/20 rule implementation
- **Category System**: Transaction categorization with budget rules
- **Database**: PostgreSQL with Prisma ORM and migrations
- **API Documentation**: Auto-generated Swagger/OpenAPI docs
- **Type Safety**: End-to-end TypeScript with Zod validation
- **Environment Config**: Validated environment variables
- **Auto-Loading**: Plugin and route auto-registration
- **CORS Support**: Configured for cross-origin requests
- **Error Handling**: Domain errors and HTTP error responses

### 🚧 In Progress
- **Account Transfers**: Transfer between user accounts
- **Reporting**: Financial summaries and analytics

### 📋 Future Enhancements
- **Investment Features**: Portfolio tracking and trading operations
- **Real-time Updates**: WebSocket support for live data
- **Notifications**: Email/push notifications for transactions
- **Multi-currency**: Support for multiple currencies
- **Data Export**: Export data in various formats (CSV, PDF)
- **Testing Suite**: Unit and integration tests
- **Logging System**: Structured logging with log levels
- **Monitoring**: Health checks, metrics, and APM
- **Rate Limiting**: API rate limiting per user
- **Caching Layer**: Redis for performance optimization
- **Audit Trail**: Transaction history and change tracking

## Development Guidelines

### Code Organization
1. **Domain First**: Start with domain entities and business rules
2. **Interface Segregation**: Define clear interfaces between layers
3. **Dependency Injection**: Use constructor injection for dependencies
4. **Single Responsibility**: Each class should have one reason to change

### Adding New Endpoints
1. **Schema First**: Define Zod schemas for request/response
2. **Domain Modeling**: Create entities and value objects
3. **Use Case Implementation**: Implement business logic
4. **Repository Pattern**: Abstract database operations
5. **Route Registration**: Create auto-loaded route plugins

### Database Guidelines
1. **Migration First**: Always create migrations for schema changes
2. **Type Safety**: Leverage Prisma's type generation
3. **Repository Pattern**: Abstract Prisma behind repository interfaces
4. **Transactions**: Use database transactions for multi-step operations

### Security Guidelines
1. **Input Validation**: Validate all inputs with Zod schemas
2. **Authentication**: Protect all sensitive endpoints
3. **Password Security**: Use bcrypt with appropriate rounds
4. **Token Security**: Use strong secrets and appropriate expiration times

## Performance Considerations

### Fastify Benefits
- High-performance HTTP server
- Low overhead plugin system
- Built-in JSON schema validation
- Automatic serialization optimization

### Database Optimization
- Connection pooling via Prisma
- Query optimization with proper indexing
- Prepared statements for security and performance
- Pagination for large datasets

### Caching Strategy (Future)
- Redis for session storage
- Application-level caching for frequently accessed data
- Database query result caching
- CDN for static assets

## Technical Requirements

### Node.js Version
- **Required**: Node.js >=20.0.0
- **Package Manager**: Yarn (preferred) or npm
- **Runtime**: tsx for development, compiled JavaScript for production

### Key Dependencies
```json
{
  "dependencies": {
    "@fastify/autoload": "^6.0.3",
    "@fastify/cors": "^10.0.1",
    "@fastify/swagger": "^9.4.0",
    "@fastify/swagger-ui": "^5.2.0",
    "@prisma/client": "^6.1.0",
    "axios": "^1.7.9",
    "bcrypt": "^5.1.1",
    "fastify": "^5.2.1",
    "fastify-plugin": "^5.0.1",
    "jsonwebtoken": "^9.0.2",
    "zod": "^3.24.1"
  },
  "devDependencies": {
    "@types/node": "^22.10.6",
    "prisma": "^6.1.0",
    "tsx": "^4.19.2",
    "typescript": "^5.7.3"
  }
}
```

## Business Rules

### 50/30/20 Budget Rule
The application implements the 50/30/20 budgeting principle:
- **50% Needs**: Essential expenses (rent, utilities, groceries)
- **30% Wants**: Non-essential expenses (entertainment, dining out)
- **20% Savings**: Savings and debt repayment

### Transaction Rules
- Transactions must be associated with a financial account
- Credit card transactions automatically create invoice entries
- Categories define whether expenses are needs, wants, or savings
- Transfers between accounts create paired transactions

### Credit Card Management
- Credit card transactions are separate from regular transactions
- Invoices are generated monthly with due dates
- Transactions can be split into installments
- Invoice payment creates a transaction in the linked account

## API Response Formats

### Success Response
```json
{
  "data": {
    "id": "uuid",
    "name": "Example",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### Error Response
```json
{
  "error": {
    "message": "Validation error",
    "code": "VALIDATION_ERROR",
    "details": {
      "field": "email",
      "message": "Invalid email format"
    }
  }
}
```

### Paginated Response
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

## Common Development Tasks

### Adding a New Entity
1. Create domain entity in `src/domain/entities/`
2. Add Prisma model in `prisma/schema.prisma`
3. Run `yarn db:generate` to update client
4. Create repository interface in `src/domain/contracts/`
5. Implement repository in `src/infrastructure/database/repositories/`
6. Create use cases in `src/application/use-cases/`
7. Define Zod schemas in `src/schemas/`
8. Create routes in `src/routes/`

### Creating a New Use Case
```typescript
// src/application/use-cases/example/create-example.ts
export class CreateExampleUseCase {
  constructor(
    private exampleRepository: ExampleRepository,
    private validationService: ValidationService
  ) {}
  
  async execute(dto: CreateExampleDto): Promise<Example> {
    // Validate business rules
    await this.validationService.validate(dto);
    
    // Create entity
    const example = Example.create(dto);
    
    // Persist
    return await this.exampleRepository.create(example);
  }
}
```

### Adding a Protected Route
```typescript
// src/routes/example/index.ts
import { authMiddleware } from '../../infrastructure/http/middlewares/auth-middleware';

const exampleRoutes: FastifyPluginAsync = async function (fastify) {
  fastify.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/',
    preHandler: authMiddleware,
    schema: {
      description: 'List examples',
      tags: ['Examples'],
      security: [{ bearerAuth: [] }],
      response: {
        200: exampleListSchema
      }
    },
    handler: async (request: AuthenticatedRequest, reply) => {
      const userId = request.user.id;
      // Implementation
    }
  });
};

export default exampleRoutes;
export const autoPrefix = '/examples';
```

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check DATABASE_URL format
   - Ensure PostgreSQL is running
   - Verify network connectivity

2. **JWT Token Invalid**
   - Ensure JWT_SECRET is at least 32 characters
   - Check token expiration settings
   - Verify Bearer token format in requests

3. **Type Errors After Schema Change**
   - Run `yarn db:generate` after schema changes
   - Restart TypeScript server in IDE
   - Check for circular dependencies

4. **Route Not Found**
   - Ensure route file exports default function
   - Check autoPrefix export for route prefix
   - Verify file is in src/routes/ directory

## Best Practices

### Security
- Always hash passwords with bcrypt
- Use environment variables for secrets
- Implement proper input validation
- Follow principle of least privilege
- Sanitize user inputs
- Use parameterized queries (handled by Prisma)

### Performance
- Use database indexes for frequently queried fields
- Implement pagination for list endpoints
- Cache frequently accessed data
- Use connection pooling (Prisma default)
- Optimize N+1 queries with proper includes

### Code Quality
- Follow Clean Architecture principles
- Write self-documenting code
- Use meaningful variable and function names
- Keep functions small and focused
- Handle errors appropriately
- Add JSDoc comments for complex logic