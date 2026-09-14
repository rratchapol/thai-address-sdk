# Thai Address SDK — ค้นหาที่อยู่ไทยแบบ offline

TypeScript/JavaScript library for Thai province, district, and subdistrict lookup, typo-tolerant search, and address formatting. **Runs locally without a REST API or API key.**

ติดตั้ง [แพ็กเกจบน npm](https://www.npmjs.com/package/thai-address-sdk):

```bash
npm install thai-address-sdk
```

```ts
import { search, normalizeAddress } from "thai-address-sdk";

search("อยูทยา", { levels: ["province"], limit: 1 })[0]?.province
  .provinceNameTh;
// "พระนครศรีอยุธยา"

normalizeAddress("บางปะอิน อยูทยา").bestMatch?.formattedAddress;
// "อำเภอบางปะอิน จังหวัดพระนครศรีอยุธยา"
```

ข้อมูลฝังอยู่ใน package: 77 จังหวัด พร้อมอำเภอ/เขต ตำบล/แขวง ชื่อไทย–อังกฤษ และรหัสไปรษณีย์ ใช้ทำ dependent dropdown, autocomplete และจัดรูปแบบที่อยู่ได้ โดยไม่ส่งข้อความค้นหาออกจากแอป

## เริ่มใช้งานต่อ

- [คู่มือ npm SDK ฉบับเต็ม](./npm-sdk/README.md) — API, options, ผลลัพธ์ และข้อจำกัด
- [ตัวอย่างที่รันได้](./npm-sdk/examples/README.md) — dropdown, autocomplete, normalize
- [Source code และ tests](./npm-sdk/src) · [npm package](https://www.npmjs.com/package/thai-address-sdk)
- [REST API](./rest-api/README.md) — วางแผนไว้ ยังไม่ได้เปิดให้ใช้งาน

SDK รองรับ Node.js 18+ และ browser ผ่าน bundler รวม ESM, CommonJS และ TypeScript declarations. Dataset อ้างอิงจาก [thailand-geography-json](https://github.com/thailand-geography-data/thailand-geography-json) ภายใต้ MIT; ดู [attribution และ source commit](./npm-sdk/THIRD_PARTY_LICENSES.md)
