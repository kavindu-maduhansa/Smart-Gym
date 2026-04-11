/**
 * Browser URL for files under backend /uploads (multer stores filename only, e.g. 1234567890.jpg).
 */
export function uploadImageSrc(stored) {
  if (stored == null) return "";
  let raw = String(stored).trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;

  raw = raw.replace(/^\/+/, "");
  if (/^uploads[/\\]/i.test(raw)) {
    raw = raw.replace(/^uploads[/\\]+/i, "");
  }
  const parts = raw.split(/[/\\]/).filter(Boolean);
  const filename = parts[parts.length - 1] || raw;
  if (!filename) return "";

  let base = (import.meta.env.VITE_API_URL || "").trim().replace(/\/+$/, "");
  if (/\/api$/i.test(base)) base = base.replace(/\/api$/i, "");

  if (import.meta.env.DEV) {
    return `/uploads/${encodeURIComponent(filename)}`;
  }

  const origin = base || "http://localhost:5000";
  return `${origin}/uploads/${encodeURIComponent(filename)}`;
}
