(function () {
    const ws = new WebSocket(`ws://${location.host}/ws`);
    const messages = document.getElementById('messages');
    const terminal = document.getElementById('terminal');
    const statusLine = document.getElementById('currentStatus');

    function addMessage(role, content) {
        const div = document.createElement('div');
        div.className = 'flex space-x-4 animate-in fade-in slide-in-from-bottom-2 duration-500';
        
        const isAgent = role === 'agent' || role === 'system';
        const color = isAgent ? 'cyan' : 'blue';
        const icon = isAgent ? 'bot' : 'user';

        div.innerHTML = `
            <div class="w-8 h-8 rounded-lg bg-${color}-500/10 flex items-center justify-center shrink-0 border border-${color}-500/20">
                <i data-lucide="${icon}" class="text-${color}-500 w-4 h-4"></i>
            </div>
            <div class="space-y-1">
                <div class="text-[10px] font-bold text-${color}-600 tracking-widest uppercase">${role}</div>
                <div class="text-[13px] leading-relaxed text-gray-400 font-medium">${content}</div>
            </div>
        `;
        messages.appendChild(div);
        messages.scrollTop = messages.scrollHeight;
        lucide.createIcons();
    }

    function addLog(type, content) {
        const div = document.createElement('div');
        const colors = {
            info: 'text-blue-500',
            error: 'text-red-500',
            command: 'text-cyan-400 font-bold',
            stdout: 'text-gray-400'
        };
        div.className = `${colors[type] || 'text-gray-500'} tracking-tight leading-4`;
        div.textContent = `> ${content}`;
        terminal.appendChild(div);
        terminal.scrollTop = terminal.scrollHeight;
    }

    ws.onmessage = (ev) => {
        try {
            const data = JSON.parse(ev.data);
            if (data.type === 'update') {
                const { state } = data;
                if (state.message) addMessage(state.role || 'agent', state.message);
                if (state.log) addLog(state.logType || 'stdout', state.log);
                if (state.status) {
                    statusLine.textContent = state.status;
                }
            }
        } catch (err) {}
    };

    ws.onclose = () => {
        statusLine.textContent = 'OFFLINE';
        statusLine.parentElement.classList.replace('bg-cyan-500/5', 'bg-red-500/5');
        addMessage('system', 'Disconnected from session monitor.');
    };
})();
