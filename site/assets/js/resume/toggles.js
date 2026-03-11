export const bindResumeToggles = (rootEl) => {
  rootEl.querySelectorAll(".resume-highlights-toggle").forEach((buttonEl) => {
    buttonEl.addEventListener("click", () => {
      const detailsId = buttonEl.getAttribute("aria-controls");
      if (!detailsId) return;
      const detailsList = document.getElementById(detailsId);
      if (!detailsList) return;

      const isExpanding = detailsList.hasAttribute("hidden");
      if (isExpanding) {
        detailsList.removeAttribute("hidden");
        buttonEl.setAttribute("aria-expanded", "true");
        return;
      }

      detailsList.setAttribute("hidden", "");
      buttonEl.setAttribute("aria-expanded", "false");
    });
  });
};
