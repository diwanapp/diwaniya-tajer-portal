import type {
  MerchantAd,
  MerchantAuthResponse,
  MerchantStore,
  MerchantMeResponse,
  MerchantProduct,
  AdCategoryOption,
} from "./types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:8010";

export const TAJER_TOKEN_KEY = "diwaniya_tajer_token";

export class TajerApiError extends Error {
  status: number;
  code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = "TajerApiError";
    this.status = status;
    this.code = code;
  }
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TAJER_TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  window.localStorage.setItem(TAJER_TOKEN_KEY, token);
}

export function clearStoredToken(): void {
  window.localStorage.removeItem(TAJER_TOKEN_KEY);
}

async function request<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = data?.detail?.error;
    const message =
      error?.message ||
      data?.detail?.message ||
      "تعذر تنفيذ الطلب. حاول مرة أخرى.";
    throw new TajerApiError(response.status, message, error?.code || data?.detail?.code);
  }

  return data as T;
}

export const tajerApi = {
  login(payload: { email: string; password: string }) {
    return request<MerchantAuthResponse>("/merchants/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  register(payload: {
    email: string;
    password: string;
    display_name?: string;
    phone?: string;
    store_name: string;
    category: string;
    city_name_ar?: string;
    district_name_ar?: string;
    whatsapp?: string;
    description?: string;
  }) {
    return request<MerchantAuthResponse>("/merchants/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  me(token: string) {
    return request<MerchantMeResponse>("/merchants/me", { token });
  },

  adCategories() {
    return request<AdCategoryOption[]>("/merchants/ad-categories");
  },

  updateStore(
    token: string,
    storeId: string,
    payload: {
      name: string;
      category: string;
      city_name_ar?: string;
      district_name_ar?: string;
      phone?: string;
      whatsapp?: string;
      google_maps_url?: string;
      description?: string;
    },
  ) {
    return request<MerchantStore>(`/merchants/stores/${storeId}`, {
      method: "PATCH",
      token,
      body: JSON.stringify(payload),
    });
  },

  listProducts(token: string, storeId: string) {
    return request<{ products: MerchantProduct[] }>(
      `/merchants/stores/${storeId}/products`,
      { token },
    );
  },

  createProduct(
    token: string,
    storeId: string,
    payload: {
      name: string;
      category: string;
      price: string;
      stock_quantity: number;
      description?: string;
      image_url?: string;
    },
  ) {
    return request<MerchantProduct>(`/merchants/stores/${storeId}/products`, {
      method: "POST",
      token,
      body: JSON.stringify(payload),
    });
  },

  listAds(token: string, storeId: string) {
    return request<{ ads: MerchantAd[] }>(`/merchants/stores/${storeId}/ads`, {
      token,
    });
  },

  createAd(
    token: string,
    storeId: string,
    payload: {
      title: string;
      description?: string;
      target_category?: string;
      image_url?: string;
      receipt_image_url?: string;
      amount_paid?: string;
      requested_start_date?: string;
      requested_end_date?: string;
    },
  ) {
    return request<MerchantAd>(`/merchants/stores/${storeId}/ads`, {
      method: "POST",
      token,
      body: JSON.stringify(payload),
    });
  },

  updateAd(
    token: string,
    adId: string,
    payload: {
      title?: string;
      description?: string;
      target_category?: string;
      image_url?: string;
      receipt_image_url?: string;
      amount_paid?: string;
      requested_start_date?: string;
      requested_end_date?: string;
    },
  ) {
    return request<MerchantAd>(`/merchants/ads/${adId}`, {
      method: "PATCH",
      token,
      body: JSON.stringify(payload),
    });
  },

  updateAdReceipt(token: string, adId: string, receiptUrl: string) {
    return request<MerchantAd>(`/merchants/ads/${adId}/receipt`, {
      method: "PATCH",
      token,
      body: JSON.stringify({ receipt_url: receiptUrl }),
    });
  },
};

export const marketplaceCategories = [
  "بقالة",
  "شاهي وقهوة",
  "حلا",
  "معسلات",
  "صيانة",
  "خدمات نظافة",
] as const;

export const adCategoryFallbacks: AdCategoryOption[] = [
  { key: "restaurants_cafes", label: "مطاعم ومقاهي" },
  { key: "online_store", label: "متجر إلكتروني" },
  { key: "home_services", label: "خدمات منزلية" },
  { key: "automotive", label: "سيارات" },
  { key: "real_estate", label: "عقار" },
  { key: "health_fitness", label: "صحة ولياقة" },
  { key: "entertainment_events", label: "ترفيه وفعاليات" },
  { key: "travel_tourism", label: "سفر وسياحة" },
  { key: "education_training", label: "تعليم وتدريب" },
  { key: "fashion_beauty", label: "أزياء وجمال" },
  { key: "technology_devices", label: "تقنية وأجهزة" },
  { key: "offers_discounts", label: "عروض وتخفيضات" },
  { key: "general_services", label: "خدمات عامة" },
  { key: "other", label: "أخرى" },
];
