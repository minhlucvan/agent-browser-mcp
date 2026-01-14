import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { EventEmitter } from "events";

// Create a shared mock process factory
function createMockProcess(exitCode = 0) {
  const stdout = new EventEmitter();
  const stderr = new EventEmitter();

  const mockProc = {
    stdout,
    stderr,
    on: vi.fn((event: string, callback: Function) => {
      if (event === "close") {
        setImmediate(() => callback(exitCode));
      }
      return mockProc;
    }),
  };

  return mockProc;
}

// Mock child_process at module level with factory
const mockSpawn = vi.fn();
vi.mock("child_process", () => ({
  spawn: mockSpawn,
}));

describe("Integration Tests", () => {
  beforeEach(() => {
    vi.resetModules();
    mockSpawn.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Full workflow scenarios", () => {
    it("should handle a complete navigation workflow", async () => {
      const mockProc = createMockProcess();
      mockSpawn.mockReturnValue(mockProc);

      const { execBrowser } = await import("../src/tools/executor.js");

      const navPromise = execBrowser("navigate", { url: "https://example.com" });
      mockProc.stdout.emit("data", "Navigated to https://example.com");
      const navResult = await navPromise;

      expect(navResult).toContain("Navigated");
      expect(mockSpawn).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining(["navigate", "--url", "https://example.com"]),
        expect.any(Object)
      );
    });

    it("should handle form filling workflow", async () => {
      const mockProc = createMockProcess();
      mockSpawn.mockReturnValue(mockProc);

      const { execBrowser } = await import("../src/tools/executor.js");

      // Fill email field
      const fillPromise = execBrowser("fill", {
        selector: "#email",
        value: "test@example.com",
      });
      mockProc.stdout.emit("data", "Filled #email");
      await fillPromise;

      expect(mockSpawn).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining(["fill", "--selector", "#email", "--value", "test@example.com"]),
        expect.any(Object)
      );
    });

    it("should handle screenshot workflow", async () => {
      const mockProc = createMockProcess();
      mockSpawn.mockReturnValue(mockProc);

      const { execBrowser } = await import("../src/tools/executor.js");

      const screenshotPromise = execBrowser("screenshot", {
        path: "/tmp/test-screenshot.png",
        fullPage: true,
      });
      mockProc.stdout.emit("data", "Screenshot saved to /tmp/test-screenshot.png");
      const result = await screenshotPromise;

      expect(result).toContain("Screenshot saved");
      expect(mockSpawn).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining(["screenshot", "--path", "/tmp/test-screenshot.png", "--full-page"]),
        expect.any(Object)
      );
    });

    it("should handle session management", async () => {
      const mockProc = createMockProcess();
      mockSpawn.mockReturnValue(mockProc);

      const { execBrowser } = await import("../src/tools/executor.js");

      // Create new session
      const createPromise = execBrowser("new_session", {
        viewport: { width: 1920, height: 1080 },
      });
      mockProc.stdout.emit("data", "session-abc123");
      const sessionId = await createPromise;

      expect(sessionId).toBe("session-abc123");
    });

    it("should pass sessionId to execBrowser", async () => {
      const mockProc = createMockProcess();
      mockSpawn.mockReturnValue(mockProc);

      const { execBrowser } = await import("../src/tools/executor.js");

      const navPromise = execBrowser("navigate", { url: "https://example.com" }, "sess-123");
      mockProc.stdout.emit("data", "Navigated");
      await navPromise;

      expect(mockSpawn).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining(["navigate", "--session", "sess-123"]),
        expect.objectContaining({
          env: expect.objectContaining({
            AGENT_BROWSER_SESSION: "sess-123",
          }),
        })
      );
    });
  });

  describe("Error scenarios", () => {
    it("should handle element not found error", async () => {
      const mockProc = createMockProcess(1);
      mockSpawn.mockReturnValue(mockProc);

      const { execBrowser } = await import("../src/tools/executor.js");

      const clickPromise = execBrowser("click", { selector: "#non-existent" });
      mockProc.stderr.emit("data", "Element not found: #non-existent");

      await expect(clickPromise).rejects.toThrow("Element not found");
    });

    it("should handle navigation timeout", async () => {
      const mockProc = createMockProcess(1);
      mockSpawn.mockReturnValue(mockProc);

      const { execBrowser } = await import("../src/tools/executor.js");

      const navPromise = execBrowser("wait_for_navigation", { timeout: 100 });
      mockProc.stderr.emit("data", "Timeout exceeded");

      await expect(navPromise).rejects.toThrow("Timeout");
    });

    it("should handle invalid selector", async () => {
      const mockProc = createMockProcess(1);
      mockSpawn.mockReturnValue(mockProc);

      const { execBrowser } = await import("../src/tools/executor.js");

      const clickPromise = execBrowser("click", { selector: "::invalid::" });
      mockProc.stderr.emit("data", "Invalid selector syntax");

      await expect(clickPromise).rejects.toThrow("Invalid selector");
    });

    it("should handle spawn error", async () => {
      const stdout = new EventEmitter();
      const stderr = new EventEmitter();

      const mockProc = {
        stdout,
        stderr,
        on: vi.fn((event: string, callback: Function) => {
          if (event === "error") {
            setImmediate(() => callback(new Error("Command not found")));
          }
          return mockProc;
        }),
      };
      mockSpawn.mockReturnValue(mockProc);

      const { execBrowser } = await import("../src/tools/executor.js");

      const promise = execBrowser("navigate", { url: "https://example.com" });
      await expect(promise).rejects.toThrow("Failed to execute agent-browser");
    });
  });

  describe("Concurrent operations", () => {
    it("should handle multiple parallel operations", async () => {
      // Create separate mock processes for each call
      const mockProcs = [createMockProcess(), createMockProcess(), createMockProcess()];
      let callIndex = 0;
      mockSpawn.mockImplementation(() => mockProcs[callIndex++]);

      const { execBrowser } = await import("../src/tools/executor.js");

      // Start multiple operations in parallel
      const operations = [
        execBrowser("get_url", {}),
        execBrowser("get_title", {}),
        execBrowser("get_text", {}),
      ];

      // Emit results for each
      mockProcs[0].stdout.emit("data", "https://example.com");
      mockProcs[1].stdout.emit("data", "Example Domain");
      mockProcs[2].stdout.emit("data", "Hello World");

      const results = await Promise.all(operations);

      expect(results).toHaveLength(3);
      expect(results[0]).toBe("https://example.com");
      expect(results[1]).toBe("Example Domain");
      expect(results[2]).toBe("Hello World");
    });
  });
});

describe("Edge Cases", () => {
  beforeEach(() => {
    vi.resetModules();
    mockSpawn.mockReset();
  });

  describe("Special characters handling", () => {
    it("should handle selectors with special characters", async () => {
      const mockProc = createMockProcess();
      mockSpawn.mockReturnValue(mockProc);

      const { execBrowser } = await import("../src/tools/executor.js");

      const promise = execBrowser("click", {
        selector: '[data-testid="submit-btn"]',
      });
      mockProc.stdout.emit("data", "Clicked");
      await promise;

      expect(mockSpawn).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining(["--selector", '[data-testid="submit-btn"]']),
        expect.any(Object)
      );
    });

    it("should handle URLs with query parameters", async () => {
      const mockProc = createMockProcess();
      mockSpawn.mockReturnValue(mockProc);

      const { execBrowser } = await import("../src/tools/executor.js");

      const promise = execBrowser("navigate", {
        url: "https://example.com/search?q=hello&page=1",
      });
      mockProc.stdout.emit("data", "Navigated");
      await promise;

      expect(mockSpawn).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining(["--url", "https://example.com/search?q=hello&page=1"]),
        expect.any(Object)
      );
    });

    it("should handle text with newlines", async () => {
      const mockProc = createMockProcess();
      mockSpawn.mockReturnValue(mockProc);

      const { execBrowser } = await import("../src/tools/executor.js");

      const promise = execBrowser("fill", {
        selector: "#textarea",
        value: "Line 1\nLine 2\nLine 3",
      });
      mockProc.stdout.emit("data", "Filled");
      await promise;

      expect(mockSpawn).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining(["--value", "Line 1\nLine 2\nLine 3"]),
        expect.any(Object)
      );
    });

    it("should handle unicode characters", async () => {
      const mockProc = createMockProcess();
      mockSpawn.mockReturnValue(mockProc);

      const { execBrowser } = await import("../src/tools/executor.js");

      const promise = execBrowser("type", {
        selector: "#input",
        text: "Hello 世界",
      });
      mockProc.stdout.emit("data", "Typed");
      await promise;

      expect(mockSpawn).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining(["--text", "Hello 世界"]),
        expect.any(Object)
      );
    });
  });

  describe("Empty and null values", () => {
    it("should handle empty string values", async () => {
      const mockProc = createMockProcess();
      mockSpawn.mockReturnValue(mockProc);

      const { execBrowser } = await import("../src/tools/executor.js");

      const promise = execBrowser("fill", {
        selector: "#input",
        value: "",
      });
      mockProc.stdout.emit("data", "Cleared");
      await promise;

      expect(mockSpawn).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining(["--value", ""]),
        expect.any(Object)
      );
    });

    it("should handle empty response from browser", async () => {
      const mockProc = createMockProcess();
      mockSpawn.mockReturnValue(mockProc);

      const { execBrowser } = await import("../src/tools/executor.js");

      const promise = execBrowser("get_text", { selector: "#empty" });
      // Don't emit any stdout data - let it close with empty output

      const result = await promise;
      expect(result).toBe("Command executed successfully");
    });
  });

  describe("Large data handling", () => {
    it("should handle large HTML response", async () => {
      const mockProc = createMockProcess();
      mockSpawn.mockReturnValue(mockProc);

      const { execBrowser } = await import("../src/tools/executor.js");

      const promise = execBrowser("get_html", {});

      // Simulate large HTML response
      const largeHtml = "<html>" + "<div>".repeat(10000) + "</div>".repeat(10000) + "</html>";
      mockProc.stdout.emit("data", largeHtml);

      const result = await promise;
      expect(result.length).toBeGreaterThan(100000);
    });

    it("should handle multiple cookies", async () => {
      const mockProc = createMockProcess();
      mockSpawn.mockReturnValue(mockProc);

      const { execBrowser } = await import("../src/tools/executor.js");

      const cookies = Array.from({ length: 50 }, (_, i) => ({
        name: `cookie_${i}`,
        value: `value_${i}`,
        domain: ".example.com",
      }));

      const promise = execBrowser("set_cookies", { cookies });
      mockProc.stdout.emit("data", "50 cookies set");

      const result = await promise;
      expect(result).toContain("50 cookies");

      // Verify cookies were passed as JSON
      expect(mockSpawn).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining(["--cookies", JSON.stringify(cookies)]),
        expect.any(Object)
      );
    });
  });

  describe("Boolean and object options", () => {
    it("should only include boolean flag when true", async () => {
      const mockProc = createMockProcess();
      mockSpawn.mockReturnValue(mockProc);

      const { execBrowser } = await import("../src/tools/executor.js");

      const promise = execBrowser("screenshot", { fullPage: true });
      mockProc.stdout.emit("data", "Done");
      await promise;

      expect(mockSpawn).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining(["--full-page"]),
        expect.any(Object)
      );
    });

    it("should not include boolean flag when false", async () => {
      const mockProc = createMockProcess();
      mockSpawn.mockReturnValue(mockProc);

      const { execBrowser } = await import("../src/tools/executor.js");

      const promise = execBrowser("screenshot", { fullPage: false, path: "/tmp/shot.png" });
      mockProc.stdout.emit("data", "Done");
      await promise;

      const callArgs = mockSpawn.mock.calls[0][1];
      expect(callArgs).not.toContain("--full-page");
      expect(callArgs).toContain("--path");
    });

    it("should pass viewport as JSON object", async () => {
      const mockProc = createMockProcess();
      mockSpawn.mockReturnValue(mockProc);

      const { execBrowser } = await import("../src/tools/executor.js");

      const viewport = { width: 1920, height: 1080 };
      const promise = execBrowser("new_session", { viewport });
      mockProc.stdout.emit("data", "session-123");
      await promise;

      expect(mockSpawn).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining(["--viewport", JSON.stringify(viewport)]),
        expect.any(Object)
      );
    });
  });
});

describe("CamelCase to kebab-case conversion", () => {
  beforeEach(() => {
    vi.resetModules();
    mockSpawn.mockReset();
  });

  it("should convert camelCase options to kebab-case flags", async () => {
    const mockProc = createMockProcess();
    mockSpawn.mockReturnValue(mockProc);

    const { execBrowser } = await import("../src/tools/executor.js");

    const promise = execBrowser("screenshot", { fullPage: true });
    mockProc.stdout.emit("data", "Done");
    await promise;

    const callArgs = mockSpawn.mock.calls[0][1];
    expect(callArgs).toContain("--full-page");
    expect(callArgs).not.toContain("--fullPage");
  });
});
