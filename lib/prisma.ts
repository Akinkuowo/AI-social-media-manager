import { PrismaClient } from '../prisma/generated/prisma/index'
import { PrismaPg } from '@prisma/adapter-pg'

const prismaClientSingleton = () => {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
  const client = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
  
  if (process.env.NODE_ENV === 'development') {
    const models = Object.keys(client).filter(k => !k.startsWith('_') && !k.startsWith('$'));
    console.log(`[PRISMA_INIT] Models: ${models.join(', ')}`);
  }

  return client;
}

declare global {
  var __prisma_v2: undefined | ReturnType<typeof prismaClientSingleton>
}

export const prisma = globalThis.__prisma_v2 ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalThis.__prisma_v2 = prisma

export default prisma
