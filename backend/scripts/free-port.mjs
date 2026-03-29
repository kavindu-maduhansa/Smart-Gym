/**
 * Frees TCP listen port before dev server starts (avoids EADDRINUSE).
 * Uses PORT from env or defaults to 5000.
 */
import { execSync } from "node:child_process";

const port = String(process.env.PORT || 5000);

function freePortWindows() {
  let netstatOut = "";
  try {
    netstatOut = execSync(`netstat -ano | findstr :${port}`, {
      encoding: "utf8",
      windowsHide: true,
    });
  } catch {
    return;
  }
  const pids = new Set();
  const suffix = `:${port}`;
  for (const line of netstatOut.split("\n")) {
    if (!line.includes("LISTENING")) continue;
    const parts = line.trim().split(/\s+/);
    if (parts.length < 5) continue;
    const localAddr = parts[1];
    if (!localAddr || !localAddr.endsWith(suffix)) continue;
    const pid = parts[parts.length - 1];
    if (/^\d+$/.test(pid)) pids.add(pid);
  }
  for (const pid of pids) {
    try {
      execSync(`taskkill /PID ${pid} /F`, { stdio: "ignore", windowsHide: true });
      console.log(`[free-port] Stopped PID ${pid} using port ${port}`);
    } catch {
      /* ignore */
    }
  }
}

function freePortUnix() {
  try {
    const out = execSync(`lsof -ti:${port}`, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    if (!out) return;
    for (const pid of out.split("\n")) {
      if (!/^\d+$/.test(pid)) continue;
      try {
        execSync(`kill -9 ${pid}`, { stdio: "ignore" });
        console.log(`[free-port] Stopped PID ${pid} using port ${port}`);
      } catch {
        /* ignore */
      }
    }
  } catch {
    /* nothing listening or lsof missing */
  }
}

if (process.platform === "win32") {
  freePortWindows();
} else {
  freePortUnix();
}
