export const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

export const formatMonthYear = (value) => {
  if (!value) return "";

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toLocaleString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
  }

  const input = String(value).trim();
  if (!input) return "";

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const yearMonthMatch = input.match(/^(\d{4})-(\d{2})/);
  if (yearMonthMatch) {
    const monthIndex = Number(yearMonthMatch[2]) - 1;
    if (monthIndex >= 0 && monthIndex < 12) {
      return `${monthNames[monthIndex]} ${yearMonthMatch[1]}`;
    }
    return yearMonthMatch[1];
  }

  const yearOnlyMatch = input.match(/^(\d{4})$/);
  if (yearOnlyMatch) {
    return yearOnlyMatch[1];
  }

  const parsedDate = new Date(input);
  if (!Number.isNaN(parsedDate.getTime())) {
    return parsedDate.toLocaleString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
  }

  return input;
};

export const renderList = (title, items, formatter, sectionClass = "") => {
  if (!Array.isArray(items) || items.length === 0) return "";
  const rows = items.map(formatter).filter(Boolean);
  if (rows.length === 0) return "";
  const classAttr = sectionClass ? ` resume-section-${sectionClass}` : "";
  return `
    <section class="resume-section${classAttr}">
      <h3>${title}</h3>
      <hr class="resume-section-divider" />
      <ul>${rows.map((row) => `<li>${row}</li>`).join("")}</ul>
    </section>
  `;
};

export const createDetailListBuilder = () => {
  let detailIdCounter = 0;
  return (items, idPrefix) => {
    if (!Array.isArray(items) || items.length === 0) return "";
    const rows = items.map(escapeHtml).filter(Boolean);
    if (rows.length === 0) return "";
    const id = `${idPrefix}-${detailIdCounter++}`;
    return { id, rows };
  };
};
