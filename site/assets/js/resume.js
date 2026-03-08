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
  const renderList = (title, items, formatter) => {
    if (!Array.isArray(items) || items.length === 0) return "";
    const rows = items.map(formatter).filter(Boolean);
    if (rows.length === 0) return "";
    return `<section><h3>${title}</h3><ul>${rows.map((row) => `<li>${row}</li>`).join("")}</ul></section>`;
  };

  const escapeHtml = (value) =>
    String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");

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

      const basics = data?.basics ?? {};
      const name = basics?.name || data?.name || "Resume";
      const label = basics?.label ? `<p>${escapeHtml(basics.label)}</p>` : "";
      const summary = basics?.summary ? `<p>${escapeHtml(basics.summary)}</p>` : "";

      const workHtml = renderList("Experience", data?.work, (job) => {
        const company = escapeHtml(job?.name || job?.company || "");
        const role = escapeHtml(job?.position || "");
        const period = escapeHtml([job?.startDate, job?.endDate].filter(Boolean).join(" - "));
        if (!company && !role) return "";
        return `<strong>${role || company}</strong>${role && company ? `, ${company}` : ""}${period ? ` (${period})` : ""}`;
      });

      const educationHtml = renderList("Education", data?.education, (edu) => {
        const school = escapeHtml(edu?.institution || "");
        const area = escapeHtml([edu?.studyType, edu?.area].filter(Boolean).join(" "));
        if (!school && !area) return "";
        return `<strong>${school}</strong>${area ? ` - ${area}` : ""}`;
      });

      const skillsHtml = renderList("Skills", data?.skills, (skill) => {
        const skillName = escapeHtml(skill?.name || "");
        const keywords = Array.isArray(skill?.keywords) ? skill.keywords.map(escapeHtml).join(", ") : "";
        return skillName || keywords ? `<strong>${skillName}</strong>${keywords ? `: ${keywords}` : ""}` : "";
      });

      const rendered = `
        <section>
          <h2>${escapeHtml(name)}</h2>
          ${label}
          ${summary}
        </section>
        ${workHtml}
        ${educationHtml}
        ${skillsHtml}
      `.trim();

      if (rendered.replace(/\s/g, "")) {
        rootEl.innerHTML = rendered;
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
