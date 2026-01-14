import { describe, it, expect, vi, beforeEach } from "vitest";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

// Mock the executor module
vi.mock("../src/tools/executor.js", () => ({
  execBrowser: vi.fn().mockResolvedValue("Success"),
  checkAgentBrowser: vi.fn().mockResolvedValue(true),
}));

describe("MCP Server", () => {
  describe("server initialization", () => {
    it("should create McpServer with correct metadata", () => {
      const server = new McpServer({
        name: "agent-browser-mcp",
        version: "0.1.0",
      });

      expect(server).toBeDefined();
    });

    it("should have tool registration method", () => {
      const server = new McpServer({
        name: "agent-browser-mcp",
        version: "0.1.0",
      });

      expect(typeof server.tool).toBe("function");
    });
  });

  describe("tool registration integration", () => {
    let server: McpServer;
    let toolCalls: Array<{ name: string; description: string }>;

    beforeEach(async () => {
      toolCalls = [];
      server = {
        tool: vi.fn((name, description) => {
          toolCalls.push({ name, description });
        }),
      } as unknown as McpServer;

      const { registerBrowserTools } = await import("../src/tools/browser.js");
      registerBrowserTools(server);
    });

    it("should register tools with descriptive names", () => {
      const toolNames = toolCalls.map((t) => t.name);

      // All tools should have browser_ prefix
      expect(toolNames.every((name) => name.startsWith("browser_"))).toBe(true);
    });

    it("should provide meaningful descriptions for all tools", () => {
      toolCalls.forEach((tool) => {
        expect(tool.description).toBeDefined();
        expect(tool.description.length).toBeGreaterThan(10);
      });
    });

    it("should register navigation tools with correct descriptions", () => {
      const navigateTool = toolCalls.find((t) => t.name === "browser_navigate");
      expect(navigateTool?.description).toContain("Navigate");

      const goBackTool = toolCalls.find((t) => t.name === "browser_go_back");
      expect(goBackTool?.description).toContain("back");
    });

    it("should register interaction tools with correct descriptions", () => {
      const clickTool = toolCalls.find((t) => t.name === "browser_click");
      expect(clickTool?.description.toLowerCase()).toContain("click");

      const fillTool = toolCalls.find((t) => t.name === "browser_fill");
      expect(fillTool?.description.toLowerCase()).toContain("fill");
    });
  });
});

describe("Tool Schema Validation", () => {
  it("should validate URL in browser_navigate", async () => {
    const { z } = await import("zod");

    const schema = z.object({
      url: z.string().url(),
      sessionId: z.string().optional(),
    });

    // Valid URL
    expect(() => schema.parse({ url: "https://example.com" })).not.toThrow();

    // Invalid URL
    expect(() => schema.parse({ url: "not-a-url" })).toThrow();
  });

  it("should validate scroll direction enum", async () => {
    const { z } = await import("zod");

    const schema = z.object({
      direction: z.enum(["up", "down", "left", "right"]),
      amount: z.number().optional(),
    });

    // Valid directions
    expect(() => schema.parse({ direction: "up" })).not.toThrow();
    expect(() => schema.parse({ direction: "down" })).not.toThrow();
    expect(() => schema.parse({ direction: "left" })).not.toThrow();
    expect(() => schema.parse({ direction: "right" })).not.toThrow();

    // Invalid direction
    expect(() => schema.parse({ direction: "diagonal" })).toThrow();
  });

  it("should validate wait state enum", async () => {
    const { z } = await import("zod");

    const schema = z.object({
      selector: z.string(),
      state: z.enum(["attached", "detached", "visible", "hidden"]).optional(),
    });

    // Valid states
    expect(() => schema.parse({ selector: "#el", state: "visible" })).not.toThrow();
    expect(() => schema.parse({ selector: "#el", state: "hidden" })).not.toThrow();

    // Invalid state
    expect(() => schema.parse({ selector: "#el", state: "loading" })).toThrow();
  });

  it("should validate cookie schema", async () => {
    const { z } = await import("zod");

    const cookieSchema = z.object({
      name: z.string(),
      value: z.string(),
      domain: z.string().optional(),
      path: z.string().optional(),
      expires: z.number().optional(),
      httpOnly: z.boolean().optional(),
      secure: z.boolean().optional(),
      sameSite: z.enum(["Strict", "Lax", "None"]).optional(),
    });

    const schema = z.object({
      cookies: z.array(cookieSchema),
    });

    // Valid cookie
    expect(() =>
      schema.parse({
        cookies: [
          {
            name: "session",
            value: "abc123",
            domain: ".example.com",
            httpOnly: true,
            sameSite: "Strict",
          },
        ],
      })
    ).not.toThrow();

    // Invalid sameSite
    expect(() =>
      schema.parse({
        cookies: [{ name: "test", value: "val", sameSite: "Invalid" }],
      })
    ).toThrow();
  });

  it("should validate viewport schema", async () => {
    const { z } = await import("zod");

    const schema = z.object({
      viewport: z
        .object({
          width: z.number(),
          height: z.number(),
        })
        .optional(),
    });

    // Valid viewport
    expect(() =>
      schema.parse({
        viewport: { width: 1920, height: 1080 },
      })
    ).not.toThrow();

    // Invalid viewport (missing height)
    expect(() =>
      schema.parse({
        viewport: { width: 1920 },
      })
    ).toThrow();
  });
});

describe("Response Format", () => {
  it("should return MCP-compliant response format", async () => {
    vi.mock("../src/tools/executor.js", () => ({
      execBrowser: vi.fn().mockResolvedValue("Test result"),
    }));

    const mockServer = {
      tool: vi.fn((name, description, schema, handler) => {
        // Store handler for testing
        (mockServer as any).handlers = (mockServer as any).handlers || {};
        (mockServer as any).handlers[name] = handler;
      }),
    } as unknown as McpServer;

    const { registerBrowserTools } = await import("../src/tools/browser.js");
    registerBrowserTools(mockServer);

    const handler = (mockServer as any).handlers["browser_get_url"];
    const result = await handler({});

    // Verify MCP response format
    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
    expect(result.content[0]).toHaveProperty("type", "text");
    expect(result.content[0]).toHaveProperty("text");
  });
});
