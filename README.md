# nickgcamp.com

Personal site for Nick Campuzano, served at nickgcamp.com: a living resume, projects, a blog and three small interactive demos.

Plain HTML, CSS and JavaScript. No build step. GitHub Pages serves the files as they are.

```
index.html              Home: the living resume (its own inline styles and scripts)
projects.html           Project write-ups
vikings.html            Vikings QBR data graphic
resume.html             Web resume (PDF in assets/)
deep-dives/             Blog: list page and posts
demos/earthquake.html   Fault line risk map (illustrative data)
demos/forecast.html     Revenue forecast planner (illustrative data)
demos/quality.html      Quality dashboard prototype (illustrative data)
404.html                Page not found
assets/                 Shared stylesheet and script, images, resume PDF
sitemap.xml, robots.txt For search engines
```

Charts use one palette: black, white, light and dark gray, light and dark purple, always through the CSS tokens so dark mode works. Bump the `?v=` number on site.css and site.js links after changing them.

## Run it locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Custom domain

1. Add a file named `CNAME` at the repo root containing just the domain, e.g. `example.com`.
2. At the domain registrar, add DNS records:
   - `A` records for the bare domain (`@`): `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - `CNAME` record for `www`: `nickgcamp.github.io`
3. In the repo, Settings → Pages: enter the domain, wait for the DNS check, then tick "Enforce HTTPS".
