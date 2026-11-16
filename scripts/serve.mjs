import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const port = Number(process.env.PORT ?? 4173);
const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.md': 'text/plain', '.svg': 'image/svg+xml' };
const server = http.createServer(async (req, res) => {
  try {
    if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405); res.end(); return; }
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const parts = pathname.split('/').filter(Boolean);
    if (parts.some(part => part.startsWith('.') || part === 'local' || part === 'node_modules' || part.includes('\\')) || parts.includes('..')) { res.writeHead(404); res.end('Not found'); return; }
    const file = path.resolve(root, '.' + pathname + (pathname.endsWith('/') ? 'index.html' : ''));
    if (!file.startsWith(root)) { res.writeHead(404); res.end('Not found'); return; }
    const stat = await fs.stat(file);
    if (!stat.isFile()) { res.writeHead(404); res.end('Not found'); return; }
    const content = await fs.readFile(file);
    res.writeHead(200, { 'Content-Type': (mime[path.extname(file)] ?? 'application/octet-stream') + '; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
    res.end(req.method === 'HEAD' ? undefined : content);
  } catch { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); res.end('Not found'); }
});
server.on('error', error => { console.error(error.code === 'EADDRINUSE' ? 'Port occupied. Set PORT to another value.' : error.message); process.exitCode = 1; });
server.listen(port, '127.0.0.1', () => console.log('PaperLens local preview: http://127.0.0.1:' + port));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(() => process.exit(0)));
