import { formatAddress } from "./formatter.js";
import { search } from "./search.js";
import { createSegments, roundScore, stripAddressLabels } from "./text.js";
import type {
  AddressHierarchy,
  AddressLevel,
  Correction,
  NormalizeOptions,
  NormalizeResult,
  SearchResult,
} from "./types.js";

interface Candidate {
  hierarchy: AddressHierarchy;
  score: number;
  matches: SearchResult[];
}

function entityCode(result: SearchResult): number {
  if (result.type === "province") return result.province.provinceCode;
  if (result.type === "district") return result.district!.districtCode;
  return result.subdistrict!.subdistrictCode;
}

function collectMatches(
  segments: string[],
  level: AddressLevel,
  minScore: number,
): SearchResult[] {
  const best = new Map<number, SearchResult>();

  for (const segment of segments) {
    for (const result of search(segment, {
      levels: [level],
      limit: 30,
      minScore,
      format: "full_th",
    })) {
      const code = entityCode(result);
      const current = best.get(code);
      if (!current || result.match.confidence > current.match.confidence)
        best.set(code, result);
    }
  }

  return [...best.values()].sort(
    (left, right) => right.match.confidence - left.match.confidence,
  );
}

function createHierarchy(
  result: SearchResult,
  format: NormalizeOptions["format"],
): AddressHierarchy {
  const hierarchy = {
    province: result.province,
    district: result.district,
    subdistrict: result.subdistrict,
    postalCode: result.subdistrict?.postalCode ?? result.district?.postalCode,
  };
  return {
    ...hierarchy,
    formattedAddress: formatAddress(hierarchy, format ?? "full_th"),
  };
}

function scoreCandidate(
  primary: SearchResult,
  related: SearchResult[],
): number {
  const scores = [
    primary.match.confidence,
    ...related.map((item) => item.match.confidence),
  ];
  const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  return roundScore(average + Math.min(related.length, 2) * 0.02);
}

function isClaimedByAncestor(
  primary: SearchResult,
  ancestors: SearchResult[],
): boolean {
  if (primary.match.matchType !== "fuzzy") return false;

  return ancestors.some(
    (ancestor) =>
      ancestor.match.input === primary.match.input &&
      ancestor.match.confidence > primary.match.confidence &&
      ancestor.match.matchType !== "fuzzy",
  );
}

function buildCandidates(
  provinceMatches: SearchResult[],
  districtMatches: SearchResult[],
  subdistrictMatches: SearchResult[],
  options: NormalizeOptions,
): Candidate[] {
  const candidates: Candidate[] = [];
  const firstProvince = provinceMatches[0];
  const firstDistrict = districtMatches[0];
  const strongProvince =
    firstProvince && firstProvince.match.confidence >= 0.86
      ? firstProvince
      : undefined;
  const strongDistrict =
    firstDistrict && firstDistrict.match.confidence >= 0.86
      ? firstDistrict
      : undefined;

  if (subdistrictMatches.length > 0) {
    for (const subdistrict of subdistrictMatches) {
      if (
        isClaimedByAncestor(subdistrict, [
          ...districtMatches,
          ...provinceMatches,
        ])
      ) {
        continue;
      }
      if (
        strongProvince &&
        subdistrict.province.provinceCode !==
          strongProvince.province.provinceCode
      ) {
        continue;
      }
      if (
        strongDistrict &&
        subdistrict.district?.districtCode !==
          strongDistrict.district?.districtCode
      ) {
        continue;
      }

      const related = [
        districtMatches.find(
          (district) =>
            district.district?.districtCode ===
            subdistrict.district?.districtCode,
        ),
        provinceMatches.find(
          (province) =>
            province.province.provinceCode ===
            subdistrict.province.provinceCode,
        ),
      ].filter((result): result is SearchResult => result !== undefined);

      candidates.push({
        hierarchy: createHierarchy(subdistrict, options.format),
        score: scoreCandidate(subdistrict, related),
        matches: [subdistrict, ...related],
      });
    }
  }

  if (candidates.length === 0 && districtMatches.length > 0) {
    for (const district of districtMatches) {
      if (isClaimedByAncestor(district, provinceMatches)) continue;
      if (
        strongProvince &&
        district.province.provinceCode !== strongProvince.province.provinceCode
      ) {
        continue;
      }
      const related = provinceMatches.filter(
        (province) =>
          province.province.provinceCode === district.province.provinceCode,
      );
      candidates.push({
        hierarchy: createHierarchy(district, options.format),
        score: scoreCandidate(district, related.slice(0, 1)),
        matches: [district, ...related.slice(0, 1)],
      });
    }
  }

  if (candidates.length === 0) {
    for (const province of provinceMatches) {
      candidates.push({
        hierarchy: createHierarchy(province, options.format),
        score: province.match.confidence,
        matches: [province],
      });
    }
  }

  return candidates.sort(
    (left, right) =>
      right.score - left.score ||
      left.hierarchy.formattedAddress.localeCompare(
        right.hierarchy.formattedAddress,
        "th",
      ),
  );
}

function buildCorrections(candidate: Candidate): Correction[] {
  const fields = new Map<AddressLevel, Correction>();
  for (const result of candidate.matches) {
    if (!result.match.corrected) continue;
    const normalized =
      result.type === "province"
        ? result.province.provinceNameTh
        : result.type === "district"
          ? result.district!.districtNameTh
          : result.subdistrict!.subdistrictNameTh;
    fields.set(result.type, {
      input: result.match.input,
      normalized,
      field: result.type,
      matchType: result.match.matchType,
    });
  }
  return [...fields.values()];
}

export function normalizeAddress(
  input: string,
  options: NormalizeOptions = {},
): NormalizeResult {
  const normalizedInput = stripAddressLabels(input);
  const segments = createSegments(input);
  const minScore = options.minScore ?? 0.72;
  const limit = Math.max(1, Math.min(options.limit ?? 5, 20));

  if (segments.length === 0) {
    return {
      input,
      normalizedInput,
      status: "not_found",
      bestMatch: null,
      confidence: 0,
      alternatives: [],
      corrections: [],
    };
  }

  const provinceMatches = collectMatches(segments, "province", minScore);
  const districtMatches = collectMatches(segments, "district", minScore);
  const subdistrictMatches = collectMatches(segments, "subdistrict", minScore);
  const candidates = buildCandidates(
    provinceMatches,
    districtMatches,
    subdistrictMatches,
    options,
  ).slice(0, limit);
  const best = candidates[0];

  if (!best) {
    return {
      input,
      normalizedInput,
      status: "not_found",
      bestMatch: null,
      confidence: 0,
      alternatives: [],
      corrections: [],
    };
  }

  const alternatives = candidates
    .slice(1)
    .filter((candidate) => best.score - candidate.score <= 0.04)
    .map((candidate) => candidate.hierarchy);
  const status =
    alternatives.length > 0
      ? "ambiguous"
      : best.score >= 0.75
        ? "matched"
        : "partial";

  return {
    input,
    normalizedInput,
    status,
    bestMatch: best.hierarchy,
    confidence: best.score,
    alternatives,
    corrections: buildCorrections(best),
  };
}

export const smartSearch = normalizeAddress;
