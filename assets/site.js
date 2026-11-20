/* Copy-email button: copies the address, plays a short animation and shows a toast.
   The address is built here rather than written in the HTML, to keep it away from scrapers. */
(() => {
  const EMAIL = ["nick", "nickgcamp.com"].join("@"); // change the address here
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  let toast, live, hideTimer, typeTimer;

  function setup() {
    if (toast) return;
    live = document.createElement("div");
    live.className = "sr-only";
    live.setAttribute("role", "status");
    live.setAttribute("aria-live", "polite");
    toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML =
      '<span class="t-badge" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.2 4.2L19 7"/></svg></span>' +
      '<span class="t-body"><b></b><span class="t-addr"></span></span>' +
      '<button type="button" class="t-close" aria-label="Close">×</button>';
    toast.querySelector(".t-close").addEventListener("click", hide);
    document.body.append(live, toast);
  }

  async function copy(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (e) { /* fall through */ }
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.cssText = "position:fixed;top:0;left:0;opacity:0;pointer-events:none";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return ok;
    } catch (e) {
      return false;
    }
  }

  function burst(btn) {
    if (reduce.matches) return;
    for (let i = 0; i < 10; i++) {
      const dot = document.createElement("span");
      dot.className = "ce-burst";
      dot.setAttribute("aria-hidden", "true");
      dot.style.setProperty("--a", i * 36 + Math.random() * 16 + "deg");
      dot.style.setProperty("--d", 24 + Math.random() * 16 + "px");
      btn.appendChild(dot);
      dot.addEventListener("animationend", () => dot.remove());
    }
  }

  function hide() {
    toast.classList.remove("show", "manual");
  }

  function show(ok) {
    clearTimeout(hideTimer);
    clearInterval(typeTimer);
    toast.classList.remove("show");
    void toast.offsetWidth; // restart the check animation
    toast.classList.toggle("manual", !ok);
    toast.querySelector("b").textContent = ok ? "Email copied" : "Here's my email";
    const addr = toast.querySelector(".t-addr");
    toast.classList.add("show");
    if (ok && !reduce.matches) {
      // type the address out like a terminal
      let i = 0;
      addr.textContent = "";
      addr.classList.add("typing");
      typeTimer = setInterval(() => {
        addr.textContent = EMAIL.slice(0, ++i);
        if (i >= EMAIL.length) { clearInterval(typeTimer); addr.classList.remove("typing"); }
      }, 28);
    } else {
      addr.textContent = EMAIL;
    }
    live.textContent = ok ? "Email address copied: " + EMAIL : "Couldn't copy automatically. My email is " + EMAIL;
    if (ok) {
      hideTimer = setTimeout(hide, 3600);
    } else {
      const range = document.createRange();
      range.selectNodeContents(addr);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }

  document.addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-copy-email]");
    if (!btn) return;
    setup();
    const ok = await copy(EMAIL);
    if (ok) {
      btn.classList.remove("is-copied");
      void btn.offsetWidth;
      btn.classList.add("is-copied");
      burst(btn);
      clearTimeout(btn._t);
      btn._t = setTimeout(() => btn.classList.remove("is-copied"), 2200);
    }
    show(ok);
  });

  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && toast) hide(); });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", setup);
  else setup();
})();
