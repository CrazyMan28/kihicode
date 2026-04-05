import inquirer from "inquirer";
import { scanDir, applyFixes, Finding } from "./scanner";
import { setApiKey, getApiKey, getApiUrl } from "./config";
import { callMistral } from "./ai";

function showFindings(findings: Finding[]) {
  if (!findings || findings.length === 0) {
    console.log("No issues found.");
    return;
  }
  console.table(findings.map(f => ({ file: f.file, line: f.line, type: f.type, excerpt: f.excerpt?.slice(0,120) })));
}

export async function interactiveMenu() {
  console.log("kihicode-secure — interactive menu");
  let findings: Finding[] = [];
  while (true) {
    const { choice } = await inquirer.prompt([{ type: "list", name: "choice", message: "Main Menu", choices: [
      { name: "Set Mistral API key", value: "set" },
      { name: "Scan current directory", value: "scan" },
      { name: "Show last findings", value: "show" },
      { name: "Apply fixes for last findings (auto)", value: "apply" },
      { name: "Generate plan with AI (mistral)", value: "ai" },
      { name: "Exit", value: "exit" }
    ] }]);

    if (choice === "set") {
      const { key } = await inquirer.prompt([{ type: "password", name: "key", message: "Mistral API key (saved to ~/.kihicode/config.json)" }]);
      if (key) {
        setApiKey(key.trim());
        console.log("Saved Mistral API key (file permissions restricted)");
      }
    } else if (choice === "scan") {
      console.log("Scanning current directory for common issues...");
      findings = scanDir(".");
      showFindings(findings);
    } else if (choice === "show") {
      showFindings(findings);
    } else if (choice === "apply") {
      if (!findings || findings.length === 0) {
        console.log("No findings to fix. Run a scan first.");
        continue;
      }
      const { ok } = await inquirer.prompt([{ type: "confirm", name: "ok", message: "Apply automatic fixes where safe? This will create backups for changed files", default: false }]);
      if (ok) {
        const res = applyFixes(findings);
        if (res && res.length > 0) {
          console.log("Applied fixes:");
          for (const r of res) console.log(`- ${r.file}: ${r.action}`);
        } else {
          console.log("No changes made.");
        }
      } else {
        console.log("Cancelled.");
      }
    } else if (choice === "ai") {
      const apiKey = getApiKey();
      if (!apiKey) {
        console.log("No Mistral API key configured. Choose menu item to set it first.");
        continue;
      }
      const { context } = await inquirer.prompt([{ type: "input", name: "context", message: "Enter a short description of what help you want from the AI (e.g., 'create a security plan for this repo')" }]);
      const { include } = await inquirer.prompt([{ type: "confirm", name: "include", message: "Include scan findings in prompt to AI?", default: true }]);
      let prompt = `${context}\n\n`;
      if (include && findings && findings.length > 0) {
        prompt += "Findings:\n";
        for (const f of findings.slice(0, 20)) {
          prompt += `- ${f.type} in ${f.file} line ${f.line}: ${f.excerpt}\n`;
        }
      }
      console.log("Calling AI (Mistral) to generate a plan...");
      try {
        const out = await callMistral(prompt, undefined, apiKey, getApiUrl());
        console.log("\nAI Plan:\n");
        console.log(out);
      } catch (e: any) {
        console.error("AI call failed:", e?.message || e);
      }
    } else if (choice === "exit") {
      console.log("Goodbye.");
      process.exit(0);
    }
  }
}

function _isLocalUrl(url?: string) {
  if (!url) return false;
  const u = url.toLowerCase();
  return u.includes("localhost") || u.startsWith("http://127.") || u.startsWith("http://0.0.0.0") || u.startsWith("http://[::1]") || u.startsWith("https://127.");
}

function findKihicodeDir(proposed?: string): string {
  if (proposed) return proposed;
  const cwd = process.cwd();
  if (cwd.toLowerCase().includes("kihicode")) return cwd;
  const downloads = require("os").homedir() + "/Downloads";
  // best-effort: return cwd
  return cwd;
}

export async function _runSecuritySubagent(argv: string[]) {
  const args = argv.slice();
  const parsed: any = { scan: undefined, fix: false, ai: false, ai_prompt: undefined, apply: false, yes: false, json: false, set_key: undefined };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--path" || a === "-p") { parsed.scan = args[++i]; }
    else if (a === "--ai") parsed.ai = true;
    else if (a === "--ai-prompt") parsed.ai_prompt = args[++i];
    else if (a === "--apply") parsed.apply = true;
    else if (a === "--yes" || a === "-y") parsed.yes = true;
    else if (a === "--json") parsed.json = true;
    else if (a === "--set-key") parsed.set_key = args[++i];
  }

  const target = findKihicodeDir(parsed.scan);
  console.log(`Security subagent target: ${target}`);
  const findings = scanDir(target);
  if (parsed.json) {
    console.log(JSON.stringify(findings, null, 2));
  } else {
    showFindings(findings);
  }

  if (parsed.ai) {
    const apiKey = getApiKey() || process.env.MISTRAL_API_KEY;
    const apiUrl = getApiUrl() || process.env.MISTRAL_API_URL;
    if (apiUrl && _isLocalUrl(apiUrl)) {
      console.error("Configured Mistral API URL looks local — refusing to use a local API.");
      return;
    }
    if (!apiKey) {
      console.log("No Mistral API key configured — falling back to a local heuristic plan.");
      // build a simple local plan
      let plan = "Local security plan:\n";
      if (!findings || findings.length === 0) plan += "No issues found.";
      else {
        for (const f of findings) {
          if (f.type === "insecure-perms") plan += `- Make ${f.file} private: chmod 600 ${f.file}\n`;
          else plan += `- ${f.type} in ${f.file}: inspect and remediate\n`;
        }
      }
      console.log(plan);
    } else {
      const promptPrefix = parsed.ai_prompt || "You are a security specialist subagent for Kihicode. Given the repository and findings, produce a prioritized, actionable, and conservative remediation plan.";
      let prompt = promptPrefix + "\n\n";
      if (findings && findings.length > 0) {
        prompt += "Findings:\n";
        for (const f of findings.slice(0, 100)) prompt += `- ${f.type} in ${f.file} line ${f.line}: ${f.excerpt}\n`;
      }
      console.log("Calling remote Mistral API to generate a plan...");
      try {
        const out = await callMistral(prompt, undefined, apiKey, apiUrl);
        if (parsed.json) console.log(JSON.stringify({ plan: out }, null, 2));
        else console.log("\nMistral AI Plan:\n", out);
      } catch (e: any) {
        console.error("AI call failed:", e?.message || e);
      }
    }
  }

  if (parsed.apply) {
    if (!parsed.yes) {
      console.log("Apply requested but --yes not passed; skipping.");
      return;
    }
    const res = applyFixes(findings);
    if (parsed.json) console.log(JSON.stringify(res, null, 2));
    else {
      if (res && res.length > 0) {
        console.log("Applied fixes:");
        for (const r of res) console.log(`- ${r.file}: ${r.action}`);
      } else console.log("No changes made.");
    }
  }
}

export async function main(argv?: string[]) {
  const args = argv || process.argv.slice(2);
  if (args.length > 0 && (args[0] === "/security" || args[0] === "security")) {
    await _runSecuritySubagent(args.slice(1));
    return;
  }
  if (!args || args.length === 0) {
    try {
      await interactiveMenu();
      return;
    } catch (e) {
      console.error("Interactive menu failed, falling back to simple mode:", e);
    }
  }

  // simple non-interactive handling
  const flags: any = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--scan") flags.scan = args[++i];
    else if (a === "--fix") flags.fix = true;
    else if (a === "--ai-plan") flags.ai_plan = args[++i];
    else if (a === "--include-findings") flags.include_findings = true;
    else if (a === "--set-key") flags.set_key = args[++i];
    else if (a === "--json") flags.json = true;
    else if (a === "--yes") flags.yes = true;
  }

  if (flags.set_key) {
    setApiKey(flags.set_key);
    console.log("Saved Mistral API key (file permissions restricted)");
    return;
  }

  let findings: Finding[] = [];
  if (flags.scan) {
    console.log(`Scanning ${flags.scan} for common issues...`);
    findings = scanDir(flags.scan);
    if (flags.json) console.log(JSON.stringify(findings, null, 2));
    else showFindings(findings);
  }

  if (flags.fix) {
    if (!flags.yes) { console.log("Non-interactive fix requires --yes to confirm changes."); return; }
    if (!findings) findings = scanDir(flags.scan || ".");
    const res = applyFixes(findings);
    if (flags.json) console.log(JSON.stringify(res, null, 2));
    else {
      if (res && res.length > 0) { console.log("Applied fixes:"); for (const r of res) console.log(`- ${r.file}: ${r.action}`); } else console.log("No changes made.");
    }
  }

  if (flags.ai_plan) {
    const apiKey = getApiKey() || process.env.MISTRAL_API_KEY;
    if (!apiKey) { console.log("No Mistral API key configured. Use --set-key or set MISTRAL_API_KEY."); return; }
    let prompt = flags.ai_plan + "\n\n";
    if (flags.include_findings && findings && findings.length > 0) {
      prompt += "Findings:\n";
      for (const f of findings.slice(0, 50)) prompt += `- ${f.type} in ${f.file} line ${f.line}: ${f.excerpt}\n`;
    }
    console.log("Calling AI (Mistral) to generate a plan...");
    try {
      const out = await callMistral(prompt, undefined, apiKey);
      if (flags.json) console.log(JSON.stringify({ plan: out }, null, 2));
      else console.log("\nAI Plan:\n", out);
    } catch (e: any) { console.error("AI call failed:", e?.message || e); }
  }
}
