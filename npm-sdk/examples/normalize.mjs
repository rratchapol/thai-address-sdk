import { normalizeAddress } from "thai-address-sdk";

const input = process.argv[2] ?? "บางปะอิน อยูทยา";
const result = normalizeAddress(input);

console.log({
  input,
  status: result.status,
  formattedAddress: result.bestMatch?.formattedAddress ?? null,
  corrections: result.corrections,
  alternatives: result.alternatives.map((item) => item.formattedAddress),
});
