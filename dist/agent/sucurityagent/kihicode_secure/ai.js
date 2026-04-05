"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_API_URL = exports.DEFAULT_MODEL = void 0;
exports.callMistral = callMistral;
exports.DEFAULT_MODEL = "mistral-1";
exports.DEFAULT_API_URL = "https://api.mistral.ai/v1";
function _isLocalUrl(url) {
    if (!url)
        return false;
    const u = url.toLowerCase();
    return (u.includes("localhost") ||
        u.startsWith("http://127.") ||
        u.startsWith("http://0.0.0.0") ||
        u.startsWith("http://[::1]") ||
        u.startsWith("https://127."));
}
function _extractTextFromResponse(data) {
    if (data && typeof data === "object") {
        const outputs = data.outputs || data.choices;
        if (Array.isArray(outputs) && outputs.length > 0) {
            const first = outputs[0];
            if (first && typeof first === "object") {
                for (const key of ["content", "text", "output", "message"]) {
                    if (key in first && typeof first[key] === "string")
                        return first[key];
                }
                for (const val of Object.values(first)) {
                    if (typeof val === "string")
                        return val;
                }
                return JSON.stringify(first, null, 2);
            }
            return String(first);
        }
        for (const key of ["result", "output", "text", "message"]) {
            if (key in data && typeof data[key] === "string")
                return data[key];
        }
        if (Array.isArray(data.choices) && data.choices.length > 0) {
            const c = data.choices[0];
            if (c && typeof c === "object") {
                for (const k of ["text", "message", "content"]) {
                    if (k in c && typeof c[k] === "string")
                        return c[k];
                }
            }
        }
        return JSON.stringify(data, null, 2);
    }
    return String(data);
}
async function callMistral(prompt, model = exports.DEFAULT_MODEL, apiKey, apiUrl, timeout = 30000) {
    apiKey = apiKey || process.env.MISTRAL_API_KEY;
    if (!apiKey)
        throw new Error("No Mistral API key provided");
    apiUrl = apiUrl || process.env.MISTRAL_API_URL || exports.DEFAULT_API_URL;
    if (_isLocalUrl(apiUrl))
        throw new Error("Local Mistral API URLs are not allowed for remote AI calls");
    const headers = { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" };
    const base = apiUrl.replace(/\/+$/, "");
    const endpoints = [
        `${base}/models/${model}/generate`,
        `${base}/v1/models/${model}/generate`,
        `${base}/v1/models/${model}:generate`,
        `${base}/generate`,
        `${base}/v1/generate`,
        `${base}/v1/engines/${model}/completions`,
        `${base}/completions`,
    ];
    const payloadVariants = [
        { input: prompt, max_new_tokens: 512, temperature: 0.2 },
        { prompt: prompt, max_tokens: 512, temperature: 0.2 },
        { text: prompt, max_new_tokens: 512 },
    ];
    let lastErr = null;
    for (const ep of endpoints) {
        for (const payload of payloadVariants) {
            try {
                const controller = new AbortController();
                const id = setTimeout(() => controller.abort(), timeout);
                const resp = await fetch(ep, { method: "POST", headers, body: JSON.stringify(payload), signal: controller.signal });
                clearTimeout(id);
                if (resp.status === 404) {
                    lastErr = `404 at ${ep}`;
                    continue;
                }
                if (!resp.ok) {
                    if (resp.status === 404 || resp.status === 405) {
                        lastErr = `HTTP ${resp.status} at ${ep}`;
                        continue;
                    }
                    const txt = await resp.text();
                    return `Error calling Mistral API: ${resp.status} ${txt}`;
                }
                const data = await resp.json();
                return _extractTextFromResponse(data);
            }
            catch (e) {
                lastErr = e?.message || String(e);
                continue;
            }
        }
    }
    return `Error calling Mistral API: tried endpoints; last error: ${lastErr}`;
}
