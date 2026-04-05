export class SubagentManager {
  private jobs: Map<string, any> = new Map();

  start(fn: () => Promise<any>) {
    const id = Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
    const job: any = { id, status: 'running', result: null, error: null };
    this.jobs.set(id, job);
    (async () => {
      try {
        const res = await fn();
        job.result = res;
        job.status = 'completed';
      } catch (err: any) {
        job.error = err?.message ?? String(err);
        job.status = 'failed';
      }
    })();
    return id;
  }

  list() {
    return Array.from(this.jobs.values());
  }

  status(id: string) {
    const j = this.jobs.get(id);
    return j ? j.status : 'unknown';
  }
}
export const subagentManager = new SubagentManager();
