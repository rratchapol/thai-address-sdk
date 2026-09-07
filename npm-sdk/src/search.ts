import {
  districtByCode,
  districts,
  getEntityAliases,
  provinceByCode,
  provinces,
  subdistricts,
} from "./dataset.js";
import { formatAddress } from "./formatter.js";
import { normalizeText, roundScore, scoreTerm } from "./text.js";
import type {
  AddressFormat,
  AddressLevel,
  District,
  MatchMetadata,
  MatchType,
  Province,
  SearchOptions,
  SearchResult,
  Subdistrict,
} from "./types.js";

interface SearchEntry {
  level: AddressLevel;
  code: number;
  text: string;
  alias: boolean;
  province: Province;
  district?: District;
  subdistrict?: Subdistrict;
}

const searchEntries: SearchEntry[] = [];

function appendTerms(
  entry: Omit<SearchEntry, "text" | "alias">,
  terms: string[],
): void {
  for (const text of terms)
    searchEntries.push({ ...entry, text, alias: false });
  for (const text of getEntityAliases(entry.level, entry.code)) {
    searchEntries.push({ ...entry, text, alias: true });
  }
}

for (const province of provinces) {
  appendTerms({ level: "province", code: province.provinceCode, province }, [
    province.provinceNameTh,
    province.provinceNameEn,
  ]);
}

for (const district of districts) {
  const province = provinceByCode.get(district.provinceCode);
  if (!province) continue;
  appendTerms(
    { level: "district", code: district.districtCode, province, district },
    [district.districtNameTh, district.districtNameEn],
  );
}

for (const subdistrict of subdistricts) {
  const province = provinceByCode.get(subdistrict.provinceCode);
  const district = districtByCode.get(subdistrict.districtCode);
  if (!province || !district) continue;
  appendTerms(
    {
      level: "subdistrict",
      code: subdistrict.subdistrictCode,
      province,
      district,
      subdistrict,
    },
    [subdistrict.subdistrictNameTh, subdistrict.subdistrictNameEn],
  );
}

function effectiveMatchType(matchType: MatchType, alias: boolean): MatchType {
  return alias && matchType === "exact" ? "alias" : matchType;
}

function toResult(
  input: string,
  entry: SearchEntry,
  score: number,
  matchType: MatchType,
  format: AddressFormat,
): SearchResult {
  const metadata: MatchMetadata = {
    input,
    matchedText: entry.text,
    matchType: effectiveMatchType(matchType, entry.alias),
    confidence: roundScore(score),
    corrected: entry.alias || matchType === "fuzzy",
  };

  return {
    type: entry.level,
    province: entry.province,
    district: entry.district,
    subdistrict: entry.subdistrict,
    postalCode: entry.subdistrict?.postalCode ?? entry.district?.postalCode,
    formattedAddress: formatAddress(entry, format),
    match: metadata,
  };
}

export function search(
  query: string,
  options: SearchOptions = {},
): SearchResult[] {
  const input = normalizeText(query);
  if (!input) return [];

  const levels = new Set<AddressLevel>(
    options.levels ?? ["province", "district", "subdistrict"],
  );
  const limit = Math.max(1, Math.min(options.limit ?? 10, 100));
  const minScore = options.minScore ?? 0.72;
  const format = options.format ?? "full_th";
  const bestByEntity = new Map<string, SearchResult>();

  for (const entry of searchEntries) {
    if (!levels.has(entry.level)) continue;
    const termScore = scoreTerm(input, entry.text);
    if (!termScore || termScore.score < minScore) continue;

    const result = toResult(
      input,
      entry,
      termScore.score,
      termScore.matchType,
      format,
    );
    const key = `${entry.level}:${entry.code}`;
    const current = bestByEntity.get(key);
    if (!current || result.match.confidence > current.match.confidence) {
      bestByEntity.set(key, result);
    }
  }

  return [...bestByEntity.values()]
    .sort(
      (left, right) =>
        right.match.confidence - left.match.confidence ||
        left.formattedAddress.localeCompare(right.formattedAddress, "th"),
    )
    .slice(0, limit);
}
