# agent-browser-mcp

MCP (Model Context Protocol) server that integrates with [Vercel's agent-browser](https://github.com/vercel-labs/agent-browser) for AI-driven browser automation.

## Overview

This MCP server exposes agent-browser functionality through the Model Context Protocol, enabling AI agents to control web browsers programmatically. It provides a comprehensive set of tools for navigation, interaction, data extraction, and browser session management.

## Prerequisites

- Node.js >= 18.0.0
- [agent-browser](https://github.com/vercel-labs/agent-browser) installed and available in PATH

## Installation

```bash
npm install
npm run build
```

## Usage

### With Claude Desktop

Add to your Claude Desktop configuration (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "agent-browser": {
      "command": "node",
      "args": ["/path/to/agent-browser-mcp/dist/index.js"],
      "env": {
        "AGENT_BROWSER_PATH": "/path/to/agent-browser"
      }
    }
  }
}
```

### With MCP Client

```typescript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const transport = new StdioClientTransport({
  command: "node",
  args: ["./dist/index.js"],
});

const client = new Client({ name: "my-client", version: "1.0.0" });
await client.connect(transport);

// Use browser tools
const result = await client.callTool({
  name: "browser_navigate",
  arguments: { url: "https://example.com" },
});
```

## Available Tools

### Navigation

| Tool | Description |
|------|-------------|
| `browser_navigate` | Navigate to a URL |
| `browser_go_back` | Navigate back in history |
| `browser_go_forward` | Navigate forward in history |
| `browser_reload` | Reload the current page |

### Interaction

| Tool | Description |
|------|-------------|
| `browser_click` | Click on an element |
| `browser_fill` | Fill a text input field |
| `browser_type` | Type text character by character |
| `browser_hover` | Hover over an element |
| `browser_scroll` | Scroll the page or element |
| `browser_select` | Select dropdown option |
| `browser_check` | Check a checkbox/radio |
| `browser_uncheck` | Uncheck a checkbox |
| `browser_press` | Press a keyboard key |

### Information Retrieval

| Tool | Description |
|------|-------------|
| `browser_get_text` | Get text content from element/page |
| `browser_get_html` | Get HTML content |
| `browser_get_attribute` | Get element attribute value |
| `browser_get_url` | Get current page URL |
| `browser_get_title` | Get current page title |
| `browser_snapshot` | Get accessibility tree snapshot |

### Element State

| Tool | Description |
|------|-------------|
| `browser_is_visible` | Check if element is visible |
| `browser_is_enabled` | Check if element is enabled |
| `browser_is_checked` | Check if checkbox/radio is checked |

### Screenshots & PDF

| Tool | Description |
|------|-------------|
| `browser_screenshot` | Take a screenshot |
| `browser_pdf` | Generate PDF of page |

### Session Management

| Tool | Description |
|------|-------------|
| `browser_new_session` | Create new isolated session |
| `browser_close_session` | Close a browser session |

### Wait Operations

| Tool | Description |
|------|-------------|
| `browser_wait_for_selector` | Wait for element to appear |
| `browser_wait_for_navigation` | Wait for navigation to complete |

### Cookies & Storage

| Tool | Description |
|------|-------------|
| `browser_get_cookies` | Get cookies |
| `browser_set_cookies` | Set cookies |
| `browser_clear_cookies` | Clear all cookies |

### JavaScript & Debugging

| Tool | Description |
|------|-------------|
| `browser_evaluate` | Execute JavaScript in browser |
| `browser_get_console` | Get console messages |
| `browser_get_network` | Get network requests |

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `AGENT_BROWSER_PATH` | Path to agent-browser executable | `agent-browser` |

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Watch mode
npm run dev

# Run server
npm start
```

## License

MIT
