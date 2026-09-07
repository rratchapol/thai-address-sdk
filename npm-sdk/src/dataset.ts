import aliasesData from "./data/aliases.json";
import districtsData from "./data/districts.json";
import provincesData from "./data/provinces.json";
import subdistrictsData from "./data/subdistricts.json";
import { normalizeText } from "./text.js";
import type { AddressLevel, District, Province, Subdistrict } from "./types.js";

interface AliasRecord {
  level: AddressLevel;
  code: number;
  aliases: string[];
}

export const provinces = Object.freeze(provincesData as Province[]);
export const districts = Object.freeze(districtsData as District[]);
export const subdistricts = Object.freeze(subdistrictsData as Subdistrict[]);
export const aliases = Object.freeze(aliasesData as AliasRecord[]);

export const provinceByCode = new Map(
  provinces.map((province) => [province.provinceCode, province]),
);
export const districtByCode = new Map(
  districts.map((district) => [district.districtCode, district]),
);
export const subdistrictByCode = new Map(
  subdistricts.map((subdistrict) => [subdistrict.subdistrictCode, subdistrict]),
);

export const aliasesByEntity = new Map<string, string[]>();
for (const record of aliases) {
  aliasesByEntity.set(
    `${record.level}:${record.code}`,
    record.aliases.map(normalizeText),
  );
}

export function getEntityAliases(level: AddressLevel, code: number): string[] {
  return aliasesByEntity.get(`${level}:${code}`) ?? [];
}
