import express from 'express';
import http from 'http';
import path from 'path';
import { WebSocketServer } from 'ws';
import { AgentLoop } from '../agent/loop';
import AuthStore from '../auth/store';

const PORT = process.env.KIHICODE_WEB_PORT ? parseInt(process.env.KIHICODE_WEB_PORT) : 3000;

const app = express();
const server = http.createServer(app);

const webDir = path.join(process.cwd(), 'web');
app.use(express.static(webDir));

const wss = new WebSocketServer({ server, path: '/ws' });

const auth = new AuthStore();
const agent = new AgentLoop();

function broadcast(obj: any) {
  const data = JSON.stringify(obj);
  for (const client of wss.clients) {
    if (client.readyState === client.OPEN) {
      client.send(data);
    }
  }
}

wss.on('connection', async (ws) => {
  console.log('client connected');
  const providers = (await auth.listProviders()) || [];
  ws.send(JSON.stringify({ type: 'welcome', providers }));

  ws.on('message', async (msg) => {
    let data: any;
    try {
      data = JSON.parse(msg.toString());
    } catch (err) {
      ws.send(JSON.stringify({ type: 'error', message: 'invalid JSON' }));
      return;
    }

    if (data.type === 'input') {
      const text = data.text || '';
      try {
        agent.run(text, (state: any) => {
          broadcast({ type: 'update', state });
        });
      } catch (err: any) {
        broadcast({ type: 'update', state: { status: 'message', content: `Run error: ${err?.message || err}` } });
      }
    } else if (data.type === 'login') {
      const provider = data.provider;
      const apiKey = data.apiKey;
      if (!provider || !apiKey) {
        ws.send(JSON.stringify({ type: 'error', message: 'provider and apiKey required' }));
        return;
      }
      try {
        await auth.saveCredentials(provider, apiKey);
        try {
          agent.setApiKey(apiKey);
        } catch (e) {
          // ignore
        }
        ws.send(JSON.stringify({ type: 'login_ack', provider }));
      } catch (err) {
        ws.send(JSON.stringify({ type: 'error', message: 'failed to save credentials' }));
      }
    } else if (data.type === 'approval') {
      const { id, approved, args } = data;
      const ok = agent.respondToApproval(id, approved, args);
      ws.send(JSON.stringify({ type: 'approval_ack', id, ok }));
    } else if (data.type === 'list_providers') {
      const providers = await auth.listProviders();
      ws.send(JSON.stringify({ type: 'providers', providers }));
    } else {
      ws.send(JSON.stringify({ type: 'error', message: 'unknown type' }));
    }
  });

  ws.on('close', () => {
    console.log('client disconnected');
  });
});

server.listen(PORT, () => {
  console.log(`Kihicode web server listening on http://localhost:${PORT}`);
});
