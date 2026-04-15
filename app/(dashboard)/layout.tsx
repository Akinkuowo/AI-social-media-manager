import { Sidebar } from '@/components/ui/Sidebar';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return redirect("/login");
  }

  // Check if user has a company association
  const teamMember = await prisma.teamMember.findFirst({
    where: { userId: session.user.id }
  });

  if (!teamMember) {
    return redirect("/onboarding");
  }

  const userName = session?.user?.name || "User";
  const firstName = userName.split(' ')[0];
  const initial = userName.charAt(0).toUpperCase();

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 flex flex-col min-h-screen">
        <header className="flex items-center justify-between px-8 py-6 border-b border-border">
          <div>
            <h2 className="text-xl font-bold">Welcome back, <span className="text-primary">{firstName}</span></h2>
            <p className="text-sm text-muted mt-1">Here's what's happening with your brands today.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">{initial}</div>
            <span className="text-sm font-medium">{userName}</span>
          </div>
        </header>
        <div className="flex-1 p-8 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
