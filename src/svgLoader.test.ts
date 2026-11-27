import { describe, expect, it, vi } from "vitest";
import {
  mountInlineSvgs,
  parseSvgMarkup,
  resolveSvgUrl,
  type SvgParserLike,
  type SvgSlotElement,
} from "./svgLoader";

interface FakeElement {
  localName: string;
  tagName: string;
  classList: {
    classes: Set<string>;
    add(name: string): void;
  };
}

function createFakeElement(name: string): FakeElement {
  const classes = new Set<string>();
  return {
    localName: name,
    tagName: name,
    classList: {
      classes,
      add(cls: string) {
        classes.add(cls);
      },
    },
  };
}

function createFakeParser(options?: { hasParserError?: boolean; rootTag?: string }): SvgParserLike {
  return {
    parseFromString(markup, type) {
      expect(type).toBe("image/svg+xml");
      if (options?.hasParserError || markup.includes("<parsererror")) {
        const errorEl = createFakeElement("parsererror") as unknown as Element;
        return {
          documentElement: errorEl,
          querySelector: (selector: string) => (selector === "parsererror" ? errorEl : null),
        };
      }
      const rootTag = options?.rootTag ?? (markup.includes("<html") ? "html" : "svg");
      const rootEl = createFakeElement(rootTag) as unknown as Element;
      return {
        documentElement: rootEl,
        querySelector: () => null,
      };
    },
  };
}

function createFakeSlot(svgPath: string | undefined): {
  slot: SvgSlotElement;
  imported: Element[];
  replacedWith: Array<Node | string>;
} {
  const imported: Element[] = [];
  const replacedWith: Array<Node | string> = [];
  const slot: SvgSlotElement = {
    dataset: svgPath === undefined ? {} : { svg: svgPath },
    ownerDocument: {
      importNode(node) {
        imported.push(node);
        return node;
      },
    },
    replaceWith(...nodes) {
      replacedWith.push(...nodes);
    },
  };
  return { slot, imported, replacedWith };
}

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe("resolveSvgUrl", () => {
  it("resolves relative and leading-slash paths against root base", () => {
    expect(resolveSvgUrl("pages/page_1.svg", "/")).toBe("/pages/page_1.svg");
    expect(resolveSvgUrl("/pages/page_1.svg", "/")).toBe("/pages/page_1.svg");
  });

  it("normalizes subpath bases with or without a trailing slash", () => {
    expect(resolveSvgUrl("pages/page_2.svg", "/dropp/")).toBe("/dropp/pages/page_2.svg");
    expect(resolveSvgUrl("/pages/page_2.svg", "/dropp")).toBe("/dropp/pages/page_2.svg");
    expect(resolveSvgUrl("books/malaga/page_1.svg", "")).toBe("/books/malaga/page_1.svg");
  });
});

describe("parseSvgMarkup", () => {
  it("returns the root <svg> element for valid SVG markup", () => {
    const root = parseSvgMarkup("<svg viewBox='0 0 10 10'></svg>", () => createFakeParser());
    expect(root.localName).toBe("svg");
  });

  it("throws when XML parsing yields a <parsererror>", () => {
    expect(() =>
      parseSvgMarkup("<svg><bad", () => createFakeParser({ hasParserError: true })),
    ).toThrow(/parsererror/i);
  });

  it("throws when the root element is not <svg>", () => {
    expect(() =>
      parseSvgMarkup("<html></html>", () => createFakeParser({ rootTag: "html" })),
    ).toThrow(/expected <svg> root/i);
  });
});

describe("mountInlineSvgs", () => {
  it("returns immediately when slots is empty", async () => {
    const fetchFn = vi.fn<typeof fetch>();
    await mountInlineSvgs([], { fetchFn });
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("prioritizes slot 0 before fetching remaining slots concurrently and invokes onPageMounted", async () => {
    const first = createFakeSlot("pages/page_1.svg");
    const second = createFakeSlot("pages/page_2.svg");
    const third = createFakeSlot("pages/page_3.svg");

    const d1 = createDeferred<Response>();
    const d2 = createDeferred<Response>();
    const d3 = createDeferred<Response>();
    const deferredByUrl = new Map([
      ["/dropp/pages/page_1.svg", d1],
      ["/dropp/pages/page_2.svg", d2],
      ["/dropp/pages/page_3.svg", d3],
    ]);

    const fetchedUrls: string[] = [];
    const fetchFn = vi.fn<typeof fetch>((input) => {
      const url = String(input);
      fetchedUrls.push(url);
      const deferred = deferredByUrl.get(url);
      if (!deferred) {
        throw new Error(`Unexpected URL: ${url}`);
      }
      return deferred.promise;
    });

    const mounted: Array<{ index: number; hasClass: boolean }> = [];
    const run = mountInlineSvgs([first.slot, second.slot, third.slot], {
      baseUrl: "/dropp",
      fetchFn,
      createParser: () => createFakeParser(),
      onPageMounted: (svg, index) => {
        const fake = svg as unknown as FakeElement;
        mounted.push({ index, hasClass: fake.classList.classes.has("page__svg") });
      },
    });

    expect(fetchedUrls).toEqual(["/dropp/pages/page_1.svg"]);

    d1.resolve(new Response("<svg></svg>", { status: 200 }));
    await vi.waitFor(() => {
      expect(fetchedUrls).toEqual([
        "/dropp/pages/page_1.svg",
        "/dropp/pages/page_2.svg",
        "/dropp/pages/page_3.svg",
      ]);
    });

    expect(first.imported).toHaveLength(1);
    expect(first.replacedWith).toHaveLength(1);
    expect(mounted).toEqual([{ index: 0, hasClass: true }]);

    d3.resolve(new Response("<svg></svg>", { status: 200 }));
    d2.resolve(new Response("<svg></svg>", { status: 200 }));
    await run;

    expect(second.imported).toHaveLength(1);
    expect(second.replacedWith).toHaveLength(1);
    expect(third.imported).toHaveLength(1);
    expect(third.replacedWith).toHaveLength(1);
    expect(mounted).toHaveLength(3);
    expect(mounted.map((item) => item.index).sort()).toEqual([0, 1, 2]);
  });

  it("reports fetch and parse errors via onError without blocking remaining pages", async () => {
    const s1 = createFakeSlot("pages/page_1.svg");
    const s2 = createFakeSlot("pages/page_2.svg");
    const s3 = createFakeSlot("pages/page_3.svg");
    const s4 = createFakeSlot(undefined);

    const fetchFn = vi.fn<typeof fetch>((input) => {
      const url = String(input);
      if (url.endsWith("page_1.svg")) {
        return Promise.resolve(new Response("Not found", { status: 404 }));
      }
      if (url.endsWith("page_2.svg")) {
        return Promise.resolve(new Response("<parsererror/>", { status: 200 }));
      }
      return Promise.resolve(new Response("<svg></svg>", { status: 200 }));
    });

    const errors: Array<{ path: string; index: number; message: string }> = [];
    const mountedIndices: number[] = [];

    await mountInlineSvgs([s1.slot, s2.slot, s3.slot, s4.slot], {
      baseUrl: "/",
      fetchFn,
      createParser: () => createFakeParser(),
      onPageMounted: (_svg, index) => {
        mountedIndices.push(index);
      },
      onError: (error, relativePath, index) => {
        errors.push({
          path: relativePath,
          index,
          message: error instanceof Error ? error.message : String(error),
        });
      },
    });

    expect(fetchFn).toHaveBeenCalledTimes(3);
    expect(mountedIndices).toEqual([2]);
    expect(s1.replacedWith).toHaveLength(0);
    expect(s2.replacedWith).toHaveLength(0);
    expect(s3.replacedWith).toHaveLength(1);
    expect(errors).toEqual([
      {
        path: "pages/page_1.svg",
        index: 0,
        message: "Failed to fetch SVG (404): /pages/page_1.svg",
      },
      {
        path: "pages/page_2.svg",
        index: 1,
        message: "Invalid SVG markup: XML parsererror encountered",
      },
    ]);
  });
});
