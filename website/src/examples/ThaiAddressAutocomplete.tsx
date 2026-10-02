import { useEffect, useId, useRef, useState } from "react";
import type { SearchResult } from "thai-address-sdk";

export function ThaiAddressAutocomplete({
  onSelect,
}: {
  onSelect?: (address: SearchResult) => void;
}) {
  const id = useId();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [selected, setSelected] = useState<SearchResult | null>(null);
  const [message, setMessage] = useState("");
  const request = useRef(0);

  useEffect(() => {
    const current = ++request.current;
    if (selected || query.trim().length < 2) {
      setResults([]);
      setMessage("");
      return;
    }
    setMessage("กำลังค้นหา…");
    const timer = setTimeout(async () => {
      try {
        const { search } = await import("thai-address-sdk");
        if (current !== request.current) return;
        const matches = search(query.trim(), { limit: 6 });
        setResults(matches);
        setMessage(
          matches.length
            ? `พบ ${matches.length} รายการ`
            : "ไม่พบพื้นที่ ลองใช้ชื่อจังหวัด",
        );
      } catch {
        if (current === request.current)
          setMessage("โหลดข้อมูลไม่สำเร็จ ลองพิมพ์ค้นหาใหม่");
      }
    }, 200);
    return () => {
      ++request.current;
      clearTimeout(timer);
    };
  }, [query, selected]);

  function choose(address: SearchResult) {
    ++request.current;
    setSelected(address);
    setQuery(address.formattedAddress);
    setOpen(false);
    setActive(-1);
    onSelect?.(address);
  }

  const visible = open && results.length > 0;
  return (
    <div className="autocomplete-example">
      <label className="field-label" htmlFor={`${id}-input`}>
        ค้นหาที่อยู่ไทย
      </label>
      <input
        id={`${id}-input`}
        className="field-input"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={visible}
        aria-controls={visible ? `${id}-list` : undefined}
        aria-activedescendant={
          visible && active >= 0 ? `${id}-option-${active}` : undefined
        }
        aria-describedby={`${id}-hint`}
        value={query}
        placeholder="เช่น อยูทยา หรือ สุเทพ"
        autoComplete="off"
        maxLength={160}
        onChange={(event) => {
          ++request.current;
          setQuery(event.target.value);
          setSelected(null);
          setResults([]);
          setActive(-1);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(event) => {
          if (event.key === "Escape") setOpen(false);
          if (
            (event.key === "ArrowDown" || event.key === "ArrowUp") &&
            results.length
          ) {
            event.preventDefault();
            setOpen(true);
            setActive((index) =>
              event.key === "ArrowDown"
                ? (index + 1) % results.length
                : index <= 0
                  ? results.length - 1
                  : index - 1,
            );
          }
          if (event.key === "Enter" && visible && active >= 0) {
            event.preventDefault();
            choose(results[active]);
          }
        }}
      />
      <p id={`${id}-hint`} className="small-note">
        พิมพ์อย่างน้อย 2 ตัวอักษร ใช้ปุ่มขึ้น/ลงและ Enter เพื่อเลือก
      </p>
      {visible && (
        <ul
          id={`${id}-list`}
          role="listbox"
          aria-label="ที่อยู่ที่แนะนำ"
          className="autocomplete-options"
        >
          {results.map((address, index) => (
            <li
              key={`${address.type}-${address.formattedAddress}`}
              id={`${id}-option-${index}`}
              role="option"
              aria-selected={index === active}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => choose(address)}
            >
              {address.formattedAddress}
            </li>
          ))}
        </ul>
      )}
      <p role="status" className="small-note">
        {selected ? `เลือกแล้ว: ${selected.formattedAddress}` : message}
      </p>
    </div>
  );
}
