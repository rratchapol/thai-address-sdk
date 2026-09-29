import { useMemo, useState } from "react";
import { search, type SearchResult } from "thai-address-sdk";

interface ThaiAddressAutocompleteProps {
  onSelect?: (result: SearchResult) => void;
}

export function ThaiAddressAutocomplete({
  onSelect,
}: ThaiAddressAutocompleteProps) {
  const [query, setQuery] = useState("");

  const suggestions = useMemo(
    () => (query.trim().length >= 2 ? search(query, { limit: 8 }) : []),
    [query],
  );

  function selectAddress(result: SearchResult) {
    setQuery(result.formattedAddress);
    onSelect?.(result);
  }

  return (
    <div>
      <label htmlFor="thai-address-search">ค้นหาที่อยู่ไทย</label>
      <input
        id="thai-address-search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="เช่น อยูทยา หรือ บางปะอิน"
        autoComplete="off"
        aria-controls="thai-address-suggestions"
        aria-expanded={suggestions.length > 0}
      />

      {suggestions.length > 0 && (
        <ul id="thai-address-suggestions" role="listbox">
          {suggestions.map((result) => (
            <li
              key={`${result.type}-${result.formattedAddress}`}
              role="option"
              aria-selected="false"
            >
              <button type="button" onClick={() => selectAddress(result)}>
                {result.formattedAddress}
                {result.match.corrected ? " (แก้คำสะกด)" : ""}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
