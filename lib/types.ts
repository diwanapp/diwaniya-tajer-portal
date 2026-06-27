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

export type GeoCity = {
  id: string;
  name_ar: string;
  region_ar?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

export type GeoDistrict = {
  id: string;
  city_id: string;
  name_ar: string;
  latitude?: number | null;
  longitude?: number | null;
};

export type MerchantAdAnalytics = {
  available: boolean;
  reason?: string | null;
};

export type AdCategoryOption = {
  key: string;
  label: string;
};

export type MerchantAd = {
  id: string;
  merchant_store_id: string;
  title: string;
  description?: string | null;
  target_category?: string | null;
  target_city?: string | null;
  target_city_id?: string | null;
  target_district_id?: string | null;
  target_city_name_ar?: string | null;
  target_district_name_ar?: string | null;
  target_district_names_ar?: string[] | null;
  target_districts?: string[] | null;
  preferred_placement_screen?: string | null;
  contact_whatsapp?: string | null;
  contact_url?: string | null;
  map_url?: string | null;
  image_url?: string | null;
  receipt_image_url?: string | null;
  receipt_url?: string | null;
  receipt_file_type?: string | null;
  requested_start_date?: string | null;
  requested_end_date?: string | null;
  amount_paid?: string | number | null;
  currency: string;
  status: string;
  review_status?: string | null;
  review_note?: string | null;
  required_changes?: string[] | null;
  payment_status?: string | null;
  payment_amount?: string | number | null;
  payment_currency?: string | null;
  payment_due_at?: string | null;
  payment_note?: string | null;
  payment_duration_days?: number | null;
  payment_placement_screen?: string | null;
  payment_requested_at?: string | null;
  receipt_uploaded_at?: string | null;
  payment_verified_at?: string | null;
  payment_verified_amount?: string | number | null;
  payment_rejected_at?: string | null;
  publication_status?: string | null;
  publication_version?: number | null;
  effective_delivery_status?: string | null;
  next_action?: string | null;
  allowed_actions?: string[] | null;
  blockers?: string[] | null;
  placement_screen?: string | null;
  placement_slot?: string | null;
  placement_priority?: number | null;
  placement_starts_at?: string | null;
  placement_ends_at?: string | null;
  published_at?: string | null;
  paused_at?: string | null;
  ended_at?: string | null;
  cancelled_at?: string | null;
  analytics?: MerchantAdAnalytics | null;
  created_at?: string | null;
  updated_at?: string | null;
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
