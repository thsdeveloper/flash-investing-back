import { z } from 'zod';

export const createItemSchema = z.object({
  connectorId: z.number().int().positive(),
  parameters: z.object({}).passthrough(), // Aceitar qualquer objeto com propriedades extras
  clientUserId: z.string().optional(),
});

export const getAccountsSchema = z.object({
  itemId: z.string().uuid('Item ID must be a valid UUID'),
});

export const getTransactionsSchema = z.object({
  itemId: z.string().uuid('Item ID must be a valid UUID'),
  accountId: z.string().uuid().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

export const connectorResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  institutionUrl: z.string().optional().default(''),
  imageUrl: z.string().optional().default(''),
  primaryColor: z.string().optional().default('#000000'),
  type: z.string().optional().default('PERSONAL_BANK'),
  country: z.string().optional().default('BR'),
  credentials: z.array(z.object({
    label: z.string(),
    name: z.string(),
    type: z.string(),
    placeholder: z.string().optional().default(''),
    validation: z.string().optional().default(''),
    validationMessage: z.string().optional().default(''),
    optional: z.boolean().optional().default(false),
  })).optional().default([]),
  products: z.array(z.string()).optional().default([]),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export const itemResponseSchema = z.object({
  id: z.string().uuid(),
  connector: z.object({
    id: z.number(),
    name: z.string(),
    institutionUrl: z.string().optional().default(''),
    imageUrl: z.string().optional().default(''),
    primaryColor: z.string().optional().default('#000000'),
  }),
  status: z.string(),
  executionStatus: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  lastUpdatedAt: z.string().datetime().optional(),
  webhookUrl: z.string().nullable().optional(),
  clientUserId: z.string().nullable().optional(),
  consecutiveFailedUpdates: z.number().optional().default(0),
  userAction: z.string().nullable().optional(),
  parameter: z.string().nullable().optional(),
});

export const accountResponseSchema = z.object({
  id: z.string().uuid(),
  itemId: z.string().uuid(),
  type: z.string(),
  subtype: z.string(),
  number: z.string(),
  name: z.string(),
  marketingName: z.string().optional().default(''),
  balance: z.number(),
  currency: z.string().optional().default('BRL'),
  currencyCode: z.string().optional().default('986'),
  creditLimit: z.number().optional().default(0),
  owner: z.string().optional().default(''),
  taxNumber: z.string().optional().default(''),
  bank: z.object({
    name: z.string(),
    fullName: z.string().optional().default(''),
    numberCode: z.string().optional().default(''),
  }).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const transactionResponseSchema = z.object({
  id: z.string().uuid(),
  accountId: z.string().uuid(),
  amount: z.number(),
  date: z.string().datetime(),
  description: z.string(),
  descriptionRaw: z.string().optional().default(''),
  currency: z.string().optional().default('BRL'),
  currencyCode: z.string().optional().default('986'),
  merchant: z.object({
    name: z.string().optional().default(''),
    businessName: z.string().optional().default(''),
    cnpj: z.string().optional().default(''),
  }).optional(),
  category: z.object({
    id: z.string().optional().default(''),
    description: z.string().optional().default(''),
  }).optional(),
  creditCardMetadata: z.object({
    installmentNumber: z.number().optional(),
    totalInstallments: z.number().optional(),
    payeeMCC: z.string().optional().default(''),
    payeeName: z.string().optional().default(''),
    cardNumber: z.string().optional().default(''),
    billId: z.string().optional().default(''),
  }).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});