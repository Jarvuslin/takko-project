import http from 'node:http';
import { createHash } from 'node:crypto';
const server = http.createServer(async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'POST' || req.url !== '/probe') { res.writeHead(404).end('{}'); return; }
  try {
    let body = '';
    for await (const chunk of req) { body += chunk; if (body.length > 1000000) throw Error('Too large'); }
    const { base64 } = JSON.parse(body);
    if (typeof base64 !== 'string' || Buffer.from(base64, 'base64').toString('base64') !== base64) throw Error('Invalid payload');
    const hash = createHash('sha256').update(base64).digest('hex');
    res.end(JSON.stringify({ chunks: base64.match(/.{1,256}/g), hash, bytes: Buffer.from(base64, 'base64').length }));
    console.log(JSON.stringify({ receivedBytes: Buffer.from(base64, 'base64').length, hash }));
    server.close();
  } catch { res.writeHead(400).end('{"error":"Invalid fixture"}'); }
});
server.listen(4344, '127.0.0.1', () => console.log('Owned one-request probe on 4344'));
setTimeout(() => server.close(), 180000).unref();
