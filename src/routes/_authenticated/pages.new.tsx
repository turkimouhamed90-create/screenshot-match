import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ImagePlus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { slugify } from "@/lib/shop";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/_authenticated/pages/new")({
  head: () => ({ meta: [{ title: "صفحة هبوط جديدة — سوقلي" }, { name: "description", content: "أنشئ صفحة لمنتجك." }] }),
  component: NewPage,
});

function NewPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = Route.useRouteContext();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [oldPrice, setOldPrice] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [askAddress, setAskAddress] = useState(true);
  const [askWilaya, setAskWilaya] = useState(true);
  const [askQty, setAskQty] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function upload(files: FileList | null) {
    if (!files) return;
    setUploading(true);
    for (const file of Array.from(files).slice(0, 6)) {
      const path = `${user.id}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "")}`;
      const { error } = await supabase.storage.from("product-images").upload(path, file);
      if (error) { toast.error("فشل رفع صورة"); continue; }
      const { data } = await supabase.storage.from("product-images").createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
      if (data) setImages((prev) => [...prev, data.signedUrl]);
    }
    setUploading(false);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("landing_pages").insert({
      user_id: user.id,
      slug: slugify(title),
      title,
      description,
      price: Number(price),
      old_price: oldPrice ? Number(oldPrice) : null,
      images,
      ask_address: askAddress,
      ask_wilaya: askWilaya,
      ask_quantity: askQty,
    });
    setSaving(false);
    if (error) {
      toast.error("تعذر الحفظ");
      return;
    }
    toast.success("تم إنشاء الصفحة 🎉");
    qc.invalidateQueries({ queryKey: ["pages"] });
    navigate({ to: "/pages" });
  }

  return (
    <form onSubmit={save} className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">إنشاء صفحة هبوط جديدة</h1>
      <div className="rounded-2xl border bg-card p-6 shadow-soft space-y-4">
        <div className="space-y-2">
          <Label>اسم المنتج</Label>
          <Input required maxLength={120} value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>الوصف</Label>
          <Textarea rows={5} maxLength={3000} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>السعر (د.ج)</Label>
            <Input required type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>السعر قبل التخفيض (اختياري)</Label>
            <Input type="number" min={0} value={oldPrice} onChange={(e) => setOldPrice(e.target.value)} />
          </div>
        </div>
        <div className="space-y-2">
          <Label>صور المنتج</Label>
          <div className="flex flex-wrap gap-3">
            {images.map((src) => (
              <div key={src} className="relative h-24 w-24 overflow-hidden rounded-xl border">
                <img src={src} alt="" className="h-full w-full object-cover" />
                <button type="button" onClick={() => setImages(images.filter((i) => i !== src))} className="absolute top-1 left-1 rounded-full bg-card p-1">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            <label className="grid h-24 w-24 cursor-pointer place-items-center rounded-xl border-2 border-dashed text-muted-foreground hover:border-primary">
              <ImagePlus className="h-6 w-6" />
              <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => upload(e.target.files)} />
            </label>
          </div>
          {uploading && <p className="text-xs text-muted-foreground">جارٍ رفع الصور...</p>}
        </div>
      </div>
      <div className="rounded-2xl border bg-card p-6 shadow-soft space-y-3">
        <h2 className="font-bold">حقول استمارة الشراء</h2>
        <p className="text-sm text-muted-foreground">الاسم ورقم الهاتف مطلوبان دائماً.</p>
        {[
          ["الولاية", askWilaya, setAskWilaya],
          ["العنوان", askAddress, setAskAddress],
          ["الكمية", askQty, setAskQty],
        ].map(([label, val, set]) => (
          <div key={label as string} className="flex items-center justify-between">
            <span>{label as string}</span>
            <Switch checked={val as boolean} onCheckedChange={set as (v: boolean) => void} />
          </div>
        ))}
      </div>
      <Button type="submit" size="lg" disabled={saving || uploading}>نشر الصفحة</Button>
    </form>
  );
}
