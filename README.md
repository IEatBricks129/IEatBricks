IEatBricks — Personal site

This repository is a small static site built with plain HTML/CSS/JavaScript.

Quick start

1. Serve locally:

```fish
python3 -m http.server 8000
```

2. Open http://localhost:8000

What I changed / improvements added (automated edits in repo)
- Persistent animated background layers to avoid reset during client-side navigation
- PJAX-style internal navigation with smooth transitions
- Theme toggle with circular reveal animation
- Blog loader that reads `pages/posts/index.json` and renders posts with tag filtering
- Accessibility and path-resilience fixes for partials and assets

Next steps / suggestions
- Run a browser QA pass and check for pages with direct body background rules
- Add tests or a CI step to validate HTML/CSS
- Add sitemap and SEO meta for production

License: CC BY-ND
