import { createFileRoute, Link, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LayoutDashboard, FilePlus2, Files, ShoppingBag, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: Layout,
});

const nav = [
  { to: "/dashboard", label: "الرئيسية", icon: LayoutDashboard },
  { to: "/pages", label: "صفحاتي", icon: Files },
  { to: "/pages/new", label: "صفحة جديدة", icon: FilePlus2 },
  { to: "/orders", label: "الطلبات", icon: ShoppingBag },
] as const;

function Layout() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }
  return (
    <div className="min-h-screen md:flex">
      <aside className="bg-sidebar text-sidebar-foreground md:w-60 md:min-h-screen p-4 flex md:flex-col gap-2 overflow-x-auto">
        <div className="font-display text-2xl font-extrabold text-sidebar-primary px-2 py-3 hidden md:block">سوقلي</div>
        {nav.map((n) => (
          <Link
            key={n.to}
            to={n.to}
            activeOptions={{ exact: true }}
            className="flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm hover:bg-sidebar-accent"
            activeProps={{ className: "bg-sidebar-accent text-sidebar-primary font-bold" }}
          >
            <n.icon className="h-4 w-4" /> {n.label}
          </Link>
        ))}
        <button onClick={signOut} className="md:mt-auto flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm hover:bg-sidebar-accent">
          <LogOut className="h-4 w-4" /> خروج
        </button>
      </aside>
      <main className="flex-1 p-4 md:p-8 max-w-6xl">
        <Outlet />
      </main>
    </div>
  );
}
