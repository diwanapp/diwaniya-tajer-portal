import type { LucideIcon } from "lucide-react";

type MetricCardProps = {
  title: string;
  value: string;
  hint: string;
  icon: LucideIcon;
};

export function MetricCard({ title, value, hint, icon: Icon }: MetricCardProps) {
  return (
    <div className="surface p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-ink-700">{title}</p>
          <p className="num mt-3 text-3xl font-black text-navy-900">{value}</p>
          <p className="mt-2 text-xs leading-6 text-ink-700/75">{hint}</p>
        </div>
        <div className="rounded-2xl bg-gold-500/15 p-3 text-gold-700">
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}
