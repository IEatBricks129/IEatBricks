#!/usr/bin/env python3
"""
Generate a simple sitemap.xml for the static site.
Run from the repo root: python3 scripts/generate_sitemap.py
"""
import os
from datetime import datetime

def find_html(root='.'):
    for dirpath, dirs, files in os.walk(root):
        for f in files:
            if f.endswith('.html'):
                yield os.path.join(dirpath, f)

base_url = 'https://example.com/'
urls = []
for path in find_html('.'):
    rel = os.path.relpath(path, '.')
    if rel.startswith('node_modules'):
        continue
    urls.append((base_url + rel.replace('\\\\', '/'), datetime.utcnow().date().isoformat()))

sitemap = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
for u, d in urls:
    sitemap.append('  <url>')
    sitemap.append(f'    <loc>{u}</loc>')
    sitemap.append(f'    <lastmod>{d}</lastmod>')
    sitemap.append('  </url>')
sitemap.append('</urlset>')

with open('sitemap.xml', 'w') as f:
    f.write('\n'.join(sitemap))
print('sitemap.xml written with', len(urls), 'urls')
