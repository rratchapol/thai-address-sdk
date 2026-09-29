import { useMemo, useState } from "react";
import { getDistricts, getProvinces, getSubdistricts } from "thai-address-sdk";

export function ThaiAddressDropdown() {
  const [provinceCode, setProvinceCode] = useState<number>();
  const [districtCode, setDistrictCode] = useState<number>();
  const [subdistrictCode, setSubdistrictCode] = useState<number>();

  const provinces = useMemo(() => getProvinces(), []);
  const districts = useMemo(
    () => (provinceCode ? getDistricts({ provinceCode }) : []),
    [provinceCode],
  );
  const subdistricts = useMemo(
    () => (districtCode ? getSubdistricts({ districtCode }) : []),
    [districtCode],
  );
  const selectedSubdistrict = subdistricts.find(
    (item) => item.subdistrictCode === subdistrictCode,
  );

  function changeProvince(value: string) {
    setProvinceCode(value ? Number(value) : undefined);
    setDistrictCode(undefined);
    setSubdistrictCode(undefined);
  }

  function changeDistrict(value: string) {
    setDistrictCode(value ? Number(value) : undefined);
    setSubdistrictCode(undefined);
  }

  return (
    <div>
      <label>
        จังหวัด
        <select
          value={provinceCode ?? ""}
          onChange={(event) => changeProvince(event.target.value)}
        >
          <option value="">เลือกจังหวัด</option>
          {provinces.map((province) => (
            <option key={province.provinceCode} value={province.provinceCode}>
              {province.provinceNameTh}
            </option>
          ))}
        </select>
      </label>

      <label>
        อำเภอ/เขต
        <select
          value={districtCode ?? ""}
          onChange={(event) => changeDistrict(event.target.value)}
          disabled={!provinceCode}
        >
          <option value="">เลือกอำเภอ/เขต</option>
          {districts.map((district) => (
            <option key={district.districtCode} value={district.districtCode}>
              {district.districtNameTh}
            </option>
          ))}
        </select>
      </label>

      <label>
        ตำบล/แขวง
        <select
          value={subdistrictCode ?? ""}
          onChange={(event) =>
            setSubdistrictCode(
              event.target.value ? Number(event.target.value) : undefined,
            )
          }
          disabled={!districtCode}
        >
          <option value="">เลือกตำบล/แขวง</option>
          {subdistricts.map((subdistrict) => (
            <option
              key={subdistrict.subdistrictCode}
              value={subdistrict.subdistrictCode}
            >
              {subdistrict.subdistrictNameTh}
            </option>
          ))}
        </select>
      </label>

      <output>
        {selectedSubdistrict
          ? `รหัสไปรษณีย์ ${selectedSubdistrict.postalCode}`
          : ""}
      </output>
    </div>
  );
}
