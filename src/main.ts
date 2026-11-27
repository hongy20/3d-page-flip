import './style.css';
import { detectHtmlInCanvas, showUnsupportedMessage } from './gl/featureDetect';
import { initBookRenderer } from './gl/renderer';

const canvas = document.getElementById('book-canvas');
const book = document.querySelector<HTMLElement>('.book');
const pages = Array.from(document.querySelectorAll<HTMLElement>('.page__content'));

if (canvas instanceof HTMLCanvasElement && book && pages.length > 0) {
  const result = detectHtmlInCanvas(canvas);
  if (!result.supported) {
    showUnsupportedMessage(result.missing);
  } else {
    initBookRenderer(result.canvas, result.gl, book, pages);
  }
}
