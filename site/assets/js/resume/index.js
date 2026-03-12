import { load as loadYaml } from "js-yaml";
import { CREDLY_BADGE_HEIGHT, CREDLY_BADGE_WIDTH } from "./constants.js";
import { ensureCredlyEmbedScript } from "./credly.js";
import {
  renderCertificatesSection,
  renderEducationSection,
  renderSkillsSection,
  renderWorkSection,
} from "./sections.js";
import { bindResumeToggles } from "./toggles.js";
import { createDetailListBuilder, escapeHtml } from "./utils.js";

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
  const buildDetailList = createDetailListBuilder();

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
      const profiles = Array.isArray(basics?.profiles)
        ? basics.profiles
            .map((profile) => {
              const network = escapeHtml(profile?.network || "");
              const url = escapeHtml(profile?.url || "");
              if (!network || !url) return "";
              return `<a href="${url}" target="_blank" rel="noopener">${network}</a>`;
            })
            .filter(Boolean)
        : [];
      const profilesHtml =
        profiles.length > 0 ? `<div class="resume-profile-links">${profiles.join("<span aria-hidden=\"true\"> &bull; </span>")}</div>` : "";
      const summary = basics?.summary ? `<p>${escapeHtml(basics.summary)}</p>` : "";

      const workHtml = renderWorkSection(data?.work, buildDetailList);
      const educationHtml = renderEducationSection(data?.education, buildDetailList);
      const skillsHtml = renderSkillsSection(data?.skills);
      const certificates = renderCertificatesSection(data?.certificates);

      const rendered = `
        <section>
          <h2>${escapeHtml(name)}</h2>
          ${label}
          ${profilesHtml}
          ${summary}
        </section>
        ${workHtml}
        ${educationHtml}
        ${skillsHtml}
        ${certificates.html}
      `.trim();

      if (rendered.replace(/\s/g, "")) {
        rootEl.innerHTML = rendered;
        bindResumeToggles(rootEl);
        if (certificates.needsCredlyEmbedScript) {
          ensureCredlyEmbedScript();
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
