# nickgcamp.com

Personal site for Nick Campuzano, served at nickgcamp.com: about, resume, projects and two small interactive demos.

Plain HTML, CSS and JavaScript. No build step. GitHub Pages serves the files as they are.

```
index.html            Home and about
projects.html         Project write-ups
resume.html           Web resume (PDF in assets/)
demos/forecast.html   Revenue forecast planner (made-up data)
demos/quality.html    Quality dashboard prototype (generated data)
assets/               Stylesheet, images, resume PDF
```

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
