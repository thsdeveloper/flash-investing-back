import { z } from 'zod';

export const registerUserSchema = z.object({
  name: z.string().min(3).max(255).describe('Nome completo do usuário'),
  email: z.string().email().describe('Email válido para login'),
  password: z.string().min(8).max(100).describe('Senha com no mínimo 8 caracteres'),
});

export const loginSchema = z.object({
  email: z.string().email().describe('Email cadastrado no sistema'),
  password: z.string().describe('Senha do usuário'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().describe('Token de refresh JWT'),
});

export const userResponseSchema = z.object({
  id: z.string().uuid().describe('ID único do usuário'),
  name: z.string().describe('Nome completo do usuário'),
  email: z.string().email().describe('Email do usuário'),
});

export const authResponseSchema = z.object({
  user: userResponseSchema,
  accessToken: z.string().describe('Token JWT de acesso'),
  refreshToken: z.string().describe('Token JWT de refresh'),
});

export const errorResponseSchema = z.object({
  error: z.string().describe('Mensagem de erro'),
});