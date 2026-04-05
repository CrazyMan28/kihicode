import * as fs from "fs";
import * as path from "path";

export type Finding = { file: string; line: number; type: string; excerpt: string };

const SECRET_PATTERNS: Array<[string, RegExp]> = [
  ["AWS Access Key", /AKIA[0-9A-Z]{16}/g],
  ["Private key", /-----BEGIN [A-Z ]*PRIVATE KEY-----/g],
  [
    "Generic secret assignment",
    /\b(api[_-]?key|secret|password|token)\b\s*[:=]\s*["']?([A-Za-z0-9\-\._]{8,})["']?/gi,
  ],
];

function isTextFile(filename: string) {
  const lower = filename.toLowerCase();
  return !lower.endsWith(".png") && !lower.endsWith(".jpg") && !lower.endsWith(".jpeg") && !lower.endsWith(".gif") && !lower.endsWith(".zip") && !lower.endsWith(".tar") && !lower.endsWith(".gz");
}

export function scanDir(root = "."): Finding[] {
  const findings: Finding[] = [];
  function walk(dir: string) {
    let entries: string[] = [];
    try {
      entries = fs.readdirSync(dir);
    } catch (e) {
      return;
    }
    for (const name of entries) {
      const full = path.join(dir, name);
      let stat: fs.Stats;
      try {
        stat = fs.statSync(full);
      } catch (e) {
        continue;
      }
      if (stat.isDirectory()) {
        walk(full);
        continue;
      }
      if (!stat.isFile()) continue;
      if (stat.size > 2 * 1024 * 1024) continue; // skip large files
      if (!isTextFile(name)) continue;
      let txt: string;
      try {
        txt = fs.readFileSync(full, { encoding: "utf8" });
      } catch (e) {
        continue;
      }
      for (const [label, patt] of SECRET_PATTERNS) {
        let m: RegExpExecArray | null;
        patt.lastIndex = 0;
        while ((m = patt.exec(txt)) !== null) {
          const idx = m.index;
          const lineNo = txt.substring(0, idx).split("\n").length;
          const lines = txt.split(/\r?\n/);
          const excerpt = (lines[lineNo - 1] || m[0]).slice(0, 200);
          findings.push({ file: full, line: lineNo, type: label, excerpt });
        }
      }
      if ([".env", ".env.local", ".env.development"].includes(name.toLowerCase())) {
        const lines = txt.split(/\r?\n/);
        for (let i = 0; i < lines.length; i++) {
          if (/(password|secret|api[_-]?key|token|passwd)/i.test(lines[i])) {
            findings.push({ file: full, line: i + 1, type: ".env secret", excerpt: lines[i].trim() });
          }
        }
      }
      try {
        const mode = stat.mode;
        if ((mode & 0o004) !== 0) {
          findings.push({ file: full, line: 0, type: "insecure-perms", excerpt: "world-readable" });
        }
      } catch (e) {
        // ignore
      }
    }
  }
  walk(root);
  return findings;
}

export function applyFixes(findings: Finding[]) {
  const results: Array<{ file: string; action: string }> = [];
  const processed = new Set<string>();
  const secretPattern = /((?:\b(?:api[_-]?key|secret|password|token|passwd)\b\s*[:=]\s*)(["']?))([A-Za-z0-9\-\._]{8,})(["']?)/gi;

  for (const f of findings) {
    const full = f.file;
    if (!fs.existsSync(full)) continue;
    try {
      if (f.type === "insecure-perms") {
        try {
          fs.chmodSync(full, 0o600);
          results.push({ file: full, action: "chmod 600" });
        } catch (e: any) {
          results.push({ file: full, action: `error chmod: ${e?.message || e}` });
        }
      } else if (f.type === ".env secret") {
        if (!processed.has(full)) {
          const bkp = `${full}.bak`;
          fs.copyFileSync(full, bkp);
          processed.add(full);
        }
        const text = fs.readFileSync(full, { encoding: "utf8" });
        const lines = text.split(/\r?\n/);
        let changed = false;
        for (let i = 0; i < lines.length; i++) {
          if (/^(.*(password|secret|api[_-]?key|token|passwd).*)=/i.test(lines[i])) {
            const k = lines[i].split("=", 1)[0];
            lines[i] = `${k}=REDACTED`;
            changed = true;
          }
        }
        if (changed) {
          fs.writeFileSync(full, lines.join("\n"), { encoding: "utf8" });
          results.push({ file: full, action: "redacted .env secrets (backup created)" });
        }
      } else {
        if (!processed.has(full)) {
          const bkp = `${full}.bak`;
          fs.copyFileSync(full, bkp);
          processed.add(full);
        }
        const text = fs.readFileSync(full, { encoding: "utf8" });
        const newText = text.replace(secretPattern, (_m, p1, _p2, _val, _q) => {
          // keep prefix, replace value with REDACTED and preserve quotes
          const quote = _m.endsWith('"') || _m.endsWith("'") ? _m.slice(-1) : '';
          return p1 + (quote || '') + 'REDACTED' + (quote || '');
        });
        if (newText !== text) {
          fs.writeFileSync(full, newText, { encoding: "utf8" });
          const matches = (text.match(secretPattern) || []).length;
          results.push({ file: full, action: `redacted ${matches} secret(s) (backup created)` });
        }
      }
    } catch (e: any) {
      results.push({ file: full, action: `error: ${e?.message || e}` });
    }
  }
  return results;
}
