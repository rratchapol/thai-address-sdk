# Runnable examples

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
