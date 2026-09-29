# Thai address SDK examples

From `npm-sdk/` run `npm ci` and `npm run build` once, then:

```bash
npm run example:dropdown
npm run example:autocomplete
npm run example:normalize
```

You can pass custom input to the last two examples:

```bash
npm run example:autocomplete -- "อยูทยา"
npm run example:normalize -- "ต สุเทพ อ เมือง จ เชียงใหม่"
```

- `dropdown.mjs` demonstrates province → district → subdistrict filtering.
- `autocomplete.mjs` returns typo-tolerant suggestions with match metadata.
- `normalize.mjs` formats a multi-part address and displays corrections.

All examples import the package by its published name using Node.js self-reference. They run locally, without a network call or API key.

## Framework examples

These copy-ready components keep `thai-address-sdk` framework-agnostic, so React is not a runtime dependency of the package:

- [`react/ThaiAddressAutocomplete.tsx`](./react/ThaiAddressAutocomplete.tsx) — typo-tolerant Thai address autocomplete with accessible listbox markup.
- [`react/ThaiAddressDropdown.tsx`](./react/ThaiAddressDropdown.tsx) — linked province → district → subdistrict dropdowns with postcode output.
- [`nextjs/ThaiAddressAutocomplete.tsx`](./nextjs/ThaiAddressAutocomplete.tsx) — Next.js client component that dynamically imports the 1.8 MB offline dataset.

Install `react` and `react-dom` in the consuming application, copy the component, and style the plain HTML controls to match your design system.
