"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subagentManager = exports.SubagentManager = void 0;
class SubagentManager {
    constructor() {
        this.jobs = new Map();
    }
    start(fn) {
        const id = Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
        const job = { id, status: 'running', result: null, error: null };
        this.jobs.set(id, job);
        (async () => {
            try {
                const res = await fn();
                job.result = res;
                job.status = 'completed';
            }
            catch (err) {
                job.error = err?.message ?? String(err);
                job.status = 'failed';
            }
        })();
        return id;
    }
    list() {
        return Array.from(this.jobs.values());
    }
    status(id) {
        const j = this.jobs.get(id);
        return j ? j.status : 'unknown';
    }
}
exports.SubagentManager = SubagentManager;
exports.subagentManager = new SubagentManager();
