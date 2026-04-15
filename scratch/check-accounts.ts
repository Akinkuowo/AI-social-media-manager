import { PrismaClient } from './prisma/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  const accounts = await prisma.socialAccount.findMany();
  console.log('CONNECTED_ACCOUNTS:', JSON.stringify(accounts, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
