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

/* Back link: go back if the visitor came from another page, otherwise go home. */
document.addEventListener("click", (e) => {
  const a = e.target.closest && e.target.closest("[data-back]");
  if (!a) return;
  if (document.referrer && new URL(document.referrer).origin === location.origin && history.length > 1) {
    e.preventDefault(); history.back();
  }
});

/* Tap to enlarge: any a[data-lightbox] opens its image full screen. */
(() => {
  const links = document.querySelectorAll("a[data-lightbox]");
  if (!links.length) return;
  const touch = window.matchMedia("(hover: none)").matches;
  links.forEach((a) => { const t = a.querySelector(".hint-txt"); if (t) t.textContent = touch ? "Tap to enlarge" : "Click to enlarge"; });
  const lb = document.createElement("dialog");
  lb.className = "lightbox";
  lb.innerHTML = '<div class="lb-scroll"><img alt=""></div><div class="lb-bar"><span class="lb-tip"></span><div class="lb-btns"><button class="lb-btn lb-zoom" type="button">Zoom in</button><button class="lb-btn lb-close" type="button" aria-label="Close">✕</button></div></div>';
  document.body.appendChild(lb);
  const scroller = lb.querySelector(".lb-scroll"), img = lb.querySelector("img");
  const zoomBtn = lb.querySelector(".lb-zoom"), tip = lb.querySelector(".lb-tip");
  let opener = null;
  function setBig(on) {
    lb.classList.toggle("big", on);
    zoomBtn.textContent = on ? "Fit to screen" : "Zoom in";
    tip.textContent = on ? (touch ? "Drag to look around" : "Scroll to look around") : (touch ? "Tap the chart to zoom in" : "Click the chart to zoom in");
  }
  function hide() { if (lb.close) lb.close(); else { lb.removeAttribute("open"); onClose(); } }
  function onClose() { document.documentElement.style.overflow = ""; if (opener) opener.focus(); }
  lb.addEventListener("close", onClose);
  links.forEach((a) => a.addEventListener("click", (e) => {
    e.preventDefault(); opener = a;
    const src = a.querySelector("img");
    img.src = a.getAttribute("href");
    img.alt = (src && src.alt) || "";
    const w = parseInt(a.dataset.fullWidth || (src && src.getAttribute("width")) || "1400", 10);
    lb.style.setProperty("--lb-w", Math.max(w, 1000) + "px");
    lb.setAttribute("aria-label", (a.getAttribute("aria-label") || "Chart") + ", full screen");
    setBig(false);
    if (lb.showModal) lb.showModal(); else lb.setAttribute("open", "");
    document.documentElement.style.overflow = "hidden";
  }));
  lb.querySelector(".lb-close").addEventListener("click", hide);
  zoomBtn.addEventListener("click", () => setBig(!lb.classList.contains("big")));
  img.addEventListener("click", (e) => {
    e.stopPropagation();
    if (lb.classList.contains("big")) { setBig(false); return; }
    const r = img.getBoundingClientRect();
    const fx = (e.clientX - r.left) / r.width, fy = (e.clientY - r.top) / r.height;
    setBig(true);
    requestAnimationFrame(() => {
      scroller.scrollLeft = fx * img.offsetWidth - scroller.clientWidth / 2;
      scroller.scrollTop = fy * img.offsetHeight - scroller.clientHeight / 2;
    });
  });
  scroller.addEventListener("click", (e) => { if (e.target === scroller) hide(); });
})();
