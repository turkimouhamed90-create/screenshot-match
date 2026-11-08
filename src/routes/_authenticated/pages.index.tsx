import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Copy, ExternalLink, Trash2 } from "lucide-react";
import { pagesQuery } from "@/lib/queries";
import { formatDZD } from "@/lib/shop";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/_authenticated/pages/")({
  head: () => ({ meta: [{ title: "صفحاتي — سوقلي" }, { name: "description", content: "صفحات الهبوط الخاصة بك." }] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(pagesQuery),
  component: PagesList,
});

function PagesList() {
  const { data: pages } = useSuspenseQuery(pagesQuery);
  const qc = useQueryClient();

  async function toggle(id: string, is_active: boolean) {
    await supabase.from("landing_pages").update({ is_active }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["pages"] });
  }
  async function remove(id: string) {
    if (!confirm("حذف هذه الصفحة وكل طلباتها؟")) return;
    await supabase.from("landing_pages").delete().eq("id", id);
    qc.invalidateQueries();
    toast.success("تم الحذف");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">صفحاتي</h1>
        <Button asChild><Link to="/pages/new">+ صفحة جديدة</Link></Button>
      </div>
      {pages.length === 0 && (
        <div className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">
          لا توجد صفحات بعد. أنشئ أول صفحة لمنتجك!
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        {pages.map((p) => {
          const url = `${window.location.origin}/p/${p.slug}`;
          return (
            <div key={p.id} className="rounded-2xl border bg-card p-4 shadow-soft flex gap-4">
              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-muted">
                {p.images[0] && <img src={p.images[0]} alt={p.title} className="h-full w-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold truncate">{p.title}</h3>
                  <Switch checked={p.is_active} onCheckedChange={(v) => toggle(p.id, v)} aria-label="تفعيل" />
                </div>
                <div className="text-primary font-bold">{formatDZD(p.price)}</div>
                <div className="text-xs text-muted-foreground">{p.views} زيارة</div>
                <div className="mt-2 flex gap-1">
                  <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(url); toast.success("تم نسخ الرابط"); }}>
                    <Copy className="h-3 w-3" /> نسخ الرابط
                  </Button>
                  <Button size="sm" variant="ghost" asChild>
                    <a href={url} target="_blank" rel="noreferrer"><ExternalLink className="h-3 w-3" /></a>
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(p.id)}>
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
