import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
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
      return {
        content: [{ type: "text", text: result }],
      };
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
      return {
        content: [{ type: "text", text: result }],
      };
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
      return {
        content: [{ type: "text", text: result }],
      };
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
      return {
        content: [{ type: "text", text: result }],
      };
    }
  );

  // Interaction Tools
  server.tool(
    "browser_click",
    "Click on an element identified by selector or accessibility properties",
    {
      selector: z.string().describe("CSS selector, text content, or accessibility locator"),
      sessionId: z.string().optional().describe("Browser session ID"),
    },
    async ({ selector, sessionId }) => {
      const result = await execBrowser("click", { selector }, sessionId);
      return {
        content: [{ type: "text", text: result }],
      };
    }
  );

  server.tool(
    "browser_fill",
    "Fill a text input field with the specified value",
    {
      selector: z.string().describe("Selector for the input element"),
      value: z.string().describe("Text value to fill in"),
      sessionId: z.string().optional().describe("Browser session ID"),
    },
    async ({ selector, value, sessionId }) => {
      const result = await execBrowser("fill", { selector, value }, sessionId);
      return {
        content: [{ type: "text", text: result }],
      };
    }
  );

  server.tool(
    "browser_type",
    "Type text character by character (useful for triggering key events)",
    {
      selector: z.string().describe("Selector for the input element"),
      text: z.string().describe("Text to type"),
      sessionId: z.string().optional().describe("Browser session ID"),
    },
    async ({ selector, text, sessionId }) => {
      const result = await execBrowser("type", { selector, text }, sessionId);
      return {
        content: [{ type: "text", text: result }],
      };
    }
  );

  server.tool(
    "browser_hover",
    "Hover over an element",
    {
      selector: z.string().describe("Selector for the element to hover"),
      sessionId: z.string().optional().describe("Browser session ID"),
    },
    async ({ selector, sessionId }) => {
      const result = await execBrowser("hover", { selector }, sessionId);
      return {
        content: [{ type: "text", text: result }],
      };
    }
  );

  server.tool(
    "browser_scroll",
    "Scroll the page or an element",
    {
      direction: z.enum(["up", "down", "left", "right"]).describe("Scroll direction"),
      amount: z.number().optional().describe("Scroll amount in pixels"),
      selector: z.string().optional().describe("Selector for element to scroll (scrolls page if not provided)"),
      sessionId: z.string().optional().describe("Browser session ID"),
    },
    async ({ direction, amount, selector, sessionId }) => {
      const result = await execBrowser("scroll", { direction, amount, selector }, sessionId);
      return {
        content: [{ type: "text", text: result }],
      };
    }
  );

  server.tool(
    "browser_select",
    "Select an option from a dropdown",
    {
      selector: z.string().describe("Selector for the select element"),
      value: z.string().describe("Value or label of the option to select"),
      sessionId: z.string().optional().describe("Browser session ID"),
    },
    async ({ selector, value, sessionId }) => {
      const result = await execBrowser("select", { selector, value }, sessionId);
      return {
        content: [{ type: "text", text: result }],
      };
    }
  );

  server.tool(
    "browser_check",
    "Check a checkbox or radio button",
    {
      selector: z.string().describe("Selector for the checkbox/radio element"),
      sessionId: z.string().optional().describe("Browser session ID"),
    },
    async ({ selector, sessionId }) => {
      const result = await execBrowser("check", { selector }, sessionId);
      return {
        content: [{ type: "text", text: result }],
      };
    }
  );

  server.tool(
    "browser_uncheck",
    "Uncheck a checkbox",
    {
      selector: z.string().describe("Selector for the checkbox element"),
      sessionId: z.string().optional().describe("Browser session ID"),
    },
    async ({ selector, sessionId }) => {
      const result = await execBrowser("uncheck", { selector }, sessionId);
      return {
        content: [{ type: "text", text: result }],
      };
    }
  );

  server.tool(
    "browser_press",
    "Press a keyboard key",
    {
      key: z.string().describe("Key to press (e.g., 'Enter', 'Escape', 'Tab')"),
      sessionId: z.string().optional().describe("Browser session ID"),
    },
    async ({ key, sessionId }) => {
      const result = await execBrowser("press", { key }, sessionId);
      return {
        content: [{ type: "text", text: result }],
      };
    }
  );

  // Information Retrieval Tools
  server.tool(
    "browser_get_text",
    "Get text content from an element or the entire page",
    {
      selector: z.string().optional().describe("Selector for the element (gets full page text if not provided)"),
      sessionId: z.string().optional().describe("Browser session ID"),
    },
    async ({ selector, sessionId }) => {
      const result = await execBrowser("get_text", { selector }, sessionId);
      return {
        content: [{ type: "text", text: result }],
      };
    }
  );

  server.tool(
    "browser_get_html",
    "Get HTML content from an element or the entire page",
    {
      selector: z.string().optional().describe("Selector for the element (gets full page HTML if not provided)"),
      outer: z.boolean().optional().describe("Get outer HTML instead of inner HTML"),
      sessionId: z.string().optional().describe("Browser session ID"),
    },
    async ({ selector, outer, sessionId }) => {
      const result = await execBrowser("get_html", { selector, outer }, sessionId);
      return {
        content: [{ type: "text", text: result }],
      };
    }
  );

  server.tool(
    "browser_get_attribute",
    "Get an attribute value from an element",
    {
      selector: z.string().describe("Selector for the element"),
      attribute: z.string().describe("Name of the attribute to get"),
      sessionId: z.string().optional().describe("Browser session ID"),
    },
    async ({ selector, attribute, sessionId }) => {
      const result = await execBrowser("get_attribute", { selector, attribute }, sessionId);
      return {
        content: [{ type: "text", text: result }],
      };
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
      return {
        content: [{ type: "text", text: result }],
      };
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
      return {
        content: [{ type: "text", text: result }],
      };
    }
  );

  server.tool(
    "browser_snapshot",
    "Get an accessibility tree snapshot of the page for AI-friendly element references",
    {
      sessionId: z.string().optional().describe("Browser session ID"),
    },
    async ({ sessionId }) => {
      const result = await execBrowser("snapshot", {}, sessionId);
      return {
        content: [{ type: "text", text: result }],
      };
    }
  );

  // Element State Tools
  server.tool(
    "browser_is_visible",
    "Check if an element is visible",
    {
      selector: z.string().describe("Selector for the element"),
      sessionId: z.string().optional().describe("Browser session ID"),
    },
    async ({ selector, sessionId }) => {
      const result = await execBrowser("is_visible", { selector }, sessionId);
      return {
        content: [{ type: "text", text: result }],
      };
    }
  );

  server.tool(
    "browser_is_enabled",
    "Check if an element is enabled",
    {
      selector: z.string().describe("Selector for the element"),
      sessionId: z.string().optional().describe("Browser session ID"),
    },
    async ({ selector, sessionId }) => {
      const result = await execBrowser("is_enabled", { selector }, sessionId);
      return {
        content: [{ type: "text", text: result }],
      };
    }
  );

  server.tool(
    "browser_is_checked",
    "Check if a checkbox/radio is checked",
    {
      selector: z.string().describe("Selector for the checkbox/radio element"),
      sessionId: z.string().optional().describe("Browser session ID"),
    },
    async ({ selector, sessionId }) => {
      const result = await execBrowser("is_checked", { selector }, sessionId);
      return {
        content: [{ type: "text", text: result }],
      };
    }
  );

  // Screenshot and PDF Tools
  server.tool(
    "browser_screenshot",
    "Take a screenshot of the page or an element",
    {
      path: z.string().optional().describe("File path to save the screenshot"),
      selector: z.string().optional().describe("Selector for element to screenshot (full page if not provided)"),
      fullPage: z.boolean().optional().describe("Capture the full scrollable page"),
      sessionId: z.string().optional().describe("Browser session ID"),
    },
    async ({ path, selector, fullPage, sessionId }) => {
      const result = await execBrowser("screenshot", { path, selector, fullPage }, sessionId);
      return {
        content: [{ type: "text", text: result }],
      };
    }
  );

  server.tool(
    "browser_pdf",
    "Generate a PDF of the current page",
    {
      path: z.string().describe("File path to save the PDF"),
      sessionId: z.string().optional().describe("Browser session ID"),
    },
    async ({ path, sessionId }) => {
      const result = await execBrowser("pdf", { path }, sessionId);
      return {
        content: [{ type: "text", text: result }],
      };
    }
  );

  // Session Management Tools
  server.tool(
    "browser_new_session",
    "Create a new isolated browser session",
    {
      viewport: z.object({
        width: z.number().describe("Viewport width in pixels"),
        height: z.number().describe("Viewport height in pixels"),
      }).optional().describe("Viewport size configuration"),
    },
    async ({ viewport }) => {
      const result = await execBrowser("new_session", { viewport });
      return {
        content: [{ type: "text", text: result }],
      };
    }
  );

  server.tool(
    "browser_close_session",
    "Close a browser session",
    {
      sessionId: z.string().describe("Session ID to close"),
    },
    async ({ sessionId }) => {
      const result = await execBrowser("close_session", {}, sessionId);
      return {
        content: [{ type: "text", text: result }],
      };
    }
  );

  // Wait Tools
  server.tool(
    "browser_wait_for_selector",
    "Wait for an element to appear in the page",
    {
      selector: z.string().describe("Selector to wait for"),
      timeout: z.number().optional().describe("Maximum wait time in milliseconds"),
      state: z.enum(["attached", "detached", "visible", "hidden"]).optional().describe("Element state to wait for"),
      sessionId: z.string().optional().describe("Browser session ID"),
    },
    async ({ selector, timeout, state, sessionId }) => {
      const result = await execBrowser("wait_for_selector", { selector, timeout, state }, sessionId);
      return {
        content: [{ type: "text", text: result }],
      };
    }
  );

  server.tool(
    "browser_wait_for_navigation",
    "Wait for navigation to complete",
    {
      timeout: z.number().optional().describe("Maximum wait time in milliseconds"),
      sessionId: z.string().optional().describe("Browser session ID"),
    },
    async ({ timeout, sessionId }) => {
      const result = await execBrowser("wait_for_navigation", { timeout }, sessionId);
      return {
        content: [{ type: "text", text: result }],
      };
    }
  );

  // Cookie and Storage Tools
  server.tool(
    "browser_get_cookies",
    "Get cookies from the browser",
    {
      urls: z.array(z.string()).optional().describe("URLs to get cookies for"),
      sessionId: z.string().optional().describe("Browser session ID"),
    },
    async ({ urls, sessionId }) => {
      const result = await execBrowser("get_cookies", { urls }, sessionId);
      return {
        content: [{ type: "text", text: result }],
      };
    }
  );

  server.tool(
    "browser_set_cookies",
    "Set cookies in the browser",
    {
      cookies: z.array(z.object({
        name: z.string(),
        value: z.string(),
        domain: z.string().optional(),
        path: z.string().optional(),
        expires: z.number().optional(),
        httpOnly: z.boolean().optional(),
        secure: z.boolean().optional(),
        sameSite: z.enum(["Strict", "Lax", "None"]).optional(),
      })).describe("Cookies to set"),
      sessionId: z.string().optional().describe("Browser session ID"),
    },
    async ({ cookies, sessionId }) => {
      const result = await execBrowser("set_cookies", { cookies }, sessionId);
      return {
        content: [{ type: "text", text: result }],
      };
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
      return {
        content: [{ type: "text", text: result }],
      };
    }
  );

  // Evaluate JavaScript
  server.tool(
    "browser_evaluate",
    "Execute JavaScript code in the browser context",
    {
      script: z.string().describe("JavaScript code to execute"),
      sessionId: z.string().optional().describe("Browser session ID"),
    },
    async ({ script, sessionId }) => {
      const result = await execBrowser("evaluate", { script }, sessionId);
      return {
        content: [{ type: "text", text: result }],
      };
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
      return {
        content: [{ type: "text", text: result }],
      };
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
      return {
        content: [{ type: "text", text: result }],
      };
    }
  );
}
