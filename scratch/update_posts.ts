import { prisma } from '../lib/prisma';

async function main() {
  const result = await prisma.post.updateMany({
    where: { status: 'DRAFT' },
    data: { status: 'SCHEDULED' }
  });
  console.log(`Updated ${result.count} posts from DRAFT to SCHEDULED.`);

  const posts = await prisma.post.findMany({ select: { id: true, status: true, scheduledAt: true, day: true } });
  console.log("Current Posts:", posts.map(p => ({
      ...p,
      isPast: p.scheduledAt ? p.scheduledAt <= new Date() : false
  })));
}

main().catch(console.error).finally(() => prisma.$disconnect());
