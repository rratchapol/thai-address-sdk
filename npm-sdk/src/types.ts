export type AddressLevel = "province" | "district" | "subdistrict";

export type AddressFormat = "full_th" | "short_th" | "plain_th" | "en";

export type MatchType = "exact" | "alias" | "prefix" | "contains" | "fuzzy";

export interface Province {
  id: number;
  provinceCode: number;
  provinceNameEn: string;
  provinceNameTh: string;
}

export interface District {
  id: number;
  provinceCode: number;
  districtCode: number;
  districtNameEn: string;
  districtNameTh: string;
  postalCode: number;
}

export interface Subdistrict {
  id: number;
  provinceCode: number;
  districtCode: number;
  subdistrictCode: number;
  subdistrictNameEn: string;
  subdistrictNameTh: string;
  postalCode: number;
}

export interface AddressHierarchy {
  province: Province;
  district?: District;
  subdistrict?: Subdistrict;
  postalCode?: number;
  formattedAddress: string;
}

export interface MatchMetadata {
  input: string;
  matchedText: string;
  matchType: MatchType;
  confidence: number;
  corrected: boolean;
}

export interface SearchResult extends AddressHierarchy {
  type: AddressLevel;
  match: MatchMetadata;
}

export interface SearchOptions {
  levels?: AddressLevel[];
  limit?: number;
  minScore?: number;
  format?: AddressFormat;
}

export interface FilterOptions {
  provinceCode?: number;
  districtCode?: number;
}

export interface NormalizeOptions {
  format?: AddressFormat;
  limit?: number;
  minScore?: number;
}

export interface Correction {
  input: string;
  normalized: string;
  field: AddressLevel;
  matchType: MatchType;
}

export type NormalizeStatus = "matched" | "partial" | "ambiguous" | "not_found";

export interface NormalizeResult {
  input: string;
  normalizedInput: string;
  status: NormalizeStatus;
  bestMatch: AddressHierarchy | null;
  confidence: number;
  alternatives: AddressHierarchy[];
  corrections: Correction[];
}
