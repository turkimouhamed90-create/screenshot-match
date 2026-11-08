import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Wallet, ShoppingBag, Files, TrendingUp } from "lucide-react";
import { ordersQuery, pagesQuery } from "@/lib/queries";
import { formatDZD } from "@/lib/shop";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "لوحة التحكم — سوقلي" }, { name: "description", content: "إحصائيات متجرك." }] }),
  loader: ({ context }) =>
    Promise.all([context.queryClient.ensureQueryData(pagesQuery), context.queryClient.ensureQueryData(ordersQuery)]),
  component: Dashboard,
});

function Dashboard() {
  const { data: pages } = useSuspenseQuery(pagesQuery);
  const { data: orders } = useSuspenseQuery(ordersQuery);

  const sales = orders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + Number(o.total), 0);
  const newOrders = orders.filter((o) => o.status === "pending").length;
  const active = pages.filter((p) => p.is_active).length;
  const views = pages.reduce((s, p) => s + p.views, 0);
  const conversion = views ? ((orders.length / views) * 100).toFixed(1) : "0";

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().slice(0, 10);
    return {
      day: d.toLocaleDateString("ar-DZ", { weekday: "short" }),
      طلبات: orders.filter((o) => o.created_at.slice(0, 10) === key).length,
    };
  });

  const stats = [
    { label: "إجمالي المبيعات", value: formatDZD(sales), icon: Wallet },
    { label: "طلبات جديدة", value: newOrders, icon: ShoppingBag },
    { label: "صفحات نشطة", value: active, icon: Files },
    { label: "نسبة التحويل", value: `${conversion}%`, icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">مرحباً بك 👋</h1>
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border bg-card p-5 shadow-soft">
            <s.icon className="h-5 w-5 text-primary" />
            <div className="mt-3 text-sm text-muted-foreground">{s.label}</div>
            <div className="mt-1 text-2xl font-bold font-display">{s.value}</div>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border bg-card p-5 shadow-soft">
        <h2 className="font-bold mb-4">الطلبات خلال آخر 7 أيام</h2>
        <div className="h-64" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={days}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} />
              <YAxis allowDecimals={false} stroke="var(--muted-foreground)" fontSize={12} />
              <Tooltip />
              <Bar dataKey="طلبات" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">إجمالي الزيارات: {views}</p>
    </div>
  );
}
