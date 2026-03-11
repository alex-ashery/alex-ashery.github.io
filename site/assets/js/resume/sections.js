import { CREDLY_BADGE_HEIGHT, CREDLY_BADGE_WIDTH } from "./constants.js";
import { extractCredlyBadgeId } from "./credly.js";
import { escapeHtml, formatMonthYear, renderList } from "./utils.js";

export const renderWorkSection = (work, buildDetailList) =>
  renderList("Experience", work, (job) => {
    const company = escapeHtml(job?.name || job?.company || "");
    const role = escapeHtml(job?.position || "");
    const startDate = formatMonthYear(job?.startDate);
    const endDate = formatMonthYear(job?.endDate);
    const period = escapeHtml([startDate, endDate].filter(Boolean).join(" - "));
    const highlights = buildDetailList(job?.highlights, "resume-highlights");
    const highlightsToggle = highlights
      ? `<button type="button" class="resume-highlights-toggle" aria-expanded="false" aria-controls="${highlights.id}">
          Highlights
        </button>`
      : "";
    const summaryText = escapeHtml(job?.summary || "");
    const summary = summaryText
      ? `<p class="resume-job-summary">${summaryText}${highlightsToggle}</p>`
      : highlightsToggle
        ? `<p class="resume-job-summary">${highlightsToggle}</p>`
        : "";
    const highlightsList = highlights
      ? `
        <div class="resume-item-details">
          <ul id="${highlights.id}" hidden>
            ${highlights.rows.map((item) => `<li>${item}</li>`).join("")}
          </ul>
        </div>
      `
      : "";
    if (!company && !role) return "";
    const headingLeft = company || role;
    const roleLine = company && role ? role : "";
    return `
      <div class="resume-item-header">
        <span class="resume-item-title">${headingLeft}</span>
        <span class="resume-item-period">${period}</span>
      </div>
      ${roleLine ? `<div class="resume-item-subtitle">${roleLine}</div>` : ""}
      ${summary}
      ${highlightsList}
    `;
  });

export const renderEducationSection = (education, buildDetailList) =>
  renderList("Education", education, (edu) => {
    const school = escapeHtml(edu?.institution || "");
    const degree = escapeHtml([edu?.studyType, edu?.area].filter(Boolean).join(" "));
    const startDate = formatMonthYear(edu?.startDate);
    const endDate = formatMonthYear(edu?.endDate);
    const period = escapeHtml([startDate, endDate].filter(Boolean).join(" - "));
    const courses = buildDetailList(edu?.courses, "resume-courses");
    const coursesToggle = courses
      ? `<button type="button" class="resume-highlights-toggle" aria-expanded="false" aria-controls="${courses.id}">
          Courses
        </button>`
      : "";
    const coursesList = courses
      ? `
        <div class="resume-item-details">
          <ul id="${courses.id}" hidden>
            ${courses.rows.map((course) => `<li>${course}</li>`).join("")}
          </ul>
        </div>
      `
      : "";
    if (!school && !degree) return "";
    const headingLeft = school || degree;
    const degreeLine = school && degree ? degree : "";
    return `
      <div class="resume-item-header">
        <span class="resume-item-title">${headingLeft}</span>
        <span class="resume-item-period">${period}</span>
      </div>
      ${degreeLine ? `<div class="resume-item-subtitle">${degreeLine}</div>` : ""}
      ${coursesToggle ? `<div class="resume-item-extra">${coursesToggle}</div>` : ""}
      ${coursesList}
    `;
  });

export const renderSkillsSection = (skills) =>
  renderList("Skills", skills, (skill) => {
    const skillName = escapeHtml(skill?.name || "");
    const keywords = Array.isArray(skill?.keywords) ? skill.keywords.map(escapeHtml).join(", ") : "";
    return skillName || keywords ? `<strong>${skillName}</strong>${keywords ? `: ${keywords}` : ""}` : "";
  });

export const renderCertificatesSection = (certificates) => {
  let needsCredlyEmbedScript = false;
  const html = renderList(
    "Certificates",
    certificates,
    (cert) => {
      const certUrl = String(cert?.url || "");
      const badgeId = extractCredlyBadgeId(certUrl);

      if (!badgeId) return "";
      needsCredlyEmbedScript = true;

      return `
        <div class="resume-certificate-card">
          <div data-iframe-width="${CREDLY_BADGE_WIDTH}" data-iframe-height="${CREDLY_BADGE_HEIGHT}" data-share-badge-id="${escapeHtml(badgeId)}" data-share-badge-host="https://www.credly.com"></div>
        </div>
      `;
    },
    "certificates",
  );

  return { html, needsCredlyEmbedScript };
};
