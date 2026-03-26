// Fixed gym hours by weekday (calendar date, UTC) for slot generation.
// Mon–Fri: 8:00–20:00, Sat: 9:00–18:00, Sun: 9:00–13:00

export function getOpeningHoursForDate(yyyyMmDd) {
  const parts = String(yyyyMmDd).split("-").map(Number);
  const Y = parts[0];
  const M = parts[1];
  const D = parts[2];
  if (!Y || !M || !D) return null;
  const wd = new Date(Date.UTC(Y, M - 1, D)).getUTCDay();
  if (wd === 0)
    return { openingTime: "09:00", closingTime: "13:00", label: "Sunday" };
  if (wd === 6)
    return { openingTime: "09:00", closingTime: "18:00", label: "Saturday" };
  return { openingTime: "08:00", closingTime: "20:00", label: "Monday–Friday" };
}
