export const faqs = [
  {
    id: "what-is-sdk",
    question: "Thai Address SDK คืออะไร?",
    answer:
      "Thai Address SDK คือแพ็กเกจ npm ชื่อ thai-address-sdk สำหรับ JavaScript และ TypeScript ใช้ค้นหาและจัดรูปแบบชื่อจังหวัด อำเภอ/เขต ตำบล/แขวง และรหัสไปรษณีย์ไทย มีข้อมูลในแพ็กเกจและฟังก์ชันแบบ synchronous เหมาะกับ autocomplete และ dropdown ที่อยู่ในฟอร์ม รองรับชื่อไทย อังกฤษ และคำสะกดใกล้เคียง",
    links: [
      { href: "/getting-started/", label: "วิธีติดตั้งและใช้งานครั้งแรก" },
    ],
  },
  {
    id: "offline",
    question: "ใช้ Thai Address SDK แบบออฟไลน์ได้ไหม ต้องมี API key หรือไม่?",
    answer:
      "ฟังก์ชัน SDK ประมวลผลจากข้อมูลที่อยู่ในแพ็กเกจ จึงไม่ต้องมี API key และไม่เรียก API ภายนอกขณะค้นหา แต่ต้องติดตั้งแพ็กเกจก่อน ส่วนเว็บ Playground ต้องดาวน์โหลดหน้าเว็บและโมดูล SDK ครั้งแรกผ่านอินเทอร์เน็ต เว็บไซต์ไม่ได้ติดตั้ง service worker เพื่อรับรองการเปิดเว็บแบบออฟไลน์",
    links: [{ href: "/playground/", label: "ลองค้นหาใน Playground" }],
  },
  {
    id: "search-or-normalize",
    question: "search() ต่างจาก normalizeAddress() อย่างไร?",
    answer:
      "ใช้ search(query) เพื่อค้นหาชื่อพื้นที่และรับ SearchResult[] ที่เรียงตามคะแนน ถ้าไม่พบจะได้อาร์เรย์ว่าง ใช้ normalizeAddress(input) เมื่อข้อความมีหลายส่วน เช่น ชื่ออำเภอกับจังหวัด และต้องการพิจารณาความสัมพันธ์ของพื้นที่ จะได้ NormalizeResult ที่มี status, bestMatch, alternatives และ corrections ฟังก์ชัน smartSearch() เป็น alias ของ normalizeAddress()",
    links: [
      { href: "/api/#search", label: "อ้างอิง search()" },
      { href: "/api/#normalize", label: "อ้างอิง normalizeAddress()" },
    ],
  },
  {
    id: "dropdown",
    question: "สร้าง dropdown จังหวัด อำเภอ ตำบล พร้อมรหัสไปรษณีย์อย่างไร?",
    answer:
      "เรียก getProvinces() เพื่อดึงจังหวัด จากนั้นใช้ getDistricts({ provinceCode }) และ getSubdistricts({ districtCode }) เพื่อกรองระดับถัดไป อ่าน postalCode จากตำบลที่เลือก เมื่อเปลี่ยนจังหวัดให้ล้างค่าอำเภอและตำบล เมื่อเปลี่ยนอำเภอให้ล้างค่าตำบล ใช้รหัสพื้นที่ที่เป็น number เป็นค่าของตัวเลือก",
    links: [
      { href: "/getting-started/#dropdown", label: "ขั้นตอนและโค้ด dropdown" },
      { href: "/examples/#dropdown", label: "ตัวอย่าง dropdown ใน React" },
    ],
  },
  {
    id: "postal-code",
    question: "ค้นหาตำบลจากรหัสไปรษณีย์ได้ไหม?",
    answer:
      "ได้ โดยกรอง getSubdistricts() ด้วย item.postalCode เช่น getSubdistricts().filter((item) => item.postalCode === 13160) SDK ไม่มีฟังก์ชันค้นหารหัสไปรษณีย์แยกต่างหาก และไม่ควรถือว่ารหัสไปรษณีย์หนึ่งค่าระบุตำบลได้เพียงแห่งเดียว ควรให้ผู้ใช้เลือกพื้นที่จากรายการที่พบ",
    links: [{ href: "/api/#filters", label: "ตัวอย่างกรองด้วยรหัสไปรษณีย์" }],
  },
  {
    id: "react-nextjs",
    question: "ใช้กับ React, Next.js, Node.js หรือ CommonJS ได้ไหม?",
    answer:
      "SDK รองรับ JavaScript และ TypeScript มี ESM, CommonJS และ TypeScript types โดยกำหนด Node.js ขั้นต่ำ 18 ใช้ใน browser ผ่าน bundler ได้ สำหรับฟอร์ม React และ Next.js ใช้ Client Component และ dynamic import เพื่อโหลดชุดข้อมูลเมื่อจำเป็น พร้อมหน่วงการค้นหา ตัว SDK ไม่ได้ขึ้นกับ React",
    links: [
      { href: "/examples/#autocomplete", label: "ตัวอย่าง React autocomplete" },
      { href: "/examples/#nextjs", label: "ตัวอย่าง Next.js" },
    ],
  },
  {
    id: "ambiguous",
    question: "ถ้าผลลัพธ์ ambiguous หรือ partial ควรทำอย่างไร?",
    answer:
      "เมื่อ normalizeAddress() คืน ambiguous ให้แสดง bestMatch และ alternatives เพื่อให้ผู้ใช้เลือก ส่วน partial หมายถึง candidate ที่ดีที่สุดมีคะแนนต่ำกว่าเกณฑ์ matched ควรเพิ่มข้อมูลพื้นที่หรือให้ผู้ใช้ตรวจสอบ แม้สถานะ matched ก็ไม่ได้รับรองว่าเป็นที่อยู่ที่ผู้ใช้ตั้งใจหรือจัดส่งได้จริง ค่า confidence เป็นคะแนนภายใน SDK ไม่ใช่เปอร์เซ็นต์ความถูกต้อง",
    links: [
      { href: "/api/#normalize", label: "ความหมายของสถานะผลลัพธ์" },
      { href: "/examples/#status", label: "ตัวอย่างจัดการสถานะก่อนบันทึก" },
    ],
  },
  {
    id: "scope",
    question: "SDK แยกบ้านเลขที่ ถนน ซอย หรือค้นหาพิกัดได้ไหม?",
    answer:
      "เวอร์ชันนี้รองรับชื่อหน่วยการปกครองและรหัสไปรษณีย์ ยังไม่แยกบ้านเลขที่ อาคาร ถนน ซอย หรือพิกัด และไม่ได้ตรวจสอบความสามารถในการจัดส่ง ควรเก็บรายละเอียดบ้านเลขที่และถนนเป็นช่องแยกจากตัวเลือกพื้นที่ formatAddress() ไม่เติมรหัสไปรษณีย์ให้อัตโนมัติ",
    links: [{ href: "/api/#limitations", label: "ขอบเขตและข้อจำกัด" }],
  },
  {
    id: "data-license",
    question:
      "ข้อมูลที่อยู่มาจากไหน อัปเดตอัตโนมัติไหม และใช้เชิงพาณิชย์ได้ไหม?",
    answer:
      "ชุดข้อมูลอ้างอิงจาก thailand-geography-data/thailand-geography-json โดย Joe Takara เป็น snapshot ที่บรรจุในแพ็กเกจและไม่อัปเดตจากอินเทอร์เน็ตอัตโนมัติ SDK และข้อมูลต้นทางเผยแพร่ภายใต้ MIT License ซึ่งอนุญาตให้ใช้และต่อยอด รวมถึงเชิงพาณิชย์ โดยต้องคงข้อความลิขสิทธิ์และ License ตามเงื่อนไข ตรวจสอบ source commit และ attribution ก่อนใช้งาน",
    links: [
      { href: "/api/#data", label: "แหล่งข้อมูลและ source commit" },
      { href: "/licenses.txt", label: "ข้อความ License ฉบับเต็ม" },
    ],
  },
  {
    id: "issues",
    question: "แจ้งข้อมูลผิดหรือเสนอเพิ่มชื่อเรียกพื้นที่ได้ที่ไหน?",
    answer:
      "เปิด issue ใน GitHub repository rratchapol/thai-address-sdk พร้อมเวอร์ชันแพ็กเกจ คำค้น โค้ดที่ใช้ ผลลัพธ์ที่ได้ และพื้นที่ที่คาดหวัง หากเป็นข้อมูลจังหวัด อำเภอ ตำบล หรือรหัสไปรษณีย์ ควรแนบแหล่งข้อมูลอ้างอิงที่ตรวจสอบได้เพื่อช่วยทบทวนและแก้ไข",
    links: [
      {
        href: "https://github.com/rratchapol/thai-address-sdk/issues",
        label: "แจ้งปัญหาและเสนอแก้ข้อมูลบน GitHub",
      },
    ],
  },
];
