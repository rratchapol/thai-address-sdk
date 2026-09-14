import { search } from "thai-address-sdk";

const query = process.argv[2] ?? "เชียงไหม่";
const results = search(query, { levels: ["province"], limit: 5 });

console.log(`Suggestions for: ${query}`);
console.log(
  results.map(({ province, match }) => ({
    code: province.provinceCode,
    label: province.provinceNameTh,
    matchType: match.matchType,
    confidence: match.confidence,
  })),
);
