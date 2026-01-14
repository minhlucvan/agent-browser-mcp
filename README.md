# Agent Browser MCP

[![npm version](https://img.shields.io/npm/v/agent-browser-mcp.svg)](https://www.npmjs.com/package/agent-browser-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](https://nodejs.org/)

A [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server that provides browser automation capabilities through [Vercel's agent-browser](https://github.com/vercel-labs/agent-browser). This enables LLMs to interact with web pages using a fast Rust CLI with Node.js fallback.

## Quick Start

```bash
# 1. Install agent-browser CLI
npm install -g agent-browser && agent-browser install

# 2. Add to Claude Desktop (or your MCP client)
npx agent-browser-mcp
```

Then use tools like `browser_navigate`, `browser_click`, `browser_snapshot` to control the browser from your AI agent.

## Features

- **AI-Optimized Browser Control** - Semantic element locators using accessibility properties, text matching, and data attributes
- **Session Isolation** - Multiple isolated browser sessions with separate cookies, storage, and navigation history
- **Comprehensive Automation** - Navigation, form filling, clicking, scrolling, keyboard input, and more
- **Data Extraction** - Get text, HTML, attributes, accessibility snapshots, screenshots, and PDFs
- **Cookie Management** - Full control over browser cookies and storage
- **JavaScript Execution** - Run arbitrary scripts in the browser context
- **Network Inspection** - Monitor console messages and network requests

## Use Cases

- **Web Scraping for AI** - Extract structured data from websites for RAG, research, or analysis
- **Automated Testing** - AI-powered end-to-end testing with natural language assertions
- **Form Automation** - Fill forms, submit data, handle multi-step workflows
- **Screenshot Analysis** - Capture pages for visual AI analysis or documentation
- **Session Automation** - Login once, persist cookies, automate authenticated workflows
- **Data Entry** - Bulk data input across web applications
- **Monitoring** - Track changes on web pages, detect updates, gather metrics

## Why Agent Browser?

Agent Browser was **built from the ground up for AI agents**, not adapted from human-centric automation tools. This fundamental difference delivers significant advantages:

### Agent-Native Design

| Capability | Agent Browser | Traditional Tools |
|------------|---------------|-------------------|
| **Semantic Element Targeting** | Native accessibility-based locators | CSS selectors / XPath |
| **Token Efficiency** | Structured data, minimal output | Verbose HTML/screenshots |
| **Response Format** | AI-optimized, parseable | Human-readable |
| **Error Messages** | Actionable, context-aware | Generic stack traces |

### Performance

- **Rust-powered CLI** - Fast execution with minimal overhead
- **Lightweight snapshots** - Accessibility tree instead of full DOM
- **Streaming output** - Real-time feedback without buffering

## Comparison with Other Browser MCP Servers

| Feature | Agent Browser MCP | [Playwright MCP](https://github.com/microsoft/playwright-mcp) | [MCP Chrome](https://github.com/hangwin/mcp-chrome) | [Playwriter](https://github.com/remorses/playwriter) |
|---------|:-----------------:|:-------------------------------------------------------------:|:---------------------------------------------------:|:----------------------------------------------------:|
| **Agent-Native Design** | Yes | No | No | No |
| **Semantic Locators** | Native | Via accessibility | CSS only | Via Playwright |
| **Token Efficient Output** | Yes | Moderate | No | Yes |
| **Performance** | Rust CLI | Node.js | Extension | Extension |
| **Headless / CI-CD** | Yes | Yes | No | No |
| **No Extension Required** | Yes | Yes | No | No |
| **Session Isolation** | Yes | Yes | No | Per-tab |
| **Accessibility Snapshots** | Yes | Yes | No | Labels only |
| **Preserves Login State** | Via storage | Via storage | Yes (your browser) | Yes (your browser) |
| **Multi-browser** | Chromium | Chrome, Firefox, WebKit | Chrome only | Chrome only |

## Installation

```bash
npm install agent-browser-mcp
```

Or run directly with npx:

```bash
npx agent-browser-mcp
```

### Prerequisites

- Node.js 18 or newer
- [agent-browser](https://github.com/vercel-labs/agent-browser) CLI installed:

```bash
# Install agent-browser globally
npm install -g agent-browser

# Download Chromium browser
agent-browser install

# On Linux, install system dependencies if needed:
# agent-browser install --with-deps
```

> **⚠️ Windows Note:** agent-browser currently has [known issues on Windows](https://github.com/vercel-labs/agent-browser/issues/56) with native shells (PowerShell/CMD). For Windows users, we recommend using [WSL (Windows Subsystem for Linux)](https://learn.microsoft.com/en-us/windows/wsl/install) until the upstream issue is resolved.

## Configuration

### VS Code

Add to your VS Code settings (JSON):

```json
{
  "mcp": {
    "servers": {
      "agent-browser": {
        "command": "npx",
        "args": ["agent-browser-mcp"]
      }
    }
  }
}
```

### Claude Desktop

Add to your `claude_desktop_config.json`:

<details>
<summary>macOS: ~/Library/Application Support/Claude/claude_desktop_config.json</summary>

```json
{
  "mcpServers": {
    "agent-browser": {
      "command": "npx",
      "args": ["agent-browser-mcp"]
    }
  }
}
```
</details>

<details>
<summary>Windows: %APPDATA%\Claude\claude_desktop_config.json</summary>

```json
{
  "mcpServers": {
    "agent-browser": {
      "command": "npx",
      "args": ["agent-browser-mcp"]
    }
  }
}
```
</details>

### Cursor

Add to Cursor MCP settings:

```json
{
  "mcpServers": {
    "agent-browser": {
      "command": "npx",
      "args": ["agent-browser-mcp"]
    }
  }
}
```

### Claude Code

```bash
claude mcp add agent-browser -- npx agent-browser-mcp
```

### Custom agent-browser Path

If `agent-browser` is not in your PATH, specify its location:

```json
{
  "mcpServers": {
    "agent-browser": {
      "command": "npx",
      "args": ["agent-browser-mcp"],
      "env": {
        "AGENT_BROWSER_PATH": "/path/to/agent-browser"
      }
    }
  }
}
```

## Available Tools

### Navigation

| Tool | Description |
|------|-------------|
| `browser_navigate` | Navigate to a URL |
| `browser_go_back` | Navigate back in browser history |
| `browser_go_forward` | Navigate forward in browser history |
| `browser_reload` | Reload the current page |

### Interaction

| Tool | Description |
|------|-------------|
| `browser_click` | Click on an element using selector or accessibility locator |
| `browser_fill` | Fill a text input field with a value |
| `browser_type` | Type text character by character (triggers key events) |
| `browser_hover` | Hover over an element |
| `browser_scroll` | Scroll the page or a specific element |
| `browser_select` | Select an option from a dropdown |
| `browser_check` | Check a checkbox or radio button |
| `browser_uncheck` | Uncheck a checkbox |
| `browser_press` | Press a keyboard key (Enter, Escape, Tab, etc.) |

### Data Extraction

| Tool | Description |
|------|-------------|
| `browser_get_text` | Get text content from an element or the entire page |
| `browser_get_html` | Get HTML content (inner or outer) |
| `browser_get_attribute` | Get an attribute value from an element |
| `browser_get_url` | Get the current page URL |
| `browser_get_title` | Get the current page title |
| `browser_snapshot` | Get accessibility tree snapshot for AI-friendly element references |

### Element State

| Tool | Description |
|------|-------------|
| `browser_is_visible` | Check if an element is visible |
| `browser_is_enabled` | Check if an element is enabled |
| `browser_is_checked` | Check if a checkbox or radio button is checked |

### Screenshots & PDF

| Tool | Description |
|------|-------------|
| `browser_screenshot` | Take a screenshot of the page or a specific element |
| `browser_pdf` | Generate a PDF of the current page |

### Session Management

| Tool | Description |
|------|-------------|
| `browser_new_session` | Create a new isolated browser session with optional viewport |
| `browser_close_session` | Close a browser session |

### Wait Operations

| Tool | Description |
|------|-------------|
| `browser_wait_for_selector` | Wait for an element to appear (attached, detached, visible, hidden) |
| `browser_wait_for_navigation` | Wait for navigation to complete |

### Cookies & Storage

| Tool | Description |
|------|-------------|
| `browser_get_cookies` | Get cookies, optionally filtered by URLs |
| `browser_set_cookies` | Set cookies with full options (domain, path, expiry, etc.) |
| `browser_clear_cookies` | Clear all cookies |

### JavaScript & Debugging

| Tool | Description |
|------|-------------|
| `browser_evaluate` | Execute JavaScript code in the browser context |
| `browser_get_console` | Get console messages from the browser |
| `browser_get_network` | Get network requests made by the browser |

## Selector Syntax

agent-browser supports semantic locators that are AI-friendly:

```
# By role and name
button:has-text("Submit")
[role="button"][name="Login"]

# By text content
text=Click here
:has-text("Welcome")

# By accessibility attributes
[aria-label="Search"]
[placeholder="Enter email"]

# By test IDs
[data-testid="submit-button"]

# Standard CSS selectors
#email
.form-input
form > input[type="text"]
```

## Session Management

Create isolated browser sessions for parallel automation:

```typescript
// Create a new session with custom viewport
const session = await client.callTool({
  name: "browser_new_session",
  arguments: {
    viewport: { width: 1920, height: 1080 }
  }
});

// Use session ID for subsequent operations
const result = await client.callTool({
  name: "browser_navigate",
  arguments: {
    url: "https://example.com",
    sessionId: "session-id-here"
  }
});

// Close when done
await client.callTool({
  name: "browser_close_session",
  arguments: { sessionId: "session-id-here" }
});
```

## Programmatic Usage

```typescript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const transport = new StdioClientTransport({
  command: "npx",
  args: ["agent-browser-mcp"],
});

const client = new Client({
  name: "my-browser-client",
  version: "1.0.0",
});

await client.connect(transport);

// Navigate to a page
await client.callTool({
  name: "browser_navigate",
  arguments: { url: "https://example.com" }
});

// Get page content
const text = await client.callTool({
  name: "browser_get_text",
  arguments: {}
});

// Take a screenshot
await client.callTool({
  name: "browser_screenshot",
  arguments: {
    path: "/tmp/screenshot.png",
    fullPage: true
  }
});
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `AGENT_BROWSER_PATH` | Path to agent-browser executable | `agent-browser` |

## Development

```bash
# Clone the repository
git clone https://github.com/minhlucvan/agent-browser-mcp.git
cd agent-browser-mcp

# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Watch mode
npm run dev

# Start server
npm start
```

## Related Projects

- [agent-browser](https://github.com/vercel-labs/agent-browser) - The underlying browser automation CLI by Vercel
- [Playwright MCP](https://github.com/microsoft/playwright-mcp) - Microsoft's Playwright-based MCP server
- [MCP Chrome](https://github.com/nicobailey3/mcp-chrome) - Chrome extension-based MCP server
- [Model Context Protocol](https://modelcontextprotocol.io/) - The MCP specification

## License

MIT
