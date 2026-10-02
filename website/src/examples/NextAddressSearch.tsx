"use client";

import { useId, useState, type SyntheticEvent } from "react";
import type { SearchResult } from "thai-address-sdk";

export default function NextAddressSearch() {
  const id = useId();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSearch(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || query.trim().length < 2) return;
    setBusy(true);
    setMessage("กำลังค้นหา…");
    setResults([]);
    try {
      // โหลด SDK เมื่อค้นหาครั้งแรก ฟังก์ชัน search ไม่ต้อง await
      const { search } = await import("thai-address-sdk");
      const found = search(query.trim(), { limit: 5 });
      setResults(found);
      setMessage(
        found.length
          ? `พบ ${found.length} รายการ`
          : "ไม่พบพื้นที่ ลองใช้ชื่อจังหวัด",
      );
    } catch {
      setMessage("โหลดข้อมูลไม่สำเร็จ กรุณาลองค้นหาอีกครั้ง");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSearch}>
      <label htmlFor={id}>ค้นหาที่อยู่ไทย</label>
      <input
        id={id}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        minLength={2}
        maxLength={160}
        required
        disabled={busy}
      />
      <button type="submit" disabled={busy}>
        {busy ? "กำลังค้นหา…" : "ค้นหา"}
      </button>
      <p role="status">{message}</p>
      <ul>
        {results.map((result) => (
          <li key={`${result.type}-${result.formattedAddress}`}>
            {result.formattedAddress}
          </li>
        ))}
      </ul>
    </form>
  );
}
