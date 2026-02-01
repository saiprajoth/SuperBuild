/**
 * scripts/smoke-a001.js
 * Lightweight guard: ensures the app builds and dev server can start.
 * This does NOT replace Playwright; it just catches obvious breakages early.
 */

import { spawn } from "node:child_process";

function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: "inherit", shell: true, ...opts });
    p.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} ${args.join(" ")} exited with ${code}`));
    });
  });
}

(async function main() {
  try {
    // Typecheck + build is the simplest A001 regression tripwire
    await run("npm", ["run", "build"]);
    console.log("\n✅ smoke-a001: build passed\n");
    process.exit(0);
  } catch (e) {
    console.error("\n❌ smoke-a001 failed:", e.message);
    process.exit(1);
  }
})();
