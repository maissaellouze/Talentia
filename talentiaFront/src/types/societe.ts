export interface Societe {
  id: number;
  rne_id: string | null;
  name: string | null;
  legal_name: string | null;
  activity: string | null;
  sector: string | null;
  naf_code: string | null;
  legal_form: string | null;
  address: string | null;
  city: string | null;
  code_postal: number | null;
  website: string | null;
  logo: string | null;
  email: string | null;
  phone: string | null;
  verified_status: boolean;
  average_rating: number | null;
  review_count: number;
  social_media: {
    linkedin?: string;
    facebook?: string;
    instagram?: string;
  } | null;
}

export interface PaginatedResponse {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  data: Societe[];
}