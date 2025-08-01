# Migration Guide - Standardized API Responses

Este guia documenta a migração de todos os endpoints para o padrão de resposta padronizado implementado no módulo de dívidas.

## ✅ Arquivos já padronizados

- `/src/modules/debts/routes/index.ts` - **Já implementado** (modelo de referência)
- `/src/modules/auth/routes/index.ts` - **Migrado** ✅

## 📋 Arquivos que precisam de migração

### 1. Financial Accounts ✅
- **Arquivo**: `/src/modules/financial-accounts/routes/index.ts`
- **Status**: **Migrado** ✅
- **Endpoints**: 5 endpoints (GET /, GET /:id, POST /, PATCH /:id, DELETE /:id)

### 2. Transactions ✅
- **Arquivo**: `/src/modules/transactions/routes/index.ts`
- **Status**: **Migrado** ✅
- **Endpoints**: 6 endpoints principais

### 3. Credit Cards ✅
- **Arquivo**: `/src/modules/credit-cards/routes/index.ts`
- **Status**: **Migrado** ✅
- **Endpoints**: Múltiplos endpoints para cartões e transações

### 4. Financial Categories ✅
- **Arquivo**: `/src/modules/financial-categories/routes/index.ts`  
- **Status**: **Migrado** ✅
- **Endpoints**: CRUD completo

### 5. User Finance Settings ✅
- **Arquivo**: `/src/modules/user-finance-settings/routes/index.ts`
- **Status**: **Migrado** ✅
- **Endpoints**: Configurações de orçamento

### 6. Users ✅
- **Arquivo**: `/src/modules/users/routes/index.ts`
- **Status**: **Migrado** ✅
- **Endpoints**: Perfil do usuário

### 7. Pluggy Integration ✅
- **Arquivo**: `/src/modules/pluggy/routes/index.ts`
- **Status**: **Migrado** ✅
- **Endpoints**: Integração bancária

### 8. Investments ✅
- **Arquivo**: `/src/modules/investments/routes/index.ts`
- **Status**: **Migrado** ✅
- **Endpoints**: Portfólios e ativos

## 🎯 Padrão de Migração

### Imports necessários:
```typescript
import { 
  standardSuccessResponseSchema,
  standardPaginatedResponseSchema,
  standardError400Schema,
  standardError401Schema,
  standardError404Schema,
  standardError422Schema,
  standardError500Schema
} from '@src/modules/shared/schemas/common';
import { ResponseHelper } from '@src/modules/shared/utils/response-helper';
```

### Schema de Response (antes):
```typescript
response: {
  200: dataSchema,
  400: errorResponseSchema
}
```

### Schema de Response (depois):
```typescript
response: {
  200: standardSuccessResponseSchema(dataSchema),
  400: standardError400Schema,
  401: standardError401Schema,
  404: standardError404Schema,
  500: standardError500Schema
}
```

### Handler Response (antes):
```typescript
try {
  const result = await useCase.execute(data);
  return reply.status(200).send(result);
} catch (error) {
  if (error instanceof DomainError) {
    return reply.status(400).send({ error: error.message });
  }
  throw error;
}
```

### Handler Response (depois):
```typescript
try {
  const result = await useCase.execute(data);
  const response = ResponseHelper.success(
    result,
    { message: 'Operação realizada com sucesso' }
  );
  return reply.status(200).send(response);
} catch (error) {
  if (error instanceof DomainError) {
    const response = ResponseHelper.error(error.message, [error.code]);
    return reply.status(400).send(response);
  }
  throw error;
}
```

### Para endpoints com paginação:
```typescript
const response = ResponseHelper.successPaginated(
  items,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  { message: 'Dados recuperados com sucesso' }
);
```

### Para diferentes tipos de erro:
```typescript
// 404 - Not Found
return reply.status(404).send(ResponseHelper.notFound('Recurso'));

// 401 - Unauthorized  
return reply.status(401).send(ResponseHelper.unauthorized());

// 422 - Validation Error
return reply.status(422).send(ResponseHelper.validationError(['Campo obrigatório']));

// 500 - Internal Server Error
return reply.status(500).send(ResponseHelper.internalServerError(error));
```

## 🔄 Estrutura de Resposta Padronizada

### Sucesso:
```json
{
  "success": true,
  "data": { /* dados da resposta */ },
  "message": "Operação realizada com sucesso",
  "errors": null,
  "meta": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "version": "1.0.0"
  }
}
```

### Erro:
```json
{
  "success": false,
  "data": null,
  "message": "Mensagem de erro",
  "errors": ["ERROR_CODE"],
  "meta": {
    "timestamp": "2024-01-01T00:00:00.000Z", 
    "version": "1.0.0"
  }
}
```

### Paginação:
```json
{
  "success": true,
  "data": {
    "items": [/* array de itens */],
    "pagination": {
      "current_page": 1,
      "total_pages": 10,
      "total_items": 100,
      "items_per_page": 10
    }
  },
  "message": "Dados recuperados com sucesso",
  "errors": null,
  "meta": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "version": "1.0.0"
  }
}
```

## ⚠️  Arquivos Legados para Remoção

### Após migração completa, remover:

1. **DTOs antigos** (se não utilizados):
   - `/src/application/dtos/` - Todo o diretório
   
2. **Use Cases antigos** (se não utilizados):
   - `/src/application/use-cases/` - Todo o diretório
   
3. **Contratos antigos** (se não utilizados):
   - `/src/domain/contracts/` - Todo o diretório
   
4. **Entidades antigas** (se não utilizadas):
   - `/src/domain/entities/` - Todo o diretório

5. **Repositórios antigos** (se não utilizados):
   - `/src/infrastructure/database/repositories/` - Todo o diretório

6. **Middlewares antigos** (se não utilizados):
   - `/src/infrastructure/http/middlewares/` - Todo o diretório

7. **Providers antigos** (se não utilizados):
   - `/src/infrastructure/providers/` - Todo o diretório

8. **Rotas antigas** (se não utilizadas):
   - `/src/routes/` - Todo o diretório

9. **Schemas antigos** (se não utilizados):
   - `/src/schemas/` - Todo o diretório

10. **Types antigos** (se não utilizados):
    - `/src/shared/types/` - Todo o diretório

11. **Scripts de deploy antigos**:
    - `/scripts/deploy.js` - Já marcado para exclusão

## 🏁 Checklist de Validação

Após migrar cada módulo, verificar:

- [ ] Todos os endpoints retornam resposta padronizada
- [ ] Schemas de response atualizados
- [ ] Tratamento de erro implementado  
- [ ] Mensagens em português
- [ ] Códigos de erro definidos
- [ ] Testes atualizados (se existirem)
- [ ] Documentação Swagger atualizada
- [ ] Middleware de erro funcionando

## 📝 Notas Importantes

1. **Compatibilidade**: O middleware de erro garante compatibilidade com endpoints não migrados
2. **Gradual**: A migração pode ser feita gradualmente por módulo
3. **Testes**: Testar cada endpoint após migração
4. **Logs**: Verificar logs para erros não capturados
5. **Performance**: O novo padrão não impacta performance significativamente