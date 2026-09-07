import assert from "node:assert/strict";
import test from "node:test";

import {
  formatAddress,
  getDistricts,
  getProvinces,
  getSubdistricts,
  normalizeAddress,
  search,
} from "../dist/index.js";

test("exposes the complete province list", () => {
  assert.equal(getProvinces().length, 77);
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
