import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ordersQuery } from "@/lib/queries";
import { formatDZD, ORDER_STATUSES, type OrderStatus } from "@/lib/shop";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/orders")({
  head: () => ({ meta: [{ title: "الطلبات — سوقلي" }, { name: "description", content: "إدارة الطلبات الواردة." }] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(ordersQuery),
  component: Orders,
});

function Orders() {
  const { data: orders } = useSuspenseQuery(ordersQuery);
  const qc = useQueryClient();
  const [filter, setFilter] = useState<"all" | OrderStatus>("all");
  const list = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  async function setStatus(id: string, status: string) {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) {
      toast.error("تعذر التحديث");
      return;
    }
    toast.success("تم تحديث الحالة");
    qc.invalidateQueries({ queryKey: ["orders"] });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">إدارة الطلبات</h1>
        <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <SelectTrigger className="w-44 bg-card"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الطلبات</SelectItem>
            {Object.entries(ORDER_STATUSES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="rounded-2xl border bg-card shadow-soft overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">المشتري</TableHead>
              <TableHead className="text-right">الهاتف</TableHead>
              <TableHead className="text-right">المنتج</TableHead>
              <TableHead className="text-right">الولاية / العنوان</TableHead>
              <TableHead className="text-right">المبلغ</TableHead>
              <TableHead className="text-right">التاريخ</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.length === 0 && (
              <TableRow><TableCell colSpan={7} className="text-center py-10 text-muted-foreground">لا توجد طلبات</TableCell></TableRow>
            )}
            {list.map((o) => {
              const st = ORDER_STATUSES[o.status as OrderStatus] ?? ORDER_STATUSES.pending;
              return (
                <TableRow key={o.id}>
                  <TableCell className="font-medium">{o.customer_name}</TableCell>
                  <TableCell dir="ltr" className="text-right"><a href={`tel:${o.phone}`} className="text-primary">{o.phone}</a></TableCell>
                  <TableCell>{o.product_title} × {o.quantity}</TableCell>
                  <TableCell className="text-sm">{[o.wilaya, o.address].filter(Boolean).join(" — ")}</TableCell>
                  <TableCell className="font-bold">{formatDZD(o.total)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString("ar-DZ")}</TableCell>
                  <TableCell>
                    <Select value={o.status} onValueChange={(v) => setStatus(o.id, v)}>
                      <SelectTrigger className={`w-32 border-0 ${st.tone}`}><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(ORDER_STATUSES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
