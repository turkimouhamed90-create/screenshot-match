import { createFileRoute, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, Truck, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getPublicPage } from "@/lib/public-page.functions";
import { formatDZD, WILAYAS } from "@/lib/shop";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/p/$slug")({
  loader: async ({ params }) => {
    const page = await getPublicPage({ data: { slug: params.slug } });
    if (!page) throw notFound();
    return page;
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "غير متوفر" }, { name: "robots", content: "noindex" }] };
    const desc = loaderData.description.slice(0, 150) || `اطلب الآن ${loaderData.title} — الدفع عند الاستلام`;
    return {
      meta: [
        { title: loaderData.title },
        { name: "description", content: desc },
        { property: "og:title", content: loaderData.title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "product" },
        { name: "twitter:card", content: "summary_large_image" },
        ...(loaderData.images[0]
          ? [{ property: "og:image", content: loaderData.images[0] }, { name: "twitter:image", content: loaderData.images[0] }]
          : []),
      ],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const page = Route.useLoaderData();
  const [img, setImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [form, setForm] = useState({ name: "", phone: "", wilaya: "", address: "" });
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (!/^0[5-7][0-9]{8}$/.test(form.phone.replace(/\s/g, ""))) return setErr("رقم الهاتف غير صحيح (مثال: 0555123456)");
    setSending(true);
    const { error } = await supabase.from("orders").insert({
      page_id: page.id,
      customer_name: form.name.trim(),
      phone: form.phone.replace(/\s/g, ""),
      wilaya: page.ask_wilaya ? form.wilaya : null,
      address: page.ask_address ? form.address.trim() : null,
      quantity: page.ask_quantity ? qty : 1,
    });
    setSending(false);
    if (error) return setErr("تعذر إرسال الطلب، حاول مجدداً");
    setDone(true);
  }

  if (done)
    return (
      <main className="min-h-screen grid place-items-center px-6 text-center">
        <div>
          <CheckCircle2 className="mx-auto h-16 w-16 text-success" />
          <h1 className="mt-4 text-2xl font-bold">شكراً {form.name}! تم استلام طلبك</h1>
          <p className="mt-2 text-muted-foreground">سنتصل بك قريباً لتأكيد الطلب.</p>
        </div>
      </main>
    );

  return (
    <main className="mx-auto max-w-xl pb-16">
      <div className="aspect-square bg-muted overflow-hidden">
        {page.images[img] && <img src={page.images[img]} alt={page.title} className="h-full w-full object-cover" />}
      </div>
      {page.images.length > 1 && (
        <div className="flex gap-2 p-3 overflow-x-auto">
          {page.images.map((src, i) => (
            <button key={src} onClick={() => setImg(i)} className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 ${i === img ? "border-primary" : "border-transparent"}`}>
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
      <div className="px-5 pt-4">
        <h1 className="text-2xl font-extrabold">{page.title}</h1>
        <div className="mt-2 flex items-baseline gap-3">
          <span className="text-3xl font-bold text-primary font-display">{formatDZD(page.price)}</span>
          {page.old_price && <span className="text-muted-foreground line-through">{formatDZD(page.old_price)}</span>}
        </div>
        <div className="mt-4 flex gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1"><Truck className="h-4 w-4" /> توصيل لكل الولايات</span>
          <span className="flex items-center gap-1"><ShieldCheck className="h-4 w-4" /> الدفع عند الاستلام</span>
        </div>

        <form onSubmit={submit} className="mt-6 rounded-2xl border-2 border-primary bg-card p-5 space-y-4 shadow-soft">
          <h2 className="text-lg font-bold text-center">اطلب الآن</h2>
          <div className="space-y-1">
            <Label>الاسم الكامل</Label>
            <Input required minLength={2} maxLength={100} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="space-y-1">
            <Label>رقم الهاتف</Label>
            <Input required type="tel" dir="ltr" inputMode="tel" placeholder="05xxxxxxxx" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          {page.ask_wilaya && (
            <div className="space-y-1">
              <Label>الولاية</Label>
              <select required value={form.wilaya} onChange={(e) => setForm({ ...form, wilaya: e.target.value })} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                <option value="">اختر الولاية</option>
                {WILAYAS.map((w, i) => <option key={w} value={w}>{String(i + 1).padStart(2, "0")} - {w}</option>)}
              </select>
            </div>
          )}
          {page.ask_address && (
            <div className="space-y-1">
              <Label>العنوان</Label>
              <Input required maxLength={300} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
          )}
          {page.ask_quantity && (
            <div className="flex items-center justify-between">
              <Label>الكمية</Label>
              <div className="flex items-center gap-3">
                <Button type="button" variant="outline" size="icon" onClick={() => setQty(Math.max(1, qty - 1))}>−</Button>
                <span className="w-6 text-center font-bold">{qty}</span>
                <Button type="button" variant="outline" size="icon" onClick={() => setQty(Math.min(100, qty + 1))}>+</Button>
              </div>
            </div>
          )}
          <div className="flex justify-between border-t pt-3 font-bold">
            <span>المجموع</span>
            <span className="text-primary">{formatDZD(Number(page.price) * (page.ask_quantity ? qty : 1))}</span>
          </div>
          {err && <p className="text-sm text-destructive">{err}</p>}
          <Button type="submit" size="lg" disabled={sending} className="w-full bg-accent text-accent-foreground hover:bg-accent/90 text-lg">
            {sending ? "جارٍ الإرسال..." : "تأكيد الطلب"}
          </Button>
        </form>

        {page.description && <p className="mt-6 whitespace-pre-line leading-8">{page.description}</p>}
      </div>
    </main>
  );
}
