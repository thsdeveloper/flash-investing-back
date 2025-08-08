// Central module registry for all application modules
// This file serves as the main entry point for module organization

// Core business modules
export { default as investmentsRoutes, autoPrefix as investmentsPrefix } from './investments/routes';
export { default as authRoutes, autoPrefix as authPrefix } from './auth/routes';
export { default as debtsRoutes, autoPrefix as debtsPrefix } from './debts/routes';

// Financial management modules
export { default as creditCardsRoutes, autoPrefix as creditCardsPrefix } from './credit-cards/routes';
export { default as transactionsRoutes, autoPrefix as transactionsPrefix } from './transactions/routes';
export { default as financialAccountsRoutes, autoPrefix as financialAccountsPrefix } from './financial-accounts/routes';
export { default as financialCategoriesRoutes, autoPrefix as financialCategoriesPrefix } from './financial-categories/routes';
export { default as userFinanceSettingsRoutes, autoPrefix as userFinanceSettingsPrefix } from './user-finance-settings/routes';


// User management
export { default as usersRoutes, autoPrefix as usersPrefix } from './users/routes';

/**
 * Module Organization Guide:
 * 
 * Each module should follow the same structure:
 * - /domain: Business logic, entities, value objects
 * - /application: Use cases, DTOs, application services  
 * - /infrastructure: Repositories, external services
 * - /routes: HTTP routes and controllers
 * - /schemas: Zod validation schemas
 * 
 * Benefits of this modular approach:
 * 1. Better code organization and maintainability
 * 2. Clear separation of concerns
 * 3. Easier testing and development
 * 4. Scalable architecture for growing applications
 * 5. Independent deployment potential (future microservices)
 */