import express from 'express';
import http from 'http';
import path from 'path';
import { WebSocketServer } from 'ws';
import { AgentLoop } from '../agent/loop.js';

let server: http.Server | null = null;
let wss: WebSocketServer | null = null;

function broadcast(obj: any) {
  if (!wss) return;
  const data = JSON.stringify(obj);
  for (const client of wss.clients) {
    if (client.readyState === 1) { // OPEN
      client.send(data);
    }
  }
}

// Hook into AgentLoop to broadcast updates globally
const originalProcess = AgentLoop.process.bind(AgentLoop);
AgentLoop.process = async (query: string, store: any, options?: any) => {
    const originalAddMessage = store.addMessage.bind(store);
    store.addMessage = (role: string, content: string) => {
        originalAddMessage(role, content);
        broadcast({ type: 'update', state: { message: content, role } });
    };

    const originalAddLog = store.addLog.bind(store);
    store.addLog = (type: string, content: string) => {
        originalAddLog(type, content);
        broadcast({ type: 'update', state: { log: content, logType: type } });
    };

    const originalSetStatus = store.setStatus.bind(store);
    store.setStatus = (status: string) => {
        originalSetStatus(status);
        broadcast({ type: 'update', state: { status } });
    };

    return originalProcess(query, store, options);
};

export const WebsiteController = {
  start() {
    if (server) return;
    
    const PORT = 3000;
    const app = express();
    server = http.createServer(app);
    const webDir = path.join(process.cwd(), 'web');
    app.use(express.static(webDir));

    wss = new WebSocketServer({ server, path: '/ws' });
    wss.on('connection', (ws) => {
      ws.send(JSON.stringify({ 
          type: 'update', 
          state: { message: 'CONNECTED TO LIVE MONITOR', role: 'system' } 
      }));
    });

    server.listen(PORT, '0.0.0.0', () => {
      console.log(`\n[WEBSITE] Live Monitor: http://localhost:${PORT}`);
    });
  },

  stop() {
    if (server) {
      server.close();
      server = null;
      wss = null;
    }
  }
};
