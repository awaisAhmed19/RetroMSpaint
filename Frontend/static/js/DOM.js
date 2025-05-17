const canvas = document.getElementById("canvas");
const bufferCanvas = document.getElementById("canvasbuffer");
const ctx = canvas.getContext("2d");
const bufferCtx = bufferCanvas.getContext("2d");
const toolsClass = document.querySelectorAll(".tools");
const menuRow = document.querySelectorAll(".menu-row");
export const DOM = {
  canvas,
  sidebarDrag: document.querySelector(".sidebar"),
  toolbar: document.querySelector(".toolbar"),
  sidebarTop: document.querySelector(".sidebar-floating-top"),
  closeButton: document.querySelector(".sidebar-close-button"),
  canvasContainer: document.getElementById("canvas-container"),
  container: document.getElementById("canvas-container"),
  bufferCanvas,
  ctx,
  bufferCtx,
  resizeHandles: document.querySelectorAll(".resize-handle"),
  dimen: document.getElementById("dimensions"),
  menubar: document.querySelectorAll(".menubar-btn"),
  dropdown: document.querySelectorAll(".dropdown"),
  dropdownContainer: document.querySelector(".dropdown-container"),
  toolsButton: document.querySelectorAll(".toolbar"),
  footNote: document.getElementById("foot-note"),
  toolsClass,
  menuRow,
  canvasContainer: document.querySelector(".canvascontainer"),
  elementFootNotesclasses: [...toolsClass, ...menuRow],
};
