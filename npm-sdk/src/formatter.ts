import type {
  AddressFormat,
  AddressHierarchy,
  District,
  Province,
  Subdistrict,
} from "./types.js";

interface FormatInput {
  province: Province;
  district?: District;
  subdistrict?: Subdistrict;
}

export function formatAddress(
  address: FormatInput,
  format: AddressFormat = "full_th",
): string {
  const { province, district, subdistrict } = address;

  if (format === "en") {
    return [
      subdistrict?.subdistrictNameEn,
      district?.districtNameEn,
      province.provinceNameEn,
    ]
      .filter(Boolean)
      .join(", ");
  }

  if (format === "plain_th") {
    return [
      subdistrict?.subdistrictNameTh,
      district?.districtNameTh,
      province.provinceNameTh,
    ]
      .filter(Boolean)
      .join(" ");
  }

  const isBangkok = province.provinceCode === 10;
  const labels =
    format === "short_th"
      ? isBangkok
        ? { subdistrict: "แขวง", district: "เขต", province: "" }
        : { subdistrict: "ต.", district: "อ.", province: "จ." }
      : isBangkok
        ? { subdistrict: "แขวง", district: "เขต", province: "" }
        : { subdistrict: "ตำบล", district: "อำเภอ", province: "จังหวัด" };

  return [
    subdistrict
      ? `${labels.subdistrict}${subdistrict.subdistrictNameTh}`
      : undefined,
    district ? `${labels.district}${district.districtNameTh}` : undefined,
    `${labels.province}${province.provinceNameTh}`,
  ]
    .filter(Boolean)
    .join(" ");
}

export function withFormattedAddress(
  address: Omit<AddressHierarchy, "formattedAddress">,
  format: AddressFormat,
): AddressHierarchy {
  return {
    ...address,
    formattedAddress: formatAddress(address, format),
  };
}
