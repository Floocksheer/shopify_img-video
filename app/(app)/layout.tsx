import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { Sidebar } from "@/components/app/Sidebar";
import { logout } from "@/app/(auth)/actions";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  return (
    <div className="dotgrid min-h-screen">
      <Sidebar email={user.email} isDemo={user.isDemo} logoutAction={logout} />
      <main className="px-4 pb-16 pt-20 md:ml-60 md:px-10 md:pt-10">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
