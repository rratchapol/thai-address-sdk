import type { MatchType } from "./types.js";

const thaiDigits: Record<string, string> = {
  "๐": "0",
  "๑": "1",
  "๒": "2",
  "๓": "3",
  "๔": "4",
  "๕": "5",
  "๖": "6",
  "๗": "7",
  "๘": "8",
  "๙": "9",
};

export function normalizeText(value: string): string {
  return value
    .normalize("NFC")
    .replace(/[๐-๙]/g, (digit) => thaiDigits[digit] ?? digit)
    .replace(/ฯ/g, "")
    .replace(/[.,/#!$%^&*;:{}=_`~()\[\]"'|+?-]/g, " ")
    .toLocaleLowerCase("th-TH")
    .replace(/\s+/g, " ")
    .trim();
}

export function stripAddressLabels(value: string): string {
  let normalized = normalizeText(value);
  const fullLabels = ["ตำบล", "อำเภอ", "จังหวัด", "แขวง", "เขต"];

  for (const label of fullLabels) {
    normalized = normalized.replace(
      new RegExp(`(^|\\s)${label}\\s*`, "gu"),
      "$1",
    );
  }

  // One-letter labels must be standalone tokens. Otherwise words such as
  // "อยุธยา" would incorrectly lose their first character.
  normalized = normalized.replace(/(^|\s)(?:ต|อ|จ)(?=\s)/gu, "$1");

  return normalized.replace(/\s+/g, " ").trim();
}

export function createSegments(value: string): string[] {
  const normalized = stripAddressLabels(value);
  if (!normalized) return [];

  const tokens = normalized.split(" ");
  const segments = new Set<string>([normalized, ...tokens]);

  for (let size = 2; size <= Math.min(tokens.length, 3); size += 1) {
    for (let start = 0; start <= tokens.length - size; start += 1) {
      const slice = tokens.slice(start, start + size);
      segments.add(slice.join(" "));
      segments.add(slice.join(""));
    }
  }

  return [...segments].filter(Boolean);
}

export function damerauLevenshtein(left: string, right: string): number {
  const a = [...left];
  const b = [...right];
  const matrix = Array.from({ length: a.length + 1 }, () =>
    Array<number>(b.length + 1).fill(0),
  );

  for (let index = 0; index <= a.length; index += 1) matrix[index]![0] = index;
  for (let index = 0; index <= b.length; index += 1) matrix[0]![index] = index;

  for (let row = 1; row <= a.length; row += 1) {
    for (let column = 1; column <= b.length; column += 1) {
      const cost = a[row - 1] === b[column - 1] ? 0 : 1;
      matrix[row]![column] = Math.min(
        matrix[row - 1]![column]! + 1,
        matrix[row]![column - 1]! + 1,
        matrix[row - 1]![column - 1]! + cost,
      );

      if (
        row > 1 &&
        column > 1 &&
        a[row - 1] === b[column - 2] &&
        a[row - 2] === b[column - 1]
      ) {
        matrix[row]![column] = Math.min(
          matrix[row]![column]!,
          matrix[row - 2]![column - 2]! + cost,
        );
      }
    }
  }

  return matrix[a.length]![b.length]!;
}

export interface TermScore {
  score: number;
  matchType: MatchType;
}

export function scoreTerm(input: string, candidate: string): TermScore | null {
  const query = normalizeText(input);
  const target = normalizeText(candidate);
  if (!query || !target) return null;

  if (query === target) return { score: 1, matchType: "exact" };

  const shorter = Math.min([...query].length, [...target].length);
  const longer = Math.max([...query].length, [...target].length);
  const lengthRatio = shorter / longer;

  if (target.startsWith(query) || query.startsWith(target)) {
    return { score: 0.86 + 0.1 * lengthRatio, matchType: "prefix" };
  }

  if (target.includes(query) || query.includes(target)) {
    return { score: 0.76 + 0.1 * lengthRatio, matchType: "contains" };
  }

  if (shorter < 4) return null;

  const similarity = 1 - damerauLevenshtein(query, target) / longer;
  if (similarity < 0.55) return null;

  return { score: 0.55 + similarity * 0.4, matchType: "fuzzy" };
}

export function roundScore(score: number): number {
  return Math.round(Math.max(0, Math.min(1, score)) * 1000) / 1000;
}
