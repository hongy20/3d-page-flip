import "./settings.css";
import { detectHtmlInCanvas } from "./gl/featureDetect";
import {
  type OptionCapability,
  type PortraitLayout,
  type TransitionMode,
  evaluateSettingsCapabilities,
  readSettings,
  sanitizeReturnUrl,
  writeSettings,
} from "./settingsStore";

interface CapabilityProbeSummary {
  readonly supportsViewTimeline: boolean;
  readonly supportsHtmlInCanvas: boolean;
  readonly missingHtmlInCanvas: readonly string[];
}

function probeBrowserCapabilities(): CapabilityProbeSummary {
  const supportsViewTimeline =
    typeof CSS !== "undefined" &&
    typeof CSS.supports === "function" &&
    CSS.supports("animation-timeline", "view()");

  const probeCanvas = document.createElement("canvas");
  probeCanvas.setAttribute("content", "drawable");
  const htmlInCanvasResult = detectHtmlInCanvas(probeCanvas);

  if (htmlInCanvasResult.supported) {
    htmlInCanvasResult.gl.getExtension("WEBGL_lose_context")?.loseContext();
    return {
      supportsViewTimeline,
      supportsHtmlInCanvas: true,
      missingHtmlInCanvas: [],
    };
  }

  return {
    supportsViewTimeline,
    supportsHtmlInCanvas: false,
    missingHtmlInCanvas: htmlInCanvasResult.missing,
  };
}

function applyOptionCapability(
  groupName: "mode" | "portraitLayout",
  value: string,
  descId: string,
  reasonId: string,
  capability: OptionCapability,
): void {
  const input = document.querySelector<HTMLInputElement>(
    `input[name="${groupName}"][value="${value}"]`,
  );
  const reasonEl = document.getElementById(reasonId);
  const wrapper = input?.closest<HTMLElement>(".setting-option") ?? null;
  if (!input || !reasonEl) {
    return;
  }

  input.disabled = capability.disabled;
  wrapper?.classList.toggle("setting-option--disabled", capability.disabled);

  if (capability.disabled && capability.reason) {
    reasonEl.textContent = capability.reason;
    reasonEl.hidden = false;
    input.setAttribute("aria-describedby", `${descId} ${reasonId}`);
  } else {
    reasonEl.textContent = "";
    reasonEl.hidden = true;
    input.setAttribute("aria-describedby", descId);
  }
}

function setupReturnLink(): void {
  const backLink = document.getElementById("settings-back");
  const backLabel = document.getElementById("settings-back-label");
  if (!(backLink instanceof HTMLAnchorElement)) {
    return;
  }

  const rawReturn = new URLSearchParams(window.location.search).get("return");
  const safeReturn = sanitizeReturnUrl(rawReturn);
  backLink.href = safeReturn;

  if (backLabel) {
    backLabel.textContent = safeReturn.startsWith("./reader.html")
      ? "Back to reader"
      : "Back to library";
  }
}

function hydrateSelectedInputs(): void {
  const settings = readSettings();
  const modeInput = document.querySelector<HTMLInputElement>(
    `input[name="mode"][value="${settings.mode}"]`,
  );
  if (modeInput) {
    modeInput.checked = true;
  }

  const layoutInput = document.querySelector<HTMLInputElement>(
    `input[name="portraitLayout"][value="${settings.portraitLayout}"]`,
  );
  if (layoutInput) {
    layoutInput.checked = true;
  }
}

setupReturnLink();
hydrateSelectedInputs();

const browserCaps = probeBrowserCapabilities();
const portraitQuery = window.matchMedia("(orientation: portrait)");

function refreshCapabilities(): void {
  const caps = evaluateSettingsCapabilities({
    supportsViewTimeline: browserCaps.supportsViewTimeline,
    supportsHtmlInCanvas: browserCaps.supportsHtmlInCanvas,
    missingHtmlInCanvas: browserCaps.missingHtmlInCanvas,
    isPortrait: portraitQuery.matches,
  });

  applyOptionCapability("mode", "slide", "mode-slide-desc", "mode-slide-reason", caps.mode.slide);
  applyOptionCapability("mode", "stack", "mode-stack-desc", "mode-stack-reason", caps.mode.stack);
  applyOptionCapability("mode", "curl", "mode-curl-desc", "mode-curl-reason", caps.mode.curl);
  applyOptionCapability(
    "portraitLayout",
    "horizontal",
    "layout-horizontal-desc",
    "layout-horizontal-reason",
    caps.portraitLayout.horizontal,
  );
  applyOptionCapability(
    "portraitLayout",
    "vertical",
    "layout-vertical-desc",
    "layout-vertical-reason",
    caps.portraitLayout.vertical,
  );
}

refreshCapabilities();
portraitQuery.addEventListener("change", refreshCapabilities);

const form = document.getElementById("settings-form");
const statusEl = document.getElementById("settings-status");

form?.addEventListener("change", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement) || target.disabled) {
    return;
  }

  if (target.name === "mode") {
    writeSettings({ mode: target.value as TransitionMode });
  } else if (target.name === "portraitLayout") {
    writeSettings({ portraitLayout: target.value as PortraitLayout });
  } else {
    return;
  }

  if (statusEl) {
    statusEl.textContent = "Preferences saved.";
  }
});
