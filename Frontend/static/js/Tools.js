/**
 * @type HTMLCanvasElement
 */

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });
const dimen = document.getElementById("dimensions");
const coords = document.getElementById("coordinate_value");
const tools = document.querySelectorAll(".tools");
let currentColorDisplay = document.getElementById("selected-color");
let switchColor = document.getElementById("switch-color");
const paletteColors = document.querySelectorAll(".pallete-color");

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
let activeTool = null;

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

const ToolsInstance = {
	pencil: () => {
		let isDrawing = false;
		const customCursorUrl = "/static/cursors/pencil.png";
		let pos = null;
		canvas.style.cursor = `url(${customCursorUrl})`;

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
		};

		const activateTool = () => {
			canvas.addEventListener("mousedown", start);
			canvas.addEventListener("mousemove", draw);
			canvas.addEventListener("mouseup", stop);
			canvas.addEventListener("mouseout", stop); // Handle mouse leaving canvas
		};

		const deactivateTool = () => {
			canvas.removeEventListener("mousedown", start);
			canvas.removeEventListener("mousemove", draw);
			canvas.removeEventListener("mouseup", stop);
			canvas.removeEventListener("mouseout", stop); // Handle mouse leaving canvas
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

	airbrush: () => {
		let isDrawing = false;
		let airOpt = 1;
		let prevX = 0;
		let prevY = 0;
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
			const rect = canvas.getBoundingClientRect();
			prevX = e.clientX - rect.left;
			prevY = e.clientY - rect.top;
			ctx.beginPath();
			updateCoords(canvas); // Ensuring coordinates are updated on start
		}

		function stopDrawing() {
			isDrawing = false;
			ctx.closePath();
		}

		function airBrush(e) {
			if (!isDrawing) return;
			const rect = canvas.getBoundingClientRect();
			let x = e.clientX - rect.left;
			let y = e.clientY - rect.top;
			const { density, radius } =
				airbrushSettings[airOpt] || airbrushSettings[1];

			const dist = Math.sqrt((x - prevX) ** 2 + (y - prevY) ** 2);
			const step = Math.max(1 / dist, 0.05);

			for (let t = 0; t < 1; t += step) {
				const interpolatedX = prevX + (x - prevX) * t;
				const interpolatedY = prevY + (y - prevY) * t;

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
			prevX = x;
			prevY = y;
			updateCoords(canvas);
		}

		const activateTool = () => {
			canvas.addEventListener("mousedown", startDrawing);
			canvas.addEventListener("mousemove", airBrush);
			canvas.addEventListener("mouseup", stopDrawing);
			canvas.addEventListener("mouseout", stopDrawing); // Handle mouse leaving canvas
		};

		const deactivateTool = () => {
			canvas.removeEventListener("mousedown", startDrawing);
			canvas.removeEventListener("mousemove", airBrush);
			canvas.removeEventListener("mouseup", stopDrawing);
			canvas.removeEventListener("mouseout", stopDrawing); // Handle mouse leaving canvas
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
				console.log(currentColor);
				console.log(ctx.fillStyle);
			},
		};
	},

	brush: () => {
		const customCursorUrl = "/static/cursors/brush.png";
		const cursorHotspotX = -45;
		const cursorHotspotY = -5;
		let old = null;
		let brushSize = 1;
		let lineLength = 10;
		let angle = Math.PI / 4;

		canvas.style.cursor = `url(${customCursorUrl}) ${cursorHotspotX} ${cursorHotspotY}, auto`;

		document.addEventListener("htmx:afterSwap", function (e) {
			const brushOptions = e.detail.target.querySelectorAll(
				".BrushOptions button"
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

		function getMousePos(canvas, e) {
			const rect = canvas.getBoundingClientRect();
			return {
				x: e.clientX - rect.left,
				y: e.clientY - rect.top,
			};
		}

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
					y0 + lineLength * Math.sin(angle)
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

		const startBrushDrawing = (e) => {
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

		const stopBrushDrawing = () => {
			isDrawing = false;
		};

		const activateTool = () => {
			canvas.addEventListener("mousedown", startBrushDrawing);
			canvas.addEventListener("mousemove", draw);
			canvas.addEventListener("mouseup", stopBrushDrawing);
		};

		const deactivateTool = () => {
			canvas.removeEventListener("mousedown", startBrushDrawing);
			canvas.removeEventListener("mousemove", draw);
			canvas.removeEventListener("mouseup", stopBrushDrawing);
		};

		activateTool();
		updateCoords(canvas);
		return {
			removeEvents: () => {
				deactivateTool();
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
				".EraserOptions button"
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

		function getMousePos(canvas, e) {
			const rect = canvas.getBoundingClientRect();
			return {
				x: e.clientX - rect.left,
				y: e.clientY - rect.top,
			};
		}

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

		const startEraserDrawing = (e) => {
			isDrawing = true;
			old = getMousePos(canvas, e);
		};

		const stopEraserDrawing = () => {
			isDrawing = false;
		};

		const activateTool = () => {
			canvas.addEventListener("mousedown", startEraserDrawing);
			canvas.addEventListener("mousemove", erase);
			canvas.addEventListener("mouseup", stopEraserDrawing);
		};

		const deactivateTool = () => {
			canvas.removeEventListener("mousedown", startEraserDrawing);
			canvas.removeEventListener("mousemove", erase);
			canvas.removeEventListener("mouseup", stopEraserDrawing);
		};

		activateTool();
		updateCoords(canvas);
		return {
			removeEvents: () => {
				deactivateTool();
			},
		};
	},

	rectlasso: () => {
		const bufferCanvas = document.getElementById("canvasbuffer");
		const selectionBuffer = document.getElementById("selectionbuffer");
		const bufferCtx = bufferCanvas.getContext("2d");
		const SBufferCtx = selectionBuffer.getContext("2d");

		bufferCanvas.width = canvas.width;
		bufferCanvas.height = canvas.height;
		selectionBuffer.width = canvas.width;
		selectionBuffer.height = canvas.height;

		bufferCtx.lineWidth = 1;
		ctx.lineWidth = 1;

		let isDrawing = false;
		let isDragging = false;
		let isSelected = false;
		let startX,
			startY,
			endX,
			endY,
			selectedImageData = null;
		let offsetX, offsetY;

		const startPolyRectHandler = (e) => {
			const rect = bufferCanvas.getBoundingClientRect();
			isDrawing = true;
			startX = e.clientX - rect.left;
			startY = e.clientY - rect.top;
		};

		const drawPolyRectHandler = (e) => {
			if (!isDrawing) return;
			const rect = bufferCanvas.getBoundingClientRect();
			endX = e.clientX - rect.left;
			endY = e.clientY - rect.top;

			bufferCtx.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height);
			bufferCtx.strokeStyle = "black";
			bufferCtx.setLineDash([5, 3]);
			bufferCtx.strokeRect(startX, startY, endX - startX, endY - startY);
		};

		const stopPolyRectHandler = (e) => {
			isDrawing = false;
			isSelected = true;

			const rect = bufferCanvas.getBoundingClientRect();
			endX = e.clientX - rect.left;
			endY = e.clientY - rect.top;
			const width = endX - startX;
			const height = endY - startY;
			bufferCtx.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height);
			selectedImageData = ctx.getImageData(startX, startY, width, height);
			ctx.clearRect(startX, startY, width, height);
			SBufferCtx.clearRect(0, 0, selectionBuffer.width, selectionBuffer.height);
			SBufferCtx.putImageData(selectedImageData, startX, startY);

			bufferCanvas.style.display = "none";
			selectionBuffer.style.display = "block";

			selectionBuffer.addEventListener("mousedown", startDragHandler);
		};

		const startDragHandler = (e) => {
			const rect = selectionBuffer.getBoundingClientRect();
			const mouseX = e.clientX - rect.left;
			const mouseY = e.clientY - rect.top;

			if (isInsideSelection(mouseX, mouseY)) {
				isDragging = true;
				offsetX = mouseX - startX;
				offsetY = mouseY - startY;
				selectionBuffer.addEventListener("mousemove", dragHandler);
				selectionBuffer.addEventListener("mouseup", stopDragHandler);
			} else {
				stopDragHandler(e);
			}
		};

		const dragHandler = (e) => {
			if (!isDragging) return;
			const rect = selectionBuffer.getBoundingClientRect();
			const mouseX = e.clientX - rect.left;
			const mouseY = e.clientY - rect.top;

			const dx = mouseX - offsetX;
			const dy = mouseY - offsetY;

			SBufferCtx.clearRect(0, 0, selectionBuffer.width, selectionBuffer.height);
			SBufferCtx.putImageData(selectedImageData, dx, dy);

			startX = dx;
			startY = dy;
		};

		const stopDragHandler = (e) => {
			if (!isDragging) return;
			isDragging = false;

			ctx.putImageData(selectedImageData, startX, startY);
			SBufferCtx.clearRect(0, 0, selectionBuffer.width, selectionBuffer.height);

			selectionBuffer.removeEventListener("mousemove", dragHandler);
			selectionBuffer.removeEventListener("mouseup", stopDragHandler);

			selectionBuffer.style.display = "none";
			bufferCanvas.style.display = "none";
			isSelected = false;
			activateTool();
		};

		const isInsideSelection = (x, y) => {
			return (
				x >= startX &&
				x <= startX + selectedImageData.width &&
				y >= startY &&
				y <= startY + selectedImageData.height
			);
		};

		const activateTool = () => {
			bufferCanvas.style.display = "flex";
			bufferCanvas.addEventListener("mousedown", startPolyRectHandler);
			bufferCanvas.addEventListener("mousemove", drawPolyRectHandler);
			bufferCanvas.addEventListener("mouseup", stopPolyRectHandler);
		};

		const deactivateTool = () => {
			bufferCanvas.style.display = "none";
			selectionBuffer.style.display = "none";
			bufferCanvas.removeEventListener("mousedown", startPolyRectHandler);
			bufferCanvas.removeEventListener("mousemove", drawPolyRectHandler);
			bufferCanvas.removeEventListener("mouseup", stopPolyRectHandler);
		};

		activateTool();
		updateCoords(bufferCanvas);
		updateDimens(bufferCanvas);
		return {
			removeEvents: () => {
				deactivateTool();
			},
		};
	},

	eyedrop: () => {
		const eyeDrop = document.getElementById("eyedrop");
		const brush = document.getElementById("brush");
		const rect = canvas.getBoundingClientRect();
		const customCursorUrl = "/static/cursors/eye-dropper.png";
		const cursorHotspotX = 15;
		const cursorHotspotY = 24;
		canvas.style.cursor = `url(${customCursorUrl}), auto`;
		const handleEyeClick = (e) => {
			const mouseX = e.clientX - rect.left - cursorHotspotX;
			const mouseY = e.clientY - rect.top - cursorHotspotY;

			const pixelColor = getColorAtPosition(mouseX, mouseY);

			currentColorDisplay.style.backgroundColor = pixelColor;
			currentColor = pixelColor;

			deactivateTool();
			ToolsInstance["brush"]();
		};

		function getColorAtPosition(x, y) {
			let pxData = ctx.getImageData(x, y, 1, 1);
			return (
				"rgb(" +
				pxData.data[0] +
				"," +
				pxData.data[1] +
				"," +
				pxData.data[2] +
				")"
			);
		}
		const activateTool = () => {
			canvas.addEventListener("mousedown", handleEyeClick);
		};
		const deactivateTool = () => {
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
				ctx.canvas.height
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
		};

		const activateTool = () => {
			canvas.addEventListener("mousedown", mousedown);
		};

		const deactivateTool = () => {
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
				console.log(currentColor);
			},
		};
	},

	line: () => {
		const bufferCanvas = document.getElementById("canvasbuffer");
		const bufferCtx = bufferCanvas.getContext("2d");
		let isDrawing = false;
		let startPosX = 0;
		let startPosY = 0;
		let lastPosX = 0;
		let lastPosY = 0;
		let linewidth = 1;
		const rec = bufferCanvas.getBoundingClientRect();

		bufferCanvas.style.display = "none";
		bufferCanvas.width = canvas.width;
		bufferCanvas.height = canvas.height;

		const customCursorUrl = "/static/cursors/precise.png";
		const cursorHotspotX = -45;
		const cursorHotspotY = -5;

		canvas.style.cursor = `url(${customCursorUrl}), auto`;
		bufferCanvas.style.cursor = `url(${customCursorUrl}), auto`;

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
			startPosX = e.clientX - rec.left;
			startPosY = e.clientY - rec.top;
			isDrawing = true;
		};

		const drawLineHandler = (e) => {
			if (!isDrawing) return;
			lastPosX = e.clientX - rec.left;
			lastPosY = e.clientY - rec.top;
			bufferCtx.strokeStyle = currentColor;
			bufferCtx.lineWidth = linewidth;
			bufferCtx.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height);
			bufferCtx.beginPath();
			bufferCtx.moveTo(startPosX + cursorHotspotX, startPosY + cursorHotspotY);
			bufferCtx.lineTo(lastPosX + cursorHotspotX, lastPosY + cursorHotspotY);
			bufferCtx.closePath();
			bufferCtx.stroke();
		};

		const stopLineHandler = (e) => {
			if (!isDrawing) return;
			isDrawing = false;
			ctx.strokeStyle = currentColor;
			ctx.lineWidth = linewidth;
			ctx.beginPath();
			ctx.moveTo(startPosX + cursorHotspotX, startPosY + cursorHotspotY);
			ctx.lineTo(lastPosX + cursorHotspotX, lastPosY + cursorHotspotY);
			ctx.closePath();
			ctx.stroke();

			bufferCtx.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height);
		};

		const activateTool = () => {
			bufferCanvas.style.display = "flex";
			bufferCanvas.addEventListener("mousedown", startLineHandler);
			bufferCanvas.addEventListener("mousemove", drawLineHandler);
			bufferCanvas.addEventListener("mouseup", stopLineHandler);
		};

		const deactivateTool = () => {
			bufferCanvas.style.display = "none";
			bufferCanvas.removeEventListener("mousedown", startLineHandler);
			bufferCanvas.removeEventListener("mousemove", drawLineHandler);
			bufferCanvas.removeEventListener("mouseup", stopLineHandler);
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
	//TODO: need to solve the pullingpart;
	curveline: () => {
		const bufferCanvas = document.getElementById("canvasbuffer");
		const bufferCtx = bufferCanvas.getContext("2d");
		const rec = bufferCanvas.getBoundingClientRect();
		let isCurving = false;
		let cp1x = 0;
		let cp1y = 0;
		let cp2x = 0;
		let cp2y = 0;
		let linewidth = 1;
		bufferCanvas.style.display = "none";
		bufferCanvas.width = canvas.width;
		bufferCanvas.height = canvas.height;

		const customCursorUrl = "/static/cursors/precise.png";
		const cursorHotspotX = -45; // Adjust to center the cursor image
		const cursorHotspotY = -5; // Adjust to center the cursor image

		canvas.style.cursor = `url(${customCursorUrl}), auto`;
		bufferCanvas.style.cursor = `url(${customCursorUrl}), auto`;

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

		const startCurvingHandler = (e) => {
			cp1x = e.clientX - rec.left;
			cp1y = e.clientY - rec.top;
			isCurving = true;
		};

		const curveHandler = (e) => {
			if (!isCurving) return;
			cp2x = e.clientX - rec.left;
			cp2y = e.clientY - rec.top;
			bufferCtx.strokeStyle = currentColor;
			bufferCtx.lineWidth = linewidth;
			bufferCtx.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height);
			bufferCtx.beginPath();
			bufferCtx.moveTo(cp1x + cursorHotspotX, cp1y + cursorHotspotY);
			bufferCtx.bezierCurveTo(
				cp1x,
				cp1y,
				cp2x,
				cp2y,
				cp2x + cursorHotspotX,
				cp2y + cursorHotspotY
			);
			bufferCtx.stroke();
		};

		const stopCurvingHandler = () => {
			if (!isCurving) return;
			isCurving = false;
			ctx.lineWidth = linewidth;
			ctx.strokeStyle = currentColor;
			ctx.beginPath();
			ctx.moveTo(cp1x + cursorHotspotX, cp1y + cursorHotspotY);
			ctx.bezierCurveTo(
				cp1x,
				cp1y,
				cp2x,
				cp2y,
				cp2x + cursorHotspotX,
				cp2y + cursorHotspotY
			);
			ctx.stroke();
			bufferCtx.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height);
		};

		const activateTool = () => {
			bufferCanvas.style.display = "flex";
			bufferCanvas.addEventListener("mousedown", startCurvingHandler);
			bufferCanvas.addEventListener("mousemove", curveHandler);
			bufferCanvas.addEventListener("mouseup", stopCurvingHandler);
		};

		const deactivateTool = () => {
			bufferCanvas.style.display = "none";
			bufferCanvas.removeEventListener("mousedown", startCurvingHandler);
			bufferCanvas.removeEventListener("mousemove", curveHandler);
			bufferCanvas.removeEventListener("mouseup", stopCurvingHandler);
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

		const customCursorUrl = "/static/cursors/precise.png";
		const cursorHotspotX = 20;
		const cursorHotspotY = 15;

		canvas.style.cursor = `url(${customCursorUrl}), auto`;
		bufferCanvas.style.cursor = `url(${customCursorUrl}), auto`;

		bufferCtx.lineWidth = 1;
		ctx.lineWidth = 1;

		document.addEventListener("htmx:afterSwap", function (e) {
			const PolyOptions = e.detail.target.querySelectorAll(
				".polygontool button"
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

		const getMousePos = (canvas, e) => {
			const rect = canvas.getBoundingClientRect();
			return {
				x: e.clientX - rect.left,
				y: e.clientY - rect.top,
			};
		};

		const isCloseToStart = (currentPoint, startPoint) => {
			const distance = Math.sqrt(
				Math.pow(currentPoint.x - startPoint.x, 2) +
					Math.pow(currentPoint.y - startPoint.y, 2)
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
			ctx.moveTo(start.x + cursorHotspotX, start.y + cursorHotspotY);
			ctx.lineTo(end.x + cursorHotspotX, end.y + cursorHotspotY);
			ctx.stroke();
		};

		const drawBufferLine = (e) => {
			if (!isDrawing) return;

			const mousePos = getMousePos(bufferCanvas, e);
			bufferCtx.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height);
			const lastPoint = points[points.length - 1];
			bufferCtx.strokeStyle = currentColor;
			bufferCtx.beginPath();
			bufferCtx.moveTo(
				lastPoint.x + cursorHotspotX,
				lastPoint.y + cursorHotspotY
			);
			bufferCtx.lineTo(
				mousePos.x + cursorHotspotX,
				mousePos.y + cursorHotspotY
			);
			bufferCtx.stroke();
		};

		const stopLineHandler = () => {
			isDrawing = false;
		};

		const fillPolygon = () => {
			ctx.beginPath();
			ctx.moveTo(points[0].x + cursorHotspotX, points[0].y + cursorHotspotY);
			for (let i = 1; i < points.length; i++) {
				ctx.lineTo(points[i].x + cursorHotspotX, points[i].y + cursorHotspotY);
			}
			ctx.closePath();
			ctx.fill();
		};

		const activateTool = () => {
			bufferCanvas.style.display = "block";
			bufferCanvas.addEventListener("mousedown", startPolygonHandler);
			bufferCanvas.addEventListener("mousemove", drawBufferLine);
			bufferCanvas.addEventListener("mouseup", stopLineHandler);
		};

		const deactivateTool = () => {
			bufferCanvas.style.display = "none";
			bufferCanvas.removeEventListener("mousedown", startPolygonHandler);
			bufferCanvas.removeEventListener("mousemove", drawBufferLine);
			bufferCanvas.removeEventListener("mouseup", stopLineHandler);
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

	text: () => {
		const bufferCanvas = document.getElementById("canvasbuffer");
		const bufferCtx = bufferCanvas.getContext("2d");
		const textarea = document.getElementById("textarea");
		const canvas = document.getElementById("canvas"); // Ensure main canvas is defined
		const ctx = canvas.getContext("2d"); // Ensure the context for the main canvas is defined
		const rect = bufferCanvas.getBoundingClientRect();
		const customCursorUrl = "/static/cursors/precise.png";
		const cursorHotspotX = -45;
		const cursorHotspotY = -5;

		bufferCtx.lineWidth = 1;
		ctx.lineWidth = 1;
		bufferCanvas.style.display = "none";
		bufferCanvas.width = canvas.width;
		bufferCanvas.height = canvas.height;
		bufferCanvas.style.background = "transparent";

		let startPosX, startPosY, textBoxX, textBoxY, textBoxWidth, textBoxHeight;
		let isDrawing = false;
		let isEditing = false;

		// Apply custom cursor with hotspot
		canvas.style.cursor = `url(${customCursorUrl}) , auto`;
		bufferCanvas.style.cursor = `url(${customCursorUrl}) , auto`;

		const startTextBox = (e) => {
			startPosX = e.clientX - rect.left + cursorHotspotX;
			startPosY = e.clientY - rect.top + cursorHotspotY;

			if (!isEditing) {
				isDrawing = true;
				textBoxX = startPosX;
				textBoxY = startPosY;
			} else {
				saveTextToCanvas();
				isEditing = false;
			}
		};

		const writeTextBox = (e) => {
			if (!isDrawing) return;
			const mouseX = e.clientX - rect.left + cursorHotspotX;
			const mouseY = e.clientY - rect.top + cursorHotspotY;

			textBoxWidth = mouseX - startPosX;
			textBoxHeight = mouseY - startPosY;

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
			bufferCanvas.addEventListener("mousedown", startTextBox);
			bufferCanvas.addEventListener("mousemove", writeTextBox);
			bufferCanvas.addEventListener("mouseup", stopTextBox);
			textarea.addEventListener("blur", onBlur);
			textarea.addEventListener("keypress", onKeyPress);
		};

		const deactivateTool = () => {
			bufferCanvas.style.display = "none";
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
		const rect = bufferCanvas.getBoundingClientRect();
		isDrawing = false;
		let startPosX = 0;
		let startPosY = 0;
		let OptValue = 1;
		bufferCanvas.style.display = "none";
		bufferCanvas.width = canvas.width;
		bufferCanvas.height = canvas.height;

		bufferCtx.lineWidth = 1;
		ctx.lineWidth = 1;
		const customCursorUrl = "/static/cursors/precise.png";
		const cursorHotspotX = 45;
		const cursorHotspotY = 5;

		canvas.style.cursor = `url(${customCursorUrl}), auto`;
		bufferCanvas.style.cursor = `url(${customCursorUrl}) , auto`;

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
			startPosX = e.clientX - rect.left;
			startPosY = e.clientY - rect.top;
			isDrawing = true;
		};

		const drawRectHandler = (e) => {
			if (!isDrawing) return;
			const rectWidth = e.clientX - startPosX;
			const rectHeight = e.clientY - startPosY;
			bufferCtx.strokeStyle = currentColor;
			bufferCtx.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height);
			bufferCtx.beginPath();
			bufferCtx.strokeRect(
				startPosX - cursorHotspotX,
				startPosY - cursorHotspotY,
				rectWidth,
				rectHeight
			);
		};

		const drawFilledRectHandler = (e) => {
			if (!isDrawing) return;
			const rectWidth = e.clientX - startPosX;
			const rectHeight = e.clientY - startPosY;
			bufferCtx.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height);
			bufferCtx.beginPath();
			bufferCtx.strokeStyle = "black";
			bufferCtx.fillStyle = "white";
			bufferCtx.rect(
				startPosX - cursorHotspotX,
				startPosY - cursorHotspotY,
				rectWidth,
				rectHeight
			);
			bufferCtx.fill();
			bufferCtx.stroke();
		};

		const drawFilledStrokeRectHandler = (e) => {
			if (!isDrawing) return;
			const rectWidth = e.clientX - startPosX;
			const rectHeight = e.clientY - startPosY;
			bufferCtx.strokeStyle = currentColor;
			bufferCtx.fillStyle = currentColor;
			bufferCtx.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height);
			bufferCtx.beginPath();
			bufferCtx.fillRect(
				startPosX - cursorHotspotX,
				startPosY - cursorHotspotY,
				rectWidth,
				rectHeight
			);
		};

		const stopRectHandler = (e) => {
			if (!isDrawing) return;
			isDrawing = false;
			const rectWidth = e.clientX - startPosX;
			const rectHeight = e.clientY - startPosY;
			ctx.beginPath();
			if (OptValue === 1) {
				ctx.strokeStyle = currentColor;
				ctx.strokeRect(
					startPosX - cursorHotspotX,
					startPosY - cursorHotspotY,
					rectWidth,
					rectHeight
				);
			} else if (OptValue === 2) {
				ctx.fillStyle = "white";
				ctx.rect(
					startPosX - cursorHotspotX,
					startPosY - cursorHotspotY,
					rectWidth,
					rectHeight
				);
				ctx.fill();
				ctx.stroke();
			} else if (OptValue == 3) {
				ctx.fillStyle = currentColor;
				ctx.fillRect(
					startPosX - cursorHotspotX,
					startPosY - cursorHotspotY,
					rectWidth,
					rectHeight
				);
				ctx.stroke();
			}
			bufferCtx.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height);
		};

		const activateTool = () => {
			bufferCanvas.style.display = "flex";
			bufferCanvas.addEventListener("mousedown", startRectHandler);
			if (OptValue === 1) {
				bufferCanvas.addEventListener("mousemove", drawRectHandler);
			} else if (OptValue === 2) {
				bufferCanvas.addEventListener("mousemove", drawFilledRectHandler);
			} else if (OptValue === 3) {
				bufferCanvas.addEventListener("mousemove", drawFilledStrokeRectHandler);
			}
			bufferCanvas.addEventListener("mouseup", stopRectHandler);
		};

		const deactivateTool = () => {
			bufferCanvas.style.display = "none";
			bufferCanvas.removeEventListener("mousedown", startRectHandler);
			bufferCanvas.removeEventListener("mousemove", drawRectHandler);
			bufferCanvas.removeEventListener("mousemove", drawFilledRectHandler);
			bufferCanvas.removeEventListener(
				"mousemove",
				drawFilledStrokeRectHandler
			);
			bufferCanvas.removeEventListener("mouseup", stopRectHandler);
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

	elipse: () => {
		const bufferCanvas = document.getElementById("canvasbuffer");
		const bufferCtx = bufferCanvas.getContext("2d");
		const rect = bufferCanvas.getBoundingClientRect();
		isDrawing = false;
		let startPosX = 0;
		let startPosY = 0;
		let EOptValue = 1;
		bufferCanvas.style.display = "none";
		bufferCanvas.width = canvas.width;
		bufferCanvas.height = canvas.height;

		bufferCtx.lineWidth = 1;
		ctx.lineWidth = 1;
		const customCursorUrl = "/static/cursors/precise.png";
		const cursorHotspotX = 45;
		const cursorHotspotY = 5;

		// Apply custom cursor with hotspot
		canvas.style.cursor = `url(${customCursorUrl}), auto`;
		bufferCanvas.style.cursor = `url(${customCursorUrl}), auto`;

		document.addEventListener("htmx:afterSwap", function (e) {
			const ElipseOptions =
				e.detail.target.querySelectorAll(".elipsetool button");

			if (ElipseOptions && ElipseOptions.length > 0) {
				ElipseOptions.forEach((option) => {
					option.addEventListener("click", () => {
						ElipseOptions.forEach((opt) => opt.classList.remove("pressed"));
						option.classList.add("pressed");
						EOptValue = parseInt(option.value, 10);
						deactivateTool();
						activateTool();
					});
				});
			}
		});

		const startCircleHandler = (e) => {
			startPosX = e.clientX - rect.left;
			startPosY = e.clientY - rect.top;
			isDrawing = true;
		};

		const drawCircleHandler = (e) => {
			if (!isDrawing) return;
			const currentX = e.clientX - rect.left;
			const currentY = e.clientY - rect.top;
			const radius = Math.sqrt(
				(currentX - startPosX) ** 2 + (currentY - startPosY) ** 2
			);

			bufferCtx.strokeStyle = currentColor;
			bufferCtx.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height);
			bufferCtx.beginPath();
			bufferCtx.arc(
				startPosX - cursorHotspotX,
				startPosY - cursorHotspotY,
				radius,
				0,
				Math.PI * 2,
				false
			);
			bufferCtx.stroke();
		};

		const drawFilledStrokeElipseHandler = (e) => {
			if (!isDrawing) return;
			const currentX = e.clientX - rect.left;
			const currentY = e.clientY - rect.top;
			const radius = Math.sqrt(
				(currentX - startPosX) ** 2 + (currentY - startPosY) ** 2
			);
			bufferCtx.strokeStyle = currentColor;
			bufferCtx.fillStyle = "white";

			bufferCtx.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height);
			bufferCtx.beginPath();
			bufferCtx.arc(
				startPosX - cursorHotspotX,
				startPosY - cursorHotspotY,
				radius,
				0,
				Math.PI * 2,
				false
			);
			bufferCtx.fill();
			bufferCtx.stroke();
		};

		const drawFilledElipseHandler = (e) => {
			if (!isDrawing) return;
			const currentX = e.clientX - rect.left;
			const currentY = e.clientY - rect.top;
			const radius = Math.sqrt(
				(currentX - startPosX) ** 2 + (currentY - startPosY) ** 2
			);
			bufferCtx.strokeStyle = currentColor;
			bufferCtx.fillStyle = currentColor;
			bufferCtx.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height);
			bufferCtx.beginPath();
			bufferCtx.arc(
				startPosX - cursorHotspotX,
				startPosY - cursorHotspotY,
				radius,
				0,
				Math.PI * 2,
				false
			);
			bufferCtx.fill();
		};

		const stopCircleHandler = (e) => {
			if (!isDrawing) return;
			isDrawing = false;
			const currentX = e.clientX - rect.left;
			const currentY = e.clientY - rect.top;
			const radius = Math.sqrt(
				(currentX - startPosX) ** 2 + (currentY - startPosY) ** 2
			);

			if (EOptValue === 1) {
				ctx.strokeStyle = currentColor;
				ctx.beginPath();
				ctx.arc(
					startPosX - cursorHotspotX,
					startPosY - cursorHotspotY,
					radius,
					0,
					Math.PI * 2,
					false
				);
				ctx.stroke();
			} else if (EOptValue === 2) {
				ctx.strokeStyle = currentColor;
				ctx.fillStyle = "white";
				ctx.beginPath();
				ctx.arc(
					startPosX - cursorHotspotX,
					startPosY - cursorHotspotY,
					radius,
					0,
					Math.PI * 2,
					false
				);
				ctx.fill();
				ctx.stroke();
			} else if (EOptValue === 3) {
				ctx.strokeStyle = currentColor;
				ctx.fillStyle = currentColor;
				ctx.beginPath();
				ctx.arc(
					startPosX - cursorHotspotX,
					startPosY - cursorHotspotY,
					radius,
					0,
					Math.PI * 2,
					false
				);
				ctx.fill();
				//ctx.stroke();
			}
			bufferCtx.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height);
		};

		const activateTool = () => {
			bufferCanvas.style.display = "flex";
			bufferCanvas.addEventListener("mousedown", startCircleHandler);
			if (EOptValue === 1) {
				bufferCanvas.addEventListener("mousemove", drawCircleHandler);
			} else if (EOptValue === 2) {
				bufferCanvas.addEventListener(
					"mousemove",
					drawFilledStrokeElipseHandler
				);
			} else if (EOptValue === 3) {
				bufferCanvas.addEventListener("mousemove", drawFilledElipseHandler);
			}
			bufferCanvas.addEventListener("mouseup", stopCircleHandler);
		};

		const deactivateTool = () => {
			bufferCanvas.style.display = "none";
			bufferCanvas.removeEventListener("mousedown", startCircleHandler);
			bufferCanvas.removeEventListener("mousemove", drawCircleHandler);
			bufferCanvas.removeEventListener(
				"mousemove",
				drawFilledStrokeElipseHandler
			);
			bufferCanvas.removeEventListener("mousemove", drawFilledElipseHandler);
			bufferCanvas.removeEventListener("mouseup", stopCircleHandler);
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

	rectelipse: () => {
		const bufferCanvas = document.getElementById("canvasbuffer");
		const bufferCtx = bufferCanvas.getContext("2d");
		const rect = bufferCanvas.getBoundingClientRect();
		let isDrawing = false;
		let startPosX = 0;
		let startPosY = 0;
		const fixedRadius = 10;
		let ROptions = 1;
		let color = "black";
		bufferCtx.lineWidth = 1;
		ctx.lineWidth = 1;
		bufferCanvas.style.display = "none";
		bufferCanvas.width = canvas.width;
		bufferCanvas.height = canvas.height;

		const customCursorUrl = "/static/cursors/precise.png";
		const cursorHotspotX = -5;
		const cursorHotspotY = 5;

		canvas.style.cursor = `url(${customCursorUrl}) ${cursorHotspotX} ${cursorHotspotY}, auto`;
		bufferCanvas.style.cursor = `url(${customCursorUrl}) ${cursorHotspotX} ${cursorHotspotY}, auto`;

		document.addEventListener("htmx:afterSwap", function (e) {
			const RectElipseOptions = e.detail.target.querySelectorAll(
				".roundedrect-tool button"
			);

			if (RectElipseOptions && RectElipseOptions.length > 0) {
				RectElipseOptions.forEach((option) => {
					option.addEventListener("click", () => {
						RectElipseOptions.forEach((opt) => opt.classList.remove("pressed"));
						option.classList.add("pressed");
						ROptions = parseInt(option.value, 10);
						deactivateTool();
						activateTool();
					});
				});
			}
		});

		const startRectHandler = (e) => {
			startPosX = e.clientX - rect.left;
			startPosY = e.clientY - rect.top;
			isDrawing = true;
		};

		const drawRectHandler = (e) => {
			if (!isDrawing) return;
			const mouseX = e.clientX - rect.left;
			const mouseY = e.clientY - rect.top;
			const rectWidth = mouseX - startPosX;
			const rectHeight = mouseY - startPosY;

			bufferCtx.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height);
			drawRoundedRect(
				bufferCtx,
				startPosX,
				startPosY,
				rectWidth,
				rectHeight,
				fixedRadius,
				ROptions
			);
		};

		const stopRectHandler = (e) => {
			if (!isDrawing) return;
			isDrawing = false;
			const mouseX = e.clientX - rect.left;
			const mouseY = e.clientY - rect.top;
			const rectWidth = mouseX - startPosX;
			const rectHeight = mouseY - startPosY;

			drawRoundedRect(
				ctx,
				startPosX,
				startPosY,
				rectWidth,
				rectHeight,
				fixedRadius,
				ROptions
			);
			bufferCtx.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height);
		};

		const drawRoundedRect = (context, x, y, width, height, radius, option) => {
			const absWidth = Math.abs(width);
			const absHeight = Math.abs(height);
			const posX = width > 0 ? x : x + width;
			const posY = height > 0 ? y : y + height;
			const effectiveRadius = Math.min(
				radius,
				Math.min(absWidth / 2, absHeight / 2)
			);

			context.beginPath();
			context.moveTo(posX + effectiveRadius, posY);
			context.lineTo(posX + absWidth - effectiveRadius, posY);
			context.arcTo(
				posX + absWidth,
				posY,
				posX + absWidth,
				posY + effectiveRadius,
				effectiveRadius
			);
			context.lineTo(posX + absWidth, posY + absHeight - effectiveRadius);
			context.arcTo(
				posX + absWidth,
				posY + absHeight,
				posX + absWidth - effectiveRadius,
				posY + absHeight,
				effectiveRadius
			);
			context.lineTo(posX + effectiveRadius, posY + absHeight);
			context.arcTo(
				posX,
				posY + absHeight,
				posX,
				posY + absHeight - effectiveRadius,
				effectiveRadius
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

		const activateTool = () => {
			bufferCanvas.style.display = "flex";
			bufferCanvas.addEventListener("mousedown", startRectHandler);
			bufferCanvas.addEventListener("mousemove", drawRectHandler);
			bufferCanvas.addEventListener("mouseup", stopRectHandler);
		};

		const deactivateTool = () => {
			bufferCanvas.style.display = "none";
			bufferCanvas.removeEventListener("mousedown", startRectHandler);
			bufferCanvas.removeEventListener("mousemove", drawRectHandler);
			bufferCanvas.removeEventListener("mouseup", stopRectHandler);
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
