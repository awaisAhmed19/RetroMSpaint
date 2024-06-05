const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const tools = document.querySelectorAll('.tools');
const palleteColors = document.querySelectorAll('.pallete-color');

let currentColor = 'black';
let isDrawing = false;
let activeTool = null;

let x = 0;
let y = 0;

palleteColors.forEach((color) => {
    color.addEventListener('click', (e) => {
        currentColor = e.target.getAttribute('value');
        if (activeTool) {
            activeTool.changeColor(currentColor);
        }
    });
});

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
    ctx.lineTo(pos.x + 14, pos.y + 24);
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
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineTo(pos.x + 15, pos.y + 16);
    ctx.stroke();
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
    airbrush:()=>setupTool(canvas, airBrush,'url(/static/cursors/airbrushCursor.png),auto'),
    line: () => {
        const bufferCanvas = document.getElementById('canvasbuffer');
        const bufferCtx = bufferCanvas.getContext('2d');
        const rec = bufferCanvas.getBoundingClientRect();
        isDrawing = false;
        let startPosX = 0;
        let startPosY = 0;
        let lastPosX = 0;
        let lastPosY = 0;
        bufferCanvas.style.display = 'none';
        bufferCanvas.width = canvas.width;
        bufferCanvas.height = canvas.height;


        const customCursorUrl = '/static/cursors/precise.png';
        const cursorHotspotX = -45; // Adjust this value to center the cursor image
        const cursorHotspotY = -5; // Adjust this value to center the cursor image

        // Apply custom cursor with hotspot
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

    
text: () => { //TODO:Need to work on this
    const bufferCanvas = document.getElementById('canvasbuffer');
    const bufferCtx = bufferCanvas.getContext('2d');
    const rect = bufferCanvas.getBoundingClientRect();
    let isDrawing = false;
    let startPosX = 0;
    let startPosY = 0;
    let rectWidth = 0;
    let rectHeight = 0;
    let draggingAnchor = null;
    const pointSize = 3; 
    let currentColor = 'black';
    let currentState = 'drawing'; // 'drawing', 'resizing', 'text'

    bufferCanvas.style.display = 'none';
    bufferCanvas.width = canvas.width;
    bufferCanvas.height = canvas.height;

    const customCursorUrl = '/static/cursors/precise.png';

    canvas.style.cursor = `url(${customCursorUrl}), auto`;
    bufferCanvas.style.cursor = `url(${customCursorUrl}), auto`;

    const getMousePos = (canvas, e) => {
        const rect = canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left+15,
            y: e.clientY - rect.top+15
        };
    };

    const startRectHandler = (e) => {
        if (currentState !== 'drawing') return;
        isDrawing = true;
        const mousePos = getMousePos(bufferCanvas, e);
        startPosX = mousePos.x;
        startPosY = mousePos.y;
    };

    const drawRectHandler = (e) => {
        if (!isDrawing) return;
        const mousePos = getMousePos(bufferCanvas, e);
        rectWidth = mousePos.x - startPosX;
        rectHeight = mousePos.y - startPosY;
        bufferCtx.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height);
        bufferCtx.strokeStyle = currentColor;
        bufferCtx.strokeRect(startPosX, startPosY, rectWidth, rectHeight);
    };

    const stopRectHandler = (e) => {
        if (!isDrawing) return;
        isDrawing = false;
        ctx.strokeStyle = currentColor;
        ctx.setLineDash([10, 5]);
        ctx.strokeRect(startPosX, startPosY, rectWidth, rectHeight);
        setResizingPoints();
        resizeRect();
        bufferCtx.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height);
        //currentState = 'text';
    };

    const setResizingPoints = () => {
        const points = [
            { x: startPosX, y: startPosY }, // Top-left corner
            { x: startPosX + rectWidth, y: startPosY }, // Top-right corner
            { x: startPosX, y: startPosY + rectHeight }, // Bottom-left corner
            { x: startPosX + rectWidth, y: startPosY + rectHeight }, // Bottom-right corner
            { x: startPosX + rectWidth / 2, y: startPosY }, // Top-middle
            { x: startPosX + rectWidth / 2, y: startPosY + rectHeight }, // Bottom-middle
            { x: startPosX, y: startPosY + rectHeight / 2 }, // Left-middle
            { x: startPosX + rectWidth, y: startPosY + rectHeight / 2 } // Right-middle
        ];

        ctx.fillStyle = 'black';

        points.forEach(point => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, pointSize, 0, Math.PI * 2);
            ctx.fill();
        });
        return points;
    };

    const isMouseOnPoint = (mousePos, point) => {
        return (
            mousePos.x >= point.x - pointSize &&
            mousePos.x <= point.x + pointSize &&
            mousePos.y >= point.y - pointSize &&
            mousePos.y <= point.y + pointSize
        );
    };

    const resizeRect = () => {
        //if (currentState !== 'resizing') return;

        canvas.addEventListener('mousedown', (e) => {
            const mousePos = getMousePos(canvas, e);
            const points = setResizingPoints();

            points.forEach((point, index) => {
                if (isMouseOnPoint(mousePos, point)) {
                    draggingAnchor = index;
                    currentState = 'resizing';
                }
            });
        });

        canvas.addEventListener('mousemove', (e) => {
            if (draggingAnchor === null) return;

            const mousePos = getMousePos(canvas, e);

            switch (draggingAnchor) {
                case 0: // Top-left
                    rectWidth += startPosX - mousePos.x;
                    rectHeight += startPosY - mousePos.y;
                    startPosX = mousePos.x;
                    startPosY = mousePos.y;
                    break;
                case 1: // Top-right
                    rectWidth = mousePos.x - startPosX;
                    rectHeight += startPosY - mousePos.y;
                    startPosY = mousePos.y;
                    break;
                case 2: // Bottom-left
                    rectWidth += startPosX - mousePos.x;
                    startPosX = mousePos.x;
                    rectHeight = mousePos.y - startPosY;
                    break;
                case 3: // Bottom-right
                    rectWidth = mousePos.x - startPosX;
                    rectHeight = mousePos.y - startPosY;
                    break;
                case 4: // Top-middle
                    rectHeight += startPosY - mousePos.y;
                    startPosY = mousePos.y;
                    break;
                case 5: // Bottom-middle
                    rectHeight = mousePos.y - startPosY;
                    break;
                case 6: // Left-middle
                    rectWidth += startPosX - mousePos.x;
                    startPosX = mousePos.x;
                    break;
                case 7: // Right-middle
                    rectWidth = mousePos.x - startPosX;
                    break;
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.strokeRect(startPosX, startPosY, rectWidth, rectHeight);
            setResizingPoints();
        });

        canvas.addEventListener('mouseup', () => {
            draggingAnchor = null;
            currentState = 'text';
        });
    };

    const handleMouseMove = (e) => {
        const mousePos = getMousePos(canvas, e);
        const points = setResizingPoints();
        let cursor = 'default';

        points.forEach((point, index) => {
            if (isMouseOnPoint(mousePos, point)) {
                cursor = 'pointer';
                currentState = 'resizing';
            }
        });

        canvas.style.cursor = cursor;
    };

    const handleTextMode = (e) => {
        const mousePos = getMousePos(canvas, e);
        if (
            mousePos.x >= startPosX && mousePos.x <= startPosX + rectWidth &&
            mousePos.y >= startPosY && mousePos.y <= startPosY + rectHeight
        ) {
            // Inside the rectangle: Text writing mode
            // You can add logic to enable text input here
            console.log("Text writing mode");
        } else {
            // Outside the rectangle: Switch back to drawing mode
            currentState = 'drawing';
            console.log("Switched to drawing mode");
        }
    };

    const activateTool = () => {
        bufferCanvas.style.display = 'flex';
        bufferCanvas.addEventListener('mousedown', startRectHandler);
        bufferCanvas.addEventListener('mousemove', drawRectHandler);
        bufferCanvas.addEventListener('mouseup', stopRectHandler);
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mousedown', handleTextMode);
    };

    const deactivateTool = () => {
        bufferCanvas.style.display = 'none';
        bufferCanvas.removeEventListener('mousedown', startRectHandler);
        bufferCanvas.removeEventListener('mousemove', drawRectHandler);
        bufferCanvas.removeEventListener('mouseup', stopRectHandler);
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mousedown', handleTextMode);
    };

    activateTool();
    resizeRect();

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
        console.log('active');


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