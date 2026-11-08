export function formatDZD(value: number | string | null | undefined): string {
  const n = Number(value ?? 0);
  return `${new Intl.NumberFormat("fr-DZ", { maximumFractionDigits: 2 }).format(n)} د.ج`;
}

export const ORDER_STATUSES = {
  pending: { label: "قيد الانتظار", tone: "bg-warning/20 text-accent-foreground" },
  confirmed: { label: "مؤكد", tone: "bg-info/15 text-info" },
  shipped: { label: "تم الشحن", tone: "bg-primary/15 text-primary" },
  delivered: { label: "تم التسليم", tone: "bg-success/15 text-success" },
  cancelled: { label: "ملغي", tone: "bg-destructive/15 text-destructive" },
} as const;
export type OrderStatus = keyof typeof ORDER_STATUSES;

export function slugify(input: string): string {
  const base = input
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return `${base || "product"}-${Math.random().toString(36).slice(2, 7)}`;
}

export const WILAYAS = [
  "أدرار","الشلف","الأغواط","أم البواقي","باتنة","بجاية","بسكرة","بشار","البليدة","البويرة",
  "تمنراست","تبسة","تلمسان","تيارت","تيزي وزو","الجزائر","الجلفة","جيجل","سطيف","سعيدة",
  "سكيكدة","سيدي بلعباس","عنابة","قالمة","قسنطينة","المدية","مستغانم","المسيلة","معسكر","ورقلة",
  "وهران","البيض","إليزي","برج بوعريريج","بومرداس","الطارف","تندوف","تيسمسيلت","الوادي","خنشلة",
  "سوق أهراس","تيبازة","ميلة","عين الدفلى","النعامة","عين تموشنت","غرداية","غليزان","تيميمون","برج باجي مختار",
  "أولاد جلال","بني عباس","عين صالح","عين قزام","تقرت","جانت","المغير","المنيعة",
];
