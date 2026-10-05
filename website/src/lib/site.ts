import packageJson from "../../package.json";

export const site = {
  name: "Thai Address SDK",
  url: "https://www.thai-address-sdk.taotech.site/",
  repository: "https://github.com/rratchapol/thai-address-sdk",
  npm: "https://www.npmjs.com/package/thai-address-sdk",
  author: "rratchapol",
  authorUrl: "https://github.com/rratchapol",
  version: packageJson.dependencies["thai-address-sdk"],
  dataCommit: "b8b3fb91c7df1129ff5b43cb46f7fcffadd2156b",
};

// Change a page's reviewed date only after checking its content against the SDK.
export const pages = [
  {
    path: "/",
    label: "หน้าแรก",
    title: "Thai Address SDK — ไลบรารีที่อยู่ไทย JavaScript / TypeScript",
    description:
      "ไลบรารีที่อยู่ไทยสำหรับ JavaScript และ TypeScript ค้นหาชื่อจังหวัด อำเภอ ตำบล แก้คำสะกด จัดรูปแบบ และสร้าง dropdown พร้อมรหัสไปรษณีย์ ไม่ต้องใช้ API key",
    reviewed: "2026-10-05",
    kind: "WebPage",
  },
  {
    path: "/getting-started/",
    label: "เริ่มใช้งาน",
    title: "ติดตั้งและใช้ Thai Address SDK ใน JavaScript / TypeScript",
    description:
      "วิธีติดตั้ง thai-address-sdk ด้วย npm และเริ่มค้นหาที่อยู่ไทยด้วย search จัดรูปแบบด้วย normalizeAddress และสร้าง dropdown จังหวัด อำเภอ ตำบล",
    reviewed: "2026-10-05",
    kind: "TechArticle",
  },
  {
    path: "/playground/",
    label: "Playground",
    title: "ทดลองค้นหาที่อยู่ไทยและรหัสไปรษณีย์ | Thai Address SDK",
    description:
      "ทดลอง Thai Address SDK ในเบราว์เซอร์ ค้นหาที่อยู่ไทยและอังกฤษ แก้คำสะกด เลือกจังหวัด อำเภอ ตำบล พร้อมดูรหัสไปรษณีย์ โค้ด และ JSON จาก SDK จริง",
    reviewed: "2026-10-05",
    kind: "WebPage",
  },
  {
    path: "/examples/",
    label: "ตัวอย่างใช้งาน",
    title: "ตัวอย่าง React / Next.js: Autocomplete และ dropdown ที่อยู่ไทย",
    description:
      "ตัวอย่างฟอร์มที่อยู่ไทยด้วย React และ Next.js พร้อม TypeScript สร้าง autocomplete และ dropdown จังหวัด อำเภอ ตำบล รวม dynamic import และการจัดการผลลัพธ์",
    reviewed: "2026-10-05",
    kind: "TechArticle",
  },
  {
    path: "/api/",
    label: "API Reference",
    title: "Thai Address SDK API: search, normalizeAddress และ dropdown",
    description:
      "อ้างอิง API ของ thai-address-sdk: search, normalizeAddress, getProvinces, getDistricts, getSubdistricts และ formatAddress พร้อม options, types และข้อจำกัด",
    reviewed: "2026-10-05",
    kind: "TechArticle",
  },
  {
    path: "/faq/",
    label: "คำถามที่พบบ่อย",
    title: "คำถามที่พบบ่อย: ไลบรารีที่อยู่ไทย | Thai Address SDK",
    description:
      "คำตอบเรื่อง Thai Address SDK: ใช้ออฟไลน์ได้ไหม ต้องมี API key หรือไม่ รองรับ React และ Next.js อย่างไร ค้นหารหัสไปรษณีย์และจัดการที่อยู่กำกวมแบบไหน",
    reviewed: "2026-10-05",
    kind: "FAQPage",
  },
] as const;

export function absoluteUrl(path: string) {
  return new URL(path, site.url).href;
}
export function getPage(pathname: string) {
  const path = pathname === "/" ? "/" : `${pathname.replace(/\/+$/, "")}/`;
  return pages.find((page) => page.path === path);
}
