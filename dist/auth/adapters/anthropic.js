"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = validateAnthropic;
async function validateAnthropic(key) {
    try {
        const res = await fetch('https://api.anthropic.com/v1/models', {
            method: 'GET',
            headers: { Authorization: `Bearer ${key}` },
        });
        return res.ok;
    }
    catch (err) {
        return false;
    }
}
