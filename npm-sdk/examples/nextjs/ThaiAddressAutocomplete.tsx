"use client";

import { useEffect, useState } from "react";
import type { SearchResult } from "thai-address-sdk";

export function ThaiAddressAutocomplete() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      const { search } = await import("thai-address-sdk");
      if (!cancelled) setSuggestions(search(query, { limit: 8 }));
    }, 200);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query]);

  function selectAddress(result: SearchResult) {
    setQuery(result.formattedAddress);
    setSuggestions([]);
  }

  return (
    <div>
      <label htmlFor="thai-address-search">ค้นหาที่อยู่ไทย</label>
      <input
        id="thai-address-search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="เช่น เชียงไหม่"
        autoComplete="off"
      />

      {suggestions.length > 0 && (
        <ul>
          {suggestions.map((result) => (
            <li key={`${result.type}-${result.formattedAddress}`}>
              <button type="button" onClick={() => selectAddress(result)}>
                {result.formattedAddress}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
