import { DOM } from "./DOM.js";
let floating = false;
let holdTimeout;
const initialTop = 0;
const initialLeft = 0;

let startPosX, startPosY, initialMouseX, initialMouseY;

DOM.closeButton.addEventListener("click", () => {
  DOM.sidebarDrag.style.display = "none";
});

DOM.sidebarDrag.addEventListener("mousedown", onMouseDown);

function onMouseDown(e) {
  if (e.target.closest(".toolbar") || e.target.closest(".tool")) return;
  e.preventDefault();
  initialMouseX = e.clientX;
  initialMouseY = e.clientY;
  startPosX = DOM.sidebarDrag.offsetLeft;
  startPosY = DOM.sidebarDrag.offsetTop;

  holdTimeout = setTimeout(() => {
    floating = true;
    DOM.sidebarDrag.classList.add("floating");
    DOM.sidebarTop.style.display = "flex";
    DOM.sidebarDrag.style.cursor = "grabbing";
  }, 700);

  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);
}

function onMouseMove(e) {
  if (!floating) return;

  const dx = e.clientX - initialMouseX;
  const dy = e.clientY - initialMouseY;

  DOM.sidebarDrag.style.left = `${startPosX + dx}px`;
  DOM.sidebarDrag.style.top = `${startPosY + dy}px`;
  //canvasContainer.style.marginLeft = `${sidebarDrag.offsetLeft + sidebarDrag.offsetWidth}px`;
}

function onMouseUp(e) {
  clearTimeout(holdTimeout);
  if (floating) {
    const dx = e.clientX - initialMouseX;
    const dy = e.clientY - initialMouseY;

    if (shouldSnapBack(dx, dy)) {
      backToPosition();
    } else {
      DOM.sidebarDrag.style.cursor = "grab";
    }
  }

  document.removeEventListener("mouseup", onMouseUp);
  document.removeEventListener("mousemove", onMouseMove);
}

function shouldSnapBack(dx, dy) {
  const snapThreshold = 50;
  return Math.abs(dx) <= snapThreshold && Math.abs(dy) <= snapThreshold;
}

function backToPosition() {
  DOM.sidebarDrag.style.left = `${initialLeft}px`;
  DOM.sidebarDrag.style.top = `${initialTop}px`;
  DOM.sidebarDrag.style.height = "100%";
  DOM.sidebarTop.style.display = "none";
  DOM.sidebarDrag.classList.remove("floating");
  DOM.sidebarDrag.style.cursor = "default";
  floating = false;
}
