import { PrismaClient } from './prisma/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  const logs = await prisma.activityLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10
  });
  console.log('ACTIVITY_LOGS:', JSON.stringify(logs, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
