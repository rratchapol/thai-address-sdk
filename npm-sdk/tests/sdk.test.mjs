import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";

import {
  formatAddress,
  getDistricts,
  getProvinces,
  getProvince,
  getDistrict,
  getSubdistrict,
  getSubdistricts,
  normalizeAddress,
  search,
} from "../dist/index.js";

test("exposes the complete province list", () => {
  assert.equal(getProvinces().length, 77);
});

test("CommonJS entry exposes the same public functions", () => {
  const require = createRequire(import.meta.url);
  const commonJsSdk = require("thai-address-sdk");
  assert.equal(commonJsSdk.getProvinces().length, 77);
  assert.equal(typeof commonJsSdk.normalizeAddress, "function");
});

test("filters districts and subdistricts by their parent codes", () => {
  const bangkokDistricts = getDistricts({ provinceCode: 10 });
  assert.ok(bangkokDistricts.length > 0);
  assert.ok(bangkokDistricts.every((district) => district.provinceCode === 10));

  const phraNakhonSubdistricts = getSubdistricts({ districtCode: 1001 });
  assert.ok(phraNakhonSubdistricts.length > 0);
  assert.ok(
    phraNakhonSubdistricts.every(
      (subdistrict) => subdistrict.districtCode === 1001,
    ),
  );
});

test("finds an official province through a misspelled alias", () => {
  const [result] = search("อยูทยา");
  assert.ok(result);
  assert.equal(result.type, "province");
  assert.equal(result.province.provinceCode, 14);
  assert.equal(result.province.provinceNameTh, "พระนครศรีอยุธยา");
  assert.equal(result.match.matchType, "fuzzy");
  assert.equal(result.match.corrected, true);
});

test("normalizes a district and misspelled province into one hierarchy", () => {
  const result = normalizeAddress("บางปะอิน อยูทยา");
  assert.equal(result.status, "matched");
  assert.equal(result.normalizedInput, "บางปะอิน อยูทยา");
  assert.equal(result.bestMatch?.province.provinceCode, 14);
  assert.equal(result.bestMatch?.district?.districtNameTh, "บางปะอิน");
  assert.equal(result.bestMatch?.subdistrict, undefined);
  assert.match(result.bestMatch?.formattedAddress ?? "", /พระนครศรีอยุธยา/);
});

test("normalizes labels and uses the matching hierarchy", () => {
  const result = normalizeAddress("ต สุเทพ อ เมือง จ เชียงใหม่");
  assert.equal(result.bestMatch?.province.provinceNameTh, "เชียงใหม่");
  assert.equal(result.bestMatch?.district?.districtNameTh, "เมืองเชียงใหม่");
  assert.equal(result.bestMatch?.subdistrict?.subdistrictNameTh, "สุเทพ");
});

test("formats Bangkok with แขวง and เขต", () => {
  const province = getProvinces().find((item) => item.provinceCode === 10);
  const district = getDistricts({ provinceCode: 10 }).find(
    (item) => item.districtNameTh === "บางนา",
  );
  const subdistrict = getSubdistricts({
    districtCode: district?.districtCode,
  }).find((item) => item.subdistrictNameTh === "บางนาเหนือ");
  assert.ok(province && district && subdistrict);
  assert.equal(
    formatAddress({ province, district, subdistrict }),
    "แขวงบางนาเหนือ เขตบางนา กรุงเทพมหานคร",
  );
});

test("dataset codes are unique and every child has a valid parent", () => {
  const provinces = getProvinces();
  const districts = getDistricts();
  const subdistricts = getSubdistricts();

  assert.equal(provinces.length, 77);
  assert.equal(districts.length, 928);
  assert.equal(subdistricts.length, 7436);
  assert.equal(
    new Set(provinces.map((item) => item.provinceCode)).size,
    provinces.length,
  );
  assert.equal(
    new Set(districts.map((item) => item.districtCode)).size,
    districts.length,
  );
  assert.equal(
    new Set(subdistricts.map((item) => item.subdistrictCode)).size,
    subdistricts.length,
  );

  for (const district of districts) {
    assert.ok(
      getProvince(district.provinceCode),
      `orphan district ${district.districtCode}`,
    );
  }
  for (const subdistrict of subdistricts) {
    assert.ok(getProvince(subdistrict.provinceCode));
    assert.equal(
      getDistrict(subdistrict.districtCode)?.provinceCode,
      subdistrict.provinceCode,
    );
  }
});

test("known aliases and typos resolve to the official province", () => {
  const bangkok = search("กทม", { levels: ["province"], limit: 1 })[0];
  assert.equal(bangkok?.province.provinceNameTh, "กรุงเทพมหานคร");
  assert.equal(bangkok?.match.matchType, "alias");

  const chiangMai = search("เชียงไหม่", { levels: ["province"], limit: 1 })[0];
  assert.equal(chiangMai?.province.provinceNameTh, "เชียงใหม่");
  assert.equal(chiangMai?.match.matchType, "fuzzy");
});

test("does not invent a subdistrict from a province-only typo", () => {
  const result = normalizeAddress("เชียงไหม่");
  assert.equal(result.bestMatch?.province.provinceNameTh, "เชียงใหม่");
  assert.equal(result.bestMatch?.district, undefined);
  assert.equal(result.bestMatch?.subdistrict, undefined);
});

test("keeps multiple Bangkok subdistricts ambiguous", () => {
  const result = normalizeAddress("บางนา กรุงเทพมหานคร");
  assert.equal(result.status, "ambiguous");
  assert.equal(result.bestMatch?.district?.districtNameTh, "บางนา");
  assert.ok(result.alternatives.length > 0);
  assert.notEqual(
    result.bestMatch?.subdistrict?.subdistrictCode,
    result.alternatives[0]?.subdistrict?.subdistrictCode,
  );
});

test("returns empty or undefined for missing inputs and codes", () => {
  assert.deepEqual(search(""), []);
  assert.deepEqual(search("xxxxxxxxxxxx"), []);
  assert.equal(getProvince(999), undefined);
  assert.equal(getDistrict(9999), undefined);
  assert.equal(getSubdistrict(999999), undefined);
  assert.equal(normalizeAddress(" ").status, "not_found");
});
