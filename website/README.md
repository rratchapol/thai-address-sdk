# Thai Address SDK website

เว็บไซต์ภาษาไทยสำหรับ `thai-address-sdk` มีหน้าแนะนำ คู่มือเริ่มต้น Playground ตัวอย่าง React / Next.js และ API Reference

[เปิดเว็บไซต์](https://www.thai-address-sdk.taotech.site/) · [Playground](https://www.thai-address-sdk.taotech.site/playground/) · [แพ็กเกจบน npm](https://www.npmjs.com/package/thai-address-sdk) · [คู่มือใช้ SDK ในแอป](https://github.com/rratchapol/thai-address-sdk/blob/main/npm-sdk/README.md) · [Source code](https://github.com/rratchapol/thai-address-sdk)

เว็บไซต์นี้เป็นเว็บประกอบไลบรารี หากต้องการใช้ SDK ในแอปของคุณ ให้ติดตั้ง `npm install thai-address-sdk` โดยไม่ต้องติดตั้งหรือรันเว็บไซต์นี้

## Run locally

Use Node.js 22.12+ (Node.js 24 is recommended for this website). The SDK itself supports Node.js 18+.

```bash
cd website
npm ci
npm run dev
```

Open the local URL printed by Astro. To validate and build:

```bash
npm run check
npm run format:check
npm run build
npm run preview
```

## Structure

- `src/pages/`: static Astro pages, including `/getting-started/`, `/playground/`, `/examples/`, `/api/`.
- `src/components/Playground.tsx`: browser-only search, normalization, and cascading dropdown demos.
- `src/examples/`: copyable React and Next.js examples, also used as the actual interactive examples or typechecked source.
- `src/lib/sdk.ts`: lazy loading of the published SDK.
- `src/styles/`: shared design tokens, responsive styles, documentation, and demos.
- `public/licenses.txt`: SDK and dataset attribution.

The website pins the published `thai-address-sdk` to **0.1.2** so documentation and examples use a consistent API. To preview changes to the local SDK, build `../npm-sdk` and temporarily install it with `npm install --no-save ../npm-sdk`; run `npm ci` to restore the published dependency. Update the website's version labels and examples together when changing the dependency.

Address queries are processed locally by the SDK. The site has no analytics, account system, or address storage. Fonts are bundled and served with the site. Initial page/module downloads still require a connection; the site does not install an offline service worker.

## Deployment

`npm run build` generates a static website in `dist/`. It can be served by any static host that supports directory index pages. `.openai/hosting.json` holds Sites hosting metadata. The source code does not require a database or a runtime server.

The optional `run_address_demo` WebMCP tool uses feature detection and the same Playground state; unsupported browsers continue with the ordinary UI.
