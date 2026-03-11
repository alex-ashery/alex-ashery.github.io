import { load as loadYaml } from "js-yaml";

const statusEl = document.getElementById("resume-status");
const rootEl = document.getElementById("resume-root");
const rawEl = document.getElementById("resume-raw");

const endpoint = rootEl?.dataset?.endpoint || "";

if (!statusEl || !rootEl || !rawEl) {
  throw new Error("Resume page elements are missing.");
}

if (!endpoint) {
  statusEl.style.display = "";
  statusEl.textContent = "Resume endpoint is not configured. Set params.jsonResumeUrl in hugo.yaml.";
} else {
  const CREDLY_BADGE_WIDTH = 150;
  const CREDLY_BADGE_HEIGHT = 270;

  const renderList = (title, items, formatter, sectionClass = "") => {
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

  const escapeHtml = (value) =>
    String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");

  const formatMonthYear = (value) => {
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

  let detailIdCounter = 0;

  const buildDetailList = (items, idPrefix) => {
    if (!Array.isArray(items) || items.length === 0) return "";
    const rows = items.map(escapeHtml).filter(Boolean);
    if (rows.length === 0) return "";
    const id = `${idPrefix}-${detailIdCounter++}`;
    return { id, rows };
  };

  const extractCredlyBadgeId = (value) => {
    if (!value) return "";
    try {
      const parsed = new URL(String(value));
      if (parsed.hostname !== "www.credly.com") return "";
      const parts = parsed.pathname.split("/").filter(Boolean);
      if (parts.length < 2 || parts[0] !== "badges") return "";
      const badgeId = parts[1];
      const guidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      return guidPattern.test(badgeId) ? badgeId : "";
    } catch {
      return "";
    }
  };


  fetch(endpoint, { cache: "no-store" })
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.text();
    })
    .then((rawText) => {
      const parsed = loadYaml(rawText);
      if (!parsed || typeof parsed !== "object") {
        throw new Error("Resume data is not a valid object.");
      }
      return parsed;
    })
    .then((data) => {
      statusEl.style.display = "none";
      rootEl.style.display = "";
      rootEl.style.setProperty("--resume-credly-badge-width", `${CREDLY_BADGE_WIDTH}px`);
      rootEl.style.setProperty("--resume-credly-badge-height", `${CREDLY_BADGE_HEIGHT}px`);

      const basics = data?.basics ?? {};
      const name = basics?.name || data?.name || "Resume";
      const label = basics?.label ? `<p>${escapeHtml(basics.label)}</p>` : "";
      const summary = basics?.summary ? `<p>${escapeHtml(basics.summary)}</p>` : "";

      const workHtml = renderList("Experience", data?.work, (job) => {
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

      const educationHtml = renderList("Education", data?.education, (edu) => {
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

      const skillsHtml = renderList("Skills", data?.skills, (skill) => {
        const skillName = escapeHtml(skill?.name || "");
        const keywords = Array.isArray(skill?.keywords) ? skill.keywords.map(escapeHtml).join(", ") : "";
        return skillName || keywords ? `<strong>${skillName}</strong>${keywords ? `: ${keywords}` : ""}` : "";
      });

      let needsCredlyEmbedScript = false;
      const certificatesHtml = renderList("Certificates", data?.certificates, (cert) => {
        const certUrl = String(cert?.url || "");
        const badgeId = extractCredlyBadgeId(certUrl);

        if (!badgeId) return "";
        needsCredlyEmbedScript = true;

        return `
          <div class="resume-certificate-card">
            <div data-iframe-width="${CREDLY_BADGE_WIDTH}" data-iframe-height="${CREDLY_BADGE_HEIGHT}" data-share-badge-id="${escapeHtml(badgeId)}" data-share-badge-host="https://www.credly.com"></div>
          </div>
        `;
      }, "certificates");

      const rendered = `
        <section>
          <h2>${escapeHtml(name)}</h2>
          ${label}
          ${summary}
        </section>
        ${workHtml}
        ${educationHtml}
        ${skillsHtml}
        ${certificatesHtml}
      `.trim();

      if (rendered.replace(/\s/g, "")) {
        rootEl.innerHTML = rendered;
        rootEl.querySelectorAll(".resume-highlights-toggle").forEach((buttonEl) => {
          buttonEl.addEventListener("click", () => {
            const highlightsId = buttonEl.getAttribute("aria-controls");
            if (!highlightsId) return;
            const highlightsList = document.getElementById(highlightsId);
            if (!highlightsList) return;

            const isExpanding = highlightsList.hasAttribute("hidden");
            if (isExpanding) {
              highlightsList.removeAttribute("hidden");
              buttonEl.setAttribute("aria-expanded", "true");
              return;
            }

            highlightsList.setAttribute("hidden", "");
            buttonEl.setAttribute("aria-expanded", "false");
          });
        });

        if (needsCredlyEmbedScript && !document.querySelector('script[src="//cdn.credly.com/assets/utilities/embed.js"]')) {
          const credlyScript = document.createElement("script");
          credlyScript.type = "text/javascript";
          credlyScript.async = true;
          credlyScript.src = "//cdn.credly.com/assets/utilities/embed.js";
          document.body.appendChild(credlyScript);
        }

        return;
      }

      rootEl.style.display = "none";
      rawEl.style.display = "";
      rawEl.textContent = JSON.stringify(data, null, 2);
    })
    .catch((err) => {
      statusEl.style.display = "";
      statusEl.textContent = `Failed to load resume data from ${endpoint}: ${err.message}`;
    });
}
