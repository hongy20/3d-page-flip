import "./style.css";
import { detectHtmlInCanvas, showUnsupportedMessage } from "./gl/featureDetect";
import { initBookRenderer } from "./gl/renderer";
import { mountInlineSvgs } from "./svgLoader";

const canvas = document.getElementById("book-canvas");
const book = document.querySelector<HTMLElement>(".book");
const pages = Array.from(document.querySelectorAll<HTMLElement>(".page__content"));

if (canvas instanceof HTMLCanvasElement && book && pages.length > 0) {
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
