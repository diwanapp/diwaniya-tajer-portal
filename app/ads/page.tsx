/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlertCircle,
  BadgeCheck,
  Banknote,
  CalendarClock,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Eye,
  FileText,
  ImageIcon,
  Layers3,
  ListChecks,
  Megaphone,
  PencilLine,
  Plus,
  Receipt,
  RefreshCw,
  Search,
  Send,
  Target,
  TimerReset,
} from "lucide-react";
import { adCategoryFallbacks, getStoredToken, TajerApiError, tajerApi } from "@/lib/api";
import type { AdCategoryOption, MerchantAd, MerchantMeResponse } from "@/lib/types";
import { TajerShell } from "@/components/tajer-shell";
import { AuthGuard } from "@/components/auth-guard";
import { LoadingState } from "@/components/loading-state";

type AdForm = {
  title: string;
  target_category: string;
  amount_paid: string;
  image_url: string;
  receipt_image_url: string;
  description: string;
  requested_start_date: string;
  requested_end_date: string;
};

type Notice = {
  tone: "success" | "error" | "info";
  text: string;
};

type JourneyStepStatus = "complete" | "current" | "blocked" | "pending";

type JourneyStep = {
  label: string;
  detail: string;
  status: JourneyStepStatus;
};

type OperationEvent = {
  label: string;
  date?: string | null;
};

type SummaryCard = {
  label: string;
  value: number;
  icon: LucideIcon;
};

type AdFilterKey = "all" | "action" | "pending" | "payment" | "scheduled" | "live" | "paused" | "ended" | "rejected";
type AdSortKey = "newest" | "oldest" | "action_first" | "live_first" | "scheduled_first";

const DEFAULT_AD_CATEGORY = "other";

const initialForm: AdForm = {
  title: "",
  target_category: DEFAULT_AD_CATEGORY,
  amount_paid: "",
  image_url: "",
  receipt_image_url: "",
  description: "",
  requested_start_date: "",
  requested_end_date: "",
};

const REVIEW_LABELS: Record<string, string> = {
  pending_review: "قيد المراجعة",
  changes_requested: "يتطلب تعديل من التاجر",
  approved: "معتمد",
  rejected: "مرفوض نهائيًا",
};

const PAYMENT_LABELS: Record<string, string> = {
  not_requested: "لم يطلب الدفع",
  payment_requested: "بانتظار الدفع",
  receipt_uploaded: "الإيصال مرفوع",
  verified: "الدفع معتمد",
  rejected: "الدفع مرفوض",
};

const PUBLICATION_LABELS: Record<string, string> = {
  not_configured: "بانتظار تجهيز النشر",
  ready_to_publish: "جاهز للنشر",
  scheduled: "مجدول",
  live: "ظاهر الآن",
  paused: "متوقف مؤقتًا",
  ended: "منتهي",
  cancelled: "ملغي",
};

const NEXT_ACTION_LABELS: Record<string, string> = {
  wait_for_merchant_changes: "بانتظار تعديلك",
  review_ad: "بانتظار مراجعة الإدارة",
  verify_payment: "بانتظار اعتماد الإيصال",
  mark_ready_to_publish: "بانتظار تجهيز النشر من الإدارة",
  publish_now: "بانتظار قرار النشر",
  monitor_publication: "تابع حالة الإعلان",
  wait_for_payment: "بانتظار الدفع",
  request_payment: "بانتظار طلب الدفع من الإدارة",
  configure_placement: "بانتظار تحديد مكان الظهور",
  wait_for_schedule: "بانتظار موعد الظهور",
  view_only: "للعرض فقط",
};

const EFFECTIVE_DELIVERY_LABELS: Record<string, string> = {
  blocked_by_review: "محجوب لحين اكتمال المراجعة",
  blocked_by_payment: "محجوب لحين اعتماد الدفع",
  blocked_by_media: "محجوب لحين اكتمال صورة الإعلان",
  blocked_by_store: "محجوب لحين اعتماد المتجر",
  blocked_by_placement: "محجوب لحين تجهيز مكان الظهور",
  blocked_by_window: "خارج مدة الظهور",
  ready: "جاهز للظهور",
  scheduled: "مجدول",
  live: "ظاهر الآن",
  paused: "متوقف مؤقتًا",
  ended: "منتهي",
  cancelled: "ملغي",
  not_deliverable: "غير جاهز للظهور",
};

const REQUIRED_CHANGE_LABELS: Record<string, string> = {
  image: "صورة الإعلان",
  title: "عنوان الإعلان",
  description: "وصف الإعلان",
  targeting: "الاستهداف",
  start_date: "تاريخ بداية الظهور",
  end_date: "تاريخ نهاية الظهور",
  duration: "مدة الإعلان",
  receipt: "الإيصال / الدفع",
  other: "أخرى",
};

const CHANGE_FIELDS: Record<string, Array<keyof AdForm>> = {
  image: ["image_url"],
  title: ["title"],
  description: ["description"],
  targeting: ["target_category"],
  start_date: ["requested_start_date"],
  end_date: ["requested_end_date"],
  duration: ["requested_start_date", "requested_end_date"],
  receipt: ["receipt_image_url", "amount_paid"],
  other: ["description"],
};

function fieldValue(value?: string | number | null) {
  return value === undefined || value === null ? "" : String(value).trim();
}

function isKnownAdCategory(value: string | null | undefined, categories: AdCategoryOption[]) {
  const clean = fieldValue(value);
  return Boolean(clean && categories.some((category) => category.key === clean));
}

function adCategoryLabel(value: string | null | undefined, categories: AdCategoryOption[]) {
  const clean = fieldValue(value);
  if (!clean) return "كل التصنيفات";
  return categories.find((category) => category.key === clean || category.label === clean)?.label || clean;
}

function adCategoryOptionsForForm(categories: AdCategoryOption[], currentValue: string) {
  const clean = fieldValue(currentValue);
  if (!clean || isKnownAdCategory(clean, categories)) return categories;
  return [...categories, { key: clean, label: clean }];
}

function moderationState(ad: MerchantAd) {
  return fieldValue(ad.review_status) || fieldValue(ad.status) || "pending_review";
}

function paymentStatus(ad: MerchantAd) {
  return fieldValue(ad.payment_status) || "not_requested";
}

function publicationStatus(ad: MerchantAd) {
  return fieldValue(ad.publication_status);
}

function receiptUrl(ad: MerchantAd) {
  return fieldValue(ad.receipt_url) || fieldValue(ad.receipt_image_url);
}

function labelFor(labels: Record<string, string>, value?: string | null) {
  const clean = fieldValue(value);
  return labels[clean] || "حالة غير محددة";
}

function formatDate(value?: string | null) {
  const clean = fieldValue(value);
  if (!clean) return "—";

  const date = /^\d{4}-\d{2}-\d{2}$/.test(clean)
    ? new Date(`${clean}T00:00:00`)
    : new Date(clean);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("ar-SA", {
    dateStyle: "medium",
  }).format(date);
}

function formatDateRange(startValue?: string | null, endValue?: string | null) {
  const start = formatDate(startValue);
  const end = formatDate(endValue);

  if (start === "—" && end === "—") return "";
  if (start === "—") return `حتى ${end}`;
  if (end === "—") return `من ${start}`;
  return `${start} - ${end}`;
}

function formatMoney(value?: string | number | null, currency = "SAR") {
  const amount = Number(fieldValue(value));
  if (!Number.isFinite(amount) || amount <= 0) return "—";

  return new Intl.NumberFormat("ar-SA", {
    style: "currency",
    currency: currency || "SAR",
    maximumFractionDigits: 2,
  }).format(amount);
}

function isHttpUrl(value: string) {
  if (!value.trim()) return true;
  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function requestedChanges(ad: MerchantAd) {
  return Array.isArray(ad.required_changes) ? ad.required_changes.filter(Boolean) : [];
}

function isChangesRequested(ad: MerchantAd) {
  return moderationState(ad) === "changes_requested";
}

function canUpdateReceipt(ad: MerchantAd) {
  const review = moderationState(ad);
  const payment = paymentStatus(ad);
  const publication = publicationStatus(ad);

  return (
    review !== "changes_requested" &&
    review !== "rejected" &&
    ["payment_requested", "rejected", "receipt_uploaded"].includes(payment) &&
    publication !== "ended" &&
    publication !== "cancelled"
  );
}

function needsMerchantAction(ad: MerchantAd) {
  return isChangesRequested(ad) || paymentStatus(ad) === "payment_requested" || paymentStatus(ad) === "rejected";
}

function sortTimestamp(ad: MerchantAd) {
  const clean = fieldValue(ad.created_at || ad.updated_at);
  if (!clean) return 0;
  const time = new Date(clean).getTime();
  return Number.isFinite(time) ? time : 0;
}

function actionPriority(ad: MerchantAd) {
  const review = moderationState(ad);
  const payment = paymentStatus(ad);
  const publication = publicationStatus(ad);

  if (review === "changes_requested") return 1;
  if (payment === "payment_requested") return 2;
  if (payment === "receipt_uploaded") return 3;
  if (review === "rejected") return 4;
  if (review === "pending_review") return 5;
  if (review === "approved" && payment === "verified" && publication === "not_configured") return 6;
  if (publication === "ready_to_publish") return 7;
  if (publication === "scheduled") return 8;
  if (publication === "live") return 9;
  if (publication === "paused") return 10;
  if (publication === "ended" || publication === "cancelled") return 11;
  return 12;
}

function matchesFilter(ad: MerchantAd, filter: AdFilterKey) {
  const review = moderationState(ad);
  const payment = paymentStatus(ad);
  const publication = publicationStatus(ad);

  if (filter === "all") return true;
  if (filter === "action") return needsMerchantAction(ad);
  if (filter === "pending") return review === "pending_review";
  if (filter === "payment") return payment === "payment_requested";
  if (filter === "scheduled") return publication === "scheduled";
  if (filter === "live") return publication === "live";
  if (filter === "paused") return publication === "paused";
  if (filter === "ended") return publication === "ended" || publication === "cancelled";
  if (filter === "rejected") return review === "rejected";
  return true;
}

function searchableAdText(ad: MerchantAd, categories: AdCategoryOption[]) {
  const review = moderationState(ad);
  const payment = paymentStatus(ad);
  const publication = publicationStatus(ad);
  const action = merchantAction(ad);

  return [
    ad.title,
    adCategoryLabel(ad.target_category, categories),
    labelFor(REVIEW_LABELS, review),
    labelFor(PAYMENT_LABELS, payment),
    labelFor(PUBLICATION_LABELS, publication),
    labelFor(NEXT_ACTION_LABELS, ad.next_action),
    action.label,
  ]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase("ar-SA");
}

function sortedAds(items: MerchantAd[], sortKey: AdSortKey) {
  return [...items].sort((a, b) => {
    if (sortKey === "oldest") return sortTimestamp(a) - sortTimestamp(b);
    if (sortKey === "action_first") {
      return actionPriority(a) - actionPriority(b) || sortTimestamp(b) - sortTimestamp(a);
    }
    if (sortKey === "live_first") {
      return Number(publicationStatus(b) === "live") - Number(publicationStatus(a) === "live") || sortTimestamp(b) - sortTimestamp(a);
    }
    if (sortKey === "scheduled_first") {
      return Number(publicationStatus(b) === "scheduled") - Number(publicationStatus(a) === "scheduled") || sortTimestamp(b) - sortTimestamp(a);
    }
    return sortTimestamp(b) - sortTimestamp(a);
  });
}

function badgeTone(value: "ok" | "warn" | "error" | "info" | "muted") {
  if (value === "ok") return "border-ok/20 bg-ok/10 text-ok";
  if (value === "error") return "border-err/20 bg-err/10 text-err";
  if (value === "info") return "border-navy-900/15 bg-navy-900/8 text-navy-900";
  if (value === "muted") return "border-sand-400/30 bg-ivory-100 text-ink-700/70";
  return "border-warn/25 bg-warn/10 text-warn";
}

function reviewTone(status: string) {
  if (status === "approved") return "ok";
  if (status === "rejected") return "error";
  if (status === "changes_requested") return "warn";
  return "warn";
}

function paymentTone(status: string) {
  if (status === "verified") return "ok";
  if (status === "rejected") return "error";
  if (status === "not_requested") return "muted";
  return "warn";
}

function publicationTone(status: string) {
  if (status === "live") return "ok";
  if (status === "cancelled") return "error";
  if (status === "paused" || status === "scheduled") return "warn";
  return "muted";
}

function StatusBadge({
  label,
  tone,
}: {
  label: string;
  tone: "ok" | "warn" | "error" | "info" | "muted";
}) {
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-black ${badgeTone(tone)}`}>
      {label}
    </span>
  );
}

function InfoTile({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-2xl bg-ivory-50 p-3">
      <div className="flex items-center gap-2 text-xs font-bold text-ink-700/60">
        <Icon size={15} />
        {label}
      </div>
      <p className="mt-2 break-words text-sm font-black text-navy-900">{value}</p>
    </div>
  );
}

function FormSection({
  title,
  description,
  icon: Icon,
  children,
  className = "",
}: {
  title: string;
  description?: string;
  icon: LucideIcon;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-xl border border-sand-400/25 bg-ivory-50/55 p-4 sm:p-5 ${className}`}>
      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-gold-700 shadow-card">
          <Icon size={19} />
        </span>
        <div>
          <h3 className="text-base font-black text-navy-900">{title}</h3>
          {description ? <p className="mt-1 text-xs leading-6 text-ink-700/60">{description}</p> : null}
        </div>
      </div>
      {children}
    </section>
  );
}

function SummaryCardItem({ label, value, icon: Icon }: SummaryCard) {
  return (
    <div className="surface p-3.5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold leading-6 text-ink-700/70">{label}</p>
          <p className="num mt-0.5 text-2xl font-black text-navy-900">{value}</p>
        </div>
        <div className="rounded-xl bg-gold-500/12 p-2 text-gold-700">
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}

function validateForm(form: AdForm) {
  if (form.title.trim().length < 2) return "عنوان الإعلان مطلوب ويجب أن يكون واضحًا.";
  if (form.amount_paid.trim()) {
    const amount = Number(form.amount_paid);
    if (!Number.isFinite(amount) || amount <= 0) return "اكتب مبلغًا صحيحًا أكبر من صفر.";
  }
  if (form.image_url.trim() && !isHttpUrl(form.image_url)) {
    return "رابط صورة الإعلان يجب أن يبدأ بـ http أو https.";
  }
  if (form.receipt_image_url.trim() && !isHttpUrl(form.receipt_image_url)) {
    return "رابط صورة الإيصال يجب أن يبدأ بـ http أو https.";
  }
  if (form.requested_start_date && form.requested_end_date) {
    const start = new Date(`${form.requested_start_date}T00:00:00`);
    const end = new Date(`${form.requested_end_date}T00:00:00`);
    if (end < start) return "تاريخ نهاية الإعلان يجب أن يكون بعد تاريخ البداية.";
  }
  return null;
}

function validateReceiptForm(form: AdForm) {
  if (!form.receipt_image_url.trim()) return "أدخل رابط الإيصال قبل الإرسال.";
  if (!isHttpUrl(form.receipt_image_url)) return "أدخل رابط إيصال صحيح يبدأ بـ http أو https.";
  return null;
}

function receiptUpdateErrorMessage(error: unknown) {
  if (error instanceof TajerApiError) {
    if (error.status === 409) return "لا يمكن تحديث الإيصال في حالة الإعلان الحالية.";
    if (error.status === 422) return "أدخل رابط إيصال صحيح يبدأ بـ http أو https.";
  }

  return "تعذر تحديث الإيصال. حاول مرة أخرى.";
}

function adSubmitErrorMessage(error: unknown) {
  if (error instanceof TajerApiError && error.status === 422) {
    return "اختر تصنيفًا إعلانيًا صحيحًا.";
  }

  return "تعذر إرسال الإعلان للمراجعة. راجع الحقول وحاول مرة أخرى.";
}

function payloadFromForm(form: AdForm, categories: AdCategoryOption[], originalAd?: MerchantAd | null) {
  const payload: {
    title: string;
    description?: string;
    target_category?: string;
    image_url?: string;
    receipt_image_url?: string;
    amount_paid?: string;
    requested_start_date?: string;
    requested_end_date?: string;
  } = {
    title: form.title.trim(),
    description: form.description.trim() || undefined,
    target_category: form.target_category || undefined,
    image_url: form.image_url.trim() || undefined,
    receipt_image_url: form.receipt_image_url.trim() || undefined,
    amount_paid: form.amount_paid.trim() || undefined,
    requested_start_date: form.requested_start_date || undefined,
    requested_end_date: form.requested_end_date || undefined,
  };

  const originalCategory = fieldValue(originalAd?.target_category);
  if (
    originalAd &&
    originalCategory &&
    form.target_category === originalCategory &&
    !isKnownAdCategory(originalCategory, categories)
  ) {
    delete payload.target_category;
  }

  return payload;
}

function formFromAd(ad: MerchantAd): AdForm {
  return {
    title: fieldValue(ad.title),
    target_category: fieldValue(ad.target_category) || DEFAULT_AD_CATEGORY,
    amount_paid: fieldValue(ad.amount_paid),
    image_url: fieldValue(ad.image_url),
    receipt_image_url: receiptUrl(ad),
    description: fieldValue(ad.description),
    requested_start_date: fieldValue(ad.requested_start_date),
    requested_end_date: fieldValue(ad.requested_end_date),
  };
}

function merchantAction(ad: MerchantAd) {
  const review = moderationState(ad);
  const payment = paymentStatus(ad);
  const publication = publicationStatus(ad);

  if (review === "changes_requested" || ad.next_action === "wait_for_merchant_changes") {
    return {
      label: "تعديل الإعلان وإعادة الإرسال",
      detail: "عدّل الحقول المطلوبة ثم أرسل الإعلان للمراجعة مرة أخرى.",
      kind: "edit" as const,
    };
  }

  if (canUpdateReceipt(ad)) {
    const hasReceipt = Boolean(receiptUrl(ad));

    if (payment === "rejected") {
      return {
        label: "تحديث الإيصال",
        detail: "راجع ملاحظة الإدارة ثم أرسل رابط إيصال صحيح لاعتماد الدفع.",
        kind: "receipt" as const,
      };
    }

    return {
      label: hasReceipt ? "تحديث الإيصال" : "إضافة / تحديث الإيصال",
      detail: hasReceipt
        ? "يمكنك تحديث رابط الإيصال ما دام بانتظار اعتماد الإدارة."
        : "أضف رابط الإيصال ليتم إرساله للإدارة لاعتماد الدفع.",
      kind: "receipt" as const,
    };
  }

  if (payment === "receipt_uploaded" && publication !== "ended" && publication !== "cancelled") {
    return {
      label: "بانتظار اعتماد الإيصال من الإدارة",
      detail: "تم تسجيل الإيصال، وسيظهر تحديث الحالة بعد اعتماد الدفع.",
      kind: "status" as const,
    };
  }

  if (review === "rejected") {
    return {
      label: "عرض سبب الرفض",
      detail: ad.review_note ? "سبب الرفض ظاهر في ملاحظة الإدارة." : "لم تصل ملاحظة تفصيلية مع الحالة الحالية.",
      kind: "details" as const,
    };
  }

  if (review === "pending_review") {
    return {
      label: "بانتظار مراجعة الإدارة",
      detail: "تم إرسال الطلب ولا يظهر الإعلان قبل الاعتماد.",
      kind: "status" as const,
    };
  }

  if (review === "approved" && payment === "verified" && publication === "not_configured") {
    return {
      label: "بانتظار تجهيز النشر من الإدارة",
      detail: "الدفع معتمد، والخطوة التالية تجهيز مكان ومدة الظهور.",
      kind: "status" as const,
    };
  }

  if (publication === "ready_to_publish") {
    return {
      label: "بانتظار قرار النشر",
      detail: "الإعلان جاهز وينتظر النشر أو الجدولة.",
      kind: "status" as const,
    };
  }

  if (publication === "scheduled") {
    return {
      label: "مجدول للظهور",
      detail: "سيظهر الإعلان في الموعد المحدد بعد تحقق شروط الظهور.",
      kind: "status" as const,
    };
  }

  if (publication === "live") {
    return {
      label: "ظاهر الآن",
      detail: "الإعلان ظاهر في التطبيق حسب مكان الظهور المعتمد.",
      kind: "status" as const,
    };
  }

  if (publication === "paused") {
    return {
      label: "متوقف مؤقتًا من الإدارة",
      detail: "الإعلان غير ظاهر حاليًا حتى تستأنف الإدارة النشر.",
      kind: "status" as const,
    };
  }

  if (publication === "ended" || publication === "cancelled") {
    return {
      label: "عرض التفاصيل",
      detail: "انتهى مسار ظهور هذا الإعلان أو تم إلغاؤه.",
      kind: "details" as const,
    };
  }

  return {
    label: "تابع حالة الإعلان",
    detail: "ستتغير الحالة عند تحديث الإدارة لمسار الطلب.",
    kind: "status" as const,
  };
}

function buildJourney(ad: MerchantAd): JourneyStep[] {
  const review = moderationState(ad);
  const payment = paymentStatus(ad);
  const publication = publicationStatus(ad);
  const hasPublicationProgress = ["ready_to_publish", "scheduled", "live", "paused", "ended", "cancelled"].includes(publication);
  const paymentDone = payment === "verified";
  const reviewApproved = review === "approved";

  return [
    {
      label: "إرسال الطلب",
      detail: formatDate(ad.created_at),
      status: "complete",
    },
    {
      label: "مراجعة الإدارة",
      detail: review === "pending_review" ? "قيد المراجعة" : labelFor(REVIEW_LABELS, review),
      status: review === "rejected" ? "blocked" : review === "pending_review" ? "current" : "complete",
    },
    {
      label: "التعديلات أو الدفع",
      detail: isChangesRequested(ad) ? "بانتظار تعديلك" : labelFor(PAYMENT_LABELS, payment),
      status: isChangesRequested(ad)
        ? "current"
        : review === "rejected"
          ? "blocked"
          : paymentDone
            ? "complete"
            : reviewApproved
              ? "current"
              : "pending",
    },
    {
      label: "تجهيز النشر",
      detail: labelFor(PUBLICATION_LABELS, publication),
      status: review === "rejected"
        ? "blocked"
        : hasPublicationProgress
          ? "complete"
          : reviewApproved && paymentDone
            ? "current"
            : "pending",
    },
    {
      label: "الظهور",
      detail: publication === "live" ? "ظاهر الآن" : labelFor(PUBLICATION_LABELS, publication),
      status: publication === "live"
        ? "current"
        : publication === "ended" || publication === "cancelled"
          ? "complete"
          : review === "rejected"
            ? "blocked"
            : "pending",
    },
  ];
}

function stepClass(status: JourneyStepStatus) {
  if (status === "complete") return "border-ok bg-ok text-white";
  if (status === "current") return "border-gold-500 bg-gold-500 text-navy-900";
  if (status === "blocked") return "border-err bg-err text-white";
  return "border-sand-400/35 bg-white text-sand-500";
}

function JourneyTimeline({ ad }: { ad: MerchantAd }) {
  return (
    <div className="rounded-2xl border border-sand-400/25 bg-ivory-50 p-4">
      <div className="mb-4 flex items-center gap-2">
        <ListChecks className="text-gold-700" size={18} />
        <h4 className="font-black text-navy-900">رحلة الإعلان</h4>
      </div>
      <div className="grid gap-3 md:grid-cols-5">
        {buildJourney(ad).map((step, index) => (
          <div key={step.label} className="relative">
            <div className="flex items-center gap-2 md:block">
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-black ${stepClass(step.status)}`}>
                {index + 1}
              </span>
              <div className="md:mt-3">
                <p className="text-sm font-black text-navy-900">{step.label}</p>
                <p className="mt-1 text-xs leading-5 text-ink-700/60">{step.detail}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function buildOperationEvents(ad: MerchantAd): OperationEvent[] {
  const events: OperationEvent[] = [{ label: "تم إرسال الطلب", date: ad.created_at }];
  const review = moderationState(ad);
  const payment = paymentStatus(ad);
  const publication = publicationStatus(ad);

  if (review === "changes_requested") {
    events.push({ label: "طلبت الإدارة تعديلًا", date: ad.updated_at });
  }
  if (payment === "payment_requested") {
    events.push({ label: "تم طلب الدفع", date: ad.payment_requested_at || ad.updated_at });
  }
  if (payment === "receipt_uploaded" || receiptUrl(ad)) {
    events.push({ label: "تم رفع الإيصال", date: ad.updated_at });
  }
  if (payment === "verified") {
    events.push({ label: "تم اعتماد الدفع", date: ad.payment_verified_at || ad.updated_at });
  }
  if (publication === "scheduled") {
    events.push({ label: "تم جدولة الإعلان", date: ad.placement_starts_at || ad.updated_at });
  }
  if (publication === "live") {
    events.push({ label: "أصبح الإعلان ظاهرًا", date: ad.placement_starts_at || ad.updated_at });
  }
  if (publication === "paused") {
    events.push({ label: "تم إيقاف الإعلان مؤقتًا", date: ad.updated_at });
  }
  if (publication === "ended") {
    events.push({ label: "انتهى الإعلان", date: ad.placement_ends_at || ad.updated_at });
  }

  return events;
}

function OperationLog({ ad }: { ad: MerchantAd }) {
  const events = buildOperationEvents(ad);
  const hasDetailedDates = events.some((event) => fieldValue(event.date));

  return (
    <div className="rounded-2xl border border-sand-400/25 bg-white p-4">
      <div className="mb-3 flex items-center gap-2">
        <ClipboardList className="text-gold-700" size={18} />
        <h4 className="font-black text-navy-900">سجل العمليات</h4>
      </div>
      <div className="space-y-2">
        {events.map((event) => (
          <div key={`${event.label}-${event.date || "none"}`} className="flex items-center justify-between gap-3 rounded-xl bg-ivory-50 px-3 py-2 text-sm">
            <span className="font-bold text-ink-700">{event.label}</span>
            <span className="text-xs font-bold text-ink-700/55">{formatDate(event.date)}</span>
          </div>
        ))}
      </div>
      {!hasDetailedDates ? (
        <p className="mt-3 rounded-xl bg-ivory-100 px-3 py-2 text-xs leading-6 text-ink-700/65">
          سجل العمليات التفصيلي سيظهر بعد ربط سجل الحالات.
        </p>
      ) : null}
    </div>
  );
}

function PerformancePlaceholder({ ended }: { ended: boolean }) {
  return (
    <div className="rounded-2xl border border-gold-500/25 bg-gold-500/10 p-4">
      <div className="flex items-center gap-2">
        <Target className="text-gold-700" size={18} />
        <h4 className="font-black text-navy-900">مؤشرات الأداء</h4>
      </div>
      <p className="mt-3 text-sm leading-7 text-ink-700/70">
        {ended
          ? "سيتم حفظ مؤشرات الإعلان هنا بعد توفر بيانات الأداء الفعلية، حتى يتمكن التاجر من الرجوع لها لاحقًا."
          : "ستظهر هنا مؤشرات أداء الإعلان بعد ربط تتبع الأداء الفعلي من النظام. لن نعرض أرقامًا تقديرية أو غير مؤكدة."}
      </p>
    </div>
  );
}

function AdCard({
  ad,
  categoryOptions,
  onEdit,
}: {
  ad: MerchantAd;
  categoryOptions: AdCategoryOption[];
  onEdit: (ad: MerchantAd) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const review = moderationState(ad);
  const payment = paymentStatus(ad);
  const publication = publicationStatus(ad);
  const changes = requestedChanges(ad);
  const action = merchantAction(ad);
  const image = fieldValue(ad.image_url);
  const receipt = receiptUrl(ad);
  const placement = [ad.placement_screen, ad.placement_slot].map(fieldValue).filter(Boolean).join(" · ") || "—";
  const dateRange = formatDateRange(ad.requested_start_date, ad.requested_end_date);
  const category = adCategoryLabel(ad.target_category, categoryOptions);
  const isEnded = publication === "ended" || publication === "cancelled";
  const actionNeeded = needsMerchantAction(ad);
  const actionPanelClass = actionNeeded
    ? "border-warn/25 bg-warn/10"
    : "border-sand-400/25 bg-ivory-50";

  return (
    <article className={`surface overflow-hidden transition hover:-translate-y-0.5 hover:shadow-glow ${actionNeeded ? "ring-2 ring-warn/15" : ""}`}>
      <div className="flex flex-col lg:flex-row" dir="ltr">
        <div className="border-b border-sand-400/20 p-3 lg:w-[240px] lg:shrink-0 lg:border-b-0 lg:border-r xl:w-[270px]" dir="rtl">
          <div className="aspect-video max-h-44 overflow-hidden rounded-xl bg-navy-900 lg:max-h-none">
            {image && !imageFailed ? (
              <img
                src={image}
                alt={ad.title}
                className="h-full w-full object-cover"
                loading="lazy"
                onError={() => setImageFailed(true)}
              />
            ) : (
              <div className="flex h-full min-h-32 flex-col items-center justify-center gap-2 px-4 text-center text-gold-500">
                <ImageIcon size={30} />
                <p className="text-xs font-black text-ivory-100">لا توجد صورة للإعلان</p>
              </div>
            )}
          </div>
        </div>

        <div className="min-w-0 flex-1 p-4" dir="rtl">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-black text-gold-700">طلب إعلان</p>
              <h3 className="mt-1 break-words text-lg font-black leading-7 text-navy-900 sm:text-xl sm:leading-8">{ad.title}</h3>
              <p className="mt-1 text-sm leading-6 text-ink-700/60">
                {`التصنيف الإعلاني: ${category}`}
              </p>
              {dateRange ? (
                <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-black text-ink-700/55">
                  <CalendarClock size={14} />
                  {dateRange}
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusBadge label={labelFor(REVIEW_LABELS, review)} tone={reviewTone(review)} />
              <StatusBadge label={labelFor(PAYMENT_LABELS, payment)} tone={paymentTone(payment)} />
              <StatusBadge label={labelFor(PUBLICATION_LABELS, publication)} tone={publicationTone(publication)} />
            </div>
          </div>

          <div className={`mt-3 rounded-xl border p-3 ${actionPanelClass}`}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-black text-ink-700/55">الخطوة التالية</p>
                <p className="mt-1 text-base font-black text-navy-900">{action.label}</p>
                <p className="mt-1 text-sm leading-7 text-ink-700/70">{action.detail}</p>
              </div>
              {actionNeeded ? (
                <span className="inline-flex w-fit shrink-0 items-center rounded-full bg-white px-3 py-1 text-xs font-black text-warn">
                  يتطلب إجراء
                </span>
              ) : null}
            </div>
          </div>

          {isChangesRequested(ad) ? (
            <div className="mt-3 rounded-xl border border-warn/25 bg-warn/10 p-3">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-1 shrink-0 text-warn" size={20} />
                <div>
                  <h4 className="font-black text-navy-900">يتطلب تعديل من التاجر</h4>
                  <p className="mt-2 text-sm leading-7 text-ink-700/75">
                    راجعت الإدارة إعلانك وطلبت تعديلات قبل اعتماده.
                  </p>
                </div>
              </div>

              {changes.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {changes.map((change) => (
                    <span key={change} className="rounded-full border border-warn/20 bg-white px-3 py-1 text-xs font-black text-warn">
                      {REQUIRED_CHANGE_LABELS[change] || "أخرى"}
                    </span>
                  ))}
                </div>
              ) : null}

              {ad.review_note ? (
                <div className="mt-3 rounded-xl bg-white p-3">
                  <p className="text-xs font-black text-ink-700/60">ملاحظة الإدارة</p>
                  <p className="mt-1 line-clamp-2 text-sm leading-7 text-navy-900">{ad.review_note}</p>
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {action.kind === "edit" || action.kind === "receipt" ? (
              <button type="button" onClick={() => onEdit(ad)} className="btn-primary inline-flex items-center gap-2 px-4 py-2 text-sm">
                {action.kind === "receipt" ? <Receipt size={16} /> : <PencilLine size={16} />}
                {action.label}
              </button>
            ) : action.kind === "details" ? (
              <button type="button" onClick={() => setExpanded(true)} className="inline-flex items-center gap-2 rounded-full border border-sand-400/35 px-4 py-2 text-sm font-black text-navy-900">
                <FileText size={16} />
                {action.label}
              </button>
            ) : (
              <button type="button" disabled className="inline-flex items-center gap-2 rounded-full border border-sand-400/35 bg-ivory-100 px-4 py-2 text-sm font-black text-ink-700/65">
                <Clock3 size={16} />
                {action.label}
              </button>
            )}

            <button
              type="button"
              onClick={() => setExpanded((current) => !current)}
              className="inline-flex items-center gap-2 rounded-full border border-sand-400/35 px-4 py-2 text-sm font-black text-navy-900"
            >
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              {expanded ? "إخفاء التفاصيل" : "عرض التفاصيل"}
            </button>
          </div>
        </div>
      </div>

      {expanded ? (
        <div className="border-t border-sand-400/20 p-4 sm:p-5">
          {ad.description ? (
            <div className="mb-5 rounded-2xl bg-ivory-50 p-4">
              <p className="text-xs font-black text-ink-700/60">وصف الإعلان</p>
              <p className="mt-2 text-sm leading-7 text-ink-700/75">{ad.description}</p>
            </div>
          ) : null}

          {ad.review_note && !isChangesRequested(ad) ? (
            <div className="mb-5 rounded-2xl bg-ivory-50 p-4">
              <p className="text-xs font-black text-ink-700/60">ملاحظة الإدارة</p>
              <p className="mt-2 text-sm leading-7 text-navy-900">{ad.review_note}</p>
            </div>
          ) : null}

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <InfoTile label="المبلغ" value={formatMoney(ad.amount_paid, ad.currency)} icon={Banknote} />
            <InfoTile label="مكان الظهور" value={placement} icon={Layers3} />
            <InfoTile label="بداية الظهور المعتمدة" value={formatDate(ad.placement_starts_at)} icon={CalendarClock} />
            <InfoTile label="نهاية الظهور المعتمدة" value={formatDate(ad.placement_ends_at)} icon={TimerReset} />
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-sand-400/25 bg-white p-4">
              <div className="mb-3 flex items-center gap-2">
                <Receipt className="text-gold-700" size={18} />
                <h4 className="font-black text-navy-900">الدفع والإيصال</h4>
              </div>
              <div className="grid gap-2 text-sm">
                <InfoTile label="حالة الدفع" value={labelFor(PAYMENT_LABELS, payment)} icon={BadgeCheck} />
                <InfoTile
                  label="المبلغ المطلوب"
                  value={formatMoney(ad.payment_amount || ad.amount_paid, ad.payment_currency || ad.currency)}
                  icon={Banknote}
                />
                <InfoTile label="آخر موعد للدفع" value={formatDate(ad.payment_due_at)} icon={Clock3} />
              </div>
              {ad.payment_note ? (
                <p className="mt-3 rounded-xl bg-ivory-50 p-3 text-sm leading-7 text-ink-700/75">{ad.payment_note}</p>
              ) : null}
              {receipt ? (
                <a
                  href={receipt}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-2 rounded-full border border-sand-400/35 px-4 py-2 text-sm font-black text-navy-900"
                >
                  <Receipt size={16} />
                  عرض الإيصال
                </a>
              ) : (
                <p className="mt-3 rounded-xl bg-ivory-100 px-3 py-2 text-xs leading-6 text-ink-700/65">
                  لم يتم تسجيل رابط إيصال لهذا الإعلان.
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-sand-400/25 bg-white p-4">
              <div className="mb-3 flex items-center gap-2">
                <Eye className="text-gold-700" size={18} />
                <h4 className="font-black text-navy-900">النشر والظهور</h4>
              </div>
              <div className="grid gap-2">
                <InfoTile label="حالة النشر" value={labelFor(PUBLICATION_LABELS, publication)} icon={Megaphone} />
                <InfoTile
                  label="جاهزية الظهور"
                  value={labelFor(EFFECTIVE_DELIVERY_LABELS, ad.effective_delivery_status)}
                  icon={CheckCircle2}
                />
                <InfoTile label="الخطوة التالية" value={labelFor(NEXT_ACTION_LABELS, ad.next_action)} icon={Send} />
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-sand-400/25 bg-white p-4">
            <div className="mb-3 flex items-center gap-2">
              <FileText className="text-gold-700" size={18} />
              <h4 className="font-black text-navy-900">معلومات السجل</h4>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <InfoTile label="تاريخ الطلب" value={formatDate(ad.created_at)} icon={CalendarClock} />
              <InfoTile label="آخر تحديث" value={formatDate(ad.updated_at)} icon={TimerReset} />
              <InfoTile label="البداية المقترحة" value={formatDate(ad.requested_start_date)} icon={CalendarClock} />
              <InfoTile label="النهاية المقترحة" value={formatDate(ad.requested_end_date)} icon={TimerReset} />
            </div>
          </div>

          <div className="mt-5">
            <JourneyTimeline ad={ad} />
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_0.85fr]">
            <OperationLog ad={ad} />
            <div className="rounded-2xl border border-sand-400/25 bg-ivory-50 p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-gold-500/15 p-3 text-gold-700">
                  {action.kind === "edit" ? <PencilLine size={21} /> : <FileText size={21} />}
                </div>
                <div>
                  <h4 className="font-black text-navy-900">{action.label}</h4>
                  <p className="mt-2 text-sm leading-7 text-ink-700/70">{action.detail}</p>
                </div>
              </div>
              {action.kind === "edit" || action.kind === "receipt" ? (
                <button type="button" onClick={() => onEdit(ad)} className="btn-primary mt-4 inline-flex items-center gap-2 px-5 py-3 text-sm">
                  {action.kind === "receipt" ? <Receipt size={17} /> : <PencilLine size={17} />}
                  {action.label}
                </button>
              ) : null}
            </div>
          </div>

          <div className="mt-5">
            <PerformancePlaceholder ended={isEnded} />
          </div>
        </div>
      ) : null}
    </article>
  );
}

export default function AdsPage() {
  const [me, setMe] = useState<MerchantMeResponse | null>(null);
  const [ads, setAds] = useState<MerchantAd[]>([]);
  const [adCategories, setAdCategories] = useState<AdCategoryOption[]>(adCategoryFallbacks);
  const [form, setForm] = useState<AdForm>(initialForm);
  const [editingAd, setEditingAd] = useState<MerchantAd | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [activeFilter, setActiveFilter] = useState<AdFilterKey>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState<AdSortKey>("action_first");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const isReceiptOnlyEditing = editingAd ? canUpdateReceipt(editingAd) : false;

  async function reload() {
    const token = getStoredToken();
    if (!token) {
      window.location.href = "/login";
      return;
    }

    const [nextMe, nextCategories] = await Promise.all([
      tajerApi.me(token),
      tajerApi.adCategories().catch(() => adCategoryFallbacks),
    ]);
    setMe(nextMe);
    setAdCategories(nextCategories.length > 0 ? nextCategories : adCategoryFallbacks);

    const store = nextMe.stores[0];
    if (store) {
      const result = await tajerApi.listAds(token, store.id);
      setAds(result.ads);
    } else {
      setAds([]);
    }
  }

  useEffect(() => {
    reload()
      .catch(() =>
        setNotice({
          tone: "error",
          text: "تعذر تحميل الإعلانات. حاول التحديث مرة أخرى.",
        }),
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (editingAd) setFormOpen(true);
  }, [editingAd]);

  const highlightedFields = useMemo(() => {
    const fields = new Set<keyof AdForm>();
    if (!editingAd) return fields;

    if (canUpdateReceipt(editingAd)) {
      fields.add("receipt_image_url");
      return fields;
    }

    if (paymentStatus(editingAd) === "payment_requested") {
      fields.add("receipt_image_url");
      fields.add("amount_paid");
    }

    for (const change of requestedChanges(editingAd)) {
      for (const field of CHANGE_FIELDS[change] || []) {
        fields.add(field);
      }
    }
    return fields;
  }, [editingAd]);

  const summaryCards = useMemo<SummaryCard[]>(() => {
    const paymentCount = (status: string) => ads.filter((ad) => paymentStatus(ad) === status).length;
    const publicationCount = (statuses: string[]) => ads.filter((ad) => statuses.includes(publicationStatus(ad))).length;

    return [
      { label: "إجمالي الإعلانات", value: ads.length, icon: Megaphone },
      { label: "يتطلب إجراء", value: ads.filter(needsMerchantAction).length, icon: AlertCircle },
      { label: "بانتظار الدفع", value: paymentCount("payment_requested"), icon: Banknote },
      { label: "ظاهر الآن", value: publicationCount(["live"]), icon: Eye },
    ];
  }, [ads]);

  const filterTabs = useMemo(
    () => [
      { key: "all" as const, label: "الكل", count: ads.length },
      { key: "action" as const, label: "يتطلب إجراء", count: ads.filter((ad) => matchesFilter(ad, "action")).length },
      { key: "pending" as const, label: "قيد المراجعة", count: ads.filter((ad) => matchesFilter(ad, "pending")).length },
      { key: "payment" as const, label: "بانتظار الدفع", count: ads.filter((ad) => matchesFilter(ad, "payment")).length },
      { key: "scheduled" as const, label: "مجدولة", count: ads.filter((ad) => matchesFilter(ad, "scheduled")).length },
      { key: "live" as const, label: "ظاهرة الآن", count: ads.filter((ad) => matchesFilter(ad, "live")).length },
      { key: "paused" as const, label: "متوقفة", count: ads.filter((ad) => matchesFilter(ad, "paused")).length },
      { key: "ended" as const, label: "منتهية", count: ads.filter((ad) => matchesFilter(ad, "ended")).length },
      { key: "rejected" as const, label: "مرفوضة", count: ads.filter((ad) => matchesFilter(ad, "rejected")).length },
    ],
    [ads],
  );

  const actionNeededAds = useMemo(() => ads.filter(needsMerchantAction), [ads]);

  const visibleAds = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase("ar-SA");
    const filtered = ads.filter((ad) => {
      if (!matchesFilter(ad, activeFilter)) return false;
      if (!query) return true;
      return searchableAdText(ad, adCategories).includes(query);
    });

    return sortedAds(filtered, sortKey);
  }, [activeFilter, adCategories, ads, searchTerm, sortKey]);

  function fieldClass(field: keyof AdForm) {
    return `input mt-2 ${highlightedFields.has(field) ? "border-warn bg-warn/5 ring-2 ring-warn/20" : ""}`;
  }

  function setField(field: keyof AdForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function startEdit(ad: MerchantAd) {
    setEditingAd(ad);
    setFormOpen(true);
    setForm(formFromAd(ad));
    setNotice({
      tone: "info",
      text: canUpdateReceipt(ad)
        ? "أدخل رابط الإيصال فقط، وسيتم إرساله للإدارة لاعتماد الدفع دون إعادة إرسال محتوى الإعلان."
        : "عدّل الحقول المطلوبة ثم أرسل الإعلان للمراجعة مرة أخرى.",
    });
    window.requestAnimationFrame(() => {
      document.getElementById("ad-request-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function cancelEdit() {
    setEditingAd(null);
    setFormOpen(false);
    setForm(initialForm);
    setNotice(null);
  }

  function openNewRequestForm() {
    setEditingAd(null);
    setForm(initialForm);
    setNotice(null);
    setFormOpen(true);
    window.requestAnimationFrame(() => {
      document.getElementById("ad-request-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function closeRequestForm() {
    setEditingAd(null);
    setForm(initialForm);
    setNotice(null);
    setFormOpen(false);
  }

  async function refreshAds() {
    setRefreshing(true);
    try {
      await reload();
      setNotice({ tone: "success", text: "تم تحديث بيانات الإعلانات." });
    } catch {
      setNotice({
        tone: "error",
        text: "تعذر تحديث الإعلانات. حاول مرة أخرى.",
      });
    } finally {
      setRefreshing(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);

    const receiptOnlyUpdate = Boolean(editingAd && canUpdateReceipt(editingAd));
    const validationError = receiptOnlyUpdate ? validateReceiptForm(form) : validateForm(form);
    if (validationError) {
      setNotice({ tone: "error", text: validationError });
      return;
    }

    const token = getStoredToken();
    const store = me?.stores[0];

    if (!token || (!store && !editingAd)) {
      setNotice({ tone: "error", text: "لم يتم العثور على متجر مرتبط بالحساب." });
      return;
    }

    setSaving(true);
    try {
      if (editingAd && receiptOnlyUpdate) {
        const hadReceipt = Boolean(receiptUrl(editingAd));
        await tajerApi.updateAdReceipt(token, editingAd.id, form.receipt_image_url.trim());
        setNotice({
          tone: "success",
          text: hadReceipt
            ? "تم تحديث الإيصال وإرساله للإدارة للمراجعة."
            : "تم رفع الإيصال وإرساله للإدارة للمراجعة.",
        });
      } else if (editingAd) {
        await tajerApi.updateAd(token, editingAd.id, payloadFromForm(form, adCategories, editingAd));
        setNotice({ tone: "success", text: "تم إرسال الإعلان للمراجعة مرة أخرى." });
      } else {
        if (!store) throw new Error("missing_store");
        await tajerApi.createAd(token, store.id, payloadFromForm(form, adCategories));
        setNotice({ tone: "success", text: "تم إرسال طلب الإعلان للمراجعة." });
      }

      setForm(initialForm);
      setEditingAd(null);
      setFormOpen(false);
      await reload();
    } catch (error) {
      setNotice({
        tone: "error",
        text: receiptOnlyUpdate
          ? receiptUpdateErrorMessage(error)
          : adSubmitErrorMessage(error),
      });
    } finally {
      setSaving(false);
    }
  }

  const noticeClass =
    notice?.tone === "error"
      ? "bg-err/10 text-err"
      : notice?.tone === "success"
        ? "bg-ok/10 text-ok"
        : "bg-gold-500/10 text-gold-700";

  return (
    <AuthGuard>
      <TajerShell>
        {loading ? (
          <LoadingState label="جاري تحميل طلبات الإعلانات..." />
        ) : (
          <>
            <section className="overflow-hidden rounded-[2rem] bg-navy-900 p-6 text-ivory-50 shadow-card lg:p-8">
              <div className="grid gap-6 lg:grid-cols-[1fr_0.72fr] lg:items-center">
                <div>
                  <p className="text-sm font-black text-gold-400">إعلاناتك في ديوانية</p>
                  <h1 className="mt-3 text-3xl font-black leading-tight lg:text-5xl">
                    إعلاناتك في ديوانية
                  </h1>
                  <p className="mt-4 max-w-2xl text-sm leading-8 text-ivory-100/78 lg:text-base">
                    أرسل إعلانك، وتابع مراجعته، وظهوره داخل التطبيق بعد اعتماد الإدارة.
                  </p>
                </div>

                <div className="rounded-[1.5rem] border border-gold-500/25 bg-white/7 p-5">
                  <div className="flex items-center gap-3">
                    <Target className="text-gold-400" />
                    <p className="font-black">مسار واضح للتاجر</p>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-ivory-100/72">
                    كل حالة توضّح المطلوب الآن والخطوة التالية دون إظهار تفاصيل داخلية.
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {summaryCards.map((card) => (
                <SummaryCardItem key={card.label} {...card} />
              ))}
            </section>

            <section className="mt-6 space-y-8">
              {formOpen ? (
              <form id="ad-request-form" onSubmit={submit} className="surface overflow-hidden p-0">
                <div className="flex items-start justify-between gap-3 border-b border-sand-400/20 bg-white px-4 py-5 sm:px-6">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-gold-500/12 p-3 text-gold-700">
                      {editingAd ? <PencilLine size={22} /> : <Plus size={22} />}
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-navy-900">
                        {isReceiptOnlyEditing ? "إضافة / تحديث الإيصال" : editingAd ? "تعديل طلب الإعلان" : "طلب إعلان جديد"}
                      </h2>
                      <p className="mt-1 text-sm text-ink-700/60">
                        {isReceiptOnlyEditing
                          ? "سيتم إرسال الإيصال للإدارة لاعتماد الدفع دون تغيير مراجعة الإعلان."
                          : editingAd
                            ? "سيعود الإعلان للمراجعة بعد الإرسال."
                            : "سيتم إرساله للمراجعة قبل الظهور."}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={editingAd ? cancelEdit : closeRequestForm}
                    className="rounded-full border border-sand-400/40 px-3 py-2 text-xs font-black text-navy-900"
                  >
                    {editingAd ? "إلغاء" : "إغلاق النموذج"}
                  </button>
                </div>

                <div className="p-4 sm:p-6">
                  {editingAd && requestedChanges(editingAd).length > 0 ? (
                    <div className="mb-4 rounded-xl border border-warn/25 bg-warn/10 p-4">
                      <p className="text-sm font-black text-navy-900">التعديلات المطلوبة</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {requestedChanges(editingAd).map((change) => (
                          <span key={change} className="rounded-full bg-white px-3 py-1 text-xs font-black text-warn">
                            {REQUIRED_CHANGE_LABELS[change] || "أخرى"}
                          </span>
                        ))}
                      </div>
                      {editingAd.review_note ? (
                        <p className="mt-3 text-sm leading-7 text-ink-700/75">{editingAd.review_note}</p>
                      ) : null}
                    </div>
                  ) : null}

                  {isReceiptOnlyEditing ? (
                    <FormSection
                      title="إيصال الدفع"
                      description="هذا المسار يحدّث رابط الإيصال فقط دون تعديل محتوى الإعلان."
                      icon={Receipt}
                    >
                      <div className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
                        <div className="rounded-xl border border-gold-500/25 bg-white p-4">
                          <p className="text-sm font-black text-navy-900">تحديث الإيصال فقط</p>
                          <p className="mt-2 text-sm leading-7 text-ink-700/70">
                            لن يتم تعديل عنوان الإعلان أو وصفه أو حالة المراجعة. ستراجع الإدارة الإيصال لاعتماد الدفع.
                          </p>
                        </div>

                        <div>
                          <label className="text-sm font-bold text-ink-700">
                            رابط صورة الإيصال <span className="text-err">*</span>
                          </label>
                          <input
                            className={fieldClass("receipt_image_url")}
                            placeholder="https://example.com/receipt.jpg"
                            value={form.receipt_image_url}
                            onChange={(e) => setField("receipt_image_url", e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    </FormSection>
                  ) : (
                    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)]">
                      <FormSection
                        title="أساسيات الإعلان"
                        description="العنوان والتصنيف والوصف الذي سيساعد الإدارة على فهم الإعلان."
                        icon={Megaphone}
                        className="xl:row-span-2"
                      >
                        <div className="grid gap-4 lg:grid-cols-2">
                          <div>
                            <label className="text-sm font-bold text-ink-700">
                              عنوان الإعلان <span className="text-err">*</span>
                            </label>
                            <input
                              className={fieldClass("title")}
                              placeholder="مثال: عرض خاص للديوانيات"
                              value={form.title}
                              onChange={(e) => setField("title", e.target.value)}
                              required
                            />
                          </div>

                          <div>
                            <label className="text-sm font-bold text-ink-700">التصنيف الإعلاني</label>
                            <select
                              className={fieldClass("target_category")}
                              value={form.target_category}
                              onChange={(e) => setField("target_category", e.target.value)}
                            >
                              {adCategoryOptionsForForm(adCategories, form.target_category).map((category) => (
                                <option key={category.key} value={category.key}>
                                  {category.label}
                                </option>
                              ))}
                            </select>
                            <p className="mt-2 text-xs leading-6 text-ink-700/55">
                              اختر التصنيف الأقرب لطبيعة الإعلان ليسهل على الإدارة مراجعته.
                            </p>
                          </div>

                          <div className="lg:col-span-2">
                            <label className="text-sm font-bold text-ink-700">وصف الإعلان</label>
                            <textarea
                              className={`${fieldClass("description")} min-h-36`}
                              placeholder="اكتب العرض، المدة، أو سبب تميز الإعلان"
                              value={form.description}
                              onChange={(e) => setField("description", e.target.value)}
                            />
                          </div>
                        </div>
                      </FormSection>

                      <FormSection
                        title="المدة والميزانية"
                        description="اكتب المبلغ المقترح ومدة الظهور المطلوبة."
                        icon={CalendarClock}
                      >
                        <div className="grid gap-4 sm:grid-cols-3">
                          <div>
                            <label className="text-sm font-bold text-ink-700">المبلغ المدفوع أو المقترح</label>
                            <input
                              className={fieldClass("amount_paid")}
                              inputMode="decimal"
                              placeholder="مثال: 250"
                              value={form.amount_paid}
                              onChange={(e) => setField("amount_paid", e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-bold text-ink-700">تاريخ بداية الإعلان المقترح</label>
                            <input
                              className={fieldClass("requested_start_date")}
                              type="date"
                              value={form.requested_start_date}
                              onChange={(e) => setField("requested_start_date", e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-bold text-ink-700">تاريخ نهاية الإعلان المقترح</label>
                            <input
                              className={fieldClass("requested_end_date")}
                              type="date"
                              value={form.requested_end_date}
                              onChange={(e) => setField("requested_end_date", e.target.value)}
                            />
                          </div>
                        </div>
                      </FormSection>

                      <FormSection
                        title="الملفات والروابط"
                        description="أضف روابط الصورة والإيصال عند توفرها."
                        icon={ImageIcon}
                      >
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <label className="text-sm font-bold text-ink-700">رابط صورة الإعلان</label>
                            <input
                              className={fieldClass("image_url")}
                              placeholder="https://example.com/ad.jpg"
                              value={form.image_url}
                              onChange={(e) => setField("image_url", e.target.value)}
                            />
                          </div>

                          <div>
                            <label className="text-sm font-bold text-ink-700">رابط صورة الإيصال</label>
                            <input
                              className={fieldClass("receipt_image_url")}
                              placeholder="https://example.com/receipt.jpg"
                              value={form.receipt_image_url}
                              onChange={(e) => setField("receipt_image_url", e.target.value)}
                            />
                          </div>
                        </div>
                      </FormSection>
                    </div>
                  )}
                </div>

                <div className="border-t border-sand-400/20 bg-white px-4 py-4 sm:px-6">
                  <button disabled={saving} className="btn-primary inline-flex w-full items-center justify-center gap-2 px-6 py-3 disabled:opacity-60">
                    <Send size={17} />
                    {saving
                      ? "جاري الإرسال..."
                      : isReceiptOnlyEditing
                        ? "تحديث الإيصال"
                        : editingAd
                          ? "إرسال الإعلان للمراجعة مرة أخرى"
                          : "إرسال طلب الإعلان للمراجعة"}
                  </button>

                  {notice ? (
                    <p className={`mt-4 rounded-xl p-3 text-sm font-bold leading-7 ${noticeClass}`}>
                      {notice.text}
                    </p>
                  ) : null}
                </div>
              </form>
              ) : (
                <div id="ad-request-form" className="surface overflow-hidden p-0">
                  <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy-900 text-gold-500">
                        <Plus size={22} />
                      </div>
                      <div>
                        <h2 className="text-lg font-black text-navy-900">طلب إعلان جديد</h2>
                        <p className="mt-1 max-w-2xl text-sm leading-7 text-ink-700/65">
                          أرسل إعلانك للإدارة وتابع مراجعته وظهوره داخل التطبيق بعد الاعتماد.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={openNewRequestForm}
                      className="btn-primary inline-flex shrink-0 items-center justify-center gap-2 px-5 py-3 text-sm"
                    >
                      <Plus size={17} />
                      إنشاء طلب إعلان
                    </button>
                  </div>
                  {notice ? (
                    <p className={`mx-4 mb-4 rounded-xl p-3 text-sm font-bold leading-7 sm:mx-5 ${noticeClass}`}>
                      {notice.text}
                    </p>
                  ) : null}
                </div>
              )}

              <div>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-black text-navy-900">طلبات الإعلانات</h2>
                    <p className="mt-1 text-sm leading-7 text-ink-700/60">
                      تابع حالة المراجعة، الدفع، النشر، والظهور لكل طلب إعلان.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={refreshAds}
                    disabled={refreshing}
                    className="inline-flex items-center gap-2 rounded-full border border-sand-400/40 px-4 py-2 text-sm font-bold text-navy-900 disabled:opacity-60"
                  >
                    <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
                    تحديث
                  </button>
                </div>

                {actionNeededAds.length > 0 ? (
                  <div className="mb-4 rounded-2xl border border-warn/25 bg-warn/10 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="mt-1 shrink-0 text-warn" size={20} />
                        <div>
                          <h3 className="font-black text-navy-900">يوجد ما يتطلب إجراء</h3>
                          <p className="mt-1 text-sm leading-7 text-ink-700/70">
                            لديك {actionNeededAds.length} طلب إعلان يحتاج تعديلًا أو تحديثًا للإيصال.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveFilter("action")}
                        className="rounded-full bg-white px-4 py-2 text-sm font-black text-warn"
                      >
                        عرض الطلبات
                      </button>
                    </div>
                  </div>
                ) : null}

                <div className="mb-4 rounded-[1.5rem] border border-sand-400/25 bg-white p-4">
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {filterTabs.map((tab) => (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => setActiveFilter(tab.key)}
                        className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-xs font-black ${
                          activeFilter === tab.key
                            ? "border-gold-500/40 bg-gold-500/15 text-navy-900"
                            : "border-sand-400/35 bg-ivory-50 text-ink-700/70"
                        }`}
                      >
                        {tab.label}
                        <span className="num rounded-full bg-white px-2 py-0.5 text-[11px] text-ink-700/65">{tab.count}</span>
                      </button>
                    ))}
                  </div>

                  <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_220px]">
                    <label className="relative block">
                      <Search className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-700/45" size={18} />
                      <input
                        className="input pr-10"
                        placeholder="ابحث بعنوان الإعلان أو التصنيف أو الحالة"
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                      />
                    </label>
                    <select
                      className="input"
                      value={sortKey}
                      onChange={(event) => setSortKey(event.target.value as AdSortKey)}
                    >
                      <option value="action_first">الإعلانات التي تتطلب إجراء أولًا</option>
                      <option value="newest">الأحدث أولًا</option>
                      <option value="oldest">الأقدم أولًا</option>
                      <option value="live_first">الظاهرة الآن أولًا</option>
                      <option value="scheduled_first">المجدولة أولًا</option>
                    </select>
                  </div>
                </div>

                {ads.length === 0 ? (
                  <div className="surface p-8 text-center">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-navy-900 text-gold-500">
                      <Megaphone size={34} />
                    </div>
                    <h3 className="mt-5 text-2xl font-black text-navy-900">لا توجد طلبات إعلان بعد</h3>
                    <p className="mx-auto mt-3 max-w-md text-sm leading-8 text-ink-700/65">
                      أرسل أول طلب إعلان. ستراجعه الإدارة قبل أي ظهور داخل التطبيق.
                    </p>
                  </div>
                ) : visibleAds.length === 0 ? (
                  <div className="surface p-8 text-center">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-navy-900 text-gold-500">
                      <Search size={34} />
                    </div>
                    <h3 className="mt-5 text-2xl font-black text-navy-900">لا توجد نتائج مطابقة</h3>
                    <p className="mx-auto mt-3 max-w-md text-sm leading-8 text-ink-700/65">
                      غيّر التصفية أو امسح البحث لعرض طلبات الإعلان المحمّلة.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-5">
                    {visibleAds.map((ad) => (
                      <AdCard key={ad.id} ad={ad} categoryOptions={adCategories} onEdit={startEdit} />
                    ))}
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </TajerShell>
    </AuthGuard>
  );
}
