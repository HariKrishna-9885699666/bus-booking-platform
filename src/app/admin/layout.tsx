import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const role = (session.user as { role?: string }).role;
  if (role !== "admin") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminSidebar user={session.user} />
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 shadow-sm">
          <h1 className="text-xl font-semibold text-gray-800">Admin Panel</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {session.user.name || session.user.email}
            </span>
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
