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

/* Pinned header height, Email me link, and the contact highlight */
(() => {
  const hdr = document.querySelector('.site-header, .top');
  const root = document.documentElement;
  if (hdr) {
    const size = () => root.style.setProperty('--hdr-h', (hdr.offsetHeight + 14) + 'px');
    let ticking = false;
    const stuck = () => { ticking = false; hdr.classList.toggle('stuck', window.scrollY > 4 && hdr.getBoundingClientRect().top <= 0.5); };
    size(); stuck();
    window.addEventListener('resize', size);
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(stuck); } }, { passive: true });
  }
  const EMAIL = ["nick", "nickgcamp.com"].join("@");
  document.querySelectorAll('[data-mailto]').forEach(a => { a.href = 'mailto:' + EMAIL; });
  const panel = document.querySelector('.contact-panel');
  if (!panel) return;
  const flash = () => { panel.classList.remove('contact-flash'); void panel.offsetWidth; panel.classList.add('contact-flash'); };
  panel.addEventListener('animationend', e => { if (e.target === panel) panel.classList.remove('contact-flash'); });
  // pulse once the page has stopped scrolling to the box
  let waiting = false;
  const whenStill = () => { if (waiting) return; waiting = true; let last = -1, still = 0, n = 0; const step = () => { const y = scrollY; still = y === last ? still + 1 : 0; last = y; if (still > 4 || ++n > 120) { waiting = false; flash(); } else requestAnimationFrame(step); }; requestAnimationFrame(step); };
  document.querySelectorAll('a[href="#contact"]').forEach(a => a.addEventListener('click', whenStill));
  if (location.hash === '#contact') whenStill();
  window.addEventListener('hashchange', () => { if (location.hash === '#contact') whenStill(); });
})();

/* Side tracker, reading-progress bar and gentle section reveal */
(() => {
  const root = document.documentElement;
  const sections = [...document.querySelectorAll('main > section[aria-labelledby]')];
  if (sections.length < 3) return;
  const hdr = document.querySelector('.top, .site-header');
  // reading-progress bar under the pinned header (narrow screens)
  if (hdr) {
    const bar = document.createElement('span'); bar.className = 'read-bar'; bar.setAttribute('aria-hidden', 'true'); hdr.appendChild(bar);
    let t = false;
    const upd = () => { t = false; const max = root.scrollHeight - innerHeight; bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, scrollY / max) : 0) + ')'; };
    addEventListener('scroll', () => { if (!t) { t = true; requestAnimationFrame(upd); } }, { passive: true });
    addEventListener('resize', upd); upd();
  }
  // side tracker (wide screens)
  const nav = document.createElement('nav'); nav.className = 'spy'; nav.setAttribute('aria-label', 'On this page');
  const links = sections.map(s => {
    const h = document.getElementById(s.getAttribute('aria-labelledby'));
    const a = document.createElement('a');
    a.href = '#' + (s.id || h.id);
    a.innerHTML = '<span class="dot" aria-hidden="true"></span><span class="lbl"></span>';
    a.querySelector('.lbl').textContent = h.textContent.trim();
    nav.appendChild(a); return a;
  });
  document.body.appendChild(nav);
  const setOn = i => links.forEach((a, k) => { a.classList.toggle('on', k === i); if (k === i) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
  const pick = () => {
    const line = innerHeight * 0.35; let cur = 0;
    sections.forEach((s, i) => { if (s.getBoundingClientRect().top <= line) cur = i; });
    if (innerHeight + scrollY >= root.scrollHeight - 2) cur = sections.length - 1;
    setOn(cur);
  };
  let p = false;
  addEventListener('scroll', () => { if (!p) { p = true; requestAnimationFrame(() => { p = false; pick(); }); } }, { passive: true });
  addEventListener('resize', pick); pick();
  // gentle reveal, once per section
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
    const show = s => s.classList.add('in');
    sections.forEach(s => { if (s.getBoundingClientRect().top < innerHeight * 0.95) show(s); });
    root.classList.add('reveal-on');
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
    sections.forEach(s => { if (!s.classList.contains('in')) io.observe(s); });
    // a jump (tracker, Contact, a link) shows everything it passes
    addEventListener('hashchange', () => sections.forEach(show));
    setTimeout(() => sections.forEach(s => { if (s.getBoundingClientRect().top < innerHeight) show(s); }), 1200);
  }
})();
/* Deep Dive reading tracker: sections light up as you read, time left counts down */
(() => {
  const art = document.querySelector('.article');
  const body = art && art.querySelector('.article-body');
  if (!body) return;
  const heads = [...body.querySelectorAll(':scope > h2[id]')];
  if (heads.length < 2) return;
  const root = document.documentElement;
  const meta = [...art.querySelectorAll('.meta-line span')].map(s => s.textContent.match(/(\d+)\s*min read/)).find(Boolean);
  const blocks = [...body.querySelectorAll(':scope > p, :scope > ul, :scope > ol, :scope > figure, :scope > h2, :scope > blockquote')];
  const words = el => (el.textContent.trim().match(/\S+/g) || []).length + (el.tagName === 'FIGURE' ? 40 : 0);
  const counts = blocks.map(words);
  const total = counts.reduce((a, b) => a + b, 0) || 1;
  const perMin = meta ? total / +meta[1] : 230;
  const hdr = document.querySelector('.site-header');
  // side tracker (wide screens)
  const nav = document.createElement('nav'); nav.className = 'track'; nav.setAttribute('aria-label', 'Sections in this read');
  nav.innerHTML = '<span class="left" aria-live="off"></span><ol><span class="fill" aria-hidden="true"></span></ol>';
  const ol = nav.querySelector('ol'), fill = nav.querySelector('.fill'), leftEl = nav.querySelector('.left');
  const label = h => h.textContent.trim().replace(/^\d+\.\s*/, '');
  const links = heads.map(h => { const li = document.createElement('li'); const a = document.createElement('a'); a.href = '#' + h.id; a.textContent = label(h); li.appendChild(a); ol.appendChild(li); return a; });
  document.body.appendChild(nav);
  // slim bar and strip under the pinned header (narrow screens)
  let bar, strip;
  if (hdr) {
    bar = document.createElement('span'); bar.className = 'read-bar'; bar.setAttribute('aria-hidden', 'true'); hdr.appendChild(bar);
    strip = document.createElement('div'); strip.className = 'read-strip'; strip.setAttribute('aria-hidden', 'true');
    strip.innerHTML = '<span class="sec"></span><span class="left"></span>'; hdr.appendChild(strip);
  }
  const fmt = (m, started) => !started ? Math.round(total / perMin) + ' min read' : m <= 0 ? 'You made it' : (m < 1 ? 'Under 1 min left' : Math.ceil(m) + ' min left');
  const tick = () => {
    const line = innerHeight * 0.4;
    let left = 0;
    blocks.forEach((b, i) => { const r = b.getBoundingClientRect(); if (r.bottom <= line) return; if (r.top >= line) left += counts[i]; else left += counts[i] * (r.bottom - line) / (r.height || 1); });
    const started = body.getBoundingClientRect().top < line;
    let cur = -1; heads.forEach((h, i) => { if (h.getBoundingClientRect().top <= line) cur = i; });
    const end = innerHeight + scrollY >= root.scrollHeight - 2;
    if (end) { cur = heads.length - 1; left = 0; }
    links.forEach((a, i) => { a.classList.toggle('on', i === cur); a.classList.toggle('done', i < cur); if (i === cur) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
    const txt = fmt(left / perMin, started);
    leftEl.textContent = txt;
    const on = links[cur];
    fill.style.height = on ? (on.offsetTop + 4) + 'px' : '0px';
    const hb = hdr ? hdr.getBoundingClientRect().bottom : 0;
    nav.style.top = Math.round(Math.max(hb + 28, art.getBoundingClientRect().top + 14)) + 'px';
    const foot = document.querySelector('.site-footer');
    if (foot) nav.classList.toggle('away', foot.getBoundingClientRect().top < nav.getBoundingClientRect().bottom + 24);
    if (bar) { const p = Math.min(1, Math.max(0, 1 - left / total)); bar.style.transform = 'scaleX(' + (started ? p : 0) + ')'; }
    if (strip) { strip.classList.toggle('show', started); strip.querySelector('.sec').textContent = cur >= 0 ? label(heads[cur]) : 'Intro'; strip.querySelector('.left').textContent = txt; }
  };
  let t = false;
  addEventListener('scroll', () => { if (!t) { t = true; requestAnimationFrame(() => { t = false; tick(); }); } }, { passive: true });
  addEventListener('resize', tick); addEventListener('load', tick); tick();
})();
/* Resume download name carries this month and year, e.g. Nick_Campuzano_Resume_Nov_2026.pdf */
(() => {
  const M = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const name = () => { const d = new Date(); return 'Nick_Campuzano_Resume_' + M[d.getMonth()] + '_' + d.getFullYear() + '.pdf'; };
  const set = a => { const n = name(); a.setAttribute('download', n); a.title = 'Downloads as ' + n; };
  document.querySelectorAll('a[href$="Nick_Campuzano_Resume.pdf"]').forEach(a => {
    set(a);
    a.addEventListener('pointerdown', () => set(a));
    a.addEventListener('click', () => set(a));
  });
  document.querySelectorAll('[data-resume-name]').forEach(el => { el.textContent = name(); });
})();

/* Section dots grow as the cursor gets close, like the Mac dock */
(() => {
  const nav = document.querySelector('.spy');
  if (!nav || !matchMedia('(hover: hover)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const dots = [...nav.querySelectorAll('.dot')];
  const links = [...nav.querySelectorAll('a')];
  const MAX = 2.5, REACH = 80;
  let raf = 0, px = 0, py = 0, near = false;
  const reset = () => { dots.forEach(d => d.style.setProperty('--m', 1)); links.forEach(a => a.classList.remove('near')); };
  const apply = () => {
    raf = 0;
    const box = nav.getBoundingClientRect();
    if (px < box.left - 40 || px > box.right + 60 || py < box.top - REACH || py > box.bottom + REACH) { if (near) { near = false; reset(); } return; }
    near = true;
    let best = null, bestD = Infinity;
    dots.forEach((d, i) => {
      const r = d.getBoundingClientRect();
      const cy = r.top + r.height / 2;
      const dist = Math.abs(py - cy);
      const t = Math.max(0, 1 - dist / REACH);
      d.style.setProperty('--m', (1 + (MAX - 1) * t * t * (3 - 2 * t)).toFixed(3));
      if (dist < bestD) { bestD = dist; best = i; }
    });
    links.forEach((a, i) => a.classList.toggle('near', i === best && bestD < 18));
  };
  addEventListener('mousemove', e => { px = e.clientX; py = e.clientY; if (!raf) raf = requestAnimationFrame(apply); }, { passive: true });
  document.addEventListener('mouseleave', () => { near = false; reset(); });
})();

/* Enlarge button on chart figures: opens a copy of the figure full screen */
(() => {
  const btns = document.querySelectorAll(".fig .enlarge");
  if (!btns.length) return;
  const touch = window.matchMedia("(hover: none)").matches;
  btns.forEach((b) => { const t = b.querySelector(".hint-txt"); if (t) t.textContent = touch ? "Tap to enlarge" : "Click to enlarge"; });
  const lb = document.createElement("dialog");
  lb.className = "lightbox";
  lb.innerHTML = '<div class="lb-scroll"></div><div class="lb-bar"><span class="lb-tip"></span><div class="lb-btns"><button class="lb-btn lb-zoom" type="button">Zoom in</button><button class="lb-btn lb-close" type="button" aria-label="Close">✕</button></div></div>';
  document.body.appendChild(lb);
  const scroller = lb.querySelector(".lb-scroll"), zoomBtn = lb.querySelector(".lb-zoom"), tip = lb.querySelector(".lb-tip");
  let opener = null, card = null;
  const fit = () => {
    if (!card) return;
    const maxW = scroller.clientWidth - 24, maxH = window.innerHeight - 110;
    let w = Math.min(maxW, 1100);
    for (let i = 0; i < 3; i++) {
      card.style.setProperty("--lb-fit", w + "px");
      const h = card.offsetHeight;
      if (h <= maxH) break;
      w = Math.max(280, Math.floor(w * maxH / h));
    }
  };
  function setBig(on) {
    lb.classList.toggle("big", on);
    zoomBtn.textContent = on ? "Fit to screen" : "Zoom in";
    tip.textContent = on ? (touch ? "Drag to look around" : "Scroll to look around") : (touch ? "Tap the chart to zoom in" : "Click the chart to zoom in");
  }
  function hide() { if (lb.close) lb.close(); else { lb.removeAttribute("open"); onClose(); } }
  function onClose() { document.documentElement.style.overflow = ""; scroller.innerHTML = ""; card = null; if (opener) opener.focus(); }
  lb.addEventListener("close", onClose);
  function open(fig, from) {
    opener = from;
    card = fig.cloneNode(true);
    card.classList.add("lb-card");
    card.removeAttribute("id");
    card.querySelectorAll("[id]").forEach((n) => { if (n.tagName.toLowerCase() !== "marker") n.removeAttribute("id"); });
    scroller.innerHTML = ""; scroller.appendChild(card);
    lb.style.setProperty("--lb-w", (parseInt(fig.dataset.fullWidth || "1200", 10)) + "px");
    const t = fig.querySelector(".fig-title");
    lb.setAttribute("aria-label", (t ? t.textContent : "Chart") + ", full screen");
    setBig(false);
    if (lb.showModal) lb.showModal(); else lb.setAttribute("open", "");
    document.documentElement.style.overflow = "hidden";
    fit();
    card.addEventListener("click", (e) => {
      e.stopPropagation();
      if (lb.classList.contains("big")) { setBig(false); fit(); return; }
      const r = card.getBoundingClientRect();
      const fx = (e.clientX - r.left) / r.width, fy = (e.clientY - r.top) / r.height;
      setBig(true);
      requestAnimationFrame(() => {
        scroller.scrollLeft = fx * card.offsetWidth - scroller.clientWidth / 2;
        scroller.scrollTop = fy * card.offsetHeight - scroller.clientHeight / 2;
      });
    });
  }
  btns.forEach((b) => b.addEventListener("click", () => open(b.closest(".fig"), b)));
  document.querySelectorAll(".fig .zoomable").forEach((z) => z.addEventListener("click", () => { const f = z.closest(".fig"); open(f, f.querySelector(".enlarge")); }));
  lb.querySelector(".lb-close").addEventListener("click", hide);
  zoomBtn.addEventListener("click", () => { const on = !lb.classList.contains("big"); setBig(on); if (!on) fit(); });
  scroller.addEventListener("click", (e) => { if (e.target === scroller) hide(); });
  window.addEventListener("resize", () => { if (lb.open && !lb.classList.contains("big")) fit(); });
})();
