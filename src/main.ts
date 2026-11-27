import "./style.css";
import { type BookManifest, getBookPagePaths, resolveBook } from "./books/catalog";
import { detectHtmlInCanvas, showUnsupportedMessage } from "./gl/featureDetect";
import { initBookRenderer } from "./gl/renderer";
import { mountInlineSvgs } from "./svgLoader";

function showBookNotFound(requestedId: string | null): void {
  document.title = "Book Not Found — Dropp";

  const aside = document.createElement("aside");
  aside.className = "unsupported";
  aside.setAttribute("role", "alert");

  const card = document.createElement("div");
  card.className = "unsupported__card";

  const heading = document.createElement("h1");
  heading.textContent = "Book not found";

  const message = document.createElement("p");
  if (requestedId) {
    const code = document.createElement("code");
    code.textContent = requestedId;
    message.append("No book matching ", code, " was found in the library catalog.");
  } else {
    message.textContent = "No books are available in the library catalog.";
  }

  const backLink = document.createElement("a");
  backLink.className = "not-found__link";
  backLink.href = "./";
  backLink.textContent = "Back to library";

  card.append(heading, message, backLink);
  aside.append(card);
  document.body.append(aside);
}

function populateBookPages(bookEl: HTMLElement, manifest: BookManifest): void {
  const pagePaths = getBookPagePaths(manifest);
  const totalPages = pagePaths.length;
  const fragment = document.createDocumentFragment();

  for (const [index, svgPath] of pagePaths.entries()) {
    const pageNumber = index + 1;

    const section = document.createElement("section");
    section.className = "page";
    section.setAttribute("aria-label", `Page ${pageNumber}`);

    const frame = document.createElement("div");
    frame.className = "page__frame";

    const content = document.createElement("article");
    content.className = "page__content";
    content.setAttribute("drawable", "");

    const slot = document.createElement("div");
    slot.className = "page__svg-slot";
    slot.dataset.svg = svgPath;

    const badge = document.createElement("button");
    badge.type = "button";
    badge.className = "page__badge";
    badge.setAttribute("aria-label", `Bookmark page ${pageNumber}`);
    badge.textContent = `Page ${pageNumber} / ${totalPages}`;

    content.append(slot, badge);
    frame.append(content);
    section.append(frame);
    fragment.append(section);
  }

  bookEl.append(fragment);
}

const requestedBookId = new URLSearchParams(window.location.search).get("book");
const manifest = resolveBook(requestedBookId);

if (!manifest) {
  showBookNotFound(requestedBookId);
} else {
  document.title = `${manifest.title} — Dropp`;

  const canvas = document.getElementById("book-canvas");
  const book = document.querySelector<HTMLElement>(".book");

  if (canvas instanceof HTMLCanvasElement && book) {
    book.style.setProperty("--page-aspect", manifest.aspectRatio);
    book.setAttribute("aria-label", `${manifest.title} — Dropp Reader`);
    populateBookPages(book, manifest);

    const pages = Array.from(book.querySelectorAll<HTMLElement>(".page__content"));
    if (pages.length > 0) {
      const result = detectHtmlInCanvas(canvas);
      if (!result.supported) {
        showUnsupportedMessage(result.missing);
      } else {
        initBookRenderer(result.canvas, result.gl, book, pages);
        const slots = Array.from(book.querySelectorAll<HTMLElement>(".page__svg-slot[data-svg]"));
        void mountInlineSvgs(slots, {
          onPageMounted: () => {
            result.canvas.requestPaint?.();
          },
        });
      }
    }
  }
}
