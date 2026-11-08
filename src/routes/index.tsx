import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { LayoutTemplate, PackageCheck, BarChart3 } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "سوقلي — أنشئ صفحة هبوط لمنتجك في دقائق" },
      { name: "description", content: "منصة للتجار في الجزائر: صفحات هبوط سريعة، استمارة طلب، وإدارة طلبات الدفع عند الاستلام." },
      { property: "og:title", content: "سوقلي — صفحات هبوط للتجار" },
      { property: "og:description", content: "أنشئ صفحة منتجك واستقبل الطلبات بالدفع عند الاستلام." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const features = [
  { icon: LayoutTemplate, title: "صفحة منتج جاهزة", text: "اسم، سعر، صور، واستمارة طلب سريعة للهاتف." },
  { icon: PackageCheck, title: "إدارة الطلبات", text: "تابع كل طلب: قيد الانتظار، تم الشحن، ملغي." },
  { icon: BarChart3, title: "إحصائيات واضحة", text: "المبيعات، الزيارات، ونسبة التحويل في لمحة." },
];

function Index() {
  return (
    <main className="min-h-screen">
      <section className="bg-hero text-primary-foreground">
        <div className="mx-auto max-w-5xl px-6 py-6 flex items-center justify-between">
          <span className="font-display text-2xl font-extrabold">سوقلي</span>
          <Button asChild variant="secondary" size="sm">
            <Link to="/auth">دخول</Link>
          </Button>
        </div>
        <div className="mx-auto max-w-5xl px-6 pb-24 pt-14 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
            بيع منتجك بصفحة واحدة
            <br />
            <span className="text-accent">والدفع عند الاستلام</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg opacity-90">
            أنشئ صفحة هبوط احترافية لمنتجك في دقائق، شارك الرابط، واستقبل الطلبات مباشرة في لوحة التحكم.
          </p>
          <Button asChild size="lg" className="mt-10 bg-accent text-accent-foreground hover:bg-accent/90 text-base px-8">
            <Link to="/auth">ابدأ مجاناً</Link>
          </Button>
        </div>
      </section>
      <section className="mx-auto max-w-5xl px-6 -mt-12 grid gap-4 md:grid-cols-3 pb-20">
        {features.map((f) => (
          <div key={f.title} className="rounded-2xl bg-card p-6 shadow-soft border">
            <f.icon className="h-8 w-8 text-primary" />
            <h3 className="mt-4 text-lg font-bold">{f.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{f.text}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
