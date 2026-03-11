import { CREDLY_EMBED_SCRIPT_SRC } from "./constants.js";

export const extractCredlyBadgeId = (value) => {
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

export const ensureCredlyEmbedScript = () => {
  if (document.querySelector(`script[src="${CREDLY_EMBED_SCRIPT_SRC}"]`)) return;
  const credlyScript = document.createElement("script");
  credlyScript.type = "text/javascript";
  credlyScript.async = true;
  credlyScript.src = CREDLY_EMBED_SCRIPT_SRC;
  document.body.appendChild(credlyScript);
};
