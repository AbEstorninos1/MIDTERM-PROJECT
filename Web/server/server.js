

const http = require('http');
const { WebSocketServer, WebSocket } = require('ws');

const PORT = Number(process.env.PORT || 3000);
const NOTIFY_KEY = process.env.NOTIFY_KEY || 'change-this-key';
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

const LOCAL_ORIGIN = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

function originAllowed(origin) {
  if (!origin) return false;

  return LOCAL_ORIGIN.test(origin) || ALLOWED_ORIGINS.includes('*') || ALLOWED_ORIGINS.includes(origin);
}

function setCors(req, res) {
  const origin = req.headers.origin;

  if (!origin || !originAllowed(origin)) return;

  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Notify-Key');
}

function sendJson(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

function broadcast(message) {
  const text = JSON.stringify(message);

  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) client.send(text);
  });
}

const server = http.createServer((req, res) => {
  setCors(req, res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'GET' && req.url === '/health') {
    sendJson(res, 200, { ok: true, clients: wss.clients.size });
    return;
  }

  if (req.method === 'POST' && req.url === '/notify') {
    if (req.headers['x-notify-key'] !== NOTIFY_KEY) {
      sendJson(res, 401, { ok: false, message: 'Invalid key' });
      return;
    }

    let body = '';

    req.on('data', chunk => {
      body += chunk;

      if (body.length > 10000) req.destroy();
    });

    req.on('end', () => {
      try {
        const { event, data } = JSON.parse(body);

        if (typeof event !== 'string' || !event) throw new Error('Missing event');

        broadcast({ event, data: data || {}, time: new Date().toISOString() });
        sendJson(res, 200, { ok: true });
      } catch (error) {
        sendJson(res, 400, { ok: false, message: 'Invalid message' });
      }
    });

    return;
  }

  sendJson(res, 404, { ok: false, message: 'Not found' });
});

const wss = new WebSocketServer({
  server,verifyClient: ({ origin }, done) => {
    if (originAllowed(origin)) done(true);
    else done(false, 403, 'Origin not allowed');
  }
});

wss.on('connection', socket => {
  socket.isAlive = true;
  socket.on('pong', () => { socket.isAlive = true; });
  socket.on('error', () => {});

  socket.send(JSON.stringify({ event: 'connected', data: {}, time: new Date().toISOString() }));
});


setInterval(() => {
  wss.clients.forEach(socket => {
    if (!socket.isAlive) {
      socket.terminate();
      return;
    }

    socket.isAlive = false;
    socket.ping();
  });
}, 30000);

server.listen(PORT, () => {
  console.log(`Realtime server running on port ${PORT}`);
});
