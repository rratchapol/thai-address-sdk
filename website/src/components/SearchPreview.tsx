import { useEffect, useState } from "react";
import type { SearchResult } from "thai-address-sdk";
import { loadSdk } from "../lib/sdk";

export default function SearchPreview() {
  const [query, setQuery] = useState("อยูทยา");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    const timer = setTimeout(async () => {
      try {
        const sdk = await loadSdk();
        if (cancelled) return;
        setResults(query.trim() ? sdk.search(query, { limit: 3 }) : []);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 180);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, attempt]);

  const first = results[0];
  return (
    <div className="address-demo">
      <div className="demo-topline">
        <span className="mono">address.search</span>
        <span className="demo-badge">ทดลองได้จริง</span>
      </div>
      <label className="demo-label" htmlFor="hero-query">
        ลองพิมพ์ชื่อพื้นที่ แม้สะกดไม่ตรง
      </label>
      <div className="search-input-wrap">
        <svg
          viewBox="0 0 24 24"
          width="21"
          height="21"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden="true"
        >
          <circle cx="10.5" cy="10.5" r="6.5" />
          <path d="m16 16 5 5" />
        </svg>
        <input
          id="hero-query"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="จังหวัด อำเภอ หรือตำบล"
          autoComplete="off"
          maxLength={160}
        />
        <kbd>TH / EN</kbd>
      </div>
      <div className="query-examples">
        <span>ลองคำนี้</span>
        {["อยูทยา", "เชียงใหม่", "Bangkok"].map((value) => (
          <button type="button" key={value} onClick={() => setQuery(value)}>
            {value}
          </button>
        ))}
      </div>
      <div className="hero-result" aria-live="polite" aria-busy={loading}>
        {error ? (
          <p>
            โหลดข้อมูลไม่สำเร็จ{" "}
            <button
              type="button"
              className="text-button"
              onClick={() => setAttempt(attempt + 1)}
            >
              ลองอีกครั้ง
            </button>
          </p>
        ) : loading ? (
          <p className="muted">กำลังค้นหาในชุดข้อมูล…</p>
        ) : first ? (
          <>
            <div className="result-top">
              <span className="eyebrow">ผลลัพธ์จาก SDK</span>
              <span className="match-badge">{first.match.matchType}</span>
            </div>
            <h3>
              {first.subdistrict?.subdistrictNameTh ??
                first.district?.districtNameTh ??
                first.province.provinceNameTh}
            </h3>
            <p>{first.formattedAddress}</p>
            <div className="address-fields">
              <div>
                <span>รหัสจังหวัด</span>
                <strong className="mono">{first.province.provinceCode}</strong>
              </div>
              <div>
                <span>ชื่อภาษาอังกฤษ</span>
                <strong>{first.province.provinceNameEn}</strong>
              </div>
            </div>
            {first.match.corrected && (
              <div className="correction">
                คำใกล้เคียงที่พบ <span>{first.match.input}</span>
                <b>{first.match.matchedText}</b>
              </div>
            )}
          </>
        ) : (
          <p className="muted">
            {query.trim()
              ? "ไม่พบพื้นที่ ลองเปลี่ยนคำค้นหรือใช้ชื่อจังหวัด"
              : "พิมพ์ชื่อพื้นที่เพื่อเริ่มค้นหา"}
          </p>
        )}
      </div>
      <div className="demo-bottom">
        <span>
          <span aria-hidden="true">⌘</span> ประมวลผลบนอุปกรณ์ของคุณ
        </span>
        <a href="/playground/">เปิด Playground</a>
      </div>
    </div>
  );
}
