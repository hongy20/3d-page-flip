export interface BookManifest {
  readonly id: string;
  readonly title: string;
  readonly subtitle?: string;
  readonly pageCount: number;
  readonly aspectRatio: string;
  readonly basePath: string;
  readonly coverPath: string;
}

export const BOOKS: readonly BookManifest[] = [
  {
    id: "malaga",
    title: "Málaga",
    subtitle: "Illustrated Travel Brochure",
    pageCount: 18,
    aspectRatio: "2115 / 2990",
    basePath: "books/malaga",
    coverPath: "books/malaga/page_1.svg",
  },
];

/**
 * Resolves a catalog book by ID, defaulting to the first catalog entry when omitted or blank.
 */
export function resolveBook(
  id: string | null | undefined,
  catalog: readonly BookManifest[] = BOOKS,
): BookManifest | undefined {
  const trimmed = id?.trim() ?? "";
  if (trimmed.length === 0) {
    return catalog[0];
  }
  return catalog.find((book) => book.id === trimmed);
}

/**
 * Builds ordered relative SVG page paths (`page_1.svg..page_N.svg`) for a book manifest.
 */
export function getBookPagePaths(book: Pick<BookManifest, "basePath" | "pageCount">): string[] {
  if (book.pageCount <= 0) {
    return [];
  }
  const normalizedBase = book.basePath.replace(/^\/+|\/+$/g, "");
  return Array.from({ length: book.pageCount }, (_, index) => {
    const fileName = `page_${index + 1}.svg`;
    return normalizedBase.length > 0 ? `${normalizedBase}/${fileName}` : fileName;
  });
}
