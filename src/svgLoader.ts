export interface SvgSlotElement {
  readonly dataset: { readonly svg?: string };
  readonly ownerDocument?: {
    importNode(node: Element, deep?: boolean): Element;
  } | null;
  replaceWith(...nodes: Array<Node | string>): void;
}

export interface SvgParserLike {
  parseFromString(
    markup: string,
    type: DOMParserSupportedType,
  ): {
    readonly documentElement: Element | null;
    querySelector?(selector: string): Element | null;
  };
}

export interface MountInlineSvgsOptions {
  readonly baseUrl?: string;
  readonly fetchFn?: typeof fetch;
  readonly createParser?: () => SvgParserLike;
  readonly onPageMounted?: (svg: Element, index: number) => void;
  readonly onError?: (error: unknown, relativePath: string, index: number) => void;
}

/**
 * Resolves a relative SVG path against the configured Vite base URL.
 */
export function resolveSvgUrl(
  relativePath: string,
  baseUrl = import.meta.env.BASE_URL || "/",
): string {
  const trimmedBase = baseUrl.trim();
  const normalizedBase =
    trimmedBase.length === 0 ? "/" : trimmedBase.endsWith("/") ? trimmedBase : `${trimmedBase}/`;
  const normalizedPath = relativePath.replace(/^\/+/, "");
  return `${normalizedBase}${normalizedPath}`;
}

/**
 * Parses raw SVG markup into a validated root `<svg>` element.
 */
export function parseSvgMarkup(svgText: string, createParser?: () => SvgParserLike): Element {
  const parser = createParser ? createParser() : new DOMParser();
  const doc = parser.parseFromString(svgText, "image/svg+xml");
  const root = doc.documentElement;
  const rootName = (root?.localName ?? root?.tagName ?? "").toLowerCase();
  const parserError = doc.querySelector?.("parsererror") ?? rootName === "parsererror";

  if (parserError) {
    throw new Error("Invalid SVG markup: XML parsererror encountered");
  }
  if (!root || rootName !== "svg") {
    throw new Error(`Invalid SVG markup: expected <svg> root, got <${rootName || "none"}>`);
  }

  return root;
}

/**
 * Fetches and mounts inline `<svg class="page__svg">` elements into slot placeholders,
 * prioritizing the first slot before loading remaining pages concurrently.
 */
export async function mountInlineSvgs(
  slots: ReadonlyArray<SvgSlotElement>,
  options?: MountInlineSvgsOptions,
): Promise<void> {
  if (slots.length === 0) {
    return;
  }

  const fetchImpl = options?.fetchFn ?? fetch;

  async function mountSlot(slot: SvgSlotElement, index: number): Promise<void> {
    const relativePath = slot.dataset.svg?.trim();
    if (!relativePath) {
      return;
    }

    try {
      const url = resolveSvgUrl(relativePath, options?.baseUrl);
      const response = await fetchImpl(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch SVG (${response.status}): ${url}`);
      }

      const markup = await response.text();
      const parsed = parseSvgMarkup(markup, options?.createParser);
      const svg =
        slot.ownerDocument && typeof slot.ownerDocument.importNode === "function"
          ? slot.ownerDocument.importNode(parsed, true)
          : parsed;

      svg.classList.add("page__svg");
      slot.replaceWith(svg);
      options?.onPageMounted?.(svg, index);
    } catch (error) {
      if (options?.onError) {
        options.onError(error, relativePath, index);
      } else {
        console.error(`Failed to mount inline SVG "${relativePath}":`, error);
      }
    }
  }

  await mountSlot(slots[0], 0);
  if (slots.length > 1) {
    await Promise.all(slots.slice(1).map((slot, offset) => mountSlot(slot, offset + 1)));
  }
}
