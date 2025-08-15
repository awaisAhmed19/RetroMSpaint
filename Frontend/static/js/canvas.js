const DEFAULT_W = 800;
const DEFAULT_H = 650;

const container = document.getElementById("canvas-container");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const bufferCanvas = document.createElement("canvas");
const bufferCtx = bufferCanvas.getContext("2d");

const resizeHandles = document.querySelectorAll(".resize-handle");
const dimen = document.getElementById("dimensions");

let isResizing = false;
let currentHandle = null;

const Cstate = {
  canvas,
  ctx,
  width: DEFAULT_W,
  height: DEFAULT_H,
};

window.addEventListener("load", () => {
  initCanvas();

  function initCanvas() {
    canvas.width = DEFAULT_W;
    canvas.height = DEFAULT_H;
  }

  function resizeCanvas() {
    bufferCanvas.width = canvas.width;
    bufferCanvas.height = canvas.height;
    bufferCtx.drawImage(canvas, 0, 0);

    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    ctx.drawImage(bufferCanvas, 0, 0);
  }

  resizeHandles.forEach((handle) => {
    handle.addEventListener("mousedown", startResize);
  });

  function startResize(e) {
    isResizing = true;
    currentHandle = e.target;
    dimen.innerHTML = "";
    document.addEventListener("mousemove", resize);
    document.addEventListener("mouseup", stopResize);
  }

  function resize(e) {
    if (!isResizing) return;

    const rect = container.getBoundingClientRect();

    if (currentHandle.classList.contains("right")) {
      let w = e.clientX - rect.left;
      if (w < 100) w = 100;
      container.style.width = `${w}px`;
    } else if (currentHandle.classList.contains("bottom")) {
      let h = e.clientY - rect.top;
      if (h < 100) h = 100;
      container.style.height = `${h}px`;
    } else if (currentHandle.classList.contains("corner")) {
      let w = e.clientX - rect.left;
      let h = e.clientY - rect.top;
      if (w < 100) w = 100;
      if (h < 100) h = 100;
      container.style.width = `${w}px`;
      container.style.height = `${h}px`;
    }

    const computed = window.getComputedStyle(container);
    const width = parseInt(computed.width, 10);
    const height = parseInt(computed.height, 10);
    dimen.innerHTML = `${width}x${height}`;

    resizeCanvas();
  }

  function stopResize() {
    isResizing = false;
    document.removeEventListener("mousemove", resize);
    document.removeEventListener("mouseup", stopResize);
    dimen.innerHTML = "";
  }
});
