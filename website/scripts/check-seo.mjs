import assert from "node:assert/strict";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = resolve(root, "dist");
const origin = "https://www.thai-address-sdk.taotech.site";
const sdkVersion = JSON.parse(
  readFileSync(resolve(root, "package.json"), "utf8"),
).dependencies["thai-address-sdk"];
const read = (path) => readFileSync(resolve(dist, path), "utf8");
const decode = (text) =>
  text
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
const attr = (tag, name) =>
  decode(tag.match(new RegExp(`(?:^|\\s)${name}="([^"]*)"`))?.[1] ?? "");
const tags = (html, name) =>
  [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, "g"))].map(
    (match) => match[0],
  );
const meta = (html, name) => {
  const matches = tags(html, "meta").filter(
    (tag) => attr(tag, "name") === name || attr(tag, "property") === name,
  );
  assert.equal(matches.length, 1, `Expected exactly one ${name}`);
  return attr(matches[0], "content");
};
const fileFor = (path) =>
  path.endsWith("/") ? `${path.slice(1)}index.html` : path.slice(1);
const sitemap = read("sitemap.xml");
assert(sitemap.includes('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'));
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) =>
  decode(match[1]),
);
assert.equal(new Set(urls).size, urls.length, "Duplicate sitemap URL");
const routes = urls.map((url) => {
  assert(url.startsWith(`${origin}/`));
  return new URL(url).pathname;
});
assert(routes.includes("/faq/"));
assert(!routes.some((route) => route.includes("404")));
const discovered = readdirSync(dist, { recursive: true })
  .filter((file) => file.replaceAll("\\", "/").endsWith("index.html"))
  .map((file) => "/" + file.replaceAll("\\", "/").replace(/index\.html$/, ""));
assert.deepEqual(
  [...routes].sort(),
  discovered.sort(),
  "Sitemap must include every built content page",
);
const titles = new Set();
const descriptions = new Set();
let internalLinks = 0;
for (const route of routes) {
  const html = read(fileFor(route));
  const title = decode(
    html.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? "",
  ).trim();
  assert(
    title.length > 10 && !titles.has(title),
    `Missing/duplicate title: ${route}`,
  );
  titles.add(title);
  const description = meta(html, "description");
  assert(
    description.length > 40 && !descriptions.has(description),
    `Missing/duplicate description: ${route}`,
  );
  descriptions.add(description);
  assert.equal(
    (html.match(/<h1\b/g) ?? []).length,
    1,
    `One H1 required: ${route}`,
  );
  assert(html.includes('lang="th"'));
  assert(!meta(html, "robots").includes("noindex"));
  const canonicals = tags(html, "link").filter(
    (tag) => attr(tag, "rel") === "canonical",
  );
  assert.equal(canonicals.length, 1);
  assert.equal(attr(canonicals[0], "href"), `${origin}${route}`);
  assert.equal(meta(html, "og:url"), `${origin}${route}`);
  assert.equal(meta(html, "twitter:card"), "summary_large_image");
  assert.equal(meta(html, "og:image"), `${origin}/opengraph.png`);
  assert.equal(meta(html, "og:image:width"), "1200");
  const blocks = [
    ...html.matchAll(
      /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,
    ),
  ];
  assert.equal(blocks.length, 1);
  const graph = JSON.parse(blocks[0][1])["@graph"];
  assert(graph.some((node) => node["@id"] === `${origin}${route}#webpage`));
  if (route !== "/") {
    assert(graph.some((node) => node["@type"] === "BreadcrumbList"));
    assert(html.includes('aria-label="เส้นทางหน้าเว็บ"'));
  }
  if (route === "/")
    assert(
      graph.some(
        (node) =>
          node["@type"] === "SoftwareSourceCode" && node.version === sdkVersion,
      ),
    );
  if (route === "/faq/") {
    const faq = graph.find((node) => node.mainEntity);
    assert.equal(faq.mainEntity.length, 10);
    for (const question of faq.mainEntity) {
      assert(decode(html).includes(question.name));
      assert(decode(html).includes(question.acceptedAnswer.text));
    }
  }
  for (const tag of tags(html, "a")) {
    const href = attr(tag, "href");
    if (!href || (!href.startsWith("/") && !href.startsWith("#"))) continue;
    const url = new URL(href, `${origin}${route}`);
    const file = fileFor(url.pathname);
    assert(
      existsSync(resolve(dist, file)),
      `Broken internal link ${href} on ${route}`,
    );
    if (url.hash && file.endsWith(".html")) {
      const target = read(file);
      assert(
        tags(target, "[a-zA-Z][\\w:-]*").some(
          (element) =>
            attr(element, "id") === decodeURIComponent(url.hash.slice(1)),
        ),
        `Missing anchor ${href} on ${route}`,
      );
    }
    internalLinks++;
  }
}
assert(meta(read("404.html"), "robots").includes("noindex"));
assert(
  !tags(read("404.html"), "link").some(
    (tag) => attr(tag, "rel") === "canonical",
  ),
);
assert(read("robots.txt").includes(`Sitemap: ${origin}/sitemap.xml`));
assert(read("robots.txt").includes("User-agent: *\nAllow: /"));
for (const textFile of ["llms.txt", "llms-full.txt"]) {
  const text = read(textFile);
  assert(text.startsWith("# Thai Address SDK"));
  assert(!text.includes("localhost"));
  for (const route of routes)
    assert(
      text.includes(`${origin}${route}`),
      `Missing ${route} in ${textFile}`,
    );
}
const png = readFileSync(resolve(dist, "opengraph.png"));
assert.equal(png.readUInt32BE(16), 1200);
assert.equal(png.readUInt32BE(20), 630);
console.log(
  `SEO build checks passed: ${routes.length} pages, ${internalLinks} internal links/anchors, 10 FAQ answers, sitemap, robots, JSON-LD, social image, 404 and AI text docs.`,
);
