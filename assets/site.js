/* Back link: go back if the visitor came from another page, otherwise go home. */
document.addEventListener("click", (e) => {
  const a = e.target.closest && e.target.closest("[data-back]");
  if (!a) return;
  if (document.referrer && new URL(document.referrer).origin === location.origin && history.length > 1) {
    e.preventDefault(); history.back();
  }
});

/* Pinned header height (for scroll offsets) and its shadow once the page scrolls */
(() => {
  const hdr = document.querySelector('.site-header');
  if (!hdr) return;
  const root = document.documentElement;
  const size = () => root.style.setProperty('--hdr-h', (hdr.offsetHeight + 14) + 'px');
  let ticking = false;
  const stuck = () => { ticking = false; hdr.classList.toggle('stuck', window.scrollY > 4 && hdr.getBoundingClientRect().top <= 0.5); };
  size(); stuck();
  window.addEventListener('resize', size);
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(stuck); } }, { passive: true });
})();
/* Blog post reading tracker: sections light up as you read, time left counts down */
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
