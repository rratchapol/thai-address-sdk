import type { APIRoute } from "astro";
import { absoluteUrl, pages, site } from "../lib/site";
import { faqs } from "../lib/faq";
import { quickStart } from "../lib/guide";
// Generated from the same examples, metadata and answers used in visible HTML.
export const GET: APIRoute = () => {
  const examples = Object.entries(quickStart)
    .map(([name, code]) => `## ${name}\n\n\`\`\`typescript\n${code}\n\`\`\``)
    .join("\n\n");
  const answers = faqs
    .map(
      (faq) =>
        `## ${faq.question}\n\n${faq.answer}\n\n${faq.links.map((link) => `- [${link.label}](${absoluteUrl(link.href)})`).join("\n")}`,
    )
    .join("\n\n");
  return new Response(
    `# Thai Address SDK — extended guide\n\nJavaScript and TypeScript library for Thai administrative area search, normalization and cascading address dropdowns.\n\nPackage: thai-address-sdk v${site.version}. Documentation reviewed: 2026-10-05.\nCanonical documentation: ${site.url}\nMaintainer: ${site.author} (${site.authorUrl}).\n\n## Installation\n\n\`\`\`sh\nnpm install thai-address-sdk\n\`\`\`\n\nSDK functions are synchronous. ESM and CommonJS are supported; Node.js minimum is 18. Browser projects need a bundler. The website needs an initial page and SDK download.\n\n${examples}\n\n## API and documentation index\n\n${pages.map((page) => `- [${page.label}](${absoluteUrl(page.path)}): ${page.description}`).join("\n")}\n\n## Source and data provenance\n\nSDK source: ${site.repository}. npm package: ${site.npm}.\nDataset: https://github.com/thailand-geography-data/thailand-geography-json/tree/${site.dataCommit} by Joe Takara (MIT). Bundled snapshot, no automatic updates. SDK license and dataset attribution: ${absoluteUrl("/licenses.txt")}.\n\n${answers}\n`,
    { headers: { "Content-Type": "text/plain; charset=utf-8" } },
  );
};
