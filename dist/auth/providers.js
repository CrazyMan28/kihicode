import openaiValidate from './adapters/openai.js';
import anthropicValidate from './adapters/anthropic.js';
import hfValidate from './adapters/huggingface.js';
export async function validateProviderKey(provider, apiKey) {
    if (!apiKey || apiKey.length < 8)
        return false;
    try {
        if (provider === 'openai')
            return await openaiValidate(apiKey);
        if (provider === 'anthropic')
            return await anthropicValidate(apiKey);
        if (provider === 'huggingface')
            return await hfValidate(apiKey);
    }
    catch (err) {
        return false;
    }
    // fallback heuristic
    return apiKey.length > 20;
}
export default { validateProviderKey };
//# sourceMappingURL=providers.js.map