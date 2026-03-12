const getBadgeMetrics = (gridEl) => {
  const styles = getComputedStyle(gridEl);
  const badgeWidthValue = styles.getPropertyValue("--resume-credly-badge-width").trim();
  const badgeWidth = Number.parseFloat(badgeWidthValue);
  const gap = Number.parseFloat(styles.columnGap || styles.gap || "0") || 0;
  return { badgeWidth, gap };
};

const getMaxColumns = (availableWidth, badgeWidth, gap) =>
  Math.max(1, Math.floor((availableWidth + gap) / (badgeWidth + gap)));

const layoutCertificateGrid = (gridEl) => {
  const itemEls = gridEl._certificateItems;
  if (!Array.isArray(itemEls) || itemEls.length === 0) return;

  const { badgeWidth, gap } = getBadgeMetrics(gridEl);
  if (!badgeWidth) return;

  const availableWidth = gridEl.parentElement?.clientWidth || gridEl.clientWidth;
  if (!availableWidth) return;

  const maxColumns = getMaxColumns(availableWidth, badgeWidth, gap);
  const nextSignature = String(maxColumns);
  if (gridEl.dataset.columnCount === nextSignature) return;

  gridEl.replaceChildren();
  for (let start = 0; start < itemEls.length; start += maxColumns) {
    const rowEl = document.createElement("div");
    rowEl.className = "resume-certificate-row";
    itemEls.slice(start, start + maxColumns).forEach((itemEl) => rowEl.appendChild(itemEl));
    gridEl.appendChild(rowEl);
  }
  gridEl.dataset.columnCount = nextSignature;
};

export const bindCertificateLayout = (rootEl) => {
  const gridEl = rootEl.querySelector(".resume-certificate-grid");
  if (!gridEl) return;

  gridEl._certificateItems = Array.from(gridEl.querySelectorAll(":scope > .resume-certificate-item"));
  layoutCertificateGrid(gridEl);
};
