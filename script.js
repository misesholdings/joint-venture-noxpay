/* =============================================================================
 * Joint Venture Intention — interactions
 *
 * - Theme toggle (light/dark) with localStorage persistence
 * - Print/export PDF action
 * - Active section highlighting in nav (scroll spy)
 * - Fade-in on scroll for sections/cards
 * - Auto-fills hero/footer dates in pt-BR
 * ===========================================================================*/

(function () {
  "use strict";

  /* ---------------------------------------------------------------------------
   * Auth gate — soft client-side login (SHA-256 + sessionStorage)
   *
   * NOTE: This is a *soft* gate. The HTML body still contains the document
   * markup, so a determined attacker with DevTools can bypass. It is intended
   * to prevent casual access only. For real confidentiality, the URL itself
   * should be treated as a secret and not shared publicly.
   * -------------------------------------------------------------------------*/
  const AUTH_KEY = "jv-auth-session";
  const AUTH_USER = "jp@misespay.com";
  // SHA-256 of the password (computed at build time).
  const AUTH_HASH = "03eaab29bef87bc27cfbdf94016d2af0bbc5924b79fd63a7fa2d6703fa63f168";
  const CONF_ACK_KEY = "jv-conf-ack";

  async function sha256Hex(input) {
    const data = new TextEncoder().encode(input);
    const buf = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  function isAuthed() {
    try {
      return sessionStorage.getItem(AUTH_KEY) === "1";
    } catch (_) {
      return false;
    }
  }

  function persistAuth() {
    try {
      sessionStorage.setItem(AUTH_KEY, "1");
    } catch (_) {}
  }

  function unlockApp() {
    const gate = document.getElementById("auth-gate");
    const main = document.getElementById("main");
    const body = document.body;
    if (gate) gate.classList.add("is-hidden");
    if (main) main.hidden = false;
    if (body) body.classList.remove("jv-is-locked");
    // Re-trigger any IntersectionObservers that may have been registered
    // before main was visible.
    window.dispatchEvent(new Event("jv:unlocked"));
    // Show the confidentiality notice if not yet acknowledged this session.
    showConfidentialityNoticeIfNeeded();
  }

  /* ---------------------------------------------------------------------------
   * Confidentiality notice (post-login NDA acknowledgement)
   * -------------------------------------------------------------------------*/
  function isConfAcked() {
    try {
      return sessionStorage.getItem(CONF_ACK_KEY) === "1";
    } catch (_) {
      return false;
    }
  }

  function persistConfAck() {
    try {
      sessionStorage.setItem(CONF_ACK_KEY, "1");
    } catch (_) {}
  }

  function showConfidentialityNoticeIfNeeded() {
    if (isConfAcked()) return;

    const notice = document.getElementById("conf-notice");
    const acceptBtn = document.getElementById("conf-notice-accept");
    const denyBtn = document.getElementById("conf-notice-deny");
    if (!notice || !acceptBtn || !denyBtn) return;

    document.documentElement.classList.add("jv-conf-open");
    document.body.classList.add("jv-conf-open");
    notice.hidden = false;

    // Focus the primary action for keyboard users.
    try {
      acceptBtn.focus({ preventScroll: true });
    } catch (_) {
      acceptBtn.focus();
    }

    function close() {
      notice.hidden = true;
      document.documentElement.classList.remove("jv-conf-open");
      document.body.classList.remove("jv-conf-open");
      window.removeEventListener("keydown", onKey);
      acceptBtn.removeEventListener("click", onAccept);
      denyBtn.removeEventListener("click", onDeny);
    }

    function onAccept() {
      persistConfAck();
      close();
    }

    function onDeny() {
      // Revoke session and reload to the login screen.
      try {
        sessionStorage.removeItem(AUTH_KEY);
        sessionStorage.removeItem(CONF_ACK_KEY);
      } catch (_) {}
      window.location.reload();
    }

    function onKey(e) {
      if (e.key === "Escape") {
        // Treat Escape as "deny" — safer default for confidential content.
        e.preventDefault();
        onDeny();
      } else if (e.key === "Enter" && document.activeElement === acceptBtn) {
        e.preventDefault();
        onAccept();
      }
    }

    acceptBtn.addEventListener("click", onAccept);
    denyBtn.addEventListener("click", onDeny);
    window.addEventListener("keydown", onKey);
  }

  function initAuthGate() {
    const gate = document.getElementById("auth-gate");
    const form = document.getElementById("auth-form");

    // Fill current year in the auth footer
    const yearEl = document.getElementById("auth-year");
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());

    if (!gate || !form) {
      // No gate in DOM (e.g., print fallback) — show app.
      unlockApp();
      return;
    }

    if (isAuthed()) {
      unlockApp();
      return;
    }

    const emailInput = document.getElementById("auth-email");
    const passInput = document.getElementById("auth-password");
    const errorBox = document.getElementById("auth-error");
    const submitBtn = document.getElementById("auth-submit");

    function showError(msg) {
      if (!errorBox) return;
      errorBox.textContent = msg;
      errorBox.hidden = false;
      // Restart the shake animation
      errorBox.style.animation = "none";
      // Force reflow
      void errorBox.offsetWidth;
      errorBox.style.animation = "";
    }

    function clearError() {
      if (!errorBox) return;
      errorBox.hidden = true;
    }

    [emailInput, passInput].forEach((el) => {
      if (el) el.addEventListener("input", clearError);
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearError();

      const email = (emailInput && emailInput.value ? emailInput.value : "")
        .trim()
        .toLowerCase();
      const pass = passInput && passInput.value ? passInput.value : "";

      if (!email || !pass) {
        showError("Preencha e-mail e senha.");
        return;
      }

      if (submitBtn) submitBtn.setAttribute("aria-busy", "true");

      try {
        if (email !== AUTH_USER) {
          await new Promise((r) => setTimeout(r, 450));
          showError("Credenciais inválidas. Verifique e-mail e senha.");
          return;
        }

        const hash = await sha256Hex(pass);
        if (hash === AUTH_HASH) {
          persistAuth();
          unlockApp();
        } else {
          await new Promise((r) => setTimeout(r, 350));
          showError("Credenciais inválidas. Verifique e-mail e senha.");
        }
      } catch (err) {
        showError("Erro ao validar credenciais. Tente novamente.");
      } finally {
        if (submitBtn) submitBtn.removeAttribute("aria-busy");
      }
    });

    // Focus the first empty field for nicer UX.
    if (emailInput && !emailInput.value) {
      try {
        emailInput.focus({ preventScroll: true });
      } catch (_) {
        emailInput.focus();
      }
    } else if (passInput) {
      try {
        passInput.focus({ preventScroll: true });
      } catch (_) {
        passInput.focus();
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAuthGate);
  } else {
    initAuthGate();
  }

  const STORAGE_KEY = "jv-theme";
  const root = document.documentElement;

  /* ---------------------------------------------------------------------------
   * Theme
   * -------------------------------------------------------------------------*/
  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "dark" ? "#0b0b0c" : "#f8f8f7");
  }

  function initTheme() {
    let saved = null;
    try {
      saved = localStorage.getItem(STORAGE_KEY);
    } catch (_) {}
    const prefersDark =
      window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    applyTheme(saved || (prefersDark ? "dark" : "light"));
  }

  function toggleTheme() {
    const current = root.getAttribute("data-theme") === "dark" ? "dark" : "light";
    const next = current === "dark" ? "light" : "dark";
    applyTheme(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch (_) {}
    showToast(next === "dark" ? "Tema escuro" : "Tema claro");
  }

  /* ---------------------------------------------------------------------------
   * Toast
   * -------------------------------------------------------------------------*/
  let toastTimer = null;
  function showToast(message) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 1800);
  }

  /* ---------------------------------------------------------------------------
   * Print
   * -------------------------------------------------------------------------*/
  function handlePrint() {
    showToast("Abrindo diálogo de impressão…");
    setTimeout(() => window.print(), 250);
  }

  /* ---------------------------------------------------------------------------
   * Scroll spy — highlights the current section in the nav
   * -------------------------------------------------------------------------*/
  function initScrollSpy() {
    const tabs = Array.from(document.querySelectorAll(".jv-nav-tabs .ds-tab"));
    if (!tabs.length) return;

    const targets = tabs
      .map((tab) => {
        const href = tab.getAttribute("href") || "";
        if (!href.startsWith("#")) return null;
        const el = document.getElementById(href.slice(1));
        if (!el) return null;
        return { tab, el };
      })
      .filter(Boolean);

    if (!targets.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id;
          targets.forEach(({ tab }) => {
            if (tab.getAttribute("href") === "#" + id) {
              tab.setAttribute("aria-current", "page");
            } else {
              tab.removeAttribute("aria-current");
            }
          });
        });
      },
      {
        rootMargin: "-40% 0px -55% 0px",
        threshold: 0,
      }
    );

    targets.forEach(({ el }) => observer.observe(el));
  }

  /* ---------------------------------------------------------------------------
   * Fade-in reveal on scroll
   * -------------------------------------------------------------------------*/
  function initReveal() {
    const candidates = document.querySelectorAll(
      ".jv-section, .ds-card, .ds-kpi-strip, .jv-hero-meta-grid"
    );
    candidates.forEach((el) => el.classList.add("ds-fade-in"));

    if (!("IntersectionObserver" in window)) {
      candidates.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 }
    );

    candidates.forEach((el) => io.observe(el));
  }

  /* ---------------------------------------------------------------------------
   * Dates — pt-BR
   * -------------------------------------------------------------------------*/
  function fillDates() {
    const now = new Date();
    const longFmt = new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    const shortFmt = new Intl.DateTimeFormat("pt-BR", {
      month: "short",
      year: "numeric",
    });

    const heroDate = document.getElementById("hero-date");
    if (heroDate) heroDate.textContent = longFmt.format(now);

    const footerDate = document.getElementById("footer-date");
    if (footerDate) footerDate.textContent = shortFmt.format(now);

    const footerYear = document.getElementById("footer-year");
    if (footerYear) footerYear.textContent = String(now.getFullYear());
  }

  /* ---------------------------------------------------------------------------
   * Init
   * -------------------------------------------------------------------------*/
  function init() {
    initTheme();
    fillDates();
    initReveal();
    initScrollSpy();

    const themeBtn = document.getElementById("theme-toggle");
    if (themeBtn) themeBtn.addEventListener("click", toggleTheme);

    const printBtn = document.getElementById("print-btn");
    if (printBtn) printBtn.addEventListener("click", handlePrint);

    document.addEventListener("keydown", (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "p") {
        return;
      }
      if (e.key === "t" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const tag = (e.target && e.target.tagName) || "";
        if (tag === "INPUT" || tag === "TEXTAREA") return;
        toggleTheme();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
