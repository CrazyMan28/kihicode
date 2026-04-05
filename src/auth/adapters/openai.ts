export default async function validateOpenAI(key: string): Promise<boolean> {
  try {
    const res = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: { Authorization: `Bearer ${key}` },
    });
    return res.ok;
  } catch (err) {
    return false;
  }
}
