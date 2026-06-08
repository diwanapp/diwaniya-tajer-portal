import { CheckCircle2, Clock3, XCircle } from "lucide-react";

type StatusChipProps = {
  status?: string | null;
};

export function StatusChip({ status }: StatusChipProps) {
  const normalized = status || "unknown";

  const config =
    normalized === "approved" || normalized === "active"
      ? {
          label: "معتمد",
          className: "border-ok/20 bg-ok/10 text-ok",
          icon: CheckCircle2,
        }
      : normalized === "rejected"
        ? {
            label: "مرفوض",
            className: "border-err/20 bg-err/10 text-err",
            icon: XCircle,
          }
        : {
            label: "قيد المراجعة",
            className: "border-warn/20 bg-warn/10 text-warn",
            icon: Clock3,
          };

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-black ${config.className}`}
    >
      <Icon size={14} />
      {config.label}
    </span>
  );
}
