import { DOM } from "./DOM.js";
window.addEventListener("load", () => {
  let isResizing = false;
  let currentHandle = null;

  function resizeCanvas() {
    DOM.bufferCanvas.width = DOM.canvas.width;
    DOM.bufferCanvas.height = DOM.canvas.height;
    DOM.bufferCtx.drawImage(DOM.canvas, 0, 0);

    DOM.canvas.width = DOM.canvasContainer.clientWidth;
    DOM.canvas.height = DOM.canvasContainer.clientHeight;

    DOM.ctx.drawImage(DOM.bufferCanvas, 0, 0);
  }

  resizeCanvas();

  DOM.resizeHandles.forEach((handle) => {
    handle.addEventListener("mousedown", startResize);
  });

  function startResize(e) {
    isResizing = true;
    currentHandle = e.target;
    DOM.dimen.innerHTML = "";
    document.addEventListener("mousemove", resize);
    document.addEventListener("mouseup", stopResize);
  }

  function resize(e) {
    if (!isResizing) return;

    const containerRect = DOM.canvasContainer.getBoundingClientRect();

    if (currentHandle.classList.contains("right")) {
      let newWidth = e.clientX - containerRect.left;
      if (newWidth < 100) newWidth = 100;
      DOM.canvasContainer.style.width = `${newWidth}px`;
    } else if (currentHandle.classList.contains("bottom")) {
      let newHeight = e.clientY - containerRect.top;
      if (newHeight < 100) newHeight = 100;
      DOM.canvasContainer.style.height = `${newHeight}px`;
    } else if (currentHandle.classList.contains("corner")) {
      let newWidth = e.clientX - containerRect.left;
      let newHeight = e.clientY - containerRect.top;
      if (newWidth < 100) newWidth = 100;
      if (newHeight < 100) newHeight = 100;
      DOM.canvasContainer.style.width = `${newWidth}px`;
      DOM.canvasContainer.style.height = `${newHeight}px`;
    }

    const computedStyle = window.getComputedStyle(DOM.canvasContainer);
    const width = parseInt(computedStyle.width, 10);
    const height = parseInt(computedStyle.height, 10);
    DOM.dimen.innerHTML = `${width}x${height}`;

    resizeCanvas();
  }

  function stopResize() {
    isResizing = false;
    document.removeEventListener("mousemove", resize);
    document.removeEventListener("mouseup", stopResize);
    DOM.dimen.innerHTML = "";
  }
});
