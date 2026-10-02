import { useId, useState } from "react";
import { getProvinces, getDistricts, getSubdistricts } from "thai-address-sdk";

export function ThaiAddressDropdown() {
  const id = useId();
  const [provinceCode, setProvinceCode] = useState<number>();
  const [districtCode, setDistrictCode] = useState<number>();
  const [subdistrictCode, setSubdistrictCode] = useState<number>();
  const provinces = getProvinces();
  const districts = provinceCode ? getDistricts({ provinceCode }) : [];
  const subdistricts = districtCode ? getSubdistricts({ districtCode }) : [];
  const selected = subdistricts.find(
    (item) => item.subdistrictCode === subdistrictCode,
  );

  return (
    <div className="dropdown-example">
      <label className="field-label" htmlFor={`${id}-province`}>
        จังหวัด
      </label>
      <select
        className="field-input"
        id={`${id}-province`}
        value={provinceCode ?? ""}
        onChange={(event) => {
          setProvinceCode(
            event.target.value ? Number(event.target.value) : undefined,
          );
          setDistrictCode(undefined);
          setSubdistrictCode(undefined);
        }}
      >
        <option value="">เลือกจังหวัด</option>
        {provinces.map((item) => (
          <option key={item.provinceCode} value={item.provinceCode}>
            {item.provinceNameTh}
          </option>
        ))}
      </select>
      <label className="field-label" htmlFor={`${id}-district`}>
        อำเภอ/เขต
      </label>
      <select
        className="field-input"
        id={`${id}-district`}
        value={districtCode ?? ""}
        disabled={!provinceCode}
        onChange={(event) => {
          setDistrictCode(
            event.target.value ? Number(event.target.value) : undefined,
          );
          setSubdistrictCode(undefined);
        }}
      >
        <option value="">เลือกอำเภอ/เขต</option>
        {districts.map((item) => (
          <option key={item.districtCode} value={item.districtCode}>
            {item.districtNameTh}
          </option>
        ))}
      </select>
      <label className="field-label" htmlFor={`${id}-subdistrict`}>
        ตำบล/แขวง
      </label>
      <select
        className="field-input"
        id={`${id}-subdistrict`}
        value={subdistrictCode ?? ""}
        disabled={!districtCode}
        onChange={(event) =>
          setSubdistrictCode(
            event.target.value ? Number(event.target.value) : undefined,
          )
        }
      >
        <option value="">เลือกตำบล/แขวง</option>
        {subdistricts.map((item) => (
          <option key={item.subdistrictCode} value={item.subdistrictCode}>
            {item.subdistrictNameTh}
          </option>
        ))}
      </select>
      <output className="dropdown-postcode">
        {selected
          ? `รหัสไปรษณีย์ ${selected.postalCode}`
          : "เลือกตำบลเพื่อแสดงรหัสไปรษณีย์"}
      </output>
    </div>
  );
}
