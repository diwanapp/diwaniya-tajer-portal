export function LoadingState({ label = "جاري تحميل البيانات..." }: { label?: string }) {
  return (
    <div className="surface p-8">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 animate-pulse rounded-2xl bg-gold-500/20" />
        <div className="flex-1">
          <div className="h-3 w-40 animate-pulse rounded-full bg-sand-400/20" />
          <div className="mt-3 h-3 w-64 animate-pulse rounded-full bg-sand-400/15" />
        </div>
      </div>
      <p className="mt-5 text-sm font-bold text-ink-700/70">{label}</p>
    </div>
  );
}
