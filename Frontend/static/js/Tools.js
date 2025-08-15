/**
 * @type HTMLCanvasElement
 */
import { undoLog } from "./undo.js";
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });
const dimen = document.getElementById("dimensions");
const coords = document.getElementById("coordinate_value");
const tools = document.querySelectorAll(".tools");
const paletteColors = document.querySelectorAll(".pallete-color");
export const undo = new undoLog();
let currentColorDisplay = document.getElementById("selected-color");
let switchColor = document.getElementById("switch-color");
let activeTool = null;

let currentColor = JSON.parse(currentColorDisplay.getAttribute("value"));
let switchColorValue = JSON.parse(switchColor.getAttribute("value"));

let startX;
let startY;
let currentX, currentY;
let isMouseDown = false;

window.onload = () => {
  currentColorDisplay.style.backgroundColor = currentColor;
  switchColor.style.backgroundColor = switchColorValue;
};

// Switching colors and assigning colors
currentColorDisplay.addEventListener("click", () => switchColorHandler());

paletteColors.forEach((color) => {
  color.addEventListener("click", () => {
    //currentColor = JSON.parse(color.value);
    currentColorDisplay.style.backgroundColor = color.style.backgroundColor;
    currentColor = JSON.parse(color.getAttribute("value"));
    //console.log('Color changed to:', currentColor);
    if (activeTool) {
      activeTool.changeColor(currentColor);
    }
  });
});

function createCanvas(width, height) {
  const stage = document.getElementById("canvas-container");
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  stage.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  return { canvas, ctx };
}

function switchColorHandler() {
  let temp = switchColor.style.backgroundColor;
  switchColor.style.backgroundColor = currentColorDisplay.style.backgroundColor;
  currentColorDisplay.style.backgroundColor = temp;

  // Swap the color values
  let tempColor = currentColor;
  currentColor = switchColorValue;
  switchColorValue = tempColor;

  if (activeTool) {
    activeTool.changeColor(currentColor);
  }
}

let isDrawing = false;

let x = 0;
let y = 0;

function getMousePos(canvas, e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  };
}

function coordFunc(canvas, e) {
  const pos = getMousePos(canvas, e);
  currentX = Math.floor(pos.x);
  currentY = Math.floor(pos.y);
  coords.innerHTML = `X: ${currentX}, Y: ${currentY}`;
}

function updateCoords(canvas) {
  canvas.addEventListener("mousemove", (e) => {
    coordFunc(canvas, e);
  });
  canvas.addEventListener("mousedown", (e) => {
    isMouseDown = true;
    const pos = getMousePos(canvas, e);
    startX = Math.floor(pos.x);
    startY = Math.floor(pos.y);
    coordFunc(canvas, e);
  });
  canvas.addEventListener("mousemove", (e) => {
    if (!isMouseDown) return;
    coordFunc(canvas, e);
  });

  canvas.addEventListener("mouseup", () => {
    isMouseDown = false;
  });
  canvas.addEventListener("mouseout", () => {
    coords.innerHTML = "";
  });
}

updateCoords(canvas);

function updateDimens(canvas) {
  canvas.addEventListener("mousedown", (e) => {
    isMouseDown = true;
    const pos = getMousePos(canvas, e);
    startX = Math.floor(pos.x);
    startY = Math.floor(pos.y);
    dimen.innerHTML = `${0}x${0}`;
  });
  canvas.addEventListener("mouseup", () => {
    isMouseDown = false;
    dimen.innerHTML = "";
  });
  canvas.addEventListener("mousemove", (e) => {
    if (!isMouseDown) return;
    const pos = getMousePos(canvas, e);
    const width = Math.floor(pos.x) - startX;
    const height = Math.floor(pos.y) - startY;
    dimen.innerHTML = `${width}x${height}`;
  });

  canvas.addEventListener("mouseout", () => {
    dimen.innerHTML = "";
  });
}

function ToRgbString(rgbArray) {
  if (rgbArray.length < 3) {
    throw new Error("Invalid RGB array");
  }

  if (rgbArray.length === 4) {
    return `rgba(${rgbArray[0]}, ${rgbArray[1]}, ${rgbArray[2]}, ${rgbArray[3] / 255})`;
  } else {
    return `rgb(${rgbArray[0]}, ${rgbArray[1]}, ${rgbArray[2]})`;
  }
}

function isMobileOrTab() {
  return window.innerWidth <= 800 || "ontouchstart" in window;
}

function activateTool(canvas, start, draw, stop) {
  const startHandler = (e) => {
    e.preventDefault();
    start(e);
  };
  const drawHandler = (e) => {
    e.preventDefault();
    draw(e);
  };
  const stopHandler = (e) => {
    e.preventDefault();
    stop(e);
  };

  canvas.addEventListener("mousedown", startHandler);
  canvas.addEventListener("mousemove", drawHandler);
  canvas.addEventListener("mouseup", stopHandler);

  canvas.addEventListener("touchstart", startHandler);
  canvas.addEventListener("touchmove", drawHandler);
  canvas.addEventListener("touchend", stopHandler);
  canvas.addEventListener("touchcancel", stopHandler);

  canvas._eventHandlers = { startHandler, drawHandler, stopHandler };
}

function deactivateTool(canvas) {
  const { startHandler, drawHandler, stopHandler } =
    canvas._eventHandlers || {};

  canvas.removeEventListener("mousedown", startHandler);
  canvas.removeEventListener("mousemove", drawHandler);
  canvas.removeEventListener("mouseup", stopHandler);

  canvas.removeEventListener("touchstart", startHandler);
  canvas.removeEventListener("touchmove", drawHandler);
  canvas.removeEventListener("touchend", stopHandler);
  canvas.removeEventListener("touchcancel", stopHandler);
}

const ToolsInstance = {
  pencil: () => {
    let isDrawing = false;
    const customCursorUrl = "../cursors/move.png";
    let pos = null;
    canvas.style.cursor = `url(./static/cursors/pencil.png), auto`;

    const start = (e) => {
      ctx.beginPath();
      isDrawing = true;
      pos = getMousePos(canvas, e);
    };

    const draw = (e) => {
      if (!isDrawing) return;
      pos = getMousePos(canvas, e);
      ctx.strokeStyle = "black";
      ctx.lineWidth = 1;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineTo(pos.x + 15, pos.y + 24);
      ctx.stroke();
      updateCoords(canvas);
    };

    const stop = () => {
      isDrawing = false;
      ctx.closePath();
      undo.logging("pencil");
    };

    activateTool(canvas, start, draw, stop);
    updateCoords(canvas);
    updateDimens(canvas);

    return {
      removeEvents: () => {
        deactivateTool(canvas, start, draw, stop);
      },
    };
  },

  airbrush: () => {
    let isDrawing = false;
    let airOpt = 1;
    let pos = null;
    const airbrushSettings = {
      1: { density: 30, radius: 1 },
      2: { density: 30, radius: 2 },
      3: { density: 40, radius: 3 },
    };

    const customCursorUrl = "/static/cursors/airbrushCursor.png";
    const cursorHotspotX = -45;
    const cursorHotspotY = -5;

    canvas.style.cursor = `url(${customCursorUrl}) ${cursorHotspotX} ${cursorHotspotY}, auto`;
    document.addEventListener("htmx:afterSwap", function (e) {
      const airOptions = e.detail.target.querySelectorAll(".airOptions");
      if (airOptions && airOptions.length > 0) {
        airOptions.forEach((option) => {
          option.addEventListener("click", () => {
            airOptions.forEach((opt) => opt.classList.remove("pressed"));
            option.classList.add("pressed");
            airOpt = parseInt(option.value, 10);
          });
        });
      }
    });

    function startDrawing(e) {
      isDrawing = true;
      pos = getMousePos(canvas, e);

      ctx.beginPath();
      updateCoords(canvas);
    }

    function stopDrawing() {
      isDrawing = false;
      ctx.closePath();
      undo.logging("Airbrush");
    }

    function airBrush(e) {
      if (!isDrawing) return;
      let newPos = getMousePos(canvas, e);
      const { density, radius } =
        airbrushSettings[airOpt] || airbrushSettings[1];

      const dist = Math.sqrt((newPos.x - pos.x) ** 2 + (newPos.y - pos.y) ** 2);
      const step = Math.max(1 / dist, 0.05);

      for (let t = 0; t < 1; t += step) {
        const interpolatedX = pos.x + (newPos.x - pos.x) * t;
        const interpolatedY = pos.y + (newPos.y - pos.y) * t;

        for (let i = 0; i < density / 5; i++) {
          const angle = Math.random() * Math.PI * 2;
          const distance = radius * Math.random();
          const dx = interpolatedX + Math.cos(angle) * distance;
          const dy = interpolatedY + Math.sin(angle) * distance;
          ctx.beginPath();
          ctx.fillStyle = currentColor;
          ctx.arc(dx, dy, radius, 0, Math.PI * 2, false);
          ctx.fill();
        }
      }
      pos.x = newPos.x;
      pos.y = newPos.y;
      updateCoords(canvas);
    }

    const activateTool = () => {
      if (isMobileOrTab()) {
        canvas.addEventListener("touchstart", startDrawing);
        canvas.addEventListener("touchmove", airBrush);
        canvas.addEventListener("touchend", stopDrawing);
        canvas.addEventListener("touchcancel", stopDrawing);
      }
      canvas.addEventListener("mousedown", startDrawing);
      canvas.addEventListener("mousemove", airBrush);
      canvas.addEventListener("mouseup", stopDrawing);
      // canvas.addEventListener("mouseout", stopDrawing); // Handle mouse leaving canvas
    };

    const deactivateTool = () => {
      if (isMobileOrTab()) {
        canvas.removeEventListener("touchmove", airBrush);
        canvas.removeEventListener("touchend", stopDrawing);
        canvas.removeEventListener("touchstart", startDrawing);
        canvas.removeEventListener("touchcancel", stopDrawing);
      }
      canvas.removeEventListener("mousedown", startDrawing);
      canvas.removeEventListener("mousemove", airBrush);
      canvas.removeEventListener("mouseup", stopDrawing);
      // canvas.removeEventListener("mouseout", stopDrawing); // Handle mouse leaving canvas
    };

    activateTool();
    updateCoords(canvas);
    updateDimens(canvas);

    return {
      removeEvents: () => {
        deactivateTool();
      },
      changeColor: (color) => {
        currentColor = ToRgbString(color);
      },
    };
  },

  brush: () => {
    let old = null;
    let brushSize = 1;
    let lineLength = 10;
    let angle = Math.PI / 4;

    canvas.style.cursor = "crosshair";

    document.addEventListener("htmx:afterSwap", function (e) {
      const brushOptions = e.detail.target.querySelectorAll(
        ".BrushOptions button",
      );

      if (brushOptions && brushOptions.length > 0) {
        brushOptions.forEach((option) => {
          option.addEventListener("click", () => {
            brushOptions.forEach((opt) => opt.classList.remove("pressed"));
            option.classList.add("pressed");
            brushSize = parseInt(option.value, 10);

            switch (brushSize) {
              case 7:
                lineLength = 9;
                angle = (3 * Math.PI) / 4;
                break;
              case 8:
                lineLength = 6;
                angle = (3 * Math.PI) / 4;
                break;
              case 9:
                lineLength = 3;
                angle = (3 * Math.PI) / 4;
                break;
              case 10:
                lineLength = 9;
                angle = Math.PI / 4;
                break;
              case 11:
                lineLength = 6;
                angle = Math.PI / 4;
                break;
              case 12:
                lineLength = 3;
                angle = Math.PI / 4;
                break;
              default:
                ctx.lineWidth = 1;
                ctx.lineCap = "round";
                ctx.lineJoin = "round";
                break;
            }
          });
        });
      }
    });

    function drawLine(x0, y0, x1, y1) {
      const dx = Math.abs(x1 - x0);
      const dy = Math.abs(y1 - y0);
      const sx = x0 < x1 ? 1 : -1;
      const sy = y0 < y1 ? 1 : -1;
      let err = dx - dy;

      while (true) {
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(
          x0 + lineLength * Math.cos(angle),
          y0 + lineLength * Math.sin(angle),
        );
        ctx.stroke();

        if (x0 === x1 && y0 === y1) break;
        const e2 = 2 * err;
        if (e2 > -dy) {
          err -= dy;
          x0 += sx;
        }
        if (e2 < dx) {
          err += dx;
          y0 += sy;
        }
      }
    }

    let isDrawing = false;

    const draw = (e) => {
      if (!isDrawing) return;

      const pos = getMousePos(canvas, e);
      ctx.strokeStyle = currentColor;

      if (brushSize >= 7 && brushSize <= 12) {
        drawLine(old.x, old.y, pos.x, pos.y);
      } else {
        ctx.beginPath();
        ctx.moveTo(old.x, old.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      }

      old = { x: pos.x, y: pos.y };
    };

    const start = (e) => {
      isDrawing = true;
      old = getMousePos(canvas, e);

      switch (brushSize) {
        case 1:
          ctx.lineWidth = 3;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          break;
        case 2:
          ctx.lineWidth = 2;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          break;
        case 3:
          ctx.lineWidth = 1;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          break;
        case 4:
          ctx.lineWidth = 3;
          ctx.lineCap = "square";
          ctx.lineJoin = "bevel";
          break;
        case 5:
          ctx.lineWidth = 2;
          ctx.lineCap = "square";
          ctx.lineJoin = "bevel";
          break;
        case 6:
          ctx.lineWidth = 1;
          ctx.lineCap = "square";
          ctx.lineJoin = "bevel";
          break;
        default:
          ctx.lineWidth = 1;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          break;
      }
    };

    const stop = () => {
      isDrawing = false;
      undo.logging("Brush");
    };

    activateTool(canvas, start, draw, stop);
    updateCoords(canvas);
    return {
      removeEvents: () => {
        deactivateTool(canvas, start, draw, stop);
      },
      changeColor: (color) => {
        currentColor = ToRgbString(color);
      },
    };
  },

  eraser: () => {
    const customCursorUrl = "static/cursors/eraser.png";
    const cursorHotspotX = -45;
    const cursorHotspotY = -5;
    let old = null;
    let eraserX = 3;

    canvas.style.cursor = `url(${customCursorUrl}) ${cursorHotspotX} ${cursorHotspotY}, auto`;

    document.addEventListener("htmx:afterSwap", function (e) {
      const EOptions = e.detail.target.querySelectorAll(
        ".EraserOptions button",
      );

      if (EOptions && EOptions.length > 0) {
        EOptions.forEach((option) => {
          option.addEventListener("click", () => {
            EOptions.forEach((opt) => opt.classList.remove("pressed"));
            option.classList.add("pressed");
            eraserX = parseInt(option.value, 10);
          });
        });
      }
    });

    let isDrawing = false;

    const erase = (e) => {
      if (!isDrawing) return;

      const pos = getMousePos(canvas, e);
      ctx.globalCompositeOperation = "destination-out";

      // Draw a circle to erase
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, eraserX / 2, 0, 2 * Math.PI);
      ctx.fill();

      // Draw a line to erase
      ctx.lineWidth = eraserX;
      ctx.beginPath();
      ctx.moveTo(old.x, old.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();

      old = { x: pos.x, y: pos.y };
    };

    const start = (e) => {
      isDrawing = true;
      old = getMousePos(canvas, e);
    };

    const stop = () => {
      isDrawing = false;
      undo.logging("Eraser");
    };

    activateTool(canvas, start, erase, stop);
    updateCoords(canvas);
    return {
      removeEvents: () => {
        deactivateTool(canvas, start, erase, stop);
      },
    };
  },

  lasso: () => {
    const bufferCanvas = document.getElementById("canvasbuffer");
    const selectionBuffer = document.getElementById("selectionbuffer");
    const bufferCtx = bufferCanvas.getContext("2d");
    const SBufferCtx = selectionBuffer.getContext("2d");

    bufferCanvas.width = canvas.width;
    selectionBuffer.width = canvas.width;
    bufferCanvas.height = canvas.height;
    selectionBuffer.height = canvas.height;

    bufferCtx.lineWidth = 1;
    ctx.lineWidth = 1;
    bufferCanvas.style.cursor = "cosshair";
    canvas.style.cursor = "cosshair";
    selectionBuffer.style.cursor = "cosshair";
    let isDrawing = false;
    let isDragging = false;
    let isSelected = false;
    let padding = 10;
    let polygon = [];
    let points = [];
    let selectedBlob = [];
    let pos,
      start,
      selectedImageData = null;
    bufferCtx.strokeStyle = "black";

    const startLasso = (e) => {
      selectedImageData = null;
      isDrawing = true;
      start = getMousePos(bufferCanvas, e);
    };

    const drawLasso = (e) => {
      if (!isDrawing) return;
      pos = getMousePos(bufferCanvas, e);
      bufferCtx.strokeStyle = "black";
      bufferCtx.lineWidth = 1;
      bufferCtx.lineCap = "round";
      bufferCtx.lineTo(pos.x, pos.y);
      //console.log(pos.x," ",pos.y);
      polygon.push(pos);
      bufferCtx.stroke();
      updateCoords(bufferCanvas);
    };

    const stopLasso = (e) => {
      isDrawing = false;
      isSelected = true;
      pos = getMousePos(bufferCanvas, e);
      bufferCtx.lineTo(start.x, start.y);

      const selectionBox = boundingBox();
      const points = pointCollector(selectionBox);

      bufferCtx.beginPath(); // clear previous path for points
      for (let i = 0; i < points.length; i++) {
        if (ray_casting(points[i], polygon)) {
          selectedBlob.push({ x: points[i].x, y: points[i].y });
        }
      }

      copy_blob(selectedBlob, points, canvas, bufferCanvas);
      clearSrc(selectedBlob, canvas);
    };

    function clearSrc(blob, src) {
      const sctx = src.getContext("2d", { willReadFrequently: true });
      const data = sctx.getImageData(0, 0, src.width, src.height);
      for (let i = 0; i < blob.length; i++) {
        //let x = blob[i].x;
        //let y = blob[i].y;
        sctx.clearRect(blob[i].x, blob[i].y, 1, 1);
        //let index = (y * src.width + x) * 4;

        //data.data[index] = 255;
        //data.data[index + 1] = 255;
        //data.data[index + 2] = 255;
        //data.data[index + 3] = 255; // opaque white
      }
      //sctx.putImageData(data, 0, 0);
    }
    function copy_blob(blob, points, src, dest) {
      const sctx = src.getContext("2d");
      const dctx = dest.getContext("2d");

      // Ensure dest is cleared first

      const srcData = sctx.getImageData(0, 0, src.width, src.height);
      const destData = dctx.getImageData(0, 0, dest.width, dest.height);

      for (let i = 0; i < blob.length; i++) {
        const x = blob[i].x;
        const y = blob[i].y;

        if (x < 0 || x >= src.width || y < 0 || y >= src.height) continue;

        const ind = (y * src.width + x) * 4;

        // Copy RGBA
        destData.data[ind] = srcData.data[ind];
        destData.data[ind + 1] = srcData.data[ind + 1];
        destData.data[ind + 2] = srcData.data[ind + 2];
        destData.data[ind + 3] = srcData.data[ind + 3];
      }

      dctx.putImageData(destData, 1, 1);
    }

    function ray_casting(point, polygon) {
      let n = polygon.length;
      let is_in = false;
      let x = point.x;
      let y = point.y;

      for (let i = 0; i < n; i++) {
        let x1 = polygon[i].x;
        let y1 = polygon[i].y;
        let x2 = polygon[(i + 1) % n].x; // wrap to first point
        let y2 = polygon[(i + 1) % n].y;

        if ((y < y1 && y >= y2) || (y >= y1 && y < y2)) {
          if (x < ((x2 - x1) * (y - y1)) / (y2 - y1) + x1) {
            is_in = !is_in;
          }
        }
      }

      return is_in;
    }

    function boundingBox() {
      let min_x = Infinity,
        min_y = Infinity;
      let max_x = -Infinity,
        max_y = -Infinity;

      if (!polygon || polygon.length === 0) return;

      bufferCtx.setLineDash([5, 3]);
      for (let i = 0; i < polygon.length; i++) {
        min_x = Math.min(min_x, polygon[i].x);
        min_y = Math.min(min_y, polygon[i].y);
        max_x = Math.max(max_x, polygon[i].x);
        max_y = Math.max(max_y, polygon[i].y);
      }
      let width = max_x - min_x + 2 * padding;
      let height = max_y - min_y + 2 * padding;

      bufferCtx.strokeStyle = "black";
      bufferCtx.rect(min_x - padding, min_y - padding, width, height);
      bufferCtx.stroke();

      return {
        x: min_x - padding,
        y: min_y - padding,
        ex: max_x + padding,
        ey: max_y + padding,
      };
    }

    function pointCollector(box) {
      let point = [];
      for (let i = box.x; i < box.ex; i++) {
        for (let j = box.y; j < box.ey; j++) {
          point.push({ x: i, y: j });
        }
      }
      return point;
    }

    activateTool(bufferCanvas, startLasso, drawLasso, stopLasso);
    bufferCanvas.style.display = "flex";
    updateCoords(bufferCanvas);
    updateDimens(bufferCanvas);
    return {
      removeEvents: () => {
        bufferCanvas.style.display = "none";
        selectionBuffer.style.display = "none";
        deactivateTool(bufferCanvas, startLasso, drawLasso, stopLasso);
      },
    };
  },

  rectlasso: () => {
    const bufferCanvas = document.getElementById("canvasbuffer");
    const selectionBuffer = document.getElementById("selectionbuffer");
    const bufferCtx = bufferCanvas.getContext("2d");
    const SBufferCtx = selectionBuffer.getContext("2d");

    bufferCanvas.width = canvas.width;
    selectionBuffer.width = canvas.width;
    bufferCanvas.height = canvas.height;
    selectionBuffer.height = canvas.height;

    bufferCtx.lineWidth = 1;
    ctx.lineWidth = 1;
    bufferCanvas.style.cursor = "cosshair";
    canvas.style.cursor = "cosshair";
    selectionBuffer.style.cursor = "cosshair";
    let isDrawing = false;
    let isDragging = false;
    let isSelected = false;
    let start,
      end,
      selectedImageData = null;
    let offsetX, offsetY;
    bufferCtx.strokeStyle = "black";
    bufferCtx.setLineDash([5, 3]);

    const startLassoRect = (e) => {
      selectedImageData = null;
      isDrawing = true;
      start = getMousePos(bufferCanvas, e);
    };

    const drawLassoRect = (e) => {
      if (!isDrawing) return;
      end = getMousePos(bufferCanvas, e);
      let width = end.x - start.x;
      let height = end.y - start.y;
      bufferCtx.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height);
      bufferCtx.beginPath();
      bufferCtx.strokeRect(start.x, start.y, width, height);
    };

    const stopLassoRect = (e) => {
      isDrawing = false;
      isSelected = true;
      end = getMousePos(bufferCanvas, e);
      let width = end.x - start.x;
      let height = end.y - start.y;
      selectedImageData = ctx.getImageData(start.x, start.y, width, height);
      ctx.clearRect(start.x, start.y, width, height);
      if (start.x > end.x) {
        SBufferCtx.putImageData(selectedImageData, end.x, end.y);
      } else {
        SBufferCtx.putImageData(selectedImageData, start.x, start.y);
      }
      bufferCanvas.style.display = "none";
      selectionBuffer.style.display = "block";
      activateTool(
        selectionBuffer,
        startDragHandler,
        DraghHandler,
        stopDraghHandler,
      );
    };

    const startDragHandler = (e) => {
      let mouse = getMousePos(canvas, e);
      if (isInsideSelection(mouse.x, mouse.y)) {
        selectionBuffer.style.cursor = "grab";
        isDragging = true;
        offsetX = start.x > end.x ? mouse.x - end.x : mouse.x - start.x;
        offsetY = start.y > end.y ? mouse.y - end.x : mouse.y - start.y;
      }
    };
    const DraghHandler = (e) => {
      if (!isDragging) return;
      let mouse = getMousePos(canvas, e);
      if (isInsideSelection(mouse.x, mouse.y)) {
        selectionBuffer.style.cursor = "grabbing";
      }
      const dx = mouse.x - offsetX;
      const dy = mouse.y - offsetY;

      SBufferCtx.clearRect(0, 0, selectionBuffer.width, selectionBuffer.height);
      SBufferCtx.putImageData(selectedImageData, dx, dy);

      start.x = dx;
      start.y = dy;
    };

    const stopDraghHandler = (e) => {
      if (!isDragging) return;
      isDragging = false;
      bufferCanvas.style.display = "block";
      bufferCanvas.style.cursor = "crosshair";
      SBufferCtx.clearRect(0, 0, selectionBuffer.width, selectionBuffer.height);
      bufferCtx.clearRect(0, 0, selectionBuffer.width, selectionBuffer.height);
      ctx.putImageData(selectedImageData, start.x, start.y);
      deactivateTool(
        selectionBuffer,
        startDragHandler,
        DraghHandler,
        stopDraghHandler,
      );
      selectionBuffer.style.display = "none";
      isSelected = false;
      undo.logging("RectLasso");
    };

    const isInsideSelection = (x, y) => {
      if (start.x > end.x) {
        return (
          x >= end.x &&
          x <= end.x + selectedImageData.width &&
          y >= end.y &&
          y <= end.y + selectedImageData.height
        );
      }
      return (
        x >= start.x &&
        x <= start.x + selectedImageData.width &&
        y >= start.y &&
        y <= start.y + selectedImageData.height
      );
    };

    activateTool(bufferCanvas, startLassoRect, drawLassoRect, stopLassoRect);
    bufferCanvas.style.display = "flex";
    updateCoords(bufferCanvas);
    updateDimens(bufferCanvas);
    return {
      removeEvents: () => {
        bufferCanvas.style.display = "none";
        selectionBuffer.style.display = "none";
        deactivateTool(
          bufferCanvas,
          startLassoRect,
          drawLassoRect,
          stopLassoRect,
        );
      },
    };
  },
  eyedrop: () => {
    const eyeDrop = document.getElementById("eyedrop");
    const brush = document.getElementById("brush");
    const customCursorUrl = "/static/cursors/eye-dropper.png";
    const cursorHotspotX = 15;
    const cursorHotspotY = 24;
    canvas.style.cursor = `url(${customCursorUrl}), auto`;
    const handleEyeClick = (e) => {
      let mouse = getMousePos(canvas, e);

      const pixelColor = getColorAtPosition(
        mouse.x - cursorHotspotX,
        mouse.y - cursorHotspotY,
      );

      currentColorDisplay.style.backgroundColor = pixelColor;
      currentColor = pixelColor;

      deactivateTool();
      ToolsInstance["brush"]();
    };

    function getColorAtPosition(x, y) {
      let pxData = ctx.getImageData(x, y, 1, 1);
      return `rgb(${pxData.data[0]} ${pxData.data[1]} ${pxData.data[2]} / ${pxData.data[3] / 255})`;
    }
    const activateTool = () => {
      if (isMobileOrTab()) {
        canvas.addEventListener("touchstart", handleEyeClick);
      }
      canvas.addEventListener("mousedown", handleEyeClick);
    };
    const deactivateTool = () => {
      if (isMobileOrTab()) {
        canvas.removeEventListener("touchstart", handleEyeClick);
      }
      canvas.removeEventListener("mousedown", handleEyeClick);
      eyeDrop.classList.remove("pressed");
      brush.classList.add("pressed");
      canvas.style.cursor = "url(/static/cursors/precise-dotted.png), auto";
    };

    activateTool();
    updateCoords(canvas);
    return {
      removeEvents: () => {
        deactivateTool();
      },
    };
  },
  magnification: () => {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    const customCursorUrl = "/static/cursors/magnifier.png";
    const buffercanvas = document.getElementById("canvasbuffer");
    const bctx = buffercanvas.getContext("2d");
    const cursorHotspotX = 15;
    const cursorHotspotY = 15;
    const baseWidth = canvas.width;
    const baseHeight = canvas.height;

    let imageData = null;
    let zoom = 1;
    canvas.style.cursor = `url(${customCursorUrl}) ${cursorHotspotX} ${cursorHotspotY}, auto`;

    document.addEventListener("htmx:afterSwap", function (e) {
      const MOptions = e.detail.target.querySelectorAll(
        ".MagnificationOptions button",
      );

      if (MOptions && MOptions.length > 0) {
        MOptions.forEach((option) => {
          option.addEventListener("click", () => {
            MOptions.forEach((opt) => opt.classList.remove("pressed"));
            option.classList.add("pressed");
            const newZoom = parseFloat(option.value);
            setZoom(newZoom);
          });
        });
      }
    });

    function setZoom(factor) {
      console.log(zoom);
      zoom = Math.max(0.1, Math.min(10, factor));
      buffercanvas.width = canvas.width;
      buffercanvas.height = canvas.height;

      // Copy current canvas content
      bctx.drawImage(canvas, 0, 0);

      canvas.style.width = `${baseWidth * zoom}px`;
      canvas.style.height = `${baseHeight * zoom}px`;

      // Clear original canvas
      ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transforms
      ctx.scale(zoom, zoom);
      console.log("Zoomed", zoom);
      // Apply scaling
      ctx.drawImage(buffercanvas, canvas.width, canvas.height); // Draw scaled image
    }

    const activateTool = () => {
      if (isMobileOrTab()) {
        canvas.addEventListener("touchstart", () => setZoom(zoom));
      }
      canvas.addEventListener("mousedown", () => setZoom(zoom));
    };

    const deactivateTool = () => {
      if (isMobileOrTab()) {
        canvas.removeEventListener("touchstart", () => setZoom(zoom));
      }
      canvas.removeEventListener("mousedown", () => setZoom(zoom));
    };

    activateTool();
    updateCoords(canvas);
    updateDimens(canvas);
    return {
      removeEvents: () => {
        deactivateTool();
      },
    };
  },
  floodfill: () => {
    const customCursorUrl = "/static/cursors/fill-bucket.png";
    const cursorHotspotX = 15;
    const cursorHotspotY = 15;
    canvas.style.cursor = `url(${customCursorUrl}) ${cursorHotspotX} ${cursorHotspotY}, auto`;

    function floodFill(ctx, x, y, fcolor, range = 1) {
      let imageData = ctx.getImageData(
        0,
        0,
        ctx.canvas.width,
        ctx.canvas.height,
      );
      const width = imageData.width;
      const height = imageData.height;
      const visited = new Uint8Array(width * height);

      let fillStack = [];
      fillStack.push([x, y]);

      const targetColor = getPixel(imageData, x, y);
      const rangeSq = range * range;

      while (fillStack.length > 0) {
        const [cx, cy] = fillStack.pop();

        if (
          cx >= 0 &&
          cx < width &&
          cy >= 0 &&
          cy < height &&
          !visited[cy * width + cx] &&
          colorsMatch(getPixel(imageData, cx, cy), targetColor, rangeSq)
        ) {
          setPixel(imageData, cx, cy, fcolor);
          visited[cy * width + cx] = 1;

          fillStack.push([cx + 1, cy]);
          fillStack.push([cx - 1, cy]);
          fillStack.push([cx, cy + 1]);
          fillStack.push([cx, cy - 1]);
        }
      }
      ctx.putImageData(imageData, 0, 0);
    }

    function getPixel(imageData, x, y) {
      const offset = (y * imageData.width + x) * 4;
      return [
        imageData.data[offset],
        imageData.data[offset + 1],
        imageData.data[offset + 2],
        imageData.data[offset + 3],
      ];
    }

    function setPixel(imageData, x, y, Scolor) {
      let i = (y * imageData.width + x) * 4;
      imageData.data[i] = Scolor[0];
      imageData.data[i + 1] = Scolor[1];
      imageData.data[i + 2] = Scolor[2];
      imageData.data[i + 3] = Scolor[3];
    }

    function colorsMatch(a, b, rangeSq) {
      const dr = a[0] - b[0];
      const dg = a[1] - b[1];
      const db = a[2] - b[2];
      const da = a[3] - b[3];
      return dr * dr + dg * dg + db * db + da * da < rangeSq;
    }

    const mousedown = (e) => {
      let pos = getMousePos(canvas, e);
      floodFill(ctx, Math.floor(pos.x), Math.floor(pos.y), currentColor, 10);
      undo.logging("FloodFill");
    };

    const activateTool = () => {
      if (isMobileOrTab()) {
        canvas.addEventListener("touchstart", mousedown);
      }
      canvas.addEventListener("mousedown", mousedown);
    };

    const deactivateTool = () => {
      if (isMobileOrTab()) {
        canvas.removeEventListener("touchstart", mousedown);
      }
      canvas.removeEventListener("mousedown", mousedown);
    };

    activateTool();
    updateCoords(canvas);
    updateDimens(canvas);
    return {
      removeEvents: () => {
        deactivateTool();
      },
      changeColor: (color) => {
        currentColor = color;
      },
    };
  },

  line: () => {
    const bufferCanvas = document.getElementById("canvasbuffer");
    const bufferCtx = bufferCanvas.getContext("2d");
    let isDrawing = false;
    let start = null;
    let end = null;

    let linewidth = 1;

    bufferCanvas.style.display = "none";
    bufferCanvas.width = canvas.width;
    bufferCanvas.height = canvas.height;

    canvas.style.cursor = "crosshair";
    bufferCanvas.style.cursor = "crosshair";

    document.addEventListener("htmx:afterSwap", function (e) {
      const LOptions = e.detail.target.querySelectorAll(".Loptions");

      if (LOptions && LOptions.length > 0) {
        LOptions.forEach((option) => {
          option.addEventListener("click", () => {
            LOptions.forEach((opt) => opt.classList.remove("pressed"));
            option.classList.add("pressed");
            linewidth = parseInt(option.value, 10);
          });
        });
      }
    });

    const startLineHandler = (e) => {
      start = getMousePos(canvas, e);
      isDrawing = true;
    };

    const drawLineHandler = (e) => {
      if (!isDrawing) return;
      end = getMousePos(canvas, e);
      bufferCtx.strokeStyle = currentColor;
      bufferCtx.lineWidth = linewidth;
      bufferCtx.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height);
      bufferCtx.beginPath();
      bufferCtx.moveTo(start.x, start.y);
      bufferCtx.lineTo(end.x, end.y);
      bufferCtx.closePath();
      bufferCtx.stroke();
    };

    const stopLineHandler = (e) => {
      if (!isDrawing) return;
      isDrawing = false;
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = linewidth;
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.closePath();
      ctx.stroke();
      bufferCtx.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height);
      undo.logging("Line");
    };

    bufferCanvas.style.display = "flex";
    activateTool(
      bufferCanvas,
      startLineHandler,
      drawLineHandler,
      stopLineHandler,
    );
    updateCoords(bufferCanvas);
    updateDimens(bufferCanvas);
    return {
      removeEvents: () => {
        bufferCanvas.style.display = "none";
        deactivateTool(
          bufferCanvas,
          startLineHandler,
          drawLineHandler,
          stopLineHandler,
        );
      },
      changeColor: (color) => {
        currentColor = ToRgbString(color);
      },
    };
  },
  curveline: () => {
    const bufferCanvas = document.getElementById("canvasbuffer");
    const bufferCtx = bufferCanvas.getContext("2d");
    let isCurving = false;
    let start = null;
    let end = null;
    let cp1 = null;
    let cp2 = null;
    let mouseDownEv = 2;
    let draggingCp1 = false;
    let draggingCp2 = false;
    let linewidth = 1;
    bufferCanvas.style.display = "none";
    bufferCanvas.width = canvas.width;
    bufferCanvas.height = canvas.height;

    canvas.style.cursor = "crosshair";
    bufferCanvas.style.cursor = "crosshair";

    document.addEventListener("htmx:afterSwap", function (e) {
      const LOptions = e.detail.target.querySelectorAll(".Loptions");

      if (LOptions && LOptions.length > 0) {
        LOptions.forEach((option) => {
          option.addEventListener("click", () => {
            LOptions.forEach((opt) => opt.classList.remove("pressed"));
            option.classList.add("pressed");
            linewidth = parseInt(option.value, 10);
          });
        });
      }
    });
    const isWithinControlPoint = (mousepos, cp) => {
      const dx = mousepos.x - cp.x;
      const dy = mousepos.y - cp.y;
      return Math.sqrt(dx * dx + dy * dy) < 100;
    };
    const startCurvingHandler = (e) => {
      start = getMousePos(canvas, e);
      isCurving = true;
    };

    const curveHandler = (e) => {
      if (!isCurving) return;
      end = getMousePos(canvas, e);
      let Mx = Math.abs((end.x + start.x) / 2);
      let My = Math.abs((end.y + start.y) / 2);
      cp1 = {
        x: Math.abs((Mx + start.x) / 2),
        y: Math.abs((My + start.y) / 2),
      };
      cp2 = {
        x: Math.abs((end.x + Mx) / 2),
        y: Math.abs((end.y + My) / 2),
      };
      drawCurve(bufferCtx);
    };

    function drawCurve(ctx) {
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = linewidth;
      ctx.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height);
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, end.x, end.y);
      ctx.stroke();
      // // Start and end points
      // ctx.fillStyle = "blue";
      // ctx.beginPath();
      // ctx.arc(start.x, start.y, 5, 0, 2 * Math.PI); // Start point
      // ctx.arc(end.x, end.y, 5, 0, 2 * Math.PI); // End point
      // ctx.fill();

      // // Control points
      // ctx.fillStyle = "red";
      // ctx.beginPath();
      // ctx.arc(cp1.x, cp1.y, 5, 0, 2 * Math.PI); // Control point one
      // ctx.arc(cp2.x, cp2.y, 5, 0, 2 * Math.PI); // Control point two
      // ctx.fill();
    }

    const stopCurvingHandler = () => {
      if (!isCurving) return;
      isCurving = false;
      ctx.lineWidth = linewidth;
      ctx.strokeStyle = currentColor;
      bufferCtx.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height);
      drawCurve(bufferCtx);
      activateCurve();
    };
    function activateCurve() {
      mouseDownEv = 2;
      deactivateTool(
        bufferCanvas,
        startCurvingHandler,
        curveHandler,
        stopCurvingHandler,
      );
      bufferCanvas.addEventListener("mousedown", mouseDownHandler);
      bufferCanvas.addEventListener("mousemove", mouseMoveHandler);
      bufferCanvas.addEventListener("mouseup", mouseUpHandler);
    }
    const mouseDownHandler = (e) => {
      if (isWithinControlPoint(getMousePos(canvas, e), cp1)) {
        draggingCp1 = true;
      } else if (isWithinControlPoint(getMousePos(canvas, e), cp2)) {
        draggingCp2 = true;
      }
    };
    const mouseMoveHandler = (e) => {
      if (draggingCp1 || draggingCp2) {
        let mousepos = getMousePos(canvas, e);
        if (draggingCp1) {
          cp1.x = mousepos.x;
          cp1.y = mousepos.y;
        } else if (draggingCp2) {
          cp2.x = mousepos.x;
          cp2.y = mousepos.y;
        }
        bufferCtx.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height);
        drawCurve(bufferCtx);
      }
    };

    const mouseUpHandler = () => {
      mouseDownEv--;
      draggingCp1 = false;
      draggingCp2 = false;
      if (mouseDownEv == 0) {
        deactivateCurve();
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, end.x, end.y);
        ctx.stroke();
        bufferCtx.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height);
        undo.logging("Curveline");
        return;
      }
    };
    function deactivateCurve() {
      activateTool(
        bufferCanvas,
        startCurvingHandler,
        curveHandler,
        stopCurvingHandler,
      );
      bufferCanvas.removeEventListener("mousedown", mouseDownHandler);
      bufferCanvas.removeEventListener("mousemove", mouseMoveHandler);
      bufferCanvas.removeEventListener("mouseup", mouseUpHandler);
    }

    bufferCanvas.style.display = "flex";
    activateTool(
      bufferCanvas,
      startCurvingHandler,
      curveHandler,
      stopCurvingHandler,
    );
    updateCoords(bufferCanvas);
    updateDimens(bufferCanvas);

    return {
      removeEvents: () => {
        bufferCanvas.style.display = "none";
        deactivateTool(
          bufferCanvas,
          startCurvingHandler,
          curveHandler,
          stopCurvingHandler,
        );
        bufferCanvas.removeEventListener("mousedown", mouseDownHandler);
        bufferCanvas.removeEventListener("mousemove", mouseMoveHandler);
        bufferCanvas.removeEventListener("mouseup", mouseUpHandler);
      },
      changeColor: (color) => {
        currentColor = ToRgbString(color);
      },
    };
  },

  polygonshape: () => {
    const bufferCanvas = document.getElementById("canvasbuffer");
    const bufferCtx = bufferCanvas.getContext("2d");
    const closeThreshold = 50;
    let POptions = 1;
    let points = [];
    let isDrawing = false;
    let isPolygonComplete = false;

    bufferCanvas.style.display = "none";
    bufferCanvas.width = canvas.width;
    bufferCanvas.height = canvas.height;

    canvas.style.cursor = "crosshair";
    bufferCanvas.style.cursor = "crosshair";

    bufferCtx.lineWidth = 1;
    ctx.lineWidth = 1;

    document.addEventListener("htmx:afterSwap", function (e) {
      const PolyOptions = e.detail.target.querySelectorAll(
        ".polygontool button",
      );
      if (PolyOptions && PolyOptions.length > 0) {
        PolyOptions.forEach((option) => {
          option.addEventListener("click", () => {
            PolyOptions.forEach((opt) => opt.classList.remove("pressed"));
            option.classList.add("pressed");
            POptions = parseInt(option.value, 10);
            deactivateTool();
            activateTool();
          });
        });
      }
    });

    const isCloseToStart = (currentPoint, startPoint) => {
      const distance = Math.sqrt(
        Math.pow(currentPoint.x - startPoint.x, 2) +
          Math.pow(currentPoint.y - startPoint.y, 2),
      );
      return distance < closeThreshold;
    };

    const completePolygon = () => {
      if (points.length < 3) return;
      drawLine(points[points.length - 1], points[0]);
      isPolygonComplete = true;
      bufferCtx.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height);
      if (POptions === 2) {
        ctx.fillStyle = "white";
        fillPolygon();
      } else if (POptions === 3) {
        ctx.fillStyle = currentColor;
        fillPolygon();
      }
      points = [];
    };

    const startPolygonHandler = (e) => {
      if (isPolygonComplete) {
        points = [];
        isPolygonComplete = false;
      }
      const mousePos = getMousePos(bufferCanvas, e);
      points.push(mousePos);
      isDrawing = true;

      if (points.length > 1) {
        drawLine(points[points.length - 2], mousePos);
      }

      if (points.length > 2 && isCloseToStart(mousePos, points[0])) {
        completePolygon();
      }
    };

    const drawLine = (start, end) => {
      ctx.strokeStyle = currentColor;
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
    };

    const drawBufferLine = (e) => {
      if (!isDrawing) return;

      const mousePos = getMousePos(bufferCanvas, e);
      bufferCtx.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height);
      const lastPoint = points[points.length - 1];
      bufferCtx.strokeStyle = currentColor;
      bufferCtx.beginPath();
      bufferCtx.moveTo(lastPoint.x, lastPoint.y);
      bufferCtx.lineTo(mousePos.x, mousePos.y);
      bufferCtx.stroke();
    };

    const stopLineHandler = () => {
      isDrawing = false;
      undo.logging("PolygonShape");
    };

    const fillPolygon = () => {
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.closePath();
      ctx.fill();
    };

    bufferCanvas.style.display = "block";
    activateTool(
      bufferCanvas,
      startPolygonHandler,
      drawBufferLine,
      stopLineHandler,
    );
    updateCoords(bufferCanvas);
    updateDimens(bufferCanvas);
    return {
      removeEvents: () => {
        bufferCanvas.style.display = "none";
        deactivateTool(
          bufferCanvas,
          startPolygonHandler,
          drawBufferLine,
          stopLineHandler,
        );
      },
      changeColor: (color) => {
        currentColor = ToRgbString(color);
      },
    };
  },

  text: () => {
    const bufferCanvas = document.getElementById("canvasbuffer");
    const bufferCtx = bufferCanvas.getContext("2d");
    const textarea = document.getElementById("textarea");
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    let start = null;

    bufferCtx.lineWidth = 1;
    ctx.lineWidth = 1;

    bufferCanvas.width = canvas.width;
    bufferCanvas.height = canvas.height;

    bufferCanvas.style.display = "none";
    bufferCanvas.style.background = "transparent";

    let textBoxX, textBoxY, textBoxWidth, textBoxHeight;
    let isDrawing = false;
    let isEditing = false;

    // Apply custom cursor with hotspot
    canvas.style.cursor = "crosshair";
    bufferCanvas.style.cursor = "crosshair";

    const startTextBox = (e) => {
      start = getMousePos(canvas, e);
      if (!isEditing) {
        isDrawing = true;
        textBoxX = start.x;
        textBoxY = start.y;
      } else {
        saveTextToCanvas();
        isEditing = false;
      }
    };

    const writeTextBox = (e) => {
      if (!isDrawing) return;
      let mouse = getMousePos(canvas, e);
      textBoxWidth = mouse.x - start.x;
      textBoxHeight = mouse.y - start.y;

      draw();
    };

    const stopTextBox = () => {
      if (!isDrawing) return;
      isDrawing = false;
      isEditing = true;
      textarea.style.border = "none";
      textarea.style.left = `${textBoxX}px`;
      textarea.style.top = `${textBoxY}px`;
      textarea.style.width = `${textBoxWidth}px`;
      textarea.style.height = `${textBoxHeight}px`;
      textarea.value = "";
      textarea.classList.remove("hidden");
      textarea.focus();
      bufferCtx.clearRect(textBoxX, textBoxY, textBoxWidth, textBoxHeight);
      undo.logging("Text");
    };

    const onBlur = () => {
      saveTextToCanvas();
      isEditing = false;
      bufferCtx.clearRect(textBoxX, textBoxY, textBoxWidth, textBoxHeight);
    };

    const onKeyPress = (e) => {
      if (e.key === "Enter") {
        saveTextToCanvas();
        isEditing = false;
      } else if (e.key === "Escape") {
        textarea.classList.add("hidden");
        isEditing = false;
      }
    };

    function draw() {
      bufferCtx.clearRect(0, 0, canvas.width, canvas.height);
      bufferCtx.strokeStyle = "black";
      bufferCtx.strokeRect(textBoxX, textBoxY, textBoxWidth, textBoxHeight);
    }

    function saveTextToCanvas() {
      const text = textarea.value;
      if (text) {
        ctx.font = "16px Arial";
        ctx.fillStyle = currentColor;
        const lines = text.split("\n");
        for (let i = 0; i < lines.length; i++) {
          ctx.fillText(lines[i], textBoxX + 5, textBoxY + 20 + i * 20);
        }
      }
      textarea.classList.add("hidden");
      bufferCtx.clearRect(0, 0, canvas.width, canvas.height);
    }

    const activateTool = () => {
      bufferCanvas.style.display = "flex";
      if (isMobileOrTab()) {
        bufferCanvas.addEventListener("touchstart", startTextBox);
        bufferCanvas.addEventListener("touchmove", writeTextBox);
        bufferCanvas.addEventListener("touchend", stopTextBox);
      }
      bufferCanvas.addEventListener("mousedown", startTextBox);
      bufferCanvas.addEventListener("mousemove", writeTextBox);
      bufferCanvas.addEventListener("mouseup", stopTextBox);
      textarea.addEventListener("blur", onBlur);
      textarea.addEventListener("keypress", onKeyPress);
    };

    const deactivateTool = () => {
      bufferCanvas.style.display = "none";
      if (isMobileOrTab()) {
        bufferCanvas.removeEventListener("touchmove", writeTextBox);
        bufferCanvas.removeEventListener("touchend", stopTextBox);
        bufferCanvas.removeEventListener("touchstart", startTextBox);
        bufferCanvas.removeEventListener("touchcancel", stopTextBox);
      }
      bufferCanvas.removeEventListener("mousedown", startTextBox);
      bufferCanvas.removeEventListener("mousemove", writeTextBox);
      bufferCanvas.removeEventListener("mouseup", stopTextBox);
      textarea.removeEventListener("blur", onBlur);
      textarea.removeEventListener("keypress", onKeyPress);
    };

    activateTool();
    updateCoords(bufferCanvas);
    updateDimens(bufferCanvas);
    return {
      removeEvents: () => {
        deactivateTool();
      },
      changeColor: (color) => {
        currentColor = ToRgbString(color);
      },
    };
  },

  rectshape: () => {
    const bufferCanvas = document.getElementById("canvasbuffer");
    const bufferCtx = bufferCanvas.getContext("2d");
    isDrawing = false;
    let start = null;
    let rect = null;
    let OptValue = 1;
    let currentMouseHandler = null;
    bufferCanvas.style.display = "none";
    bufferCanvas.width = canvas.width;
    bufferCanvas.height = canvas.height;

    bufferCtx.lineWidth = 1;
    ctx.lineWidth = 1;

    canvas.style.cursor = "crosshair";
    bufferCanvas.style.cursor = "crosshair";

    document.addEventListener("htmx:afterSwap", function (e) {
      const RectOptions = e.detail.target.querySelectorAll(".rectTool button");

      if (RectOptions && RectOptions.length > 0) {
        RectOptions.forEach((option) => {
          option.addEventListener("click", () => {
            RectOptions.forEach((opt) => opt.classList.remove("pressed"));
            option.classList.add("pressed");
            OptValue = parseInt(option.value, 10);
            deactivateTool();
            activateTool();
          });
        });
      }
    });

    const startRectHandler = (e) => {
      start = getMousePos(canvas, e);
      isDrawing = true;
    };

    const drawRectHandler = (e) => {
      if (!isDrawing) return;
      rect = getMousePos(canvas, e);
      bufferCtx.strokeStyle = currentColor;
      bufferCtx.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height);
      bufferCtx.beginPath();
      bufferCtx.strokeRect(
        start.x,
        start.y,
        rect.x - start.x,
        rect.y - start.y,
      );
    };

    const drawFilledRectHandler = (e) => {
      if (!isDrawing) return;
      rect = getMousePos(canvas, e);
      bufferCtx.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height);
      bufferCtx.beginPath();
      bufferCtx.strokeStyle = "black";
      bufferCtx.fillStyle = "white";
      bufferCtx.rect(start.x, start.y, rect.x - start.x, rect.y - start.y);
      bufferCtx.fill();
      bufferCtx.stroke();
    };

    const drawFilledStrokeRectHandler = (e) => {
      if (!isDrawing) return;
      rect = getMousePos(canvas, e);
      bufferCtx.strokeStyle = currentColor;
      bufferCtx.fillStyle = currentColor;
      bufferCtx.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height);
      bufferCtx.beginPath();
      bufferCtx.fillRect(start.x, start.y, rect.x - start.x, rect.y - start.y);
    };

    const stopRectHandler = (e) => {
      if (!isDrawing) return;
      isDrawing = false;
      rect = getMousePos(canvas, e);
      ctx.beginPath();
      if (OptValue === 1) {
        ctx.strokeStyle = currentColor;
        ctx.strokeRect(start.x, start.y, rect.x - start.x, rect.y - start.y);
      } else if (OptValue === 2) {
        ctx.fillStyle = "white";
        ctx.rect(start.x, start.y, rect.x - start.x, rect.y - start.y);
        ctx.fill();
        ctx.stroke();
      } else if (OptValue == 3) {
        ctx.fillStyle = currentColor;
        ctx.fillRect(start.x, start.y, rect.x - start.x, rect.y - start.y);
        ctx.stroke();
      }
      undo.logging("Rectshape");
      bufferCtx.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height);
    };

    const activateTool = () => {
      bufferCanvas.style.display = "flex";
      if (isMobileOrTab()) {
        canvas.addEventListener("touchstart", startRectHandler);
        if (currentMouseHandler) {
          bufferCanvas.removeEventListener("touchmove", currentMouseHandler);
        }
        if (OptValue === 1) {
          currentMouseHandler = drawRectHandler;
        } else if (OptValue === 2) {
          currentMouseHandler = drawFilledRectHandler;
        } else if (OptValue === 3) {
          currentMouseHandler = drawFilledStrokeRectHandler;
        }
        bufferCanvas.addEventListener("touchmove", currentMouseHandler);
        bufferCanvas.addEventListener("touchend", stopRectHandler);
        bufferCanvas.addEventListener("touchcancel", stopRectHandler);
      }
      bufferCanvas.addEventListener("mousedown", startRectHandler);
      if (currentMouseHandler) {
        bufferCanvas.removeEventListener("mousemove", currentMouseHandler);
      }
      if (OptValue === 1) {
        currentMouseHandler = drawRectHandler;
      } else if (OptValue === 2) {
        currentMouseHandler = drawFilledRectHandler;
      } else if (OptValue === 3) {
        currentMouseHandler = drawFilledStrokeRectHandler;
      }
      bufferCanvas.addEventListener("mousemove", currentMouseHandler);
      bufferCanvas.addEventListener("mouseup", stopRectHandler);
      // console.log("rect activated");
    };

    const deactivateTool = () => {
      bufferCanvas.style.display = "none";
      if (isMobileOrTab()) {
        if (currentMouseHandler) {
          bufferCanvas.removeEventListener("touchmove", currentMouseHandler);
        }
        bufferCanvas.removeEventListener("touchend", stopRectHandler);
        bufferCanvas.removeEventListener("touchstart", startRectHandler);
        bufferCanvas.removeEventListener("touchcancel", stopRectHandler);
      }
      bufferCanvas.removeEventListener("mousedown", startRectHandler);
      if (currentMouseHandler) {
        bufferCanvas.removeEventListener("mousemove", currentMouseHandler);
        currentMouseHandler = null;
      }
      bufferCanvas.removeEventListener("mouseup", stopRectHandler);
      // console.log("deactivated rectshape");
    };
    activateTool();
    updateCoords(bufferCanvas);
    updateDimens(bufferCanvas);
    return {
      removeEvents: () => {
        deactivateTool();
      },
      changeColor: (color) => {
        currentColor = ToRgbString(color);
      },
    };
  },

  ellipse: () => {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    const bufferCanvas = document.getElementById("canvasbuffer");
    const bufferCtx = bufferCanvas.getContext("2d");
    let isDrawing = false;
    let startPos = null;
    let fill = false;
    let stroke = true;
    let nostroke_fill = false;
    let EOptions = 1;
    bufferCanvas.style.display = "none";
    bufferCanvas.width = canvas.width;
    bufferCanvas.height = canvas.height;
    console.log("active");

    const customCursorUrl = "/static/cursors/precise.png";
    const cursorHotspotX = 45; // Adjust this value to center the cursor image
    const cursorHotspotY = 5; // Adjust this value to center the cursor image

    // Apply custom cursor with hotspot
    canvas.style.cursor = `url(${customCursorUrl}), auto`;
    bufferCanvas.style.cursor = `url(${customCursorUrl}) , auto`;
    document.addEventListener("htmx:afterSwap", function (e) {
      const EllipseOptions = e.detail.target.querySelectorAll(
        ".ellipsetool button",
      );
      if (EllipseOptions && EllipseOptions.length > 0) {
        EllipseOptions.forEach((option) => {
          option.addEventListener("click", () => {
            //@TODO
            EllipseOptions.forEach((opt) => opt.classList.remove("pressed"));
            option.classList.add("pressed");
            EOptions = parseInt(option.value, 10);
            bufferCanvas.style.display = "none";
            deactivateTool(
              bufferCanvas,
              startCircleHandler,
              drawCircleHandler,
              stopCircleHandler,
            );

            bufferCanvas.style.display = "flex";
            activateTool(
              bufferCanvas,
              startCircleHandler,
              drawCircleHandler,
              stopCircleHandler,
            );
          });
        });
      }
    });

    const startCircleHandler = (e) => {
      startPos = getMousePos(bufferCanvas, e);
      isDrawing = true;
    };

    const drawCircleHandler = (e) => {
      if (!isDrawing) return;
      const current = getMousePos(bufferCanvas, e);
      const a = Math.abs(current.x - startPos.x);
      const b = Math.abs(current.y - startPos.y);
      bufferCtx.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height);
      stroke = EOptions === 1 ? true : false;
      fill = EOptions === 2 ? true : false;
      nostroke_fill = EOptions === 3 ? true : false;
      drawEllipse(
        bufferCtx,
        startPos.x,
        startPos.y,
        a,
        b,
        currentColor,
        stroke,
        fill,
        nostroke_fill,
      );
    };

    function drawEllipse(ctx, x, y, w, h, color, stroke, fill, nostroke_fill) {
      const center_x = x + w / 2;
      const center_y = y + h / 2;
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.ellipse(center_x, center_y, w, h, 0, 0, 6.2831);
      if (fill) {
        ctx.fillStyle = "white";
        ctx.stroke();
        ctx.fill();
      } else if (stroke) {
        ctx.stroke();
      } else if (nostroke_fill) {
        ctx.fillStyle = color;
        ctx.fill();
      }
    }

    const stopCircleHandler = (e) => {
      if (!isDrawing) return;
      isDrawing = false;
      const current = getMousePos(bufferCanvas, e);
      const a = Math.abs(current.x - startPos.x);
      const b = Math.abs(current.y - startPos.y);
      ctx.strokeStyle = currentColor;
      stroke = EOptions === 1 ? true : false;
      fill = EOptions === 2 ? true : false;
      nostroke_fill = EOptions === 3 ? true : false;
      drawEllipse(
        ctx,
        startPos.x,
        startPos.y,
        a,
        b,
        currentColor,
        stroke,
        fill,
        nostroke_fill,
      );
      bufferCtx.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height);
    };

    const activateTool = () => {
      bufferCanvas.style.display = "flex";
      bufferCanvas.addEventListener("mousedown", startCircleHandler);
      bufferCanvas.addEventListener("mousemove", drawCircleHandler);
      bufferCanvas.addEventListener("mouseup", stopCircleHandler);
    };
    const deactivateTool = () => {
      bufferCanvas.style.display = "none";
      bufferCanvas.removeEventListener("mousedown", startCircleHandler);
      bufferCanvas.removeEventListener("mousemove", drawCircleHandler);
      bufferCanvas.removeEventListener("mouseup", stopCircleHandler);
    };

    activateTool();

    return {
      removeEvents: () => {
        deactivateTool();
      },
      changeColor: (color) => {
        currentColor = color;
      },
    };
  },

  rectelipse: () => {
    const bufferCanvas = document.getElementById("canvasbuffer");
    const bufferCtx = bufferCanvas.getContext("2d");
    let isDrawing = false;
    let start = null;
    const fixedRadius = 10;
    let ROptions = 1;
    let color = "black";
    bufferCtx.lineWidth = 1;
    ctx.lineWidth = 1;
    bufferCanvas.style.display = "none";
    bufferCanvas.width = canvas.width;
    bufferCanvas.height = canvas.height;

    canvas.style.cursor = "crosshair";
    bufferCanvas.style.cursor = "crosshair";

    document.addEventListener("htmx:afterSwap", function (e) {
      const RectElipseOptions = e.detail.target.querySelectorAll(
        ".roundedrect-tool button",
      );

      if (RectElipseOptions && RectElipseOptions.length > 0) {
        RectElipseOptions.forEach((option) => {
          option.addEventListener("click", () => {
            RectElipseOptions.forEach((opt) => opt.classList.remove("pressed"));
            option.classList.add("pressed");
            ROptions = parseInt(option.value, 10);
            bufferCanvas.style.display = "none";
            deactivateTool(
              bufferCanvas,
              startRectHandler,
              drawRectHandler,
              stopRectHandler,
            );

            bufferCanvas.style.display = "flex";
            activateTool(
              bufferCanvas,
              startRectHandler,
              drawRectHandler,
              stopRectHandler,
            );
          });
        });
      }
    });

    const startRectHandler = (e) => {
      start = getMousePos(canvas, e);
      isDrawing = true;
    };

    const drawRectHandler = (e) => {
      if (!isDrawing) return;
      let mouse = getMousePos(canvas, e);
      const rectWidth = mouse.x - start.x;
      const rectHeight = mouse.y - start.y;

      bufferCtx.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height);
      drawRoundedRect(
        bufferCtx,
        start.x,
        start.y,
        rectWidth,
        rectHeight,
        fixedRadius,
        ROptions,
      );
    };

    const stopRectHandler = (e) => {
      if (!isDrawing) return;
      isDrawing = false;
      let mouse = getMousePos(canvas, e);
      const rectWidth = mouse.x - start.x;
      const rectHeight = mouse.y - start.y;

      drawRoundedRect(
        ctx,
        start.x,
        start.y,
        rectWidth,
        rectHeight,
        fixedRadius,
        ROptions,
      );
      undo.logging("RectElipse");
      bufferCtx.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height);
    };

    const drawRoundedRect = (context, x, y, width, height, radius, option) => {
      const absWidth = Math.abs(width);
      const absHeight = Math.abs(height);
      const posX = width > 0 ? x : x + width;
      const posY = height > 0 ? y : y + height;
      const effectiveRadius = Math.min(
        radius,
        Math.min(absWidth / 2, absHeight / 2),
      );

      context.beginPath();
      context.moveTo(posX + effectiveRadius, posY);
      context.lineTo(posX + absWidth - effectiveRadius, posY);
      context.arcTo(
        posX + absWidth,
        posY,
        posX + absWidth,
        posY + effectiveRadius,
        effectiveRadius,
      );
      context.lineTo(posX + absWidth, posY + absHeight - effectiveRadius);
      context.arcTo(
        posX + absWidth,
        posY + absHeight,
        posX + absWidth - effectiveRadius,
        posY + absHeight,
        effectiveRadius,
      );
      context.lineTo(posX + effectiveRadius, posY + absHeight);
      context.arcTo(
        posX,
        posY + absHeight,
        posX,
        posY + absHeight - effectiveRadius,
        effectiveRadius,
      );
      context.lineTo(posX, posY + effectiveRadius);
      context.arcTo(posX, posY, posX + effectiveRadius, posY, effectiveRadius);
      context.closePath();

      if (option === 1) {
        context.strokeStyle = currentColor;
        context.stroke();
      } else if (option === 2) {
        context.strokeStyle = currentColor;
        context.fillStyle = "white";
        context.fill();
        context.stroke();
      } else if (option === 3) {
        context.fillStyle = color;
        context.fill();
        color = currentColor;
      }
    };

    bufferCanvas.style.display = "flex";
    activateTool(
      bufferCanvas,
      startRectHandler,
      drawRectHandler,
      stopRectHandler,
    );
    updateCoords(bufferCanvas);
    updateDimens(bufferCanvas);
    return {
      removeEvents: () => {
        deactivateTool(
          bufferCanvas,
          startRectHandler,
          drawRectHandler,
          stopRectHandler,
        );
        bufferCanvas.style.display = "none";
      },
      changeColor: (color) => {
        currentColor = ToRgbString(color);
      },
    };
  },
};

tools.forEach((tool) => {
  tool.addEventListener("click", (e) => {
    tools.forEach((t) => t.classList.remove("pressed"));
    e.target.classList.add("pressed");

    const toolName = e.target.getAttribute("id");

    if (activeTool) {
      activeTool.removeEvents();
    }

    activeTool = ToolsInstance[toolName]();
  });
});
