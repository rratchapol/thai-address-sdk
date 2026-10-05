import { defineConfig } from "astro/config";
import react from "@astrojs/react";

export default defineConfig({
  site: "https://www.thai-address-sdk.taotech.site/",
  integrations: [react()],
  output: "static",
  trailingSlash: "always",
});
