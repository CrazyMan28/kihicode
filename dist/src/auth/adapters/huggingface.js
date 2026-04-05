"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = validateHF;
async function validateHF(key) {
    try {
        const res = await fetch('https://api-inference.huggingface.co/models', {
            method: 'GET',
            headers: { Authorization: `Bearer ${key}` },
        });
        return res.ok;
    }
    catch (err) {
        return false;
    }
}
