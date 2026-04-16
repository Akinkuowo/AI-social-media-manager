import { PrismaClient } from '../prisma/generated/prisma/index.js';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: 'postgresql://postgres:inioluwa%402025@localhost:5432/social-media-manager' });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Check social accounts
  const accounts = await prisma.socialAccount.findMany();
  console.log("\n=== SOCIAL ACCOUNTS ===");
  if (accounts.length === 0) {
    console.log("(none found)");
  } else {
    accounts.forEach(a => {
      console.log(`  ${a.platform} | ${a.name} | platformId=${a.platformId} | companyId=${a.companyId}`);
    });
  }

  // Check team members
  const members = await prisma.teamMember.findMany({
    include: { user: { select: { name: true, email: true } }, company: { select: { name: true } } }
  });
  console.log("\n=== TEAM MEMBERS ===");
  members.forEach(m => {
    console.log(`  ${m.user.name} (${m.user.email}) -> company: ${m.company.name} (${m.companyId}) role: ${m.role}`);
  });

  // Check recent activity logs
  const logs = await prisma.activityLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  console.log("\n=== RECENT ACTIVITY LOGS ===");
  logs.forEach(l => {
    console.log(`  [${l.createdAt.toISOString()}] ${l.action}: ${l.details}`);
  });
}

main()
  .catch(e => console.error("SCRIPT_ERROR:", e))
  .finally(() => prisma.$disconnect());
