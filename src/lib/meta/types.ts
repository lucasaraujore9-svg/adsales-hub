export type MetaStatus = "ACTIVE" | "PAUSED" | "ARCHIVED" | "DELETED";

export interface MetaAdAccount {
  id: string;
  account_id: string;
  name: string;
  currency: string;
  timezone_name: string;
  account_status?: number;
}

export interface MetaCampaign {
  id?: string;
  name: string;
  objective: string;
  status: MetaStatus;
  special_ad_categories: string[];
  daily_budget?: string;
  lifetime_budget?: string;
  start_time?: string;
  stop_time?: string;
}

export interface MetaGeoLocations {
  countries?: string[];
  regions?: { key: string }[];
  cities?: { key: string; radius?: number; distance_unit?: "mile" | "kilometer" }[];
}

export interface MetaTargeting {
  age_min?: number;
  age_max?: number;
  genders?: number[];
  geo_locations?: MetaGeoLocations;
  flexible_spec?: { interests?: { id: string; name: string }[] }[];
  custom_audiences?: { id: string }[];
  excluded_custom_audiences?: { id: string }[];
  publisher_platforms?: string[];
  facebook_positions?: string[];
  instagram_positions?: string[];
  device_platforms?: string[];
}

export interface MetaAdSet {
  id?: string;
  name: string;
  campaign_id: string;
  status: MetaStatus;
  optimization_goal: string;
  billing_event?: string;
  bid_strategy?: string;
  daily_budget?: string;
  lifetime_budget?: string;
  start_time?: string;
  end_time?: string;
  targeting: MetaTargeting;
  promoted_object?: Record<string, string>;
}

export interface MetaLinkData {
  message: string;
  link: string;
  name: string;
  description?: string;
  call_to_action?: {
    type: string;
    value?: { link?: string };
  };
  image_hash?: string;
  video_id?: string;
}

export interface MetaAdCreativeSpec {
  name: string;
  object_story_spec: {
    page_id: string;
    link_data?: MetaLinkData;
    video_data?: Record<string, unknown>;
  };
  degrees_of_freedom_spec?: Record<string, unknown>;
}

export interface MetaAd {
  id?: string;
  name: string;
  adset_id: string;
  status: MetaStatus;
  creative: { creative_id: string } | MetaAdCreativeSpec;
}

export interface MetaLeadForm {
  id?: string;
  name: string;
  locale?: string;
  questions: {
    type: string;
    label?: string;
    key?: string;
    options?: { value: string; key?: string }[];
  }[];
  thank_you_page: { title: string; body: string };
  privacy_policy: { url: string; link_text?: string };
  follow_up_action_url?: string;
}

export interface MetaAudience {
  id?: string;
  name: string;
  subtype: "CUSTOM" | "LOOKALIKE" | "WEBSITE" | "APP" | "ENGAGEMENT";
  description?: string;
  customer_file_source?: "USER_PROVIDED_ONLY" | "PARTNER_PROVIDED_ONLY" | "BOTH_USER_AND_PARTNER_PROVIDED";
  rule?: Record<string, unknown>;
  lookalike_spec?: {
    origin: { id: string; type: "custom_audience" }[];
    country: string;
    ratio: number;
  };
}

export interface MetaInsightAction {
  action_type: string;
  value: string;
}

export interface MetaInsight {
  date_start: string;
  date_stop: string;
  impressions?: string;
  reach?: string;
  clicks?: string;
  spend?: string;
  ctr?: string;
  cpc?: string;
  cpm?: string;
  frequency?: string;
  actions?: MetaInsightAction[];
  cost_per_action_type?: MetaInsightAction[];
  campaign_id?: string;
  adset_id?: string;
  ad_id?: string;
}

export interface MetaPagedResponse<T> {
  data: T[];
  paging?: {
    cursors?: { before: string; after: string };
    next?: string;
    previous?: string;
  };
}

export interface MetaErrorResponse {
  error: {
    code: number;
    message: string;
    type: string;
    error_user_msg?: string;
    error_user_title?: string;
    fbtrace_id?: string;
  };
}
