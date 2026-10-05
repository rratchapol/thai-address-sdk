import type { APIRoute } from "astro";
import { absoluteUrl, pages } from "../lib/site";
export const GET: APIRoute = () =>
  new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.map((page) => `<url><loc>${absoluteUrl(page.path)}</loc><lastmod>${page.reviewed}</lastmod></url>`).join("")}</urlset>\n`,
    { headers: { "Content-Type": "application/xml; charset=utf-8" } },
  );
