# thai-address-sdk

ไลบรารี TypeScript/JavaScript สำหรับค้นหา กรอง ตรวจคำสะกด และจัดรูปแบบข้อมูล
จังหวัด อำเภอ/เขต และตำบล/แขวงของประเทศไทยแบบ offline

ข้อมูลและระบบค้นหาถูก bundle อยู่ใน package จึงไม่ต้องเรียก REST API, ไม่ต้องใช้ API
key และไม่ส่งข้อความที่อยู่ของผู้ใช้ออกจาก application

## Quick Start (1 นาที)

```bash
npm install thai-address-sdk
```

```ts
import { getDistricts, normalizeAddress, search } from "thai-address-sdk";

const [province] = search("อยูทยา", { levels: ["province"], limit: 1 });
console.log(province?.province.provinceNameTh);
// พระนครศรีอยุธยา

const result = normalizeAddress("บางปะอิน อยูทยา");
console.log(result.status, result.bestMatch?.formattedAddress);
// matched อำเภอบางปะอิน จังหวัดพระนครศรีอยุธยา

console.log(getDistricts({ provinceCode: 14 }).length);
// จำนวนอำเภอในจังหวัดพระนครศรีอยุธยา
```

ถ้าต้องการลองโค้ดที่รันได้ทันทีใน repository ดู
[ตัวอย่าง dropdown, autocomplete และ normalize](https://github.com/rratchapol/thai-address-sdk/tree/main/npm-sdk/examples)
โดยรัน `npm ci`, `npm run build` แล้ว `npm run example:dropdown` จากโฟลเดอร์ `npm-sdk/`

## ความสามารถ

- ข้อมูลครบ 77 จังหวัด พร้อมอำเภอ/เขตและตำบล/แขวง
- ค้นหาด้วยชื่อไทย ชื่ออังกฤษ และ alias ที่ใช้ทั่วไป
- รองรับ exact, prefix, contains และ fuzzy search
- ช่วยแก้คำสะกด เช่น `อยูทยา` → `พระนครศรีอยุธยา`
- ตรวจความสัมพันธ์จังหวัด → อำเภอ → ตำบลจากข้อความหลายส่วน
- กรองข้อมูลสำหรับทำ dependent dropdown
- จัดรูปแบบที่อยู่ไทยเต็ม ไทยย่อ ไม่มีคำนำหน้า และภาษาอังกฤษ
- รองรับ ESM, CommonJS และมี TypeScript declarations
- ทำงานได้ทั้ง Node.js และ browser ผ่าน bundler

## ขอบเขตของ package

Package นี้จัดการเฉพาะข้อมูลต่อไปนี้:

```text
จังหวัด → อำเภอ/เขต → ตำบล/แขวง → รหัสไปรษณีย์
```

ยังไม่แยกเลขที่บ้าน หมู่บ้าน อาคาร ซอย ถนน พิกัด GPS หรือข้อมูลส่วนบุคคลอื่น

## การติดตั้ง

ติดตั้ง package ที่เผยแพร่บน npm:

```bash
npm install thai-address-sdk
```

หรือใช้ package manager อื่น:

```bash
pnpm add thai-address-sdk
yarn add thai-address-sdk
```

ระหว่างพัฒนาใน repository นี้ สามารถติดตั้งจากโฟลเดอร์โดยตรง:

```bash
npm install ../thai-address/npm-sdk
```

ต้องใช้ Node.js 18 ขึ้นไปสำหรับการพัฒนาและทดสอบ package

## เริ่มต้นใช้งาน

```ts
import {
  getDistricts,
  getProvinces,
  getSubdistricts,
  normalizeAddress,
  search,
} from "thai-address-sdk";

// ค้นหาชื่อที่สะกดผิด
const results = search("อยูทยา");

// วิเคราะห์หลายส่วนและคืน hierarchy ที่สัมพันธ์กัน
const normalized = normalizeAddress("บางปะอิน อยูทยา");

// ใช้สร้าง dropdown จังหวัด → อำเภอ → ตำบล
const provinces = getProvinces();
const districts = getDistricts({ provinceCode: 14 });
const subdistricts = getSubdistricts({ districtCode: 1406 });
```

ทุกฟังก์ชันเป็น synchronous เพราะประมวลผลจากข้อมูลใน memory:

```ts
const results = search("เชียงใหม่"); // ไม่ต้อง await
```

## การ Import

### ESM และ TypeScript

```ts
import { search, normalizeAddress } from "thai-address-sdk";
```

### CommonJS

```js
const { search, normalizeAddress } = require("thai-address-sdk");
```

## `search(query, options?)`

ใช้ค้นหาหน่วยการปกครองจากคำเดียว โดยค้นหาได้ทั้งจังหวัด อำเภอ และตำบล

```ts
const results = search("อยูทยา", {
  levels: ["province"],
  limit: 5,
  minScore: 0.72,
  format: "full_th",
});
```

### Search options

| Option     | Type                                            | Default     | ความหมาย                              |
| ---------- | ----------------------------------------------- | ----------- | ------------------------------------- |
| `levels`   | `("province" \| "district" \| "subdistrict")[]` | ทุกระดับ    | จำกัดประเภทผลลัพธ์                    |
| `limit`    | `number`                                        | `10`        | จำนวนผลลัพธ์ สูงสุดภายในระบบคือ `100` |
| `minScore` | `number`                                        | `0.72`      | คะแนนต่ำสุดที่ยอมรับ                  |
| `format`   | `"full_th" \| "short_th" \| "plain_th" \| "en"` | `"full_th"` | รูปแบบ `formattedAddress`             |

### ตัวอย่าง fuzzy search

```ts
const [result] = search("อยูทยา", {
  levels: ["province"],
  limit: 1,
});

console.log(result);
```

ผลลัพธ์:

```json
{
  "type": "province",
  "province": {
    "id": 5,
    "provinceCode": 14,
    "provinceNameEn": "Phra Nakhon Si Ayutthaya",
    "provinceNameTh": "พระนครศรีอยุธยา"
  },
  "formattedAddress": "จังหวัดพระนครศรีอยุธยา",
  "match": {
    "input": "อยูทยา",
    "matchedText": "อยุธยา",
    "matchType": "fuzzy",
    "confidence": 0.817,
    "corrected": true
  }
}
```

### ประเภทการ match

| `matchType` | ความหมาย                                   |
| ----------- | ------------------------------------------ |
| `exact`     | ตรงกับชื่อใน dataset ทุกตัวอักษร           |
| `alias`     | ตรงกับชื่อย่อหรือชื่อที่ใช้ทั่วไป          |
| `prefix`    | คำค้นหรือชื่อข้อมูลขึ้นต้นตรงกัน           |
| `contains`  | คำค้นเป็นส่วนหนึ่งของชื่อ หรือในทางกลับกัน |
| `fuzzy`     | สะกดใกล้เคียงจากการคำนวณระยะห่างของคำ      |

`confidence` อยู่ระหว่าง `0` ถึง `1` และเป็นคะแนนจัดอันดับภายใน SDK
ไม่ควรนำไปตีความเป็นเปอร์เซ็นต์ความถูกต้องทางสถิติ

ถ้าต้องการให้ผลลัพธ์เข้มงวดขึ้น สามารถเพิ่ม `minScore`:

```ts
const strictResults = search("อยูทยา", { minScore: 0.9 });
```

## `normalizeAddress(input, options?)`

ใช้เมื่อตัว input มีหลายส่วน เช่นจังหวัดร่วมกับอำเภอหรือตำบล ระบบจะใช้ hierarchy
ช่วยเลือกผลลัพธ์ที่สัมพันธ์กัน

```ts
const result = normalizeAddress("บางปะอิน อยูทยา");
```

ผลลัพธ์:

```json
{
  "input": "บางปะอิน อยูทยา",
  "normalizedInput": "บางปะอิน อยูทยา",
  "status": "matched",
  "bestMatch": {
    "province": {
      "provinceCode": 14,
      "provinceNameTh": "พระนครศรีอยุธยา",
      "provinceNameEn": "Phra Nakhon Si Ayutthaya"
    },
    "district": {
      "districtCode": 1406,
      "districtNameTh": "บางปะอิน",
      "districtNameEn": "Bang Pa-In"
    },
    "postalCode": 13160,
    "formattedAddress": "อำเภอบางปะอิน จังหวัดพระนครศรีอยุธยา"
  },
  "confidence": 0.929,
  "alternatives": [],
  "corrections": [
    {
      "input": "อยูทยา",
      "normalized": "พระนครศรีอยุธยา",
      "field": "province",
      "matchType": "fuzzy"
    }
  ]
}
```

> ตัวอย่างด้านบนตัด field `id`, code เชื่อมโยง และ `postalCode` บางส่วนออกเพื่อให้อ่านง่าย
> object ที่ได้จริงจะมี field ครบตาม TypeScript types

### Normalize options

```ts
const result = normalizeAddress("ต สุเทพ อ เมือง จ เชียงใหม่", {
  format: "short_th",
  limit: 5,
  minScore: 0.72,
});
```

| Option     | Default     | ความหมาย                                       |
| ---------- | ----------- | ---------------------------------------------- |
| `format`   | `"full_th"` | รูปแบบที่อยู่ผลลัพธ์                           |
| `limit`    | `5`         | จำนวน candidate ที่ใช้พิจารณา สูงสุด `20`      |
| `minScore` | `0.72`      | คะแนนขั้นต่ำของแต่ละส่วนที่นำมาสร้าง hierarchy |

### Normalize status

| Status      | ความหมาย                                               |
| ----------- | ------------------------------------------------------ |
| `matched`   | พบผลลัพธ์ที่ผ่านเกณฑ์และไม่มีคู่แข่งคะแนนใกล้เคียง     |
| `partial`   | พบข้อมูลบางส่วนแต่คะแนนยังไม่สูงพอ                     |
| `ambiguous` | มีมากกว่าหนึ่งผลลัพธ์ที่คะแนนใกล้กัน ควรให้ผู้ใช้เลือก |
| `not_found` | ไม่พบผลลัพธ์ที่ผ่าน `minScore`                         |

ควรตรวจ `status` และ `bestMatch` ทุกครั้งก่อนนำข้อมูลไปบันทึก:

```ts
const result = normalizeAddress(userInput);

switch (result.status) {
  case "matched":
    saveAddress(result.bestMatch);
    break;
  case "ambiguous":
    showAddressChoices([result.bestMatch, ...result.alternatives]);
    break;
  case "partial":
    askForMoreAddressDetails(result.bestMatch);
    break;
  case "not_found":
    showNotFoundMessage();
    break;
}
```

## `smartSearch(input, options?)`

`smartSearch` เป็น alias ของ `normalizeAddress` และคืนผลลัพธ์รูปแบบเดียวกัน:

```ts
import { smartSearch } from "thai-address-sdk";

const result = smartSearch("ต สุเทพ อ เมือง จ เชียงใหม่");
console.log(result.bestMatch?.formattedAddress);
// ตำบลสุเทพ อำเภอเมืองเชียงใหม่ จังหวัดเชียงใหม่
```

เลือกใช้ชื่อที่เหมาะกับบริบทของ application ได้ แต่ไม่จำเป็นต้องเรียกทั้งสองฟังก์ชัน

## Filter API สำหรับ dropdown

### จังหวัดทั้งหมด

```ts
import { getProvinces } from "thai-address-sdk";

const provinces = getProvinces();
```

### อำเภอทั้งหมดในจังหวัด

```ts
import { getDistricts } from "thai-address-sdk";

const districts = getDistricts({ provinceCode: 14 });
```

### ตำบลทั้งหมดในอำเภอ

```ts
import { getSubdistricts } from "thai-address-sdk";

const subdistricts = getSubdistricts({ districtCode: 1406 });
```

สามารถกรองตำบลด้วยทั้งจังหวัดและอำเภอพร้อมกัน:

```ts
const subdistricts = getSubdistricts({
  provinceCode: 14,
  districtCode: 1406,
});
```

### ค้นหาด้วย code

```ts
import { getDistrict, getProvince, getSubdistrict } from "thai-address-sdk";

const province = getProvince(14);
const district = getDistrict(1406);
const subdistrict = getSubdistrict(140601);
```

ฟังก์ชันแบบ code คืน `undefined` เมื่อไม่พบข้อมูล:

```ts
const province = getProvince(999);

if (!province) {
  console.log("ไม่พบจังหวัด");
}
```

## ตัวอย่าง dependent dropdown

```ts
import { getDistricts, getProvinces, getSubdistricts } from "thai-address-sdk";

const state = {
  provinceCode: undefined as number | undefined,
  districtCode: undefined as number | undefined,
};

const provinceOptions = getProvinces().map((province) => ({
  value: province.provinceCode,
  label: province.provinceNameTh,
}));

function onProvinceChange(provinceCode: number) {
  state.provinceCode = provinceCode;
  state.districtCode = undefined;

  return getDistricts({ provinceCode }).map((district) => ({
    value: district.districtCode,
    label: district.districtNameTh,
  }));
}

function onDistrictChange(districtCode: number) {
  state.districtCode = districtCode;

  return getSubdistricts({ districtCode }).map((subdistrict) => ({
    value: subdistrict.subdistrictCode,
    label: subdistrict.subdistrictNameTh,
    postalCode: subdistrict.postalCode,
  }));
}
```

เมื่อเปลี่ยนจังหวัดควร reset อำเภอและตำบลที่เลือกไว้ เพื่อไม่ให้เกิด hierarchy ที่ไม่สัมพันธ์กัน

## `formatAddress(address, format?)`

```ts
import {
  formatAddress,
  getDistrict,
  getProvince,
  getSubdistrict,
} from "thai-address-sdk";

const province = getProvince(10);
const district = getDistrict(1047);
const subdistrict = getSubdistrict(104702);

if (province && district && subdistrict) {
  formatAddress({ province, district, subdistrict }, "full_th");
  // แขวงบางนาเหนือ เขตบางนา กรุงเทพมหานคร

  formatAddress({ province, district, subdistrict }, "plain_th");
  // บางนาเหนือ บางนา กรุงเทพมหานคร

  formatAddress({ province, district, subdistrict }, "en");
  // Bang Na Nuea, Bang Na, Bangkok
}
```

รูปแบบที่รองรับ:

| Format     | ตัวอย่าง                                         |
| ---------- | ------------------------------------------------ |
| `full_th`  | `ตำบลสุเทพ อำเภอเมืองเชียงใหม่ จังหวัดเชียงใหม่` |
| `short_th` | `ต.สุเทพ อ.เมืองเชียงใหม่ จ.เชียงใหม่`           |
| `plain_th` | `สุเทพ เมืองเชียงใหม่ เชียงใหม่`                 |
| `en`       | `Suthep, Mueang Chiang Mai, Chiang Mai`          |

กรุงเทพมหานครจะใช้ `แขวง` และ `เขต` อัตโนมัติ

## Text utilities

ฟังก์ชันเหล่านี้เป็น utility ระดับต่ำสำหรับกรณีที่ application ต้องการจัดการข้อความเอง:

```ts
import {
  damerauLevenshtein,
  normalizeText,
  stripAddressLabels,
} from "thai-address-sdk";

normalizeText("  กรุงเทพฯ  ");
// กรุงเทพ

stripAddressLabels("ต. สุเทพ อ. เมืองเชียงใหม่ จ. เชียงใหม่");
// สุเทพ เมืองเชียงใหม่ เชียงใหม่

damerauLevenshtein("อยูทยา", "อยุธยา");
// ระยะห่างของตัวอักษร
```

สำหรับ use case ทั่วไปควรใช้ `search` หรือ `normalizeAddress` แทน utility เหล่านี้

## TypeScript types

Package export types หลักดังนี้:

```ts
import type {
  AddressFormat,
  AddressHierarchy,
  AddressLevel,
  District,
  NormalizeResult,
  Province,
  SearchOptions,
  SearchResult,
  Subdistrict,
} from "thai-address-sdk";
```

Code ทุกชนิดเป็น `number`:

```ts
province.provinceCode; // 2 หลัก เช่น 14
district.districtCode; // 4 หลัก เช่น 1406
subdistrict.subdistrictCode; // 6 หลัก เช่น 140601
subdistrict.postalCode; // 5 หลัก เช่น 13160
```

ควรใช้ code เป็น identifier และใช้ชื่อสำหรับแสดงผล เนื่องจากชื่อพื้นที่อาจซ้ำกันได้

## ตัวอย่าง autocomplete ใน browser

ควร debounce การค้นหาเพื่อไม่ให้ fuzzy search ทำงานทุกครั้งที่ผู้ใช้กดปุ่ม:

```ts
import { search } from "thai-address-sdk";

let timer: ReturnType<typeof setTimeout>;

searchInput.addEventListener("input", (event) => {
  clearTimeout(timer);

  timer = setTimeout(() => {
    const query = (event.target as HTMLInputElement).value;
    const results = query.length >= 2 ? search(query, { limit: 8 }) : [];
    renderSuggestions(results);
  }, 200);
});
```

เนื่องจาก package bundle dataset มาด้วย JavaScript bundle ที่ build แล้วมีขนาดประมาณ 1.8 MB
ก่อน compression ควรใช้ dynamic import หากหน้าเว็บไม่ได้ใช้ข้อมูลที่อยู่ทันที:

```ts
const thaiAddress = await import("thai-address-sdk");
const results = thaiAddress.search("เชียงใหม่");
```

## แนวทางจัดการ fuzzy result

- อย่าบันทึกผลลัพธ์ fuzzy โดยไม่ให้ผู้ใช้ตรวจสอบในงานที่ต้องการความแม่นยำสูง
- ถ้า `status` เป็น `ambiguous` ให้แสดง `alternatives` เพื่อให้ผู้ใช้เลือก
- ใช้จังหวัดหรืออำเภอที่ผู้ใช้เลือกไว้ช่วยจำกัดบริบท
- เพิ่ม `minScore` เมื่อต้องการลด false positive
- ใช้ debounce สำหรับช่อง autocomplete
- เก็บ code ของพื้นที่ ไม่ควรเก็บเฉพาะชื่อ

## การพัฒนา package

```bash
cd npm-sdk
npm install
npm run typecheck
npm test
npm run format:check
npm run build
```

Scripts:

| Command                | หน้าที่                                   |
| ---------------------- | ----------------------------------------- |
| `npm run build`        | สร้าง ESM, CommonJS และ declaration files |
| `npm run typecheck`    | ตรวจ TypeScript แบบ strict                |
| `npm test`             | Build และรัน integration tests            |
| `npm run format`       | จัดรูปแบบ source และเอกสารด้วย Prettier   |
| `npm run format:check` | ตรวจรูปแบบโดยไม่แก้ไฟล์                   |

ไฟล์ที่พร้อม publish จะอยู่ใน `dist/` สามารถตรวจ package ก่อน publish ได้ด้วย:

```bash
npm pack --dry-run
```

## ข้อมูลและ License

ข้อมูลจังหวัด อำเภอ ตำบล และรหัสไปรษณีย์มาจาก
[`thailand-geography-data/thailand-geography-json`](https://github.com/thailand-geography-data/thailand-geography-json)
และถูก pin ไว้ที่ source commit ที่ระบุใน
[`THIRD_PARTY_LICENSES.md`](./THIRD_PARTY_LICENSES.md)

ก่อนอัปเดต dataset ควรตรวจจำนวนรายการ code ซ้ำ parent code ที่ไม่มีอยู่ และรัน test
ทั้งหมดอีกครั้ง

## ข้อจำกัดปัจจุบัน

- Alias ที่มากับ SDK ยังเป็นชุดเริ่มต้น ไม่ครอบคลุมชื่อเรียกท้องถิ่นทั้งหมด
- Fuzzy threshold ยังต้องปรับจากคำค้นจริงเพิ่มเติม
- การค้นหาและ normalize เป็น synchronous และอาจใช้เวลามากขึ้นบนอุปกรณ์กำลังต่ำ
- Dataset เป็น snapshot และจะไม่อัปเดตจากอินเทอร์เน็ตอัตโนมัติ
- Package ยังไม่รองรับบ้านเลขที่ ถนน ซอย หมู่บ้าน และ geocoding
