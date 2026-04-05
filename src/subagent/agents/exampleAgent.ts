export async function run(args: any) {
  // Simulate async work performed by a subagent
  await new Promise((r) => setTimeout(r, 3000));
  return {
    ok: true,
    handled: args ?? null,
    message: `Example agent completed with args=${JSON.stringify(args)}`,
  };
}
