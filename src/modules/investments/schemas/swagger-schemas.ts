// JSON Schema puro para responses do Swagger
export const portfolioItemSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    userId: { type: 'string', format: 'uuid' },
    name: { type: 'string' },
    description: { anyOf: [{ type: 'string' }, { type: 'null' }] },
    totalValue: { type: 'number' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
  required: ['id', 'userId', 'name', 'totalValue', 'createdAt', 'updatedAt'],
};

export const portfolioListResponseSchema = {
  type: 'object',
  properties: {
    data: {
      type: 'array',
      items: portfolioItemSchema,
    },
    pagination: {
      type: 'object',
      properties: {
        page: { type: 'number' },
        limit: { type: 'number' },
        total: { type: 'number' },
        totalPages: { type: 'number' },
      },
      required: ['page', 'limit', 'total', 'totalPages'],
    },
  },
  required: ['data', 'pagination'],
};

export const assetItemSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    symbol: { type: 'string' },
    name: { type: 'string' },
    type: { 
      type: 'string',
      enum: ['STOCK', 'BOND', 'FUND', 'ETF', 'REIT', 'CRYPTO', 'COMMODITY']
    },
    riskLevel: { 
      type: 'string',
      enum: ['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH']
    },
    sector: { anyOf: [{ type: 'string' }, { type: 'null' }] },
    currentPrice: { type: 'number' },
    currency: { type: 'string' },
    isActive: { type: 'boolean' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
  required: ['id', 'symbol', 'name', 'type', 'riskLevel', 'currentPrice', 'currency', 'isActive', 'createdAt', 'updatedAt'],
};

export const assetListResponseSchema = {
  type: 'object',
  properties: {
    data: {
      type: 'array',
      items: assetItemSchema,
    },
    pagination: {
      type: 'object',
      properties: {
        page: { type: 'number' },
        limit: { type: 'number' },
        total: { type: 'number' },
        totalPages: { type: 'number' },
      },
      required: ['page', 'limit', 'total', 'totalPages'],
    },
  },
  required: ['data', 'pagination'],
};

export const recommendationItemSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    userId: { type: 'string', format: 'uuid' },
    assetId: { type: 'string', format: 'uuid' },
    type: { 
      type: 'string',
      enum: ['BUY', 'SELL', 'HOLD', 'STRONG_BUY', 'STRONG_SELL']
    },
    reason: { 
      type: 'string',
      enum: ['TECHNICAL_ANALYSIS', 'FUNDAMENTAL_ANALYSIS', 'MARKET_CONDITIONS', 'RISK_MANAGEMENT', 'PORTFOLIO_REBALANCING', 'DIVERSIFICATION']
    },
    targetPrice: { anyOf: [{ type: 'number' }, { type: 'null' }] },
    stopLoss: { anyOf: [{ type: 'number' }, { type: 'null' }] },
    confidence: { type: 'number', minimum: 0, maximum: 100 },
    description: { type: 'string' },
    isActive: { type: 'boolean' },
    expiresAt: { anyOf: [{ type: 'string', format: 'date-time' }, { type: 'null' }] },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
  required: ['id', 'userId', 'assetId', 'type', 'reason', 'confidence', 'description', 'isActive', 'createdAt', 'updatedAt'],
};

export const recommendationListResponseSchema = {
  type: 'object',
  properties: {
    data: {
      type: 'array',
      items: recommendationItemSchema,
    },
    pagination: {
      type: 'object',
      properties: {
        page: { type: 'number' },
        limit: { type: 'number' },
        total: { type: 'number' },
        totalPages: { type: 'number' },
      },
      required: ['page', 'limit', 'total', 'totalPages'],
    },
  },
  required: ['data', 'pagination'],
};

export const recommendationArrayResponseSchema = {
  type: 'object',
  properties: {
    data: {
      type: 'array',
      items: recommendationItemSchema,
    },
  },
  required: ['data'],
};

export const errorResponseSchema = {
  type: 'object',
  properties: {
    message: { type: 'string' },
  },
  required: ['message'],
};