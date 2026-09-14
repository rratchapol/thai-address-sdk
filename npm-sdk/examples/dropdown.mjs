import { getDistricts, getProvince, getSubdistricts } from "thai-address-sdk";

const province = getProvince(14);
if (!province) throw new Error("Province not found");

const district = getDistricts({ provinceCode: province.provinceCode }).find(
  (item) => item.districtNameTh === "บางปะอิน",
);
if (!district) throw new Error("District not found");

const subdistricts = getSubdistricts({ districtCode: district.districtCode });

console.log(`${province.provinceNameTh} → ${district.districtNameTh}`);
console.log(
  subdistricts.slice(0, 3).map((item) => ({
    value: item.subdistrictCode,
    label: item.subdistrictNameTh,
    postalCode: item.postalCode,
  })),
);
