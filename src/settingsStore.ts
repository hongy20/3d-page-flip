export type TransitionMode = "slide" | "stack" | "curl";
export type PortraitLayout = "horizontal" | "vertical";

export interface ReaderSettings {
  readonly mode: TransitionMode;
  readonly portraitLayout: PortraitLayout;
}

export type StorageLike = Pick<Storage, "getItem" | "setItem">;

export interface SettingsCapabilityProbes {
  readonly supportsViewTimeline: boolean;
  readonly supportsHtmlInCanvas: boolean;
  readonly isPortrait: boolean;
  readonly missingHtmlInCanvas?: readonly string[];
}

export interface OptionCapability {
  readonly disabled: boolean;
  readonly reason: string | null;
}

export interface SettingsCapabilities {
  readonly mode: Record<TransitionMode, OptionCapability>;
  readonly portraitLayout: Record<PortraitLayout, OptionCapability>;
}

export const SETTINGS_STORAGE_KEY = "dropp:reader-settings";

export const DEFAULT_SETTINGS: ReaderSettings = {
  mode: "slide",
  portraitLayout: "horizontal",
};

function isTransitionMode(value: unknown): value is TransitionMode {
  return value === "slide" || value === "stack" || value === "curl";
}

function isPortraitLayout(value: unknown): value is PortraitLayout {
  return value === "horizontal" || value === "vertical";
}

function resolveStorage(storage?: StorageLike | null): StorageLike | null {
  if (storage !== undefined) {
    return storage;
  }
  try {
    return typeof globalThis !== "undefined" && "localStorage" in globalThis
      ? globalThis.localStorage
      : null;
  } catch {
    return null;
  }
}

/**
 * Reads and validates persisted reader preferences, falling back cleanly to defaults.
 */
export function readSettings(storage?: StorageLike | null): ReaderSettings {
  const target = resolveStorage(storage);
  if (!target) {
    return { ...DEFAULT_SETTINGS };
  }

  try {
    const raw = target.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) {
      return { ...DEFAULT_SETTINGS };
    }
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return { ...DEFAULT_SETTINGS };
    }
    const record = parsed as Record<string, unknown>;
    return {
      mode: isTransitionMode(record.mode) ? record.mode : DEFAULT_SETTINGS.mode,
      portraitLayout: isPortraitLayout(record.portraitLayout)
        ? record.portraitLayout
        : DEFAULT_SETTINGS.portraitLayout,
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

/**
 * Merges and persists valid preference fields, returning the resulting settings object.
 */
export function writeSettings(
  partial: Partial<ReaderSettings>,
  storage?: StorageLike | null,
): ReaderSettings {
  const current = readSettings(storage);
  const next: ReaderSettings = {
    mode: isTransitionMode(partial.mode) ? partial.mode : current.mode,
    portraitLayout: isPortraitLayout(partial.portraitLayout)
      ? partial.portraitLayout
      : current.portraitLayout,
  };

  const target = resolveStorage(storage);
  if (target) {
    try {
      target.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignore storage quota or private-browsing write failures.
    }
  }

  return next;
}

/**
 * Accepts only same-directory relative `./...` paths for return navigation, falling back to `./`.
 */
export function sanitizeReturnUrl(raw: string | null | undefined): string {
  if (!raw) {
    return "./";
  }
  const trimmed = raw.trim();
  if (!trimmed.startsWith("./") || trimmed.includes("\\")) {
    return "./";
  }
  for (let i = 0; i < trimmed.length; i += 1) {
    if (trimmed.charCodeAt(i) < 32) {
      return "./";
    }
  }
  try {
    const resolved = new URL(trimmed, "https://dropp.local/app/");
    if (resolved.origin !== "https://dropp.local" || !resolved.pathname.startsWith("/app/")) {
      return "./";
    }
    return trimmed;
  } catch {
    return "./";
  }
}

/**
 * Evaluates which settings options are supported or active in the current browser & viewport.
 */
export function evaluateSettingsCapabilities(
  probes: SettingsCapabilityProbes,
): SettingsCapabilities {
  const stackDisabled = !probes.supportsViewTimeline;
  const stackReason = stackDisabled
    ? "Unavailable: requires CSS Scroll-Driven Animations (animation-timeline: view())."
    : null;

  let curlReason: string | null = null;
  if (!probes.supportsViewTimeline && !probes.supportsHtmlInCanvas) {
    curlReason =
      "Unavailable: requires Chrome 157+ HTML-in-Canvas/WebGL2 and CSS Scroll-Driven Animations (view()).";
  } else if (!probes.supportsHtmlInCanvas) {
    const detail =
      probes.missingHtmlInCanvas && probes.missingHtmlInCanvas.length > 0
        ? ` (missing: ${probes.missingHtmlInCanvas.join(", ")})`
        : "";
    curlReason = `Unavailable: requires Chrome 157+ HTML-in-Canvas and WebGL2 support${detail}.`;
  } else if (!probes.supportsViewTimeline) {
    curlReason = "Unavailable: requires CSS Scroll-Driven Animations (animation-timeline: view()).";
  }

  const verticalDisabled = !probes.isPortrait;
  const verticalReason = verticalDisabled
    ? "Inactive in landscape: vertical page layout applies only in portrait single-page mode."
    : null;

  return {
    mode: {
      slide: { disabled: false, reason: null },
      stack: { disabled: stackDisabled, reason: stackReason },
      curl: { disabled: curlReason !== null, reason: curlReason },
    },
    portraitLayout: {
      horizontal: { disabled: false, reason: null },
      vertical: { disabled: verticalDisabled, reason: verticalReason },
    },
  };
}
