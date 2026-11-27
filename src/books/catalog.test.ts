import { describe, expect, it } from "vitest";
import { resolveSvgUrl } from "../svgLoader";
import { BOOKS, getBookPagePaths, resolveBook } from "./catalog";

describe("BOOKS catalog", () => {
  it("contains the default Málaga brochure manifest", () => {
    expect(BOOKS.length).toBeGreaterThanOrEqual(1);
    expect(BOOKS[0]).toEqual({
      id: "malaga",
      title: "Málaga",
      subtitle: "Illustrated Travel Brochure",
      pageCount: 18,
      aspectRatio: "2115 / 2990",
      basePath: "books/malaga",
      coverPath: "books/malaga/page_1.svg",
    });
  });
});

describe("resolveBook", () => {
  it("resolves a known book by ID", () => {
    const book = resolveBook("malaga");
    expect(book).toEqual(BOOKS[0]);
  });

  it("defaults to the first catalog entry when ID is omitted or empty", () => {
    expect(resolveBook(null)).toEqual(BOOKS[0]);
    expect(resolveBook(undefined)).toEqual(BOOKS[0]);
    expect(resolveBook("")).toEqual(BOOKS[0]);
    expect(resolveBook("   ")).toEqual(BOOKS[0]);
  });

  it("returns undefined for an unknown book ID", () => {
    expect(resolveBook("missing")).toBeUndefined();
  });
});

describe("getBookPagePaths", () => {
  it("builds 1..N relative SVG paths for Málaga", () => {
    const malaga = resolveBook("malaga");
    expect(malaga).toBeDefined();
    const paths = getBookPagePaths(malaga!);
    expect(paths).toHaveLength(18);
    expect(paths[0]).toBe("books/malaga/page_1.svg");
    expect(paths[17]).toBe("books/malaga/page_18.svg");
  });

  it("normalizes leading and trailing slashes and handles zero pages", () => {
    expect(getBookPagePaths({ basePath: "/books/demo/", pageCount: 2 })).toEqual([
      "books/demo/page_1.svg",
      "books/demo/page_2.svg",
    ]);
    expect(getBookPagePaths({ basePath: "", pageCount: 1 })).toEqual(["page_1.svg"]);
    expect(getBookPagePaths({ basePath: "books/empty", pageCount: 0 })).toEqual([]);
  });

  it("produces paths compatible with resolveSvgUrl across root and subpath bases", () => {
    const paths = getBookPagePaths(BOOKS[0]);
    expect(resolveSvgUrl(paths[0], "/")).toBe("/books/malaga/page_1.svg");
    expect(resolveSvgUrl(paths[17], "/3d-page-flip/")).toBe(
      "/3d-page-flip/books/malaga/page_18.svg",
    );
  });
});
