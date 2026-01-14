import { describe, it, expect, vi, beforeEach } from "vitest";
import { EventEmitter } from "events";

// Create mock spawn function at module level
const mockSpawn = vi.fn();
vi.mock("child_process", () => ({
  spawn: mockSpawn,
}));

// Helper to create mock process
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

describe("executor", () => {
  beforeEach(() => {
    vi.resetModules();
    mockSpawn.mockReset();
  });

  describe("execBrowser", () => {
    it("should execute a simple command", async () => {
      const mockProc = createMockProcess();
      mockSpawn.mockReturnValue(mockProc);

      const { execBrowser } = await import("../src/tools/executor.js");

      const resultPromise = execBrowser("navigate", { url: "https://example.com" });
      mockProc.stdout.emit("data", "Navigation successful");

      const result = await resultPromise;

      expect(result).toBe("Navigation successful");
      expect(mockSpawn).toHaveBeenCalledWith(
        "agent-browser",
        ["navigate", "--url", "https://example.com"],
        expect.any(Object)
      );
    });

    it("should include session ID when provided", async () => {
      const mockProc = createMockProcess();
      mockSpawn.mockReturnValue(mockProc);

      const { execBrowser } = await import("../src/tools/executor.js");

      const resultPromise = execBrowser("click", { selector: "#btn" }, "session-123");
      mockProc.stdout.emit("data", "Clicked");

      await resultPromise;

      expect(mockSpawn).toHaveBeenCalledWith(
        "agent-browser",
        ["click", "--session", "session-123", "--selector", "#btn"],
        expect.objectContaining({
          env: expect.objectContaining({
            AGENT_BROWSER_SESSION: "session-123",
          }),
        })
      );
    });

    it("should handle boolean options correctly", async () => {
      const mockProc = createMockProcess();
      mockSpawn.mockReturnValue(mockProc);

      const { execBrowser } = await import("../src/tools/executor.js");

      const resultPromise = execBrowser("screenshot", { fullPage: true, path: "/tmp/shot.png" });
      mockProc.stdout.emit("data", "Screenshot saved");

      await resultPromise;

      const callArgs = mockSpawn.mock.calls[0][1];
      expect(callArgs).toContain("--full-page");
      expect(callArgs).toContain("--path");
      expect(callArgs).toContain("/tmp/shot.png");
    });

    it("should handle array options as JSON", async () => {
      const mockProc = createMockProcess();
      mockSpawn.mockReturnValue(mockProc);

      const { execBrowser } = await import("../src/tools/executor.js");

      const cookies = [{ name: "session", value: "abc123" }];
      const resultPromise = execBrowser("set_cookies", { cookies });
      mockProc.stdout.emit("data", "Cookies set");

      await resultPromise;

      expect(mockSpawn).toHaveBeenCalledWith(
        "agent-browser",
        ["set_cookies", "--cookies", JSON.stringify(cookies)],
        expect.any(Object)
      );
    });

    it("should handle object options as JSON", async () => {
      const mockProc = createMockProcess();
      mockSpawn.mockReturnValue(mockProc);

      const { execBrowser } = await import("../src/tools/executor.js");

      const viewport = { width: 1920, height: 1080 };
      const resultPromise = execBrowser("new_session", { viewport });
      mockProc.stdout.emit("data", "Session created");

      await resultPromise;

      expect(mockSpawn).toHaveBeenCalledWith(
        "agent-browser",
        ["new_session", "--viewport", JSON.stringify(viewport)],
        expect.any(Object)
      );
    });

    it("should skip null and undefined options", async () => {
      const mockProc = createMockProcess();
      mockSpawn.mockReturnValue(mockProc);

      const { execBrowser } = await import("../src/tools/executor.js");

      const resultPromise = execBrowser("get_text", { selector: null, other: undefined } as any);
      mockProc.stdout.emit("data", "Page text");

      await resultPromise;

      expect(mockSpawn).toHaveBeenCalledWith("agent-browser", ["get_text"], expect.any(Object));
    });

    it("should convert camelCase to kebab-case", async () => {
      const mockProc = createMockProcess();
      mockSpawn.mockReturnValue(mockProc);

      const { execBrowser } = await import("../src/tools/executor.js");

      const resultPromise = execBrowser("screenshot", { fullPage: true });
      mockProc.stdout.emit("data", "Done");

      await resultPromise;

      const callArgs = mockSpawn.mock.calls[0][1];
      expect(callArgs).toContain("--full-page");
      expect(callArgs).not.toContain("--fullPage");
    });

    it("should reject on non-zero exit code", async () => {
      const mockProc = createMockProcess(1);
      mockSpawn.mockReturnValue(mockProc);

      const { execBrowser } = await import("../src/tools/executor.js");

      const resultPromise = execBrowser("navigate", { url: "invalid" });
      mockProc.stderr.emit("data", "Invalid URL");

      await expect(resultPromise).rejects.toThrow("agent-browser exited with code 1");
    });

    it("should reject on spawn error", async () => {
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

      const resultPromise = execBrowser("navigate", { url: "https://example.com" });

      await expect(resultPromise).rejects.toThrow("Failed to execute agent-browser");
    });

    it("should return default message when stdout is empty", async () => {
      const mockProc = createMockProcess();
      mockSpawn.mockReturnValue(mockProc);

      const { execBrowser } = await import("../src/tools/executor.js");

      const resultPromise = execBrowser("click", { selector: "#btn" });
      // No stdout data emitted

      const result = await resultPromise;
      expect(result).toBe("Command executed successfully");
    });

    it("should accumulate multiple stdout chunks", async () => {
      const mockProc = createMockProcess();
      mockSpawn.mockReturnValue(mockProc);

      const { execBrowser } = await import("../src/tools/executor.js");

      const resultPromise = execBrowser("get_html", {});
      mockProc.stdout.emit("data", "<html>");
      mockProc.stdout.emit("data", "<body>");
      mockProc.stdout.emit("data", "</body></html>");

      const result = await resultPromise;
      expect(result).toBe("<html><body></body></html>");
    });

    it("should not include false boolean options", async () => {
      const mockProc = createMockProcess();
      mockSpawn.mockReturnValue(mockProc);

      const { execBrowser } = await import("../src/tools/executor.js");

      const resultPromise = execBrowser("screenshot", { fullPage: false });
      mockProc.stdout.emit("data", "Done");

      await resultPromise;

      const callArgs = mockSpawn.mock.calls[0][1];
      expect(callArgs).not.toContain("--full-page");
    });

    it("should handle numeric options", async () => {
      const mockProc = createMockProcess();
      mockSpawn.mockReturnValue(mockProc);

      const { execBrowser } = await import("../src/tools/executor.js");

      const resultPromise = execBrowser("scroll", { amount: 500, direction: "down" });
      mockProc.stdout.emit("data", "Scrolled");

      await resultPromise;

      expect(mockSpawn).toHaveBeenCalledWith(
        "agent-browser",
        expect.arrayContaining(["--amount", "500", "--direction", "down"]),
        expect.any(Object)
      );
    });
  });

  describe("checkAgentBrowser", () => {
    it("should return true when agent-browser is available", async () => {
      const mockProc = createMockProcess();
      mockSpawn.mockReturnValue(mockProc);

      const { checkAgentBrowser } = await import("../src/tools/executor.js");

      const resultPromise = checkAgentBrowser();
      mockProc.stdout.emit("data", "1.0.0");

      const result = await resultPromise;
      expect(result).toBe(true);
    });

    it("should return false when agent-browser fails", async () => {
      const mockProc = createMockProcess(1);
      mockSpawn.mockReturnValue(mockProc);

      const { checkAgentBrowser } = await import("../src/tools/executor.js");

      const result = await checkAgentBrowser();
      expect(result).toBe(false);
    });

    it("should return false when spawn error occurs", async () => {
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

      const { checkAgentBrowser } = await import("../src/tools/executor.js");

      const result = await checkAgentBrowser();
      expect(result).toBe(false);
    });
  });

  describe("environment configuration", () => {
    it("should use default agent-browser command", async () => {
      const mockProc = createMockProcess();
      mockSpawn.mockReturnValue(mockProc);

      const { execBrowser } = await import("../src/tools/executor.js");

      const resultPromise = execBrowser("navigate", { url: "https://example.com" });
      mockProc.stdout.emit("data", "Done");

      await resultPromise;

      expect(mockSpawn).toHaveBeenCalledWith("agent-browser", expect.any(Array), expect.any(Object));
    });
  });
});
