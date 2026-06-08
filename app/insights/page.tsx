import { BarChart3, MousePointerClick, Phone, Send } from "lucide-react";
import { TajerShell } from "@/components/tajer-shell";
import { MetricCard } from "@/components/metric-card";

export default function InsightsPage() {
  return (
    <TajerShell>
      <h1 className="text-3xl font-black text-navy-900">الأثر التجاري</h1>
      <p className="mt-2 text-sm leading-7 text-ink-700/70">
        هذه الصفحة مخصصة لإظهار أثر وجود التاجر في سوق ديوانية. سيتم تفعيل الأرقام بعد إضافة تتبع الضغطات من تطبيق المستخدم.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="ضغطات اتصال" value="—" hint="عدد من ضغطوا زر الاتصال من السوق." icon={Phone} />
        <MetricCard title="ضغطات واتساب" value="—" hint="عدد من فتحوا واتساب للتواصل مع المتجر." icon={Send} />
        <MetricCard title="ضغطات الإعلان" value="—" hint="مؤشر مباشر لأثر الإعلان المدفوع." icon={MousePointerClick} />
        <MetricCard title="معدل الاهتمام" value="—" hint="يحسب لاحقًا من المشاهدات والضغطات." icon={BarChart3} />
      </div>

      <div className="surface mt-6 p-6">
        <h2 className="text-xl font-black text-navy-900">لماذا هذه البيانات مهمة؟</h2>
        <p className="mt-3 max-w-3xl text-sm leading-8 text-ink-700/75">
          عندما يرى التاجر عدد الضغطات والمشاهدات، يستطيع تقييم أثر الإعلان والمنتجات على التواصل والطلبات المحتملة. هذا يجعل قرار تجديد الإعلان أو زيادة الميزانية أوضح وأسهل.
        </p>
      </div>
    </TajerShell>
  );
}
