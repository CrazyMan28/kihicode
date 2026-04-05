export default async function validateHF(key) {
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
//# sourceMappingURL=huggingface.js.map