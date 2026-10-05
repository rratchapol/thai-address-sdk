import { useEffect, useId, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import type {
  AddressFormat,
  AddressLevel,
  NormalizeResult,
  SearchResult,
} from "thai-address-sdk";
import { site } from "../lib/site";
import { loadSdk, type AddressSdk } from "../lib/sdk";

type Mode = "search" | "normalize" | "dropdown";
const modes: { id: Mode; label: string; functionName: string }[] = [
  { id: "search", label: "ค้นหาที่อยู่", functionName: "search()" },
  { id: "normalize", label: "จัดรูปแบบ", functionName: "normalizeAddress()" },
  { id: "dropdown", label: "เลือกพื้นที่", functionName: "getSubdistricts()" },
];
const statusLabels = {
  matched: "พบที่อยู่ที่ตรงกัน",
  partial: "พบข้อมูลบางส่วน",
  ambiguous: "พบหลายคำตอบ กรุณาเลือก",
  not_found: "ไม่พบข้อมูลที่ตรงกัน",
};
const formats: { id: AddressFormat; label: string }[] = [
  { id: "full_th", label: "ภาษาไทยเต็ม" },
  { id: "short_th", label: "ภาษาไทยย่อ" },
  { id: "plain_th", label: "ไม่ใส่คำนำหน้า" },
  { id: "en", label: "ภาษาอังกฤษ" },
];
const levelNames = {
  province: "จังหวัด",
  district: "อำเภอ/เขต",
  subdistrict: "ตำบล/แขวง",
};

interface ModelContext {
  registerTool: (
    tool: {
      name: string;
      description: string;
      inputSchema: object;
      annotations: { readOnlyHint: boolean };
      execute: (input: unknown) => unknown;
    },
    options: { signal: AbortSignal },
  ) => void | Promise<void>;
}

export default function Playground() {
  const id = useId();
  const [mode, setMode] = useState<Mode>("search");
  const [query, setQuery] = useState("อยูทยา");
  const [normalizeQuery, setNormalizeQuery] = useState("บางปะอิน อยูทยา");
  const [sdk, setSdk] = useState<AddressSdk>();
  const [loadError, setLoadError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [level, setLevel] = useState<AddressLevel | "all">("all");
  const [format, setFormat] = useState<AddressFormat>("full_th");
  const [minScore, setMinScore] = useState(0.72);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [normalized, setNormalized] = useState<NormalizeResult>();
  const [working, setWorking] = useState(false);
  const [selected, setSelected] = useState<number>();
  const [provinceCode, setProvinceCode] = useState<number>();
  const [districtCode, setDistrictCode] = useState<number>();
  const [subdistrictCode, setSubdistrictCode] = useState<number>();
  const [outputTab, setOutputTab] = useState<"code" | "json">("code");
  const [copyState, setCopyState] = useState("");
  const [searchError, setSearchError] = useState(false);
  const toolHandler = useRef<(input: unknown) => unknown>(() => {
    throw new Error("SDK is loading");
  });

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("mode");
    if (
      requested === "search" ||
      requested === "normalize" ||
      requested === "dropdown"
    )
      setMode(requested);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoadError(false);
    loadSdk()
      .then((loaded) => {
        if (!cancelled) setSdk(loaded);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [retry]);

  useEffect(() => {
    if (!sdk || mode === "dropdown") return;
    setWorking(true);
    setSelected(undefined);
    setSearchError(false);
    const timer = setTimeout(() => {
      try {
        if (mode === "search")
          setResults(
            query.trim().length >= 2
              ? sdk.search(query.trim(), {
                  levels: level === "all" ? undefined : [level],
                  limit: 6,
                  minScore,
                  format,
                })
              : [],
          );
        else
          setNormalized(
            normalizeQuery.trim()
              ? sdk.normalizeAddress(normalizeQuery.trim(), {
                  format,
                  minScore,
                  limit: 5,
                })
              : undefined,
          );
      } catch {
        setSearchError(true);
      } finally {
        setWorking(false);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [sdk, mode, query, normalizeQuery, level, format, minScore]);

  const provinces = useMemo(() => sdk?.getProvinces() ?? [], [sdk]);
  const districts = useMemo(
    () => (provinceCode ? (sdk?.getDistricts({ provinceCode }) ?? []) : []),
    [sdk, provinceCode],
  );
  const subdistricts = useMemo(
    () => (districtCode ? (sdk?.getSubdistricts({ districtCode }) ?? []) : []),
    [sdk, districtCode],
  );
  const province = sdk?.getProvince(provinceCode ?? 0);
  const district = sdk?.getDistrict(districtCode ?? 0);
  const subdistrict = sdk?.getSubdistrict(subdistrictCode ?? 0);
  const candidates = normalized?.bestMatch
    ? [normalized.bestMatch, ...normalized.alternatives]
    : [];
  const chosen =
    mode === "search"
      ? selected === undefined
        ? undefined
        : results[selected]
      : selected === undefined
        ? undefined
        : candidates[selected];
  const dropdownResult = province
    ? {
        province,
        ...(district ? { district } : {}),
        ...(subdistrict
          ? { subdistrict, postalCode: subdistrict.postalCode }
          : {}),
        formattedAddress: sdk?.formatAddress(
          { province, district, subdistrict },
          format,
        ),
      }
    : null;
  const output =
    mode === "search"
      ? results
      : mode === "normalize"
        ? (normalized ?? null)
        : dropdownResult;
  const snippet =
    mode === "search"
      ? `import { search } from "thai-address-sdk";\n\nconst results = search(${JSON.stringify(query.trim())}, {\n${level === "all" ? "" : `  levels: ["${level}"],\n`}  limit: 6,\n  minScore: ${minScore},\n  format: "${format}",\n});`
      : mode === "normalize"
        ? `import { normalizeAddress } from "thai-address-sdk";\n\nconst result = normalizeAddress(\n  ${JSON.stringify(normalizeQuery.trim())},\n  { format: "${format}", minScore: ${minScore}, limit: 5 },\n);\n\n// ตรวจ status ก่อนใช้ผลลัพธ์\nconsole.log(result.status);\nconsole.log(result.bestMatch?.formattedAddress);`
        : `import {\n  getProvinces, getDistricts, getSubdistricts,\n  getProvince, getDistrict, formatAddress,\n} from "thai-address-sdk";\n\nconst provinces = getProvinces();\n${provinceCode ? `const districts = getDistricts({\n  provinceCode: ${provinceCode},\n});` : "// เลือกจังหวัดเพื่อดูโค้ดขั้นถัดไป"}\n${districtCode ? `const subdistricts = getSubdistricts({\n  districtCode: ${districtCode},\n});` : "// เลือกอำเภอเพื่อดึงรายการตำบล"}${subdistrictCode ? `\nconst selected = subdistricts.find(\n  (item) => item.subdistrictCode === ${subdistrictCode},\n);\nconsole.log(selected?.postalCode);` : ""}${provinceCode ? `\n\nconst province = getProvince(${provinceCode});\nif (province) {\n  const formatted = formatAddress({\n    province,${districtCode ? `\n    district: getDistrict(${districtCode}),` : ""}${subdistrictCode ? "\n    subdistrict: selected," : ""}\n  }, "${format}");\n  console.log(formatted);\n}` : ""}`;

  function changeMode(nextMode: Mode) {
    setMode(nextMode);
    setSelected(undefined);
    const url = new URL(window.location.href);
    url.searchParams.set("mode", nextMode);
    window.history.replaceState(null, "", url);
  }

  toolHandler.current = (input) => {
    if (!input || typeof input !== "object")
      throw new Error("Expected an object");
    const { mode: nextMode, query: nextQuery } = input as {
      mode?: unknown;
      query?: unknown;
    };
    if (
      (nextMode !== "search" && nextMode !== "normalize") ||
      typeof nextQuery !== "string" ||
      nextQuery.trim().length < 2 ||
      nextQuery.length > 160
    )
      throw new Error(
        "Use search or normalize with a query of 2–160 characters",
      );
    if (!sdk) throw new Error("SDK is still loading");
    const result =
      nextMode === "search"
        ? sdk.search(nextQuery.trim(), {
            levels: level === "all" ? undefined : [level],
            limit: 6,
            format,
            minScore,
          })
        : sdk.normalizeAddress(nextQuery.trim(), {
            limit: 5,
            format,
            minScore,
          });
    flushSync(() => {
      changeMode(nextMode);
      if (nextMode === "search") {
        setQuery(nextQuery);
        setResults(result as SearchResult[]);
      } else {
        setNormalizeQuery(nextQuery);
        setNormalized(result as NormalizeResult);
      }
      setOutputTab("json");
      setSearchError(false);
    });
    return result;
  };

  useEffect(() => {
    const context = (document as Document & { modelContext?: ModelContext })
      .modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    try {
      void Promise.resolve(
        context.registerTool(
          {
            name: "run_address_demo",
            description:
              "Search or normalize a Thai address and display the results in this Playground.",
            inputSchema: {
              type: "object",
              properties: {
                mode: { type: "string", enum: ["search", "normalize"] },
                query: { type: "string", minLength: 2, maxLength: 160 },
              },
              required: ["mode", "query"],
              additionalProperties: false,
            },
            annotations: { readOnlyHint: false },
            execute: (input) => toolHandler.current(input),
          },
          { signal: lifecycle.signal },
        ),
      ).catch(() => {});
    } catch {
      /* Browsers without WebMCP continue using the normal UI. */
    }
    return () => lifecycle.abort();
  }, []);

  async function copyOutput() {
    try {
      await navigator.clipboard.writeText(
        outputTab === "code" ? snippet : JSON.stringify(output, null, 2),
      );
      setCopyState("คัดลอกแล้ว");
    } catch {
      setCopyState("เลือกโค้ดแล้วคัดลอกด้วยตนเอง");
    }
    window.setTimeout(() => setCopyState(""), 3000);
  }

  return (
    <div className="playground">
      <div
        className="playground-tabs"
        role="tablist"
        aria-label="ประเภทการทดลอง"
      >
        {modes.map((item, index) => (
          <button
            key={item.id}
            type="button"
            id={`${id}-tab-${item.id}`}
            role="tab"
            aria-selected={mode === item.id}
            aria-controls={`${id}-panel`}
            tabIndex={mode === item.id ? 0 : -1}
            onClick={() => changeMode(item.id)}
            onKeyDown={(event) => {
              const next =
                event.key === "ArrowRight"
                  ? (index + 1) % modes.length
                  : event.key === "ArrowLeft"
                    ? (index + modes.length - 1) % modes.length
                    : event.key === "Home"
                      ? 0
                      : event.key === "End"
                        ? modes.length - 1
                        : undefined;
              if (next !== undefined) {
                event.preventDefault();
                changeMode(modes[next].id);
                document.getElementById(`${id}-tab-${modes[next].id}`)?.focus();
              }
            }}
          >
            <span>{item.label}</span>
            <code>{item.functionName}</code>
          </button>
        ))}
      </div>
      <div
        id={`${id}-panel`}
        role="tabpanel"
        aria-labelledby={`${id}-tab-${mode}`}
        tabIndex={0}
        className="playground-grid"
      >
        <div className="playground-workspace">
          <div className="workspace-heading">
            <span className="eyebrow">INPUT</span>
            <span>ทำงานบนอุปกรณ์ของคุณ</span>
          </div>
          {loadError ? (
            <div className="notice warning" role="alert">
              โหลดชุดข้อมูลไม่สำเร็จ ตรวจการเชื่อมต่อแล้ว{" "}
              <button
                className="text-button"
                onClick={() => setRetry(retry + 1)}
                type="button"
              >
                ลองอีกครั้ง
              </button>
            </div>
          ) : !sdk ? (
            <p role="status" className="notice">
              กำลังเตรียมชุดข้อมูลที่อยู่…
            </p>
          ) : null}
          {mode !== "dropdown" ? (
            <>
              <label className="field-label" htmlFor={`${id}-query`}>
                {mode === "search"
                  ? "ค้นหาชื่อจังหวัด อำเภอ หรือตำบล"
                  : "ข้อความที่อยู่ที่ต้องการจัดรูปแบบ"}
              </label>
              <input
                className="field-input large-input"
                id={`${id}-query`}
                value={mode === "search" ? query : normalizeQuery}
                onChange={(event) => {
                  setSelected(undefined);
                  mode === "search"
                    ? setQuery(event.target.value)
                    : setNormalizeQuery(event.target.value);
                }}
                maxLength={160}
                autoComplete="off"
                spellCheck={false}
                placeholder={
                  mode === "search" ? "เช่น อยูทยา" : "เช่น บางปะอิน อยูทยา"
                }
              />
              <div className="query-examples workspace-examples">
                <span>ลองตัวอย่าง</span>
                {(mode === "search"
                  ? ["อยูทยา", "เชียงใหม่", "Bangkok"]
                  : ["บางปะอิน อยูทยา", "ต สุเทพ อ เมือง จ เชียงใหม่", "เมือง"]
                ).map((text) => (
                  <button
                    key={text}
                    type="button"
                    onClick={() => {
                      mode === "search"
                        ? setQuery(text)
                        : setNormalizeQuery(text);
                    }}
                  >
                    {text}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="dropdown-fields">
              <label className="field-label" htmlFor={`${id}-province`}>
                จังหวัด
              </label>
              <select
                className="field-input"
                id={`${id}-province`}
                disabled={!sdk}
                value={provinceCode ?? ""}
                onChange={(e) => {
                  setProvinceCode(
                    e.target.value ? Number(e.target.value) : undefined,
                  );
                  setDistrictCode(undefined);
                  setSubdistrictCode(undefined);
                }}
              >
                <option value="">เลือกจังหวัด</option>
                {provinces.map((p) => (
                  <option key={p.provinceCode} value={p.provinceCode}>
                    {p.provinceNameTh}
                  </option>
                ))}
              </select>
              <div className="field-row">
                <div>
                  <label className="field-label" htmlFor={`${id}-district`}>
                    อำเภอ/เขต
                  </label>
                  <select
                    className="field-input"
                    id={`${id}-district`}
                    disabled={!provinceCode}
                    value={districtCode ?? ""}
                    onChange={(e) => {
                      setDistrictCode(
                        e.target.value ? Number(e.target.value) : undefined,
                      );
                      setSubdistrictCode(undefined);
                    }}
                  >
                    <option value="">
                      {provinceCode ? "เลือกอำเภอ/เขต" : "เลือกจังหวัดก่อน"}
                    </option>
                    {districts.map((d) => (
                      <option key={d.districtCode} value={d.districtCode}>
                        {d.districtNameTh}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="field-label" htmlFor={`${id}-subdistrict`}>
                    ตำบล/แขวง
                  </label>
                  <select
                    className="field-input"
                    id={`${id}-subdistrict`}
                    disabled={!districtCode}
                    value={subdistrictCode ?? ""}
                    onChange={(e) =>
                      setSubdistrictCode(
                        e.target.value ? Number(e.target.value) : undefined,
                      )
                    }
                  >
                    <option value="">
                      {districtCode ? "เลือกตำบล/แขวง" : "เลือกอำเภอก่อน"}
                    </option>
                    {subdistricts.map((s) => (
                      <option key={s.subdistrictCode} value={s.subdistrictCode}>
                        {s.subdistrictNameTh}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
          <div className="options-row">
            {mode === "search" && (
              <div>
                <label className="field-label" htmlFor={`${id}-level`}>
                  ระดับพื้นที่
                </label>
                <select
                  className="field-input"
                  id={`${id}-level`}
                  value={level}
                  onChange={(e) =>
                    setLevel(e.target.value as AddressLevel | "all")
                  }
                >
                  <option value="all">ทุกระดับ</option>
                  {Object.entries(levelNames).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="field-label" htmlFor={`${id}-format`}>
                รูปแบบที่อยู่
              </label>
              <select
                className="field-input"
                id={`${id}-format`}
                value={format}
                onChange={(e) => setFormat(e.target.value as AddressFormat)}
              >
                {formats.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {mode !== "dropdown" && (
            <details className="advanced-options">
              <summary>ตัวเลือกเพิ่มเติม</summary>
              <label className="field-label" htmlFor={`${id}-score`}>
                คะแนนขั้นต่ำ <output>{minScore.toFixed(2)}</output>
              </label>
              <input
                id={`${id}-score`}
                type="range"
                min="0.5"
                max="1"
                step="0.01"
                value={minScore}
                onChange={(e) => setMinScore(Number(e.target.value))}
              />
              <p>
                คะแนนสูงขึ้นจะรับเฉพาะคำที่ใกล้เคียงมากขึ้น
                คะแนนนี้ไม่ใช่เปอร์เซ็นต์ความถูกต้อง
              </p>
            </details>
          )}
          <div className="results-heading">
            <h2>ผลลัพธ์</h2>
            <span role="status">
              {sdk
                ? working && mode !== "dropdown"
                  ? "กำลังค้นหา…"
                  : mode === "search"
                    ? `${results.length} รายการ`
                    : mode === "normalize"
                      ? normalized
                        ? statusLabels[normalized.status]
                        : "รอข้อความที่อยู่"
                      : subdistrict
                        ? "เลือกพื้นที่ครบแล้ว"
                        : "เลือกพื้นที่ตามลำดับ"
                : "รอชุดข้อมูล"}
            </span>
          </div>
          <div
            className="results-list"
            aria-busy={!sdk || (working && mode !== "dropdown")}
          >
            {searchError && mode !== "dropdown" ? (
              <p className="notice warning" role="alert">
                ประมวลผลไม่สำเร็จ ลองเปลี่ยนข้อความแล้วค้นหาใหม่
              </p>
            ) : mode === "search" ? (
              results.length ? (
                results.map((result, index) => (
                  <button
                    type="button"
                    className={`result-card ${selected === index ? "is-selected" : ""}`}
                    key={`${result.type}-${result.formattedAddress}`}
                    aria-pressed={selected === index}
                    disabled={working}
                    onClick={() => setSelected(index)}
                  >
                    <span className="result-card-top">
                      <span className="result-level">
                        {levelNames[result.type]}
                      </span>
                      <span className="match-badge">
                        {result.match.matchType}
                      </span>
                    </span>
                    <strong>{result.formattedAddress}</strong>
                    <span className="result-card-bottom">
                      <span>
                        {result.postalCode
                          ? `รหัสไปรษณีย์ ${result.postalCode}`
                          : `รหัสจังหวัด ${result.province.provinceCode}`}
                      </span>
                      <span>
                        {selected === index ? "เลือกแล้ว" : "เลือกผลลัพธ์"}
                      </span>
                    </span>
                  </button>
                ))
              ) : sdk && !working ? (
                <p className="empty-state">
                  {query.trim().length < 2
                    ? "พิมพ์อย่างน้อย 2 ตัวอักษรเพื่อเริ่มค้นหา"
                    : "ไม่พบพื้นที่ ลองเปลี่ยนคำค้น ลดคะแนนขั้นต่ำ หรือเลือกระดับพื้นที่อื่น"}
                </p>
              ) : null
            ) : mode === "normalize" ? (
              <>
                {normalized && (
                  <span className={`status-label status-${normalized.status}`}>
                    {normalized.status}
                  </span>
                )}
                {candidates.map((candidate, index) => (
                  <button
                    type="button"
                    className={`result-card ${selected === index ? "is-selected" : ""}`}
                    key={`${candidate.formattedAddress}-${index}`}
                    disabled={working}
                    aria-pressed={selected === index}
                    onClick={() => setSelected(index)}
                  >
                    <span className="result-level">
                      {index === 0
                        ? "คำตอบอันดับแรก"
                        : `คำตอบทางเลือก ${index}`}
                    </span>
                    <strong>{candidate.formattedAddress}</strong>
                    <span className="result-card-bottom">
                      <span>
                        {candidate.postalCode
                          ? `รหัสไปรษณีย์ ${candidate.postalCode}`
                          : ""}
                      </span>
                      <span>
                        {selected === index ? "เลือกแล้ว" : "เลือกผลลัพธ์"}
                      </span>
                    </span>
                  </button>
                ))}
                {normalized?.corrections.length ? (
                  <div className="corrections-list">
                    <h3>คำที่ปรับให้ตรงกับข้อมูล</h3>
                    {normalized.corrections.map((correction, index) => (
                      <p key={index}>
                        <del>{correction.input}</del>
                        <span>{correction.normalized}</span>
                        <code>{correction.field}</code>
                      </p>
                    ))}
                  </div>
                ) : null}
                {normalized?.status === "ambiguous" && (
                  <p className="notice">
                    มีชื่อพื้นที่ที่ตรงกันหลายแห่ง
                    เลือกผลลัพธ์หรือเพิ่มชื่อจังหวัดเพื่อช่วยระบุพื้นที่
                  </p>
                )}
                {normalized?.status === "partial" && (
                  <p className="notice">
                    พบเพียงบางส่วน
                    ลองเพิ่มชื่ออำเภอหรือจังหวัดแล้วตรวจผลลัพธ์อีกครั้ง
                  </p>
                )}
                {(!normalized || normalized.status === "not_found") &&
                  sdk &&
                  !working && (
                    <p className="empty-state">
                      {normalizeQuery.trim()
                        ? "ไม่พบที่อยู่ ลองระบุชื่อจังหวัดร่วมกับอำเภอหรือตำบล"
                        : "พิมพ์ที่อยู่เพื่อเริ่มจัดรูปแบบ"}
                    </p>
                  )}
              </>
            ) : (
              <div className="dropdown-result">
                <p className="field-label">
                  {dropdownResult?.formattedAddress || "จังหวัด / อำเภอ / ตำบล"}
                </p>
                <span className="muted">รหัสไปรษณีย์ของตำบล</span>
                <div
                  className="postal-digits"
                  aria-label={
                    subdistrict
                      ? `รหัสไปรษณีย์ ${subdistrict.postalCode}`
                      : "ยังไม่ได้เลือกตำบล"
                  }
                >
                  {(subdistrict ? String(subdistrict.postalCode) : "-----")
                    .split("")
                    .map((digit, index) => (
                      <span key={index} aria-hidden="true">
                        {digit}
                      </span>
                    ))}
                </div>
                {subdistrict && (
                  <p className="area-codes mono">
                    {provinceCode} / {districtCode} / {subdistrictCode}
                  </p>
                )}
              </div>
            )}
          </div>
          {chosen && !working && (
            <div className="selected-address" role="status">
              <span>ที่อยู่ที่คุณเลือก</span>
              <strong>{chosen.formattedAddress}</strong>
            </div>
          )}
        </div>
        <aside className="playground-output">
          <div className="output-tabs">
            <div role="group" aria-label="รูปแบบผลลัพธ์">
              <button
                type="button"
                aria-pressed={outputTab === "code"}
                onClick={() => setOutputTab("code")}
              >
                โค้ดที่ใช้
              </button>
              <button
                type="button"
                aria-pressed={outputTab === "json"}
                onClick={() => setOutputTab("json")}
              >
                JSON
              </button>
            </div>
            <button className="output-copy" type="button" onClick={copyOutput}>
              คัดลอก
            </button>
          </div>
          <pre
            tabIndex={0}
            aria-label={outputTab === "code" ? "โค้ดตัวอย่าง" : "ผลลัพธ์ JSON"}
          >
            <code>
              {outputTab === "code" ? snippet : JSON.stringify(output, null, 2)}
            </code>
          </pre>
          <p className="output-note">
            {outputTab === "code"
              ? "โค้ดเปลี่ยนตามค่าที่คุณทดลอง คัดลอกไปใช้ในแอปได้เลย"
              : `ผลลัพธ์จริงจาก thai-address-sdk v${site.version}`}
          </p>
          <p className="copy-status" role="status">
            {copyState}
          </p>
          <a
            className="output-reference"
            href={`/api/#${mode === "search" ? "search" : mode === "normalize" ? "normalize" : "filters"}`}
          >
            อ่านรายละเอียดฟังก์ชันใน API Reference
          </a>
        </aside>
      </div>
    </div>
  );
}
