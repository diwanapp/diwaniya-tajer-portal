export type MerchantUser = {
  id: string;
  email: string;
  display_name?: string | null;
  phone?: string | null;
  status: string;
  is_active: boolean;
};

export type MerchantStore = {
  id: string;
  name: string;
  category: string;
  city_id?: string | null;
  district_id?: string | null;
  city_name_ar?: string | null;
  district_name_ar?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  google_maps_url?: string | null;
  description?: string | null;
  status: string;
  review_note?: string | null;
};

export type MerchantProduct = {
  id: string;
  merchant_store_id: string;
  name: string;
  category: string;
  description?: string | null;
  price: string;
  currency: string;
  stock_quantity: number;
  image_url?: string | null;
  status: string;
  review_note?: string | null;
};

export type MerchantAd = {
  id: string;
  merchant_store_id: string;
  title: string;
  description?: string | null;
  target_category?: string | null;
  target_city_id?: string | null;
  target_district_id?: string | null;
  image_url?: string | null;
  receipt_image_url?: string | null;
  requested_start_date?: string | null;
  requested_end_date?: string | null;
  amount_paid?: string | null;
  currency: string;
  status: string;
  review_note?: string | null;
};

export type MerchantAuthResponse = {
  access_token: string;
  token_type: string;
  merchant: MerchantUser;
  stores: MerchantStore[];
};

export type MerchantMeResponse = {
  merchant: MerchantUser;
  stores: MerchantStore[];
};
