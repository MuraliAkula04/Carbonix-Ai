import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 5000,
  DATABASE_URL: process.env.DATABASE_URL || 'file:./dev.db',
  JWT_SECRET: process.env.JWT_SECRET || 'carbonix-ai-super-secret-jwt-token-2026-secure-key',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  AI_API_KEY: process.env.AI_API_KEY || ''
};
