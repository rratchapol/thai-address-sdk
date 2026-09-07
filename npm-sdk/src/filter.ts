import {
  districtByCode,
  districts,
  provinceByCode,
  provinces,
  subdistrictByCode,
  subdistricts,
} from "./dataset.js";
import type {
  District,
  FilterOptions,
  Province,
  Subdistrict,
} from "./types.js";

export function getProvinces(): readonly Province[] {
  return provinces;
}

export function getProvince(provinceCode: number): Province | undefined {
  return provinceByCode.get(provinceCode);
}

export function getDistricts(
  options: Pick<FilterOptions, "provinceCode"> = {},
): District[] {
  const { provinceCode } = options;
  return provinceCode === undefined
    ? [...districts]
    : districts.filter((district) => district.provinceCode === provinceCode);
}

export function getDistrict(districtCode: number): District | undefined {
  return districtByCode.get(districtCode);
}

export function getSubdistricts(options: FilterOptions = {}): Subdistrict[] {
  const { provinceCode, districtCode } = options;
  return subdistricts.filter(
    (subdistrict) =>
      (provinceCode === undefined ||
        subdistrict.provinceCode === provinceCode) &&
      (districtCode === undefined || subdistrict.districtCode === districtCode),
  );
}

export function getSubdistrict(
  subdistrictCode: number,
): Subdistrict | undefined {
  return subdistrictByCode.get(subdistrictCode);
}
