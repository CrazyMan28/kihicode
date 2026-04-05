export default async function validateAnthropic(key: string): Promise<boolean> {
  try {
    const res = await fetch('https://api.anthropic.com/v1/models', {
      method: 'GET',
      headers: { Authorization: `Bearer ${key}` },
    });
    return res.ok;
  } catch (err) {
    return false;
  }
}
