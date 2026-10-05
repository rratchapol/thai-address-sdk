# SEO / AEO / GEO audit — Thai Address SDK

วันที่ตรวจ: **5 ตุลาคม 2026** · เว็บไซต์: https://www.thai-address-sdk.taotech.site/ · SDK ที่เอกสารและเดโมใช้: **0.1.3**

## ผลวิเคราะห์และสิ่งที่แก้

เว็บเดิมมีพื้นฐานดี: Astro สร้าง HTML จริง มีคำอธิบาย API และตัวอย่างโค้ดอ่านได้โดยไม่รัน JavaScript รองรับมือถือ และระบุข้อจำกัดของข้อมูลอย่างตรงไปตรงมา ปัญหาหลักอยู่ที่การระบุ URL หลัก การช่วยค้นพบเอกสาร และเนื้อหาที่อธิบายตัวไลบรารีโดยตรง

| ประเด็น                     | หลักฐานก่อนแก้จากเว็บจริง                                                      | การแก้ในโปรเจกต์                                                                                            |
| --------------------------- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| URL หลัก                    | ทั้ง 5 หน้าไม่มี canonical; `/getting-started` และ `/getting-started/` ตอบ 200 | canonical ของแต่ละหน้าเป็น HTTPS www พร้อม trailing slash; Vercel redirect ให้ตรงรูปแบบ                     |
| การค้นพบหน้า                | robots.txt และ sitemap.xml ตอบ 404                                             | robots อนุญาต public crawlers และอ้าง sitemap; sitemap มี 6 หน้าที่ index ได้ ไม่รวม 404                    |
| Preview ตอนแชร์             | ไม่มี og:url, og:image หรือ Twitter card                                       | เพิ่มข้อมูลครบ พร้อมภาพ PNG 1200×630                                                                        |
| Structured data             | ไม่พบ JSON-LD                                                                  | WebSite, SoftwareSourceCode, WebPage, TechArticle, BreadcrumbList และ FAQPage ตามเนื้อหาที่แสดงจริง         |
| คำตอบที่อ่านแยกได้          | หน้าแรกอธิบายประโยชน์ แต่ยังไม่มีนิยามชื่อแพ็กเกจชัดเจน                        | เพิ่มนิยาม Thai Address SDK และคำตอบสรุปเลือกฟังก์ชัน พร้อม FAQ 10 ข้อและลิงก์ไป API                        |
| ความน่าเชื่อถือ             | มี License และ source SHA อยู่แล้ว แต่กระจายอยู่ท้ายเอกสาร                     | แสดงผู้ดูแล rratchapol, เวอร์ชัน, วันที่ทบทวนเอกสาร, ลิงก์ snapshot และประวัติ source code                  |
| ความสอดคล้องของเวอร์ชัน     | เว็บและเดโมใช้ 0.1.2 ขณะที่ npm latest เป็น 0.1.3                              | อัปเดต dependency, label, schema และตัวอย่างให้ใช้ 0.1.3 จากค่าเดียวกัน                                     |
| ข้อมูลสำหรับอ่านเป็นข้อความ | llms.txt / llms-full.txt ตอบ 404                                               | สร้างจาก metadata, quick-start examples และ FAQ ที่ใช้แสดงจริง ไม่พึ่งไฟล์นอกโฟลเดอร์ website               |
| หน้าไม่พบ                   | URL ที่ไม่มีอยู่ตอบ HTTP 404 จริง แต่ไม่มี noindex                             | เพิ่ม noindex และไม่ใส่ canonical/schema ในหน้า 404                                                         |
| ประสบการณ์หน้าแรก           | โหลด React และชุดข้อมูล SDK ก่อนผู้ใช้เริ่มค้นหา; mobile lab TBT 390ms         | คำนวณผลตัวอย่างด้วย SDK จริงตอน build, render ใน HTML, hydrate เมื่อ idle และโหลดชุดข้อมูลเมื่อคำค้นเปลี่ยน |
| Accessibility               | Lighthouse พบ heading ข้ามระดับ, comment สีจาง, ชื่อลิงก์/ปุ่มไม่ครบ           | แก้ hierarchy, high-contrast code theme และ accessible names                                                |

robots.txt ที่หายและตอบ 404 **ไม่ได้บล็อก crawler อยู่เดิม** การเพิ่มไฟล์ช่วยให้มีนโยบายที่ชัดเจนและค้นพบ sitemap ได้ การอนุญาตใน robots ยังไม่ใช่หลักฐานว่า firewall ยอมรับ bot จาก IP จริงทุกตัว

## หน้าที่ตอบแต่ละเจตนาการค้นหา

| URL                 | หัวข้อหลัก                                        | คำค้น/คำถามที่เหมาะ                                                   |
| ------------------- | ------------------------------------------------- | --------------------------------------------------------------------- |
| `/`                 | ไลบรารีที่อยู่ไทย JavaScript / TypeScript         | Thai address library, thai-address-sdk คืออะไร                        |
| `/getting-started/` | ติดตั้งและใช้ SDK                                 | npm ที่อยู่ไทย, ติดตั้ง Thai Address SDK                              |
| `/playground/`      | ทดลอง SDK กับข้อมูลจริง                           | ทดลองค้นหาที่อยู่ไทย, dropdown จังหวัด อำเภอ ตำบล                     |
| `/examples/`        | React / Next.js address form                      | React Thai address autocomplete, Next.js dropdown ที่อยู่             |
| `/api/`             | signature, options, types และข้อจำกัด             | search, normalizeAddress, getSubdistricts, รหัสไปรษณีย์               |
| `/faq/`             | คำตอบเรื่อง offline, framework, ข้อมูล และผลลัพธ์ | ต้องใช้ API key ไหม, ค้นหารหัสไปรษณีย์อย่างไร, confidence หมายถึงอะไร |

คำเหล่านี้เป็นการจับคู่เจตนากับเนื้อหาที่มีจริง ไม่ได้อ้าง search volume หรืออันดับที่ยังไม่ได้วัด ไม่สร้างหน้าใกล้เคียงจำนวนมากเพื่อยัด keyword

## AEO และ GEO ที่นำไปทำจริง

คำตอบใน FAQ ใช้ข้อความที่อ่านเดี่ยว ๆ ได้ และเชื่อมไปตัวอย่างหรือ API โดยคำตอบที่เห็นบนหน้าเว็บเป็นแหล่งเดียวกับ FAQPage schema และไฟล์ข้อความ เนื้อหายืนยันว่า SDK ประมวลผลแบบ synchronous มี ESM/CommonJS และ TypeScript types รองรับ Node.js 18+ และ browser ผ่าน bundler ไม่มี API key หรือ REST request ระหว่างค้นหา

แยก `search()` ที่คืนอาร์เรย์ผลลัพธ์ออกจาก `normalizeAddress()` ที่คืน status, bestMatch, alternatives และ corrections ระบุว่า postalCode ไม่ใช่ identifier ของตำบล และ confidence ไม่ใช่เปอร์เซ็นต์ความถูกต้อง ยังไม่รองรับบ้านเลขที่ ถนน ซอย พิกัด หรือการตรวจสอบว่าจัดส่งได้

ชุดข้อมูลเป็น snapshot จาก Joe Takara ภายใต้ MIT ที่ source commit `b8b3fb91c7df1129ff5b43cb46f7fcffadd2156b` ลิงก์ไป revision ที่ใช้โดยตรง ไม่อ้างว่าเป็นข้อมูลสดหรือบริการของรัฐ ไม่สร้างชื่อองค์กร คุณวุฒิ รีวิว หรือคะแนนความแม่นยำที่ไม่มีหลักฐาน

- **Google / Gemini:** HTML ที่ index ได้, canonical, internal links และ structured data ที่ตรงกับข้อความจริงเป็นพื้นฐาน Googlebot ควบคุม Search และ AI features; Google-Extended มีหน้าที่ต่างออกไป
- **ChatGPT Search:** OAI-SearchBot ไม่ถูกบล็อกด้วย robots wildcard; GPTBot สำหรับการฝึกเป็นคนละบทบาท
- **Claude / Perplexity:** wildcard อนุญาตการอ่านเอกสาร; Claude-SearchBot และ PerplexityBot เป็น crawler สำหรับค้นหา ไม่ควรใช้ชื่อ training bot แทนการวัด search eligibility
- **Bing / Copilot:** มี sitemap และ URL หลัก พร้อมแหล่งข้อมูล npm/GitHub ที่ตรวจสอบได้

`llms.txt` เป็นเอกสารเสริมเพื่ออ่านคู่มือสะดวก ไม่ใช่เงื่อนไขการจัดอันดับ Google และไม่รับรองการถูกอ้างอิงโดย AI ส่วน FAQPage ใช้บอกความหมายของ FAQ เท่านั้น ไม่อ้างสิทธิ์ได้ Google FAQ rich results ซึ่ง Google ยกเลิกแล้วในปี 2026

## การตรวจสอบ

- Astro check: 0 errors / 0 warnings / 0 hints; static build สำเร็จ
- SEO build checks: 6 หน้า, 173 internal links/anchors, 10 FAQ answers, JSON-LD parse ได้, sitemap ครบ, robots ถูกต้อง, ภาพ 1200×630, 404 noindex, และไฟล์ AI text docs
- Chrome headless: ทั้ง 6 หน้าที่ viewport 390px ไม่ล้นแนวนอน; desktop และ mobile ผ่าน
- ปิด JavaScript: อ่าน FAQ, คำแนะนำ Playground และตัวอย่างผลค้นหาหน้าแรกได้
- เดโมจริง: normalize ตัวอย่างเป็น matched; เลือกจังหวัด14/อำเภอ1406/ตำบล140601 ได้ postalCode13160; หน้าแรกไม่โหลด SDK dataset ก่อนเปลี่ยนคำค้น และค้นหา/คืนค่าเดิม/คัดลอกทำงาน
- Lighthouse accessibility หลังแก้บน local preview: 100/100 (lab test)
- npm audit หลังอัปเดต transitive build dependency http-cache-semantics: 0 vulnerabilities
- Website CI ตรวจ formatting, types, build และ emitted SEO metadata ทุก push/PR ที่เกี่ยวข้อง

## Lighthouse: เว็บจริงก่อนแก้

วัด homepage จริงด้วย **Lighthouse 13.5.0**, mobile preset, simulated throttling, Chrome headless ในเครื่องนี้ ผลหนึ่งครั้งใช้ชี้จุดแก้ ไม่ใช่ข้อมูลจากผู้ใช้จริงหรือหลักฐานอันดับ Google

| ตัวชี้วัด           | ก่อนแก้ |
| ------------------- | ------- |
| Performance         | 90/100  |
| Accessibility       | 89/100  |
| Best practices      | 100/100 |
| SEO checklist       | 100/100 |
| LCP                 | 1.3s    |
| CLS                 | 0.049   |
| Total Blocking Time | 390ms   |

แม้ Lighthouse SEO ได้ 100 แต่ยังพบ canonical, sitemap และ schema ที่ขาดจากการตรวจด้วยมือ เพราะคะแนน Lighthouse ตรวจเพียงบางข้อ ไม่มีข้อมูล field INP หรือ CrUX ในการตรวจครั้งนี้

## ขั้นตอนที่ต้องใช้บัญชีเจ้าของหรือหลักฐานจริง

1. Google Search Console: ยืนยัน property ของโดเมน แล้ว submit `https://www.thai-address-sdk.taotech.site/sitemap.xml`; inspect หน้าแรก คู่มือ API และ FAQ เพื่อตรวจ Googlebot/index coverage
2. Bing Webmaster Tools: ยืนยัน property และส่ง sitemap เดียวกัน
3. ติดตามผลจริงเป็นรายหน้า: indexed URLs, impressions, clicks, queries และ conversion ไป npm/GitHub ไม่สรุปว่าการค้นหาเว็บไม่พบในผล search ชุดเล็กเท่ากับไม่ถูก index
4. บันทึกการอ้างอิงจาก AI ที่เห็นจริง พร้อมคำถาม platform URL และวันที่; ไม่สร้าง citation score หรือ brand-authority score ที่ยังไม่มีหลักฐาน
5. GitHub About homepage ปัจจุบันยังชี้ npm; เปลี่ยนเป็นเว็บไซต์คู่มือได้จาก settings เพื่อให้คนที่เข้า repository เห็นเว็บทันที
6. หากต้องการรองรับ `thai-address-sdk.taotech.site` ที่ไม่มี `www` ต้องตั้ง DNS และ Vercel domain แล้ว redirect ไป canonical host; ตอนตรวจ hostname นี้ยัง resolve ไม่ได้ ส่วน www ใช้ได้และ HTTP redirect ไป HTTPS อยู่แล้ว

ยังไม่ได้ยืนยันบัญชี Search Console/Bing หรือส่ง sitemap ผ่านบัญชีเหล่านั้น และไม่ได้อ้างว่ามีอันดับ/traffic/AI citations เพิ่มแล้ว งานที่ทำในโค้ดมีหลักฐานจาก build และ browser; งาน index/traffic ต้องตรวจหลังระบบค้นหาประมวลผล

## แหล่งอ้างอิงหลัก

- [Google: AI optimization guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)
- [Google: AI features and websites](https://developers.google.com/search/docs/appearance/ai-features)
- [Google: documentation updates — FAQ removal in 2026](https://developers.google.com/search/updates)
- [Google: robots.txt status-code handling](https://developers.google.com/crawling/docs/robots-txt/robots-txt-spec)
- [OpenAI: bot roles](https://developers.openai.com/api/docs/bots)
- [Anthropic: crawler roles](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler)
- [Perplexity: crawlers](https://docs.perplexity.ai/docs/resources/perplexity-crawlers)
- [Schema.org: SoftwareSourceCode](https://schema.org/SoftwareSourceCode)
- [llms.txt proposal](https://llmstxt.org/)
- [Vercel: project configuration](https://vercel.com/docs/project-configuration)
- [SDK source](https://github.com/rratchapol/thai-address-sdk)
- [Dataset revision](https://github.com/thailand-geography-data/thailand-geography-json/tree/b8b3fb91c7df1129ff5b43cb46f7fcffadd2156b)
