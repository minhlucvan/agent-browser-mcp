import { spawn } from "child_process";

// Environment variable for agent-browser executable path
const AGENT_BROWSER_PATH = process.env.AGENT_BROWSER_PATH || "agent-browser";

interface ExecOptions {
  [key: string]: unknown;
}

/**
 * Execute an agent-browser command and return the result
 */
export async function execBrowser(
  command: string,
  options: ExecOptions = {},
  sessionId?: string
): Promise<string> {
  const args: string[] = [command];

  // Add session ID if provided
  if (sessionId) {
    args.push("--session", sessionId);
  }

  // Add options as command arguments
  for (const [key, value] of Object.entries(options)) {
    if (value === undefined || value === null) continue;

    const flag = `--${key.replace(/([A-Z])/g, "-$1").toLowerCase()}`;

    if (typeof value === "boolean") {
      if (value) args.push(flag);
    } else if (Array.isArray(value)) {
      args.push(flag, JSON.stringify(value));
    } else if (typeof value === "object") {
      args.push(flag, JSON.stringify(value));
    } else {
      args.push(flag, String(value));
    }
  }

  return new Promise((resolve, reject) => {
    const proc = spawn(AGENT_BROWSER_PATH, args, {
      env: {
        ...process.env,
        // Ensure session is isolated if sessionId is provided
        ...(sessionId && { AGENT_BROWSER_SESSION: sessionId }),
      },
    });

    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    proc.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    proc.on("close", (code) => {
      if (code === 0) {
        resolve(stdout.trim() || "Command executed successfully");
      } else {
        reject(new Error(`agent-browser exited with code ${code}: ${stderr || stdout}`));
      }
    });

    proc.on("error", (err) => {
      reject(new Error(`Failed to execute agent-browser: ${err.message}`));
    });
  });
}

/**
 * Check if agent-browser is available
 */
export async function checkAgentBrowser(): Promise<boolean> {
  try {
    await execBrowser("--version", {});
    return true;
  } catch {
    return false;
  }
}
