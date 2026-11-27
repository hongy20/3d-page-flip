import "./library.css";
import { BOOKS, type BookManifest } from "./books/catalog";
import { resolveSvgUrl } from "./svgLoader";

function createBookCard(book: BookManifest): HTMLLIElement {
  const item = document.createElement("li");
  item.className = "shelf__item";

  const link = document.createElement("a");
  link.className = "book-card";
  link.href = `./reader.html?book=${encodeURIComponent(book.id)}`;

  const cover = document.createElement("div");
  cover.className = "book-card__cover";
  cover.style.setProperty("--book-aspect", book.aspectRatio);

  const img = document.createElement("img");
  img.className = "book-card__img";
  img.src = resolveSvgUrl(book.coverPath);
  img.alt = `${book.title} cover`;
  img.decoding = "async";
  cover.append(img);

  const meta = document.createElement("div");
  meta.className = "book-card__meta";

  const title = document.createElement("h2");
  title.className = "book-card__title";
  title.textContent = book.title;
  meta.append(title);

  if (book.subtitle) {
    const subtitle = document.createElement("p");
    subtitle.className = "book-card__subtitle";
    subtitle.textContent = book.subtitle;
    meta.append(subtitle);
  }

  const pages = document.createElement("p");
  pages.className = "book-card__pages";
  pages.textContent = `${book.pageCount} ${book.pageCount === 1 ? "page" : "pages"}`;
  meta.append(pages);

  link.append(cover, meta);
  item.append(link);
  return item;
}

const shelf = document.getElementById("book-shelf");
if (shelf) {
  const fragment = document.createDocumentFragment();
  for (const book of BOOKS) {
    fragment.append(createBookCard(book));
  }
  shelf.append(fragment);
}
