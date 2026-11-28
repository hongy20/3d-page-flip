import { describe, expect, it } from "vitest";
import {
  DEFAULT_SETTINGS,
  SETTINGS_STORAGE_KEY,
  type StorageLike,
  evaluateSettingsCapabilities,
  readSettings,
  sanitizeReturnUrl,
  writeSettings,
} from "./settingsStore";

function createMemoryStorage(initial?: Record<string, string>): StorageLike {
  const map = new Map<string, string>(Object.entries(initial ?? {}));
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => {
      map.set(key, value);
    },
  };
}

describe("readSettings", () => {
  it("returns defaults when storage is empty, null, or malformed", () => {
    expect(readSettings(null)).toEqual(DEFAULT_SETTINGS);
    expect(readSettings(createMemoryStorage())).toEqual(DEFAULT_SETTINGS);
    expect(readSettings(createMemoryStorage({ [SETTINGS_STORAGE_KEY]: "{bad json" }))).toEqual(
      DEFAULT_SETTINGS,
    );
    expect(readSettings(createMemoryStorage({ [SETTINGS_STORAGE_KEY]: "[]" }))).toEqual(
      DEFAULT_SETTINGS,
    );
  });

  it("validates individual fields and ignores unknown values", () => {
    const partialInvalid = createMemoryStorage({
      [SETTINGS_STORAGE_KEY]: JSON.stringify({ mode: "curl", portraitLayout: "diagonal" }),
    });
    expect(readSettings(partialInvalid)).toEqual({ mode: "curl", portraitLayout: "horizontal" });
  });

  it("falls back to defaults when storage throws", () => {
    const throwingStorage: StorageLike = {
      getItem: () => {
        throw new Error("SecurityError");
      },
      setItem: () => {
        throw new Error("QuotaExceededError");
      },
    };
    expect(readSettings(throwingStorage)).toEqual(DEFAULT_SETTINGS);
  });
});

describe("writeSettings", () => {
  it("persists partial updates and preserves untouched valid fields", () => {
    const storage = createMemoryStorage();
    expect(writeSettings({ mode: "stack" }, storage)).toEqual({
      mode: "stack",
      portraitLayout: "horizontal",
    });
    expect(writeSettings({ portraitLayout: "vertical" }, storage)).toEqual({
      mode: "stack",
      portraitLayout: "vertical",
    });
    expect(readSettings(storage)).toEqual({
      mode: "stack",
      portraitLayout: "vertical",
    });
  });

  it("ignores invalid partial values and swallows storage write errors", () => {
    const throwingStorage: StorageLike = {
      getItem: () => null,
      setItem: () => {
        throw new Error("QuotaExceededError");
      },
    };
    expect(
      writeSettings(
        { mode: "invalid" as unknown as "slide", portraitLayout: "vertical" },
        throwingStorage,
      ),
    ).toEqual({
      mode: "slide",
      portraitLayout: "vertical",
    });
  });
});

describe("sanitizeReturnUrl", () => {
  it("keeps valid relative ./ app links", () => {
    expect(sanitizeReturnUrl("./")).toBe("./");
    expect(sanitizeReturnUrl("./reader.html")).toBe("./reader.html");
    expect(sanitizeReturnUrl("./reader.html?book=malaga")).toBe("./reader.html?book=malaga");
  });

  it("rejects external, protocol-relative, parent-traversal, and invalid URLs", () => {
    expect(sanitizeReturnUrl(null)).toBe("./");
    expect(sanitizeReturnUrl("")).toBe("./");
    expect(sanitizeReturnUrl("https://evil.example/")).toBe("./");
    expect(sanitizeReturnUrl("//evil.example/")).toBe("./");
    expect(sanitizeReturnUrl("javascript:alert(1)")).toBe("./");
    expect(sanitizeReturnUrl("../outside.html")).toBe("./");
    expect(sanitizeReturnUrl("./../outside.html")).toBe("./");
    expect(sanitizeReturnUrl("./reader.html\\evil")).toBe("./");
  });
});

describe("evaluateSettingsCapabilities", () => {
  it("enables all options when view(), HTML-in-Canvas, and portrait are supported", () => {
    expect(
      evaluateSettingsCapabilities({
        supportsViewTimeline: true,
        supportsHtmlInCanvas: true,
        isPortrait: true,
      }),
    ).toEqual({
      mode: {
        slide: { disabled: false, reason: null },
        stack: { disabled: false, reason: null },
        curl: { disabled: false, reason: null },
      },
      portraitLayout: {
        horizontal: { disabled: false, reason: null },
        vertical: { disabled: false, reason: null },
      },
    });
  });

  it("disables stack and curl without view(), curl without HTML-in-Canvas, and vertical in landscape", () => {
    const result = evaluateSettingsCapabilities({
      supportsViewTimeline: false,
      supportsHtmlInCanvas: false,
      isPortrait: false,
      missingHtmlInCanvas: ['<canvas content="drawable">'],
    });
    expect(result.mode.slide.disabled).toBe(false);
    expect(result.mode.stack.disabled).toBe(true);
    expect(result.mode.stack.reason).toContain("view()");
    expect(result.mode.curl.disabled).toBe(true);
    expect(result.mode.curl.reason).toContain("HTML-in-Canvas");
    expect(result.portraitLayout.horizontal.disabled).toBe(false);
    expect(result.portraitLayout.vertical.disabled).toBe(true);
    expect(result.portraitLayout.vertical.reason).toContain("landscape");

    const missingHtmlOnly = evaluateSettingsCapabilities({
      supportsViewTimeline: true,
      supportsHtmlInCanvas: false,
      isPortrait: true,
      missingHtmlInCanvas: ['<canvas content="drawable">'],
    });
    expect(missingHtmlOnly.mode.stack.disabled).toBe(false);
    expect(missingHtmlOnly.mode.curl.disabled).toBe(true);
    expect(missingHtmlOnly.mode.curl.reason).toContain('<canvas content="drawable">');
    expect(missingHtmlOnly.portraitLayout.vertical.disabled).toBe(false);
  });
});
