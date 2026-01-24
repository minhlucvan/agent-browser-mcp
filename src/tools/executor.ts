import { spawn } from "child_process";

const AGENT_BROWSER_PATH = process.env.AGENT_BROWSER_PATH || "agent-browser";

/**
 * Command mapping from MCP tool names to agent-browser CLI commands.
 * The agent-browser CLI uses positional arguments, not flags.
 */
const COMMAND_MAP: Record<string, string> = {
  navigate: "open",
  go_back: "back",
  go_forward: "forward",
  reload: "reload",
  click: "click",
  fill: "fill",
  type: "type",
  hover: "hover",
  scroll: "scroll",
  select: "select",
  check: "check",
  uncheck: "uncheck",
  press: "press",
  get_text: "get text",
  get_html: "get html",
  get_attribute: "get attr",
  get_url: "get url",
  get_title: "get title",
  snapshot: "snapshot",
  is_visible: "is visible",
  is_enabled: "is enabled",
  is_checked: "is checked",
  screenshot: "screenshot",
  pdf: "pdf",
  evaluate: "eval",
  wait_for_selector: "wait",
  get_cookies: "cookies get",
  set_cookie: "cookies set",  // Single cookie: cookies set <name> <value>
  clear_cookies: "cookies clear",
  get_console: "console",
  get_network: "network requests",
  close_session: "close",
};

/**
 * Helper to check if a value is defined and non-empty for required args.
 */
function isDefined(value: unknown): value is string | number | boolean {
  return value !== undefined && value !== null && value !== "";
}

/**
 * Build positional arguments for each command based on agent-browser CLI syntax.
 * Returns an array of arguments in the correct order.
 */
function buildPositionalArgs(
  command: string,
  options: Record<string, unknown>
): string[] {
  const args: string[] = [];

  switch (command) {
    // Navigation: open <url>
    case "navigate":
      if (isDefined(options.url)) args.push(String(options.url));
      break;

    // Click/hover/check/uncheck: <command> <selector>
    case "click":
    case "hover":
    case "check":
    case "uncheck":
      if (isDefined(options.selector)) args.push(String(options.selector));
      break;

    // Fill: fill <selector> <value>
    case "fill":
      if (isDefined(options.selector)) args.push(String(options.selector));
      // Allow empty string for value (to clear a field)
      if (options.value !== undefined && options.value !== null) {
        args.push(String(options.value));
      }
      break;

    // Type: type <selector> <text>
    case "type":
      if (isDefined(options.selector)) args.push(String(options.selector));
      // Allow empty string for text
      if (options.text !== undefined && options.text !== null) {
        args.push(String(options.text));
      }
      break;

    // Press: press <key>
    case "press":
      if (isDefined(options.key)) args.push(String(options.key));
      break;

    // Scroll: scroll <direction> [amount]
    case "scroll":
      if (isDefined(options.direction)) args.push(String(options.direction));
      if (options.amount !== undefined && options.amount !== null) {
        args.push(String(options.amount));
      }
      break;

    // Select: select <selector> <value...>
    case "select":
      if (isDefined(options.selector)) args.push(String(options.selector));
      // Support both single value and array of values
      if (Array.isArray(options.values)) {
        for (const v of options.values) {
          if (isDefined(v)) args.push(String(v));
        }
      } else if (isDefined(options.value)) {
        args.push(String(options.value));
      }
      break;

    // Get text/html: get text|html [selector]
    case "get_text":
    case "get_html":
      if (isDefined(options.selector)) args.push(String(options.selector));
      break;

    // Get attribute: get attr <name> <selector>
    case "get_attribute":
      if (isDefined(options.attribute)) args.push(String(options.attribute));
      if (isDefined(options.selector)) args.push(String(options.selector));
      break;

    // Is visible/enabled/checked: is <state> <selector>
    case "is_visible":
    case "is_enabled":
    case "is_checked":
      if (isDefined(options.selector)) args.push(String(options.selector));
      break;

    // Screenshot: screenshot [path]
    case "screenshot":
      if (isDefined(options.path)) args.push(String(options.path));
      break;

    // PDF: pdf <path>
    case "pdf":
      if (isDefined(options.path)) args.push(String(options.path));
      break;

    // Evaluate: eval <js>
    case "evaluate":
      if (isDefined(options.script)) args.push(String(options.script));
      break;

    // Wait: wait <selector|ms>
    case "wait_for_selector":
      if (isDefined(options.selector)) args.push(String(options.selector));
      break;

    // Set cookie: cookies set <name> <value>
    case "set_cookie":
      if (isDefined(options.name)) args.push(String(options.name));
      // Allow empty string for cookie value
      if (options.value !== undefined && options.value !== null) {
        args.push(String(options.value));
      }
      break;

    // Commands with no positional args
    case "go_back":
    case "go_forward":
    case "reload":
    case "get_url":
    case "get_title":
    case "snapshot":
    case "get_cookies":
    case "clear_cookies":
    case "get_console":
    case "get_network":
    case "close_session":
      // No positional args needed
      break;
  }

  return args;
}

/**
 * Build optional flags for commands that support them.
 * Flags are placed after the command but typically work anywhere.
 */
function buildOptionalFlags(
  command: string,
  options: Record<string, unknown>
): string[] {
  const flags: string[] = [];

  // Screenshot flags
  if (command === "screenshot") {
    if (options.fullPage) flags.push("-f");
  }

  // Snapshot flags (verified: -i, -c, -d, -s all work)
  if (command === "snapshot") {
    if (options.interactive) flags.push("-i");
    if (options.compact) flags.push("-c");
    if (options.depth !== undefined && options.depth !== null) {
      flags.push("-d", String(options.depth));
    }
    if (isDefined(options.selector)) {
      flags.push("-s", String(options.selector));
    }
  }

  return flags;
}

/**
 * Execute an agent-browser command and return the result.
 */
export async function execBrowser(
  command: string,
  options: Record<string, unknown> = {},
  sessionId?: string
): Promise<string> {
  // Get the CLI command (may contain spaces like "get text")
  const cliCommand = COMMAND_MAP[command];
  if (!cliCommand) {
    throw new Error(`Unknown command: ${command}`);
  }
  const commandParts = cliCommand.split(" ");

  // Build the full argument list
  const args: string[] = [...commandParts];

  // Add session flag if provided (verified: --session is supported)
  if (sessionId) {
    args.push("--session", sessionId);
  }

  // Add positional arguments
  const positionalArgs = buildPositionalArgs(command, options);
  args.push(...positionalArgs);

  // Add optional flags
  const optionalFlags = buildOptionalFlags(command, options);
  args.push(...optionalFlags);

  // Debug logging
  if (process.env.DEBUG) {
    console.error(`[agent-browser-mcp] Executing: ${AGENT_BROWSER_PATH} ${args.join(" ")}`);
  }

  return new Promise((resolve, reject) => {
    const proc = spawn(AGENT_BROWSER_PATH, args, {
      env: {
        ...process.env,
        // Also set env var for session isolation
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
        reject(
          new Error(`agent-browser exited with code ${code}: ${stderr || stdout}`)
        );
      }
    });

    proc.on("error", (err) => {
      reject(new Error(`Failed to execute agent-browser: ${err.message}`));
    });
  });
}

/**
 * Check if agent-browser is available.
 */
export async function checkAgentBrowser(): Promise<boolean> {
  try {
    await execBrowser("snapshot", {});
    return true;
  } catch {
    return false;
  }
}
