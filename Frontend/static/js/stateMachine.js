import DOM from "./DOM.js";
class stateMachine {
  constructor(DOM) {
    this.canvas = DOM.canvas;
    this.ctx = this.canvas.getContext("2d");
    this.bufferCanvas = DOM.bufferCanvas;
    this.bctx = this.bufferCanvas.getConext("2d");
    this.state = "drawing";
    this.tool = "pencil";
    this.color = "#000000";
    this.can_width = "1000px";
    this.can_height = "700px";
    this.brushSize = 1;
    this.isDrawing = false;
    this.pointer = { x: null, y: null, startx: null, starty: null };
    this.toolSet = [
      "rectlasso",
      "lasso",
      "floodfill",
      "pencil",
      "eraser",
      "brush",
      "eyedrop",
      "magnification",
      "airbrush",
      "line",
      "curveline",
      "rectshape",
      "rectelipse",
      "ellipse",
    ];
  }
  setState(state) {
    this.state = state;
  }

  getState() {
    return this.state;
  }

  setTool(tool) {
    this.tool = tool;
  }
  setColor(color) {
    this.color = color;
  }
  setDimension(width, height) {
    this.can_width = width;
    this.can_height = height;
  }
  getDimension() {
    return {
      w: this.can_width,
      h: this.can_height,
    };
  }

  activeTool(canvas, start, draw, stop) {
    canvas.addEventListener("mousedown", start);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", stop);
  }

  deactivateTool(canvas, start, draw, stop) {
    canvas.removeEventListener("mousedown", start);
    canvas.removeEventListener("mousemove", draw);
    canvas.removeEventListener("mouseup", stop);
  }

  getMousePos(canvas, e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }
}
