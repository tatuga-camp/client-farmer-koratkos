export type Province = {
  id?: string;
  originalId?: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  geography_id?: number;
  name_en?: string;
  name_th: string;
};

export type Amphure = {
  id?: string;
  originalId?: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  province_id?: number;
  name_en?: string;
  name_th: string;
};

export type Tambon = {
  id?: string;
  originalId?: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  amphure_id?: number;
  name_en?: string;
  name_th: string;
  zip_code?: number;
};
