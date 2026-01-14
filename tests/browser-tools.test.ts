import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerBrowserTools } from "../src/tools/browser.js";

// Mock the executor module
vi.mock("../src/tools/executor.js", () => ({
  execBrowser: vi.fn().mockResolvedValue("Success"),
}));

import { execBrowser } from "../src/tools/executor.js";

describe("browser tools", () => {
  let server: McpServer;
  let registeredTools: Map<string, { description: string; handler: Function }>;

  beforeEach(() => {
    registeredTools = new Map();

    // Create a mock server that captures tool registrations
    server = {
      tool: vi.fn((name, description, schema, handler) => {
        registeredTools.set(name, { description, handler });
      }),
    } as unknown as McpServer;

    registerBrowserTools(server);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("tool registration", () => {
    it("should register all navigation tools", () => {
      expect(registeredTools.has("browser_navigate")).toBe(true);
      expect(registeredTools.has("browser_go_back")).toBe(true);
      expect(registeredTools.has("browser_go_forward")).toBe(true);
      expect(registeredTools.has("browser_reload")).toBe(true);
    });

    it("should register all interaction tools", () => {
      expect(registeredTools.has("browser_click")).toBe(true);
      expect(registeredTools.has("browser_fill")).toBe(true);
      expect(registeredTools.has("browser_type")).toBe(true);
      expect(registeredTools.has("browser_hover")).toBe(true);
      expect(registeredTools.has("browser_scroll")).toBe(true);
      expect(registeredTools.has("browser_select")).toBe(true);
      expect(registeredTools.has("browser_check")).toBe(true);
      expect(registeredTools.has("browser_uncheck")).toBe(true);
      expect(registeredTools.has("browser_press")).toBe(true);
    });

    it("should register all information retrieval tools", () => {
      expect(registeredTools.has("browser_get_text")).toBe(true);
      expect(registeredTools.has("browser_get_html")).toBe(true);
      expect(registeredTools.has("browser_get_attribute")).toBe(true);
      expect(registeredTools.has("browser_get_url")).toBe(true);
      expect(registeredTools.has("browser_get_title")).toBe(true);
      expect(registeredTools.has("browser_snapshot")).toBe(true);
    });

    it("should register all element state tools", () => {
      expect(registeredTools.has("browser_is_visible")).toBe(true);
      expect(registeredTools.has("browser_is_enabled")).toBe(true);
      expect(registeredTools.has("browser_is_checked")).toBe(true);
    });

    it("should register all screenshot and PDF tools", () => {
      expect(registeredTools.has("browser_screenshot")).toBe(true);
      expect(registeredTools.has("browser_pdf")).toBe(true);
    });

    it("should register all session management tools", () => {
      expect(registeredTools.has("browser_new_session")).toBe(true);
      expect(registeredTools.has("browser_close_session")).toBe(true);
    });

    it("should register all wait tools", () => {
      expect(registeredTools.has("browser_wait_for_selector")).toBe(true);
      expect(registeredTools.has("browser_wait_for_navigation")).toBe(true);
    });

    it("should register all cookie and storage tools", () => {
      expect(registeredTools.has("browser_get_cookies")).toBe(true);
      expect(registeredTools.has("browser_set_cookies")).toBe(true);
      expect(registeredTools.has("browser_clear_cookies")).toBe(true);
    });

    it("should register all JavaScript and debugging tools", () => {
      expect(registeredTools.has("browser_evaluate")).toBe(true);
      expect(registeredTools.has("browser_get_console")).toBe(true);
      expect(registeredTools.has("browser_get_network")).toBe(true);
    });

    it("should register all expected tools", () => {
      // 4 navigation + 9 interaction + 6 info retrieval + 3 state + 2 screenshot + 2 session + 2 wait + 3 cookies + 3 js/debug = 34
      expect(registeredTools.size).toBe(34);
    });
  });

  describe("navigation tools handlers", () => {
    it("browser_navigate should call execBrowser with correct params", async () => {
      const handler = registeredTools.get("browser_navigate")!.handler;
      const result = await handler({ url: "https://example.com", sessionId: "sess-1" });

      expect(execBrowser).toHaveBeenCalledWith("navigate", { url: "https://example.com" }, "sess-1");
      expect(result).toEqual({ content: [{ type: "text", text: "Success" }] });
    });

    it("browser_go_back should call execBrowser correctly", async () => {
      const handler = registeredTools.get("browser_go_back")!.handler;
      await handler({ sessionId: "sess-1" });

      expect(execBrowser).toHaveBeenCalledWith("go_back", {}, "sess-1");
    });

    it("browser_go_forward should call execBrowser correctly", async () => {
      const handler = registeredTools.get("browser_go_forward")!.handler;
      await handler({});

      expect(execBrowser).toHaveBeenCalledWith("go_forward", {}, undefined);
    });

    it("browser_reload should call execBrowser correctly", async () => {
      const handler = registeredTools.get("browser_reload")!.handler;
      await handler({ sessionId: "sess-2" });

      expect(execBrowser).toHaveBeenCalledWith("reload", {}, "sess-2");
    });
  });

  describe("interaction tools handlers", () => {
    it("browser_click should pass selector to execBrowser", async () => {
      const handler = registeredTools.get("browser_click")!.handler;
      await handler({ selector: "#submit-btn", sessionId: "sess-1" });

      expect(execBrowser).toHaveBeenCalledWith("click", { selector: "#submit-btn" }, "sess-1");
    });

    it("browser_fill should pass selector and value", async () => {
      const handler = registeredTools.get("browser_fill")!.handler;
      await handler({ selector: "#email", value: "test@example.com" });

      expect(execBrowser).toHaveBeenCalledWith(
        "fill",
        { selector: "#email", value: "test@example.com" },
        undefined
      );
    });

    it("browser_type should pass selector and text", async () => {
      const handler = registeredTools.get("browser_type")!.handler;
      await handler({ selector: "#search", text: "hello world" });

      expect(execBrowser).toHaveBeenCalledWith(
        "type",
        { selector: "#search", text: "hello world" },
        undefined
      );
    });

    it("browser_hover should pass selector", async () => {
      const handler = registeredTools.get("browser_hover")!.handler;
      await handler({ selector: ".menu-item" });

      expect(execBrowser).toHaveBeenCalledWith("hover", { selector: ".menu-item" }, undefined);
    });

    it("browser_scroll should pass direction and optional params", async () => {
      const handler = registeredTools.get("browser_scroll")!.handler;
      await handler({ direction: "down", amount: 500, selector: "#content" });

      expect(execBrowser).toHaveBeenCalledWith(
        "scroll",
        { direction: "down", amount: 500, selector: "#content" },
        undefined
      );
    });

    it("browser_select should pass selector and value", async () => {
      const handler = registeredTools.get("browser_select")!.handler;
      await handler({ selector: "#country", value: "US" });

      expect(execBrowser).toHaveBeenCalledWith(
        "select",
        { selector: "#country", value: "US" },
        undefined
      );
    });

    it("browser_check should pass selector", async () => {
      const handler = registeredTools.get("browser_check")!.handler;
      await handler({ selector: "#agree-terms" });

      expect(execBrowser).toHaveBeenCalledWith("check", { selector: "#agree-terms" }, undefined);
    });

    it("browser_uncheck should pass selector", async () => {
      const handler = registeredTools.get("browser_uncheck")!.handler;
      await handler({ selector: "#newsletter" });

      expect(execBrowser).toHaveBeenCalledWith("uncheck", { selector: "#newsletter" }, undefined);
    });

    it("browser_press should pass key", async () => {
      const handler = registeredTools.get("browser_press")!.handler;
      await handler({ key: "Enter" });

      expect(execBrowser).toHaveBeenCalledWith("press", { key: "Enter" }, undefined);
    });
  });

  describe("information retrieval tools handlers", () => {
    it("browser_get_text should pass optional selector", async () => {
      const handler = registeredTools.get("browser_get_text")!.handler;
      await handler({ selector: ".content" });

      expect(execBrowser).toHaveBeenCalledWith("get_text", { selector: ".content" }, undefined);
    });

    it("browser_get_text should work without selector", async () => {
      const handler = registeredTools.get("browser_get_text")!.handler;
      await handler({});

      expect(execBrowser).toHaveBeenCalledWith("get_text", { selector: undefined }, undefined);
    });

    it("browser_get_html should pass selector and outer flag", async () => {
      const handler = registeredTools.get("browser_get_html")!.handler;
      await handler({ selector: "#main", outer: true });

      expect(execBrowser).toHaveBeenCalledWith(
        "get_html",
        { selector: "#main", outer: true },
        undefined
      );
    });

    it("browser_get_attribute should pass selector and attribute name", async () => {
      const handler = registeredTools.get("browser_get_attribute")!.handler;
      await handler({ selector: "a.link", attribute: "href" });

      expect(execBrowser).toHaveBeenCalledWith(
        "get_attribute",
        { selector: "a.link", attribute: "href" },
        undefined
      );
    });

    it("browser_get_url should call execBrowser", async () => {
      const handler = registeredTools.get("browser_get_url")!.handler;
      await handler({});

      expect(execBrowser).toHaveBeenCalledWith("get_url", {}, undefined);
    });

    it("browser_get_title should call execBrowser", async () => {
      const handler = registeredTools.get("browser_get_title")!.handler;
      await handler({});

      expect(execBrowser).toHaveBeenCalledWith("get_title", {}, undefined);
    });

    it("browser_snapshot should call execBrowser", async () => {
      const handler = registeredTools.get("browser_snapshot")!.handler;
      await handler({ sessionId: "sess-1" });

      expect(execBrowser).toHaveBeenCalledWith("snapshot", {}, "sess-1");
    });
  });

  describe("element state tools handlers", () => {
    it("browser_is_visible should pass selector", async () => {
      const handler = registeredTools.get("browser_is_visible")!.handler;
      await handler({ selector: "#modal" });

      expect(execBrowser).toHaveBeenCalledWith("is_visible", { selector: "#modal" }, undefined);
    });

    it("browser_is_enabled should pass selector", async () => {
      const handler = registeredTools.get("browser_is_enabled")!.handler;
      await handler({ selector: "#submit" });

      expect(execBrowser).toHaveBeenCalledWith("is_enabled", { selector: "#submit" }, undefined);
    });

    it("browser_is_checked should pass selector", async () => {
      const handler = registeredTools.get("browser_is_checked")!.handler;
      await handler({ selector: "#checkbox" });

      expect(execBrowser).toHaveBeenCalledWith("is_checked", { selector: "#checkbox" }, undefined);
    });
  });

  describe("screenshot and PDF tools handlers", () => {
    it("browser_screenshot should pass all options", async () => {
      const handler = registeredTools.get("browser_screenshot")!.handler;
      await handler({
        path: "/tmp/screenshot.png",
        selector: "#chart",
        fullPage: true,
        sessionId: "sess-1",
      });

      expect(execBrowser).toHaveBeenCalledWith(
        "screenshot",
        { path: "/tmp/screenshot.png", selector: "#chart", fullPage: true },
        "sess-1"
      );
    });

    it("browser_pdf should pass path", async () => {
      const handler = registeredTools.get("browser_pdf")!.handler;
      await handler({ path: "/tmp/page.pdf" });

      expect(execBrowser).toHaveBeenCalledWith("pdf", { path: "/tmp/page.pdf" }, undefined);
    });
  });

  describe("session management tools handlers", () => {
    it("browser_new_session should pass viewport config", async () => {
      const handler = registeredTools.get("browser_new_session")!.handler;
      await handler({ viewport: { width: 1920, height: 1080 } });

      expect(execBrowser).toHaveBeenCalledWith(
        "new_session",
        { viewport: { width: 1920, height: 1080 } }
      );
    });

    it("browser_close_session should pass sessionId", async () => {
      const handler = registeredTools.get("browser_close_session")!.handler;
      await handler({ sessionId: "sess-to-close" });

      expect(execBrowser).toHaveBeenCalledWith("close_session", {}, "sess-to-close");
    });
  });

  describe("wait tools handlers", () => {
    it("browser_wait_for_selector should pass all options", async () => {
      const handler = registeredTools.get("browser_wait_for_selector")!.handler;
      await handler({
        selector: "#loaded",
        timeout: 5000,
        state: "visible",
      });

      expect(execBrowser).toHaveBeenCalledWith(
        "wait_for_selector",
        { selector: "#loaded", timeout: 5000, state: "visible" },
        undefined
      );
    });

    it("browser_wait_for_navigation should pass timeout", async () => {
      const handler = registeredTools.get("browser_wait_for_navigation")!.handler;
      await handler({ timeout: 30000 });

      expect(execBrowser).toHaveBeenCalledWith(
        "wait_for_navigation",
        { timeout: 30000 },
        undefined
      );
    });
  });

  describe("cookie and storage tools handlers", () => {
    it("browser_get_cookies should pass URLs", async () => {
      const handler = registeredTools.get("browser_get_cookies")!.handler;
      await handler({ urls: ["https://example.com", "https://api.example.com"] });

      expect(execBrowser).toHaveBeenCalledWith(
        "get_cookies",
        { urls: ["https://example.com", "https://api.example.com"] },
        undefined
      );
    });

    it("browser_set_cookies should pass cookie array", async () => {
      const handler = registeredTools.get("browser_set_cookies")!.handler;
      const cookies = [
        { name: "session", value: "abc123", domain: ".example.com" },
        { name: "pref", value: "dark", httpOnly: true },
      ];
      await handler({ cookies });

      expect(execBrowser).toHaveBeenCalledWith("set_cookies", { cookies }, undefined);
    });

    it("browser_clear_cookies should call execBrowser", async () => {
      const handler = registeredTools.get("browser_clear_cookies")!.handler;
      await handler({});

      expect(execBrowser).toHaveBeenCalledWith("clear_cookies", {}, undefined);
    });
  });

  describe("JavaScript and debugging tools handlers", () => {
    it("browser_evaluate should pass script", async () => {
      const handler = registeredTools.get("browser_evaluate")!.handler;
      await handler({ script: "document.title" });

      expect(execBrowser).toHaveBeenCalledWith(
        "evaluate",
        { script: "document.title" },
        undefined
      );
    });

    it("browser_get_console should call execBrowser", async () => {
      const handler = registeredTools.get("browser_get_console")!.handler;
      await handler({ sessionId: "sess-1" });

      expect(execBrowser).toHaveBeenCalledWith("get_console", {}, "sess-1");
    });

    it("browser_get_network should call execBrowser", async () => {
      const handler = registeredTools.get("browser_get_network")!.handler;
      await handler({});

      expect(execBrowser).toHaveBeenCalledWith("get_network", {}, undefined);
    });
  });

  describe("error handling", () => {
    it("should propagate errors from execBrowser", async () => {
      vi.mocked(execBrowser).mockRejectedValueOnce(new Error("Browser error"));

      const handler = registeredTools.get("browser_navigate")!.handler;
      await expect(handler({ url: "https://example.com" })).rejects.toThrow("Browser error");
    });
  });
});
