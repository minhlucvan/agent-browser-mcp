import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { execBrowser } from "./executor.js";

export function registerBrowserTools(server: McpServer): void {
  // Navigation Tools
  server.tool(
    "browser_navigate",
    "Navigate to a URL in the browser",
    {
      url: z.string().url().describe("The URL to navigate to"),
      sessionId: z.string().optional().describe("Browser session ID for isolation"),
    },
    async ({ url, sessionId }) => {
      const result = await execBrowser("navigate", { url }, sessionId);
      return { content: [{ type: "text", text: result }] };
    }
  );

  server.tool(
    "browser_go_back",
    "Navigate back in browser history",
    {
      sessionId: z.string().optional().describe("Browser session ID"),
    },
    async ({ sessionId }) => {
      const result = await execBrowser("go_back", {}, sessionId);
      return { content: [{ type: "text", text: result }] };
    }
  );

  server.tool(
    "browser_go_forward",
    "Navigate forward in browser history",
    {
      sessionId: z.string().optional().describe("Browser session ID"),
    },
    async ({ sessionId }) => {
      const result = await execBrowser("go_forward", {}, sessionId);
      return { content: [{ type: "text", text: result }] };
    }
  );

  server.tool(
    "browser_reload",
    "Reload the current page",
    {
      sessionId: z.string().optional().describe("Browser session ID"),
    },
    async ({ sessionId }) => {
      const result = await execBrowser("reload", {}, sessionId);
      return { content: [{ type: "text", text: result }] };
    }
  );

  // Interaction Tools
  server.tool(
    "browser_click",
    "Click on an element identified by selector or ref (e.g., '@e1' from snapshot)",
    {
      selector: z.string().min(1).describe("CSS selector, text, or ref from snapshot (e.g., '@e1')"),
      sessionId: z.string().optional().describe("Browser session ID"),
    },
    async ({ selector, sessionId }) => {
      const result = await execBrowser("click", { selector }, sessionId);
      return { content: [{ type: "text", text: result }] };
    }
  );

  server.tool(
    "browser_fill",
    "Clear and fill a text input field with the specified value",
    {
      selector: z.string().min(1).describe("Selector or ref for the input element"),
      value: z.string().describe("Text value to fill in (empty string clears the field)"),
      sessionId: z.string().optional().describe("Browser session ID"),
    },
    async ({ selector, value, sessionId }) => {
      const result = await execBrowser("fill", { selector, value }, sessionId);
      return { content: [{ type: "text", text: result }] };
    }
  );

  server.tool(
    "browser_type",
    "Type text character by character (useful for triggering key events)",
    {
      selector: z.string().min(1).describe("Selector or ref for the input element"),
      text: z.string().describe("Text to type"),
      sessionId: z.string().optional().describe("Browser session ID"),
    },
    async ({ selector, text, sessionId }) => {
      const result = await execBrowser("type", { selector, text }, sessionId);
      return { content: [{ type: "text", text: result }] };
    }
  );

  server.tool(
    "browser_hover",
    "Hover over an element",
    {
      selector: z.string().min(1).describe("Selector or ref for the element to hover"),
      sessionId: z.string().optional().describe("Browser session ID"),
    },
    async ({ selector, sessionId }) => {
      const result = await execBrowser("hover", { selector }, sessionId);
      return { content: [{ type: "text", text: result }] };
    }
  );

  server.tool(
    "browser_scroll",
    "Scroll the page in a direction",
    {
      direction: z.enum(["up", "down", "left", "right"]).describe("Scroll direction"),
      amount: z.number().optional().describe("Scroll amount in pixels"),
      sessionId: z.string().optional().describe("Browser session ID"),
    },
    async ({ direction, amount, sessionId }) => {
      const result = await execBrowser("scroll", { direction, amount }, sessionId);
      return { content: [{ type: "text", text: result }] };
    }
  );

  server.tool(
    "browser_select",
    "Select one or more options from a dropdown",
    {
      selector: z.string().min(1).describe("Selector or ref for the select element"),
      values: z.union([
        z.string(),
        z.array(z.string())
      ]).describe("Value(s) to select - single string or array for multi-select"),
      sessionId: z.string().optional().describe("Browser session ID"),
    },
    async ({ selector, values, sessionId }) => {
      // Normalize to array
      const valuesArray = Array.isArray(values) ? values : [values];
      const result = await execBrowser("select", { selector, values: valuesArray }, sessionId);
      return { content: [{ type: "text", text: result }] };
    }
  );

  server.tool(
    "browser_check",
    "Check a checkbox or radio button",
    {
      selector: z.string().min(1).describe("Selector or ref for the checkbox/radio element"),
      sessionId: z.string().optional().describe("Browser session ID"),
    },
    async ({ selector, sessionId }) => {
      const result = await execBrowser("check", { selector }, sessionId);
      return { content: [{ type: "text", text: result }] };
    }
  );

  server.tool(
    "browser_uncheck",
    "Uncheck a checkbox",
    {
      selector: z.string().min(1).describe("Selector or ref for the checkbox element"),
      sessionId: z.string().optional().describe("Browser session ID"),
    },
    async ({ selector, sessionId }) => {
      const result = await execBrowser("uncheck", { selector }, sessionId);
      return { content: [{ type: "text", text: result }] };
    }
  );

  server.tool(
    "browser_press",
    "Press a keyboard key",
    {
      key: z.string().min(1).describe("Key to press (e.g., 'Enter', 'Tab', 'Control+a')"),
      sessionId: z.string().optional().describe("Browser session ID"),
    },
    async ({ key, sessionId }) => {
      const result = await execBrowser("press", { key }, sessionId);
      return { content: [{ type: "text", text: result }] };
    }
  );

  // Information Retrieval Tools
  server.tool(
    "browser_get_text",
    "Get text content from an element or the entire page",
    {
      selector: z.string().optional().describe("Selector or ref (gets full page text if not provided)"),
      sessionId: z.string().optional().describe("Browser session ID"),
    },
    async ({ selector, sessionId }) => {
      const result = await execBrowser("get_text", { selector }, sessionId);
      return { content: [{ type: "text", text: result }] };
    }
  );

  server.tool(
    "browser_get_html",
    "Get HTML content from an element or the entire page",
    {
      selector: z.string().optional().describe("Selector or ref (gets full page HTML if not provided)"),
      sessionId: z.string().optional().describe("Browser session ID"),
    },
    async ({ selector, sessionId }) => {
      const result = await execBrowser("get_html", { selector }, sessionId);
      return { content: [{ type: "text", text: result }] };
    }
  );

  server.tool(
    "browser_get_attribute",
    "Get an attribute value from an element",
    {
      selector: z.string().min(1).describe("Selector or ref for the element"),
      attribute: z.string().min(1).describe("Name of the attribute to get"),
      sessionId: z.string().optional().describe("Browser session ID"),
    },
    async ({ selector, attribute, sessionId }) => {
      const result = await execBrowser("get_attribute", { selector, attribute }, sessionId);
      return { content: [{ type: "text", text: result }] };
    }
  );

  server.tool(
    "browser_get_url",
    "Get the current page URL",
    {
      sessionId: z.string().optional().describe("Browser session ID"),
    },
    async ({ sessionId }) => {
      const result = await execBrowser("get_url", {}, sessionId);
      return { content: [{ type: "text", text: result }] };
    }
  );

  server.tool(
    "browser_get_title",
    "Get the current page title",
    {
      sessionId: z.string().optional().describe("Browser session ID"),
    },
    async ({ sessionId }) => {
      const result = await execBrowser("get_title", {}, sessionId);
      return { content: [{ type: "text", text: result }] };
    }
  );

  server.tool(
    "browser_snapshot",
    "Get an accessibility tree snapshot of the page with element refs for AI interaction",
    {
      interactive: z.boolean().optional().describe("Only show interactive elements (-i flag)"),
      compact: z.boolean().optional().describe("Remove empty structural elements (-c flag)"),
      depth: z.number().optional().describe("Limit tree depth (-d flag)"),
      selector: z.string().optional().describe("Scope snapshot to a CSS selector (-s flag)"),
      sessionId: z.string().optional().describe("Browser session ID"),
    },
    async ({ interactive, compact, depth, selector, sessionId }) => {
      const result = await execBrowser("snapshot", { interactive, compact, depth, selector }, sessionId);
      return { content: [{ type: "text", text: result }] };
    }
  );

  // Element State Tools
  server.tool(
    "browser_is_visible",
    "Check if an element is visible",
    {
      selector: z.string().min(1).describe("Selector or ref for the element"),
      sessionId: z.string().optional().describe("Browser session ID"),
    },
    async ({ selector, sessionId }) => {
      const result = await execBrowser("is_visible", { selector }, sessionId);
      return { content: [{ type: "text", text: result }] };
    }
  );

  server.tool(
    "browser_is_enabled",
    "Check if an element is enabled",
    {
      selector: z.string().min(1).describe("Selector or ref for the element"),
      sessionId: z.string().optional().describe("Browser session ID"),
    },
    async ({ selector, sessionId }) => {
      const result = await execBrowser("is_enabled", { selector }, sessionId);
      return { content: [{ type: "text", text: result }] };
    }
  );

  server.tool(
    "browser_is_checked",
    "Check if a checkbox/radio is checked",
    {
      selector: z.string().min(1).describe("Selector or ref for the checkbox/radio element"),
      sessionId: z.string().optional().describe("Browser session ID"),
    },
    async ({ selector, sessionId }) => {
      const result = await execBrowser("is_checked", { selector }, sessionId);
      return { content: [{ type: "text", text: result }] };
    }
  );

  // Screenshot and PDF Tools
  server.tool(
    "browser_screenshot",
    "Take a screenshot of the page",
    {
      path: z.string().optional().describe("File path to save the screenshot"),
      fullPage: z.boolean().optional().describe("Capture the full scrollable page (-f flag)"),
      sessionId: z.string().optional().describe("Browser session ID"),
    },
    async ({ path, fullPage, sessionId }) => {
      const result = await execBrowser("screenshot", { path, fullPage }, sessionId);
      return { content: [{ type: "text", text: result }] };
    }
  );

  server.tool(
    "browser_pdf",
    "Generate a PDF of the current page",
    {
      path: z.string().min(1).describe("File path to save the PDF"),
      sessionId: z.string().optional().describe("Browser session ID"),
    },
    async ({ path, sessionId }) => {
      const result = await execBrowser("pdf", { path }, sessionId);
      return { content: [{ type: "text", text: result }] };
    }
  );

  // Wait Tools
  server.tool(
    "browser_wait",
    "Wait for an element to appear or a specified time",
    {
      target: z.string().min(1).describe("Selector/ref to wait for, or milliseconds (e.g., '1000' for 1 second)"),
      sessionId: z.string().optional().describe("Browser session ID"),
    },
    async ({ target, sessionId }) => {
      const result = await execBrowser("wait_for_selector", { selector: target }, sessionId);
      return { content: [{ type: "text", text: result }] };
    }
  );

  // Cookie Tools
  server.tool(
    "browser_get_cookies",
    "Get all cookies from the browser",
    {
      sessionId: z.string().optional().describe("Browser session ID"),
    },
    async ({ sessionId }) => {
      const result = await execBrowser("get_cookies", {}, sessionId);
      return { content: [{ type: "text", text: result }] };
    }
  );

  server.tool(
    "browser_set_cookie",
    "Set a single cookie",
    {
      name: z.string().min(1).describe("Cookie name"),
      value: z.string().describe("Cookie value"),
      sessionId: z.string().optional().describe("Browser session ID"),
    },
    async ({ name, value, sessionId }) => {
      const result = await execBrowser("set_cookie", { name, value }, sessionId);
      return { content: [{ type: "text", text: result }] };
    }
  );

  server.tool(
    "browser_clear_cookies",
    "Clear all cookies",
    {
      sessionId: z.string().optional().describe("Browser session ID"),
    },
    async ({ sessionId }) => {
      const result = await execBrowser("clear_cookies", {}, sessionId);
      return { content: [{ type: "text", text: result }] };
    }
  );

  // JavaScript Evaluation
  server.tool(
    "browser_evaluate",
    "Execute JavaScript code in the browser context",
    {
      script: z.string().min(1).describe("JavaScript code to execute"),
      sessionId: z.string().optional().describe("Browser session ID"),
    },
    async ({ script, sessionId }) => {
      const result = await execBrowser("evaluate", { script }, sessionId);
      return { content: [{ type: "text", text: result }] };
    }
  );

  // Console and Network Tools
  server.tool(
    "browser_get_console",
    "Get console messages from the browser",
    {
      sessionId: z.string().optional().describe("Browser session ID"),
    },
    async ({ sessionId }) => {
      const result = await execBrowser("get_console", {}, sessionId);
      return { content: [{ type: "text", text: result }] };
    }
  );

  server.tool(
    "browser_get_network",
    "Get network requests made by the browser",
    {
      sessionId: z.string().optional().describe("Browser session ID"),
    },
    async ({ sessionId }) => {
      const result = await execBrowser("get_network", {}, sessionId);
      return { content: [{ type: "text", text: result }] };
    }
  );

  // Session Management
  server.tool(
    "browser_close",
    "Close the browser",
    {
      sessionId: z.string().optional().describe("Session ID to close"),
    },
    async ({ sessionId }) => {
      const result = await execBrowser("close_session", {}, sessionId);
      return { content: [{ type: "text", text: result }] };
    }
  );
}
