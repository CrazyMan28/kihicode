(function () {
  const ws = new WebSocket(`ws://${location.host}/ws`);
  const messages = document.getElementById('messages');
  const input = document.getElementById('input');
  const send = document.getElementById('send');
  const login = document.getElementById('login');

  function append(msg) {
    const el = document.createElement('div');
    el.textContent = msg;
    messages.appendChild(el);
    messages.scrollTop = messages.scrollHeight;
  }

  ws.onopen = () => append('Connected to server.');
  ws.onmessage = (ev) => {
    try {
      const data = JSON.parse(ev.data);
      if (data.type === 'welcome') {
        append('Welcome. Providers: ' + (data.providers || []).join(', '));
      } else if (data.type === 'update') {
        append('[' + data.state.status + '] ' + (data.state.content || JSON.stringify(data.state)));
      } else if (data.type === 'login_ack') {
        append('Login saved for provider: ' + data.provider);
      } else if (data.type === 'error') {
        append('Error: ' + data.message);
      } else {
        append('Msg: ' + JSON.stringify(data));
      }
    } catch (err) {
      append('Invalid message: ' + ev.data);
    }
  };

  send.addEventListener('click', () => {
    const text = input.value.trim();
    if (!text) return;
    ws.send(JSON.stringify({ type: 'input', text }));
    append('You: ' + text);
    input.value = '';
  });

  input.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') send.click();
  });

  login.addEventListener('click', () => {
    const provider = prompt('Provider name (e.g., anthropic, openai):', 'anthropic') || 'anthropic';
    const key = prompt('API key:');
    if (!key) return;
    ws.send(JSON.stringify({ type: 'login', provider, apiKey: key }));
    append('Sent login for ' + provider);
  });
})();
