/**
 * @type HTMLCanvasElement
 */



const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });

const tools = document.querySelectorAll('.tools');
let currentColorDisplay = document.getElementById('selected-color');
let switchColor = document.getElementById('switch-color');
const paletteColors = document.querySelectorAll('.pallete-color');

let currentColor = JSON.parse(currentColorDisplay.getAttribute('value')); 
let switchColorValue = JSON.parse(switchColor.getAttribute('value'));


window.onload = () => {
    currentColorDisplay.style.backgroundColor = currentColor;
    switchColor.style.backgroundColor = switchColorValue;
};

// Switching colors and assigning colors
currentColorDisplay.addEventListener('click', () => switchColorHandler());

paletteColors.forEach((color) => {
    color.addEventListener('click', () => {
        currentColor = JSON.parse(color.value);
        console.log('Color changed to:', currentColor); 
        currentColorDisplay.style.backgroundColor = color.style.backgroundColor;
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
        y: e.clientY - rect.top
    };
}

function startDrawing() {
    isDrawing = true;
    ctx.beginPath();
}

function stopDrawing() {
    isDrawing = false;
    ctx.closePath();
}

function pencilDraw(canvas, e) {
    if (!isDrawing) return;
    const pos = getMousePos(canvas, e);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineTo(pos.x + 15, pos.y + 24);
    ctx.stroke();
}

function airBrush(canvas, e) {
    if (!isDrawing) return;

    const density = 10;
    const radius = 3;
    for (let i = 0; i < density; i++){
    const pos = getMousePos(canvas, e);
    const angle = Math.random() * Math.PI * 2;
    const distance = radius * Math.random();
    const x = pos.x + Math.cos(angle) * distance;
    const y = pos.y + Math.sin(angle) * distance;
    ctx.beginPath();
    ctx.fillStyle = currentColor;
    ctx.arc(x, y, 1, 0, Math.PI * 2, false);
    ctx.fill();
    }
}

function brushDraw(canvas, e) {
    if (!isDrawing) return;
    const pos = getMousePos(canvas, e);
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineTo(pos.x + 15, pos.y + 16);
    ctx.stroke();
}

function eraser(canvas, e) {
    if (!isDrawing) return;
    const pos = getMousePos(canvas, e);
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.strokeRect(pos.x,pos.y,2,2);
    ctx.fill();
    ctx.closePath();
}


function setupTool(canvas, drawFunc, cursor) {
    const startHandler = () => startDrawing();
    const drawHandler = (e) => drawFunc(canvas, e);
    const stopHandler = () => stopDrawing();

    canvas.style.cursor = cursor;

    canvas.addEventListener('mousedown', startHandler);
    canvas.addEventListener('mousemove', drawHandler);
    canvas.addEventListener('mouseup', stopHandler);

    return {
        removeEvents: () => {
            canvas.removeEventListener('mousedown', startHandler);
            canvas.removeEventListener('mousemove', drawHandler);
            canvas.removeEventListener('mouseup', stopHandler);
        },
        changeColor: (color) => {
            currentColor = color;
        }
    };
}

const ToolsInstance = {
    pencil: () => setupTool(canvas, pencilDraw, 'url(/static/cursors/pencil.png), auto'),
    brush: () => setupTool(canvas, brushDraw, 'url(/static/cursors/precise-dotted.png), auto'),
    eraser: () => setupTool(canvas, eraser, 'url(/static/cursors/eraser.png), auto'),
    airbrush: () => setupTool(canvas, airBrush, 'url(/static/cursors/airbrushCursor.png),auto'),
rectlasso: () => {
    const bufferCanvas = document.getElementById('canvasbuffer');
    const selectionBuffer = document.getElementById('selectionbuffer');
    const bufferCtx = bufferCanvas.getContext('2d');
    const SBufferCtx = selectionBuffer.getContext('2d');

    bufferCanvas.width = canvas.width;
    bufferCanvas.height = canvas.height;
    selectionBuffer.width = canvas.width;
    selectionBuffer.height = canvas.height;

    let isDrawing = false;
    let isDragging = false;
    let isSelected = false;
    let startX, startY, endX, endY, selectedImageData = null;
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
        bufferCtx.strokeStyle = 'black';
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

        bufferCanvas.style.display = 'none';
        selectionBuffer.style.display = 'block';

        selectionBuffer.addEventListener('mousedown', startDragHandler);
    };

    const startDragHandler = (e) => {
        const rect = selectionBuffer.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        if (isInsideSelection(mouseX, mouseY)) {
            isDragging = true;
            offsetX = mouseX - startX;
            offsetY = mouseY - startY;
            selectionBuffer.addEventListener('mousemove', dragHandler);
            selectionBuffer.addEventListener('mouseup', stopDragHandler);
            
        }
        else {
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

        selectionBuffer.removeEventListener('mousemove', dragHandler);
        selectionBuffer.removeEventListener('mouseup', stopDragHandler);

        selectionBuffer.style.display = 'none';
        bufferCanvas.style.display = 'none';
        isSelected = false;
        activateTool();
    };

    

    const isInsideSelection = (x, y) => {
        return x >= startX && x <= startX + selectedImageData.width && y >= startY && y <= startY + selectedImageData.height;
    };

    const activateTool = () => {
        bufferCanvas.style.display = 'flex';
        bufferCanvas.addEventListener('mousedown', startPolyRectHandler);
        bufferCanvas.addEventListener('mousemove', drawPolyRectHandler);
        bufferCanvas.addEventListener('mouseup', stopPolyRectHandler);
    };

    const deactivateTool = () => {
        bufferCanvas.style.display = 'none';
        selectionBuffer.style.display = 'none';
        bufferCanvas.removeEventListener('mousedown', startPolyRectHandler);
        bufferCanvas.removeEventListener('mousemove', drawPolyRectHandler);
        bufferCanvas.removeEventListener('mouseup', stopPolyRectHandler);
    };

    activateTool();

    return {
        removeEvents: () => {
            deactivateTool();
        }
    };
},


    eyedrop: () => {
        const eyeDrop = document.getElementById('eyedrop');
        const brush = document.getElementById('brush');
        const rect = canvas.getBoundingClientRect()
        const customCursorUrl = '/static/cursors/eye-dropper.png';
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
            ToolsInstance['brush']();

        }

        function getColorAtPosition(x, y) {
            let pxData = ctx.getImageData(x,y,1,1);
        return("rgb("+pxData.data[0]+","+pxData.data[1]+","+pxData.data[2]+")");
        }
        const activateTool = () => {
            
            canvas.addEventListener('mousedown', handleEyeClick);

        }
        const deactivateTool = () => {
            
            canvas.removeEventListener('mousedown', handleEyeClick);
            eyeDrop.classList.remove('pressed');
            brush.classList.add('pressed');
            canvas.style.cursor = 'url(/static/cursors/precise-dotted.png), auto';
        }
        
        activateTool();

        return {
            removeEvents: () => {
                deactivateTool();
            },
        };
    },

 floodfill : () => {
    const customCursorUrl = '/static/cursors/fill-bucket.png';
    const cursorHotspotX = 15;
    const cursorHotspotY = 15;
    canvas.style.cursor = `url(${customCursorUrl}), auto`;

    function floodFill(ctx, x, y, fillColor, range = 1) {
        const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
        const width = imageData.width;
        const height = imageData.height;
        const visited = new Uint8Array(width * height);

        const stack = [];
        stack.push(x, y);

        const targetColor = getPixel(imageData, x, y);
        const rangeSq = range * range;

        while (stack.length > 0) {
            const cy = stack.pop();
            const cx = stack.pop();

            if (!visited[cy * width + cx] && colorsMatch(getPixel(imageData, cx, cy), targetColor, rangeSq)) {
                setPixel(imageData, cx, cy, fillColor);
                visited[cy * width + cx] = 1;

                if (cx > 0) stack.push(cx - 1, cy);
                if (cx < width - 1) stack.push(cx + 1, cy);
                if (cy > 0) stack.push(cx, cy - 1);
                if (cy < height - 1) stack.push(cx, cy + 1);
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
            imageData.data[offset + 3]
        ];
    }

    function setPixel(imageData, x, y, color) {
        const offset = (y * imageData.width + x) * 4;
        imageData.data[offset] = color[0];
        imageData.data[offset + 1] = color[1];
        imageData.data[offset + 2] = color[2];
        imageData.data[offset + 3] = color[3];
    }

    function colorsMatch(a, b, rangeSq) {
        const dr = a[0] - b[0];
        const dg = a[1] - b[1];
        const db = a[2] - b[2];
        const da = a[3] - b[3];
        return dr * dr + dg * dg + db * db + da * da < rangeSq;
    }

    const handleMouseDown = (e) => {
        const rect = canvas.getBoundingClientRect();
        const MouseX = Math.floor(e.clientX - rect.left + cursorHotspotX);
        const MouseY = Math.floor(e.clientY - rect.top + cursorHotspotY);
        floodFill(ctx, MouseX, MouseY, currentColor, 10);
    };

    const activateTool = () => {
        canvas.addEventListener('mousedown', handleMouseDown);
    };

    const deactivateTool = () => {
        canvas.removeEventListener('mousedown', handleMouseDown);
    };

    activateTool();

    return {
        removeEvents: () => {
            deactivateTool();
        },
        changeColor: (color) => {
            currentColor = color;
        }
    };
},



    line: () => {
        const bufferCanvas = document.getElementById('canvasbuffer');
        const bufferCtx = bufferCanvas.getContext('2d');
        const LineOptions = document.querySelectorAll('.Loptions');
        const rec = bufferCanvas.getBoundingClientRect();
        isDrawing = false;
        let startPosX = 0;
        let startPosY = 0;
        let lastPosX = 0;
        let lastPosY = 0;
        let linewidth = 1;
        bufferCanvas.style.display = 'none';
        bufferCanvas.width = canvas.width;
        bufferCanvas.height = canvas.height;

        console.log('LineOptions:', LineOptions);

        LineOptions.forEach((Opt) => {
            Opt.addEventListener('click', (e) => {
                console.log('Button clicked:', e.target);
                LineOptions.forEach((O) => O.classList.remove('pressed'));
                    
                e.target.classList.add('pressed');
                    
                linewidth = parseInt(e.target.getAttribute('value'), 10);
                console.log('Line width:', linewidth);
                ctx.lineWidth = linewidth;
                bufferCtx.lineWidth = linewidth;
            });
        });

        const customCursorUrl = '/static/cursors/precise.png';
        const cursorHotspotX = -45;
        const cursorHotspotY = -5; 

        
        canvas.style.cursor = `url(${customCursorUrl}), auto`;
        bufferCanvas.style.cursor = `url(${customCursorUrl}) , auto`;

        const startLineHandler = (e) => {
            startPosX = e.clientX - rec.left;
            startPosY = e.clientY - rec.top;
            isDrawing = true;
        }

        const drawLineHandler = (e) => {
            if (!isDrawing) return;
            lastPosX = e.clientX - rec.left;
            lastPosY = e.clientY - rec.top;
            bufferCtx.strokeStyle = currentColor
            bufferCtx.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height);
            bufferCtx.beginPath();
            bufferCtx.moveTo(startPosX + cursorHotspotX, startPosY + cursorHotspotY);
            bufferCtx.lineTo(lastPosX + cursorHotspotX, lastPosY + cursorHotspotY);
            bufferCtx.stroke();
        }

        const stopLineHandler = (e) => {
            if (!isDrawing) return;
            isDrawing = false;
            ctx.strokeStyle = currentColor;
            ctx.beginPath();
            ctx.moveTo(startPosX+cursorHotspotX, startPosY+cursorHotspotY);
            ctx.lineTo(lastPosX+cursorHotspotX, lastPosY+cursorHotspotY);
            ctx.stroke();

            bufferCtx.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height);
        }

        const activateTool = () => {
            bufferCanvas.style.display = 'flex';
            bufferCanvas.addEventListener('mousedown', startLineHandler);
            bufferCanvas.addEventListener('mousemove', drawLineHandler);
            bufferCanvas.addEventListener('mouseup', stopLineHandler);
        }
        const deactivateTool = () => {
            bufferCanvas.style.display = 'none';
            bufferCanvas.removeEventListener('mousedown', startLineHandler);
            bufferCanvas.removeEventListener('mousemove', drawLineHandler);
            bufferCanvas.removeEventListener('mouseup', stopLineHandler);
        }
        
        activateTool();

        return {
            removeEvents: () => {
                deactivateTool();
            },
            changeColor: (color) => {
                currentColor = color;
            }
        };
    },
//TODO: need to solve the pullingpart;
  curveline: () => {
    const bufferCanvas = document.getElementById('canvasbuffer');
    const bufferCtx = bufferCanvas.getContext('2d');
    const rec = bufferCanvas.getBoundingClientRect();
    let isCurving = false;
    let cp1x = 0;
    let cp1y = 0;
    let cp2x = 0;
    let cp2y = 0;

    bufferCanvas.style.display = 'none';
    bufferCanvas.width = canvas.width;
    bufferCanvas.height = canvas.height;

    const customCursorUrl = '/static/cursors/precise.png';
    const cursorHotspotX = -45; // Adjust to center the cursor image
    const cursorHotspotY = -5; // Adjust to center the cursor image

    canvas.style.cursor = `url(${customCursorUrl}), auto`;
    bufferCanvas.style.cursor = `url(${customCursorUrl}), auto`;

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
        bufferCtx.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height);
        bufferCtx.beginPath();
        bufferCtx.moveTo(cp1x + cursorHotspotX, cp1y + cursorHotspotY);
        bufferCtx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, cp2x + cursorHotspotX, cp2y + cursorHotspotY);
        bufferCtx.stroke();
    };

    const stopCurvingHandler = () => {
        if (!isCurving) return;
        isCurving = false;
        // Draw the curve on the main canvas
        ctx.strokeStyle = currentColor;
        ctx.beginPath();
        ctx.moveTo(cp1x + cursorHotspotX, cp1y + cursorHotspotY);
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, cp2x + cursorHotspotX, cp2y + cursorHotspotY);
        ctx.stroke();
        bufferCtx.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height);
    };

    const activateTool = () => {
        bufferCanvas.style.display = 'flex';
        bufferCanvas.addEventListener('mousedown', startCurvingHandler);
        bufferCanvas.addEventListener('mousemove', curveHandler);
        bufferCanvas.addEventListener('mouseup', stopCurvingHandler);
    };

    const deactivateTool = () => {
        bufferCanvas.style.display = 'none';
        bufferCanvas.removeEventListener('mousedown', startCurvingHandler);
        bufferCanvas.removeEventListener('mousemove', curveHandler);
        bufferCanvas.removeEventListener('mouseup', stopCurvingHandler);
    };

    activateTool();

    return {
        removeEvents: () => {
            deactivateTool();
        },
        changeColor: (color) => {
            currentColor = color;
        }
    };
    },
  
    polygonshape :() =>{
            const bufferCanvas = document.getElementById('canvasbuffer');
            const bufferCtx = bufferCanvas.getContext('2d');
            const closeThreshold = 30;
            let points = [];
            let isDrawing = false;
            let isPolygonComplete = false;

            bufferCanvas.style.display = 'none';
            bufferCanvas.width = canvas.width;
            bufferCanvas.height = canvas.height;

            const customCursorUrl = '/static/cursors/precise.png';
            const cursorHotspotX = 20; 
            const cursorHotspotY = 15; 

            canvas.style.cursor = `url(${customCursorUrl}), auto`;
            bufferCanvas.style.cursor = `url(${customCursorUrl}), auto`;

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
            }

            const drawLine = (start, end) => {
                ctx.strokeStyle = currentColor;
                ctx.beginPath();
                ctx.moveTo(start.x + cursorHotspotX, start.y + cursorHotspotY);
                ctx.lineTo(end.x + cursorHotspotX, end.y + cursorHotspotY);
                ctx.stroke();
            }

            const drawBufferLine = (e) => {
                if (!isDrawing) return;

                const mousePos = getMousePos(bufferCanvas, e);
                bufferCtx.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height);
                const lastPoint = points[points.length - 1];
                bufferCtx.strokeStyle = currentColor;
                bufferCtx.beginPath();
                bufferCtx.moveTo(lastPoint.x + cursorHotspotX, lastPoint.y + cursorHotspotY);
                bufferCtx.lineTo(mousePos.x + cursorHotspotX, mousePos.y + cursorHotspotY);
                bufferCtx.stroke();
            }

            const getMousePos = (canvas, e) => {
                const rect = canvas.getBoundingClientRect();
                return {
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top
                };
            }

            const isCloseToStart = (currentPoint, startPoint) => {
                const distance = Math.sqrt(
                    Math.pow(currentPoint.x - startPoint.x, 2) +
                    Math.pow(currentPoint.y - startPoint.y, 2)
                );
                return distance < closeThreshold;
            }

            const stopLineHandler = () => {
                isDrawing = false;
            }

            const completePolygon = () => {
                if (points.length < 3) return;
                drawLine(points[points.length - 1], points[0]);
                isPolygonComplete = true;
                bufferCtx.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height);
                points = [];
            }

            const activateTool = () => {
                bufferCanvas.style.display = 'flex';
                bufferCanvas.addEventListener('mousedown', startPolygonHandler);
                bufferCanvas.addEventListener('mousemove', drawBufferLine);
                bufferCanvas.addEventListener('mouseup', stopLineHandler);
            }

            const deactivateTool = () => {
                bufferCanvas.style.display = 'none';
                bufferCanvas.removeEventListener('mousedown', startPolygonHandler);
                bufferCanvas.removeEventListener('mousemove', drawBufferLine);
                bufferCanvas.removeEventListener('mouseup', stopLineHandler);
            }

            activateTool();

            return {
                removeEvents: () => { 
                    deactivateTool();
                },
                changeColor: (color) => {
                    currentColor = color;
                }
            };
        },

    
    text: () => {
        const bufferCanvas = document.getElementById('canvasbuffer');
        const bufferCtx = bufferCanvas.getContext('2d');
        const textarea = document.getElementById('textarea');
        const canvas = document.getElementById('canvas'); // Ensure main canvas is defined
        const ctx = canvas.getContext('2d'); // Ensure the context for the main canvas is defined
        const rect = bufferCanvas.getBoundingClientRect();
        const customCursorUrl = '/static/cursors/precise.png';
        const cursorHotspotX = -45;
        const cursorHotspotY = -5; 

        bufferCanvas.style.display = 'none';
        bufferCanvas.width = canvas.width;
        bufferCanvas.height = canvas.height;
        bufferCanvas.style.background = 'transparent';

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
            textarea.style.border = 'none';
            textarea.style.left = `${textBoxX}px`;
            textarea.style.top = `${textBoxY}px`;
            textarea.style.width = `${textBoxWidth}px`;
            textarea.style.height = `${textBoxHeight}px`;
            textarea.value = '';
            textarea.classList.remove('hidden');
            textarea.focus();
            bufferCtx.clearRect(textBoxX, textBoxY, textBoxWidth, textBoxHeight);
        };

        const onBlur = () => {
            saveTextToCanvas();
            isEditing = false;
            bufferCtx.clearRect(textBoxX, textBoxY, textBoxWidth, textBoxHeight)
        };

        const onKeyPress = (e) => {
            if (e.key === 'Enter') {
                saveTextToCanvas();
                isEditing = false;
            } else if (e.key === 'Escape') {
                textarea.classList.add('hidden');
                isEditing = false;
            }
        };

        function draw() {
            bufferCtx.clearRect(0, 0, canvas.width, canvas.height);
            bufferCtx.strokeStyle = 'black';
            bufferCtx.strokeRect(textBoxX, textBoxY, textBoxWidth, textBoxHeight);
        }

        function saveTextToCanvas() {
            const text = textarea.value;
            if (text) {
                ctx.font = '16px Arial';
                ctx.fillStyle = currentColor;
                const lines = text.split('\n');
                for (let i = 0; i < lines.length; i++) {
                    ctx.fillText(lines[i], textBoxX + 5, textBoxY + 20 + (i * 20));
                }
            }
            textarea.classList.add('hidden');
            bufferCtx.clearRect(0, 0, canvas.width, canvas.height);            
        }

        const activateTool = () => {
            bufferCanvas.style.display = 'flex';
            bufferCanvas.addEventListener('mousedown', startTextBox);
            bufferCanvas.addEventListener('mousemove', writeTextBox);
            bufferCanvas.addEventListener('mouseup', stopTextBox);
            textarea.addEventListener('blur', onBlur);
            textarea.addEventListener('keypress', onKeyPress);
        };

        const deactivateTool = () => {
            bufferCanvas.style.display = 'none';
            bufferCanvas.removeEventListener('mousedown', startTextBox);
            bufferCanvas.removeEventListener('mousemove', writeTextBox);
            bufferCanvas.removeEventListener('mouseup', stopTextBox);
            textarea.removeEventListener('blur', onBlur);
            textarea.removeEventListener('keypress', onKeyPress);
        };

        activateTool();

        return {
            removeEvents: () => {
                deactivateTool();
            },
            changeColor: (color) => {
                currentColor = color;
            }
        };
},


    
    rectshape: () => {
        const bufferCanvas = document.getElementById('canvasbuffer');
        const bufferCtx = bufferCanvas.getContext('2d');
        const rect = bufferCanvas.getBoundingClientRect();
        isDrawing = false;
        let startPosX = 0;
        let startPosY = 0;
        bufferCanvas.style.display = 'none';
        bufferCanvas.width = canvas.width;
        bufferCanvas.height = canvas.height;
        console.log('active');


        const customCursorUrl = '/static/cursors/precise.png';
        const cursorHotspotX = 45; // Adjust this value to center the cursor image
        const cursorHotspotY = 5; // Adjust this value to center the cursor image

        // Apply custom cursor with hotspot
        canvas.style.cursor = `url(${customCursorUrl}), auto`;
        bufferCanvas.style.cursor = `url(${customCursorUrl}) , auto`;

        const startRectHandler = (e) => {
            startPosX = e.clientX - rect.left;
            startPosY = e.clientY - rect.top;
            isDrawing = true;
        }

        const drawRectHandler = (e) => {
            if (!isDrawing) return;
            const rectWidth = e.clientX - startPosX;
            const rectHeight = e.clientY - startPosY;
            bufferCtx.strokeStyle = currentColor
            bufferCtx.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height);
            bufferCtx.beginPath();
            bufferCtx.strokeRect(startPosX-cursorHotspotX, startPosY-cursorHotspotY, rectWidth, rectHeight);
        }

        const stopRectHandler = (e) => {
            if (!isDrawing) return;
            isDrawing = false;
            const rectWidth = e.clientX - startPosX;
            const rectHeight = e.clientY - startPosY;;
            ctx.strokeStyle = currentColor
            //ctx.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height);
            ctx.beginPath();
            ctx.strokeRect(startPosX-cursorHotspotX, startPosY-cursorHotspotY, rectWidth, rectHeight);

            bufferCtx.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height);
        }

        const activateTool = () => {
            bufferCanvas.style.display = 'flex';
            bufferCanvas.addEventListener('mousedown', startRectHandler);
            bufferCanvas.addEventListener('mousemove', drawRectHandler);
            bufferCanvas.addEventListener('mouseup', stopRectHandler);
        }
        const deactivateTool = () => {
            bufferCanvas.style.display = 'none';
            bufferCanvas.removeEventListener('mousedown', startRectHandler);
            bufferCanvas.removeEventListener('mousemove', drawRectHandler);
            bufferCanvas.removeEventListener('mouseup', stopRectHandler);
        }
        
        activateTool();

        return {
            removeEvents: () => {
                deactivateTool();
            },
            changeColor: (color) => {
                currentColor = color;
            }
        };
    },
    elipse: () => {
        const bufferCanvas = document.getElementById('canvasbuffer');
        const bufferCtx = bufferCanvas.getContext('2d');
        const rect = bufferCanvas.getBoundingClientRect();
        isDrawing = false;
        let startPosX = 0;
        let startPosY = 0;
        bufferCanvas.style.display = 'none';
        bufferCanvas.width = canvas.width;
        bufferCanvas.height = canvas.height;

        const customCursorUrl = '/static/cursors/precise.png';
        const cursorHotspotX = 45; // Adjust this value to center the cursor image
        const cursorHotspotY = 5; // Adjust this value to center the cursor image

        // Apply custom cursor with hotspot
        canvas.style.cursor = `url(${customCursorUrl}), auto`;
        bufferCanvas.style.cursor = `url(${customCursorUrl}) , auto`;

        const startCircleHandler = (e) => {
            startPosX = e.clientX - rect.left;
            startPosY = e.clientY - rect.top;
            isDrawing = true;
        }

        const drawCircleHandler = (e) => {
            if (!isDrawing) return;
            const currentX = e.clientX - rect.left;
            const currentY = e.clientY - rect.top;
            const radius = Math.sqrt((currentX - startPosX) ** 2 + (currentY - startPosY) ** 2);
        
            bufferCtx.strokeStyle = currentColor
            bufferCtx.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height);
            bufferCtx.beginPath();
            bufferCtx.arc(startPosX-cursorHotspotX, startPosY-cursorHotspotY, radius, 0, Math.PI * 2, false);
            bufferCtx.stroke();
        }

        const stopCircleHandler = (e) => {
            if (!isDrawing) return;
            isDrawing = false;
            const currentX = e.clientX - rect.left;
            const currentY = e.clientY - rect.top;
            const radius = Math.sqrt((currentX - startPosX) ** 2 + (currentY - startPosY) ** 2);
        
            ctx.strokeStyle = currentColor
            //ctx.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height);
            ctx.beginPath();
            ctx.arc(startPosX-cursorHotspotX, startPosY-cursorHotspotY, radius, 0, Math.PI * 2, false);
            ctx.stroke();
            bufferCtx.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height);
        }

        const activateTool = () => {
            bufferCanvas.style.display = 'flex';
            bufferCanvas.addEventListener('mousedown', startCircleHandler);
            bufferCanvas.addEventListener('mousemove', drawCircleHandler);
            bufferCanvas.addEventListener('mouseup', stopCircleHandler);
        }
        const deactivateTool = () => {
            bufferCanvas.style.display = 'none';
            bufferCanvas.removeEventListener('mousedown', startCircleHandler);
            bufferCanvas.removeEventListener('mousemove', drawCircleHandler);
            bufferCanvas.removeEventListener('mouseup', stopCircleHandler);
        }
        
        activateTool();

        return {
            removeEvents: () => {
                deactivateTool();
            },
            changeColor: (color) => {
                currentColor = color;
            }
        };
    },
rectelipse: () => {
    const bufferCanvas = document.getElementById('canvasbuffer');
    const bufferCtx = bufferCanvas.getContext('2d');
    const rect = bufferCanvas.getBoundingClientRect();
    let isDrawing = false;
    let startPosX = 0;
    let startPosY = 0;
    const fixedRadius = 10; // Fixed radius for rounded corners

    bufferCanvas.style.display = 'none';
    bufferCanvas.width = canvas.width;
    bufferCanvas.height = canvas.height;

    const customCursorUrl = '/static/cursors/precise.png';
    const cursorHotspotX = 45; 
    const cursorHotspotY = 5; 

    // Apply custom cursor with hotspot
    canvas.style.cursor = `url(${customCursorUrl}), auto`;
    bufferCanvas.style.cursor = `url(${customCursorUrl}) , auto`;

    const startRectHandler = (e) => {
        startPosX = e.clientX - rect.left;
        startPosY = e.clientY - rect.top;
        isDrawing = true;
    }

    const drawRectHandler = (e) => {
        if (!isDrawing) return;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const rectWidth = mouseX - startPosX;
        const rectHeight = mouseY - startPosY;
        const absWidth = Math.abs(rectWidth);
        const absHeight = Math.abs(rectHeight);
        const radius = Math.min(fixedRadius, Math.min(absWidth / 2, absHeight / 2));

        bufferCtx.strokeStyle = currentColor;
        bufferCtx.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height);
        bufferCtx.beginPath();
        bufferCtx.moveTo(startPosX + radius, startPosY);
        bufferCtx.lineTo(startPosX + absWidth - radius, startPosY);
        bufferCtx.arcTo(startPosX + absWidth, startPosY, startPosX + absWidth, startPosY + radius, radius);
        bufferCtx.lineTo(startPosX + absWidth, startPosY + absHeight - radius);
        bufferCtx.arcTo(startPosX + absWidth, startPosY + absHeight, startPosX + absWidth - radius, startPosY + absHeight, radius);
        bufferCtx.lineTo(startPosX + radius, startPosY + absHeight);
        bufferCtx.arcTo(startPosX, startPosY + absHeight, startPosX, startPosY + absHeight - radius, radius);
        bufferCtx.lineTo(startPosX, startPosY + radius);
        bufferCtx.arcTo(startPosX, startPosY, startPosX + radius, startPosY, radius);
        bufferCtx.closePath();
        bufferCtx.stroke();
    }
 
    const stopRectHandler = (e) => {
        if (!isDrawing) return;
        isDrawing = false;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const rectWidth = mouseX - startPosX;
        const rectHeight = mouseY - startPosY;
        const absWidth = Math.abs(rectWidth);
        const absHeight = Math.abs(rectHeight);
        const radius = Math.min(fixedRadius, Math.min(absWidth / 2, absHeight / 2));

        ctx.strokeStyle = currentColor;
        ctx.beginPath();
        ctx.moveTo(startPosX + radius, startPosY);
        ctx.lineTo(startPosX + absWidth - radius, startPosY);
        ctx.arcTo(startPosX + absWidth, startPosY, startPosX + absWidth, startPosY + radius, radius);
        ctx.lineTo(startPosX + absWidth, startPosY + absHeight - radius);
        ctx.arcTo(startPosX + absWidth, startPosY + absHeight, startPosX + absWidth - radius, startPosY + absHeight, radius);
        ctx.lineTo(startPosX + radius, startPosY + absHeight);
        ctx.arcTo(startPosX, startPosY + absHeight, startPosX, startPosY + absHeight - radius, radius);
        ctx.lineTo(startPosX, startPosY + radius);
        ctx.arcTo(startPosX, startPosY, startPosX + radius, startPosY, radius);
        ctx.closePath();
        ctx.stroke();
        bufferCtx.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height);
}

    const activateTool = () => {
        bufferCanvas.style.display = 'flex';
        bufferCanvas.addEventListener('mousedown', startRectHandler);
        bufferCanvas.addEventListener('mousemove', drawRectHandler);
        bufferCanvas.addEventListener('mouseup', stopRectHandler);
    }

    const deactivateTool = () => {
        bufferCanvas.style.display = 'none';
        bufferCanvas.removeEventListener('mousedown', startRectHandler);
        bufferCanvas.removeEventListener('mousemove', drawRectHandler);
        bufferCanvas.removeEventListener('mouseup', stopRectHandler);
    }

    activateTool();

    return {
        removeEvents: () => {
            deactivateTool();
        },
        changeColor: (color) => {
            currentColor = color;
        }
    };
    },
};

tools.forEach((tool) => {
    tool.addEventListener('click', (e) => {
        tools.forEach((t) => t.classList.remove('pressed'));
        e.target.classList.add('pressed');

        const toolName = e.target.getAttribute('id');

        if (activeTool) {
            activeTool.removeEvents();
        }

        activeTool = ToolsInstance[toolName]();
    });
});