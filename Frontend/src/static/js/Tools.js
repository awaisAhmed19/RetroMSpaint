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



function colorChecker(e) {
    const colorData = ctx.getImageData(e.clientX-canvas.getBoundingClientRect().left, e.clientY-canvas.getBoundingClientRect().top, 1, 1).data;
    const red = colorData[0];
    const green = colorData[1];
    const blue = colorData[2];
    const alpha = colorData[3]/255;
    currentColor = `rgba(${red},${green},${blue},${alpha})`;
    console.log(currentColor);
}
//TODO: need to solve this....
function eyeDropper(canvas, cursor) {
    
    canvas.style.cursor = cursor;
    canvas.addEventListener('click', colorChecker);

    return {
        removeEvents: () => {
            canvas.removeEventListener('click', colorChecker);
        },
        changeColor: (color) => {
            currentColor = color;
        }
    };
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
    line: () => {
        const bufferCanvas = document.getElementById('canvasbuffer');
        const bufferCtx = bufferCanvas.getContext('2d');
        isDrawing = false;
        let startPosX = 0;
        let startPosY = 0;
        let lastPosX = 0;
        let lastPosY = 0;
        const cursorOffsetX = 16;
        const cursorOffsetY = 16;
        const rec = bufferCanvas.getBoundingClientRect();
        bufferCanvas.width = canvas.width;
        bufferCanvas.height = canvas.height;

        canvas.style.cursor = 'url(/static/cursors/precise.png), auto';
        bufferCanvas.style.cursor = 'url(/static/cursors/precise.png), auto';

        const startLineHandler = (e) => {
            startPosX = e.clientX - rec.left;
            startPosY = e.clientY - rec.top;
           isDrawing = true;
        }

        const drawLineHandler = (e) => {
            if (!isDrawing) return;
            lastPosX = e.clientX - rec.left;
            lastPosY = e.clientY - rec.top;
            bufferCtx.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height);
            bufferCtx.beginPath();
            bufferCtx.moveTo(startPosX+cursorOffsetX, startPosY+cursorOffsetY);
            bufferCtx.lineTo(lastPosX+cursorOffsetX, lastPosY+cursorOffsetY);
            bufferCtx.stroke();
        }

        const stopLineHandler = (e) => {
            if (!isDrawing) return;
            isDrawing = false;
            ctx.strokeStyle = currentColor;
            ctx.beginPath();
            ctx.moveTo(startPosX+cursorOffsetX, startPosY+cursorOffsetY);
            ctx.lineTo(lastPosX+cursorOffsetX, lastPosY+cursorOffsetY);
            ctx.stroke();

            bufferCtx.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height);
        }

        bufferCanvas.addEventListener('mousedown', startLineHandler);
        bufferCanvas.addEventListener('mousemove', drawLineHandler);
        bufferCanvas.addEventListener('mouseup', stopLineHandler);

        return {
            removeEvents: () => {
                bufferCanvas.removeEventListener('mousedown', startLineHandler);
                bufferCanvas.removeEventListener('mousemove', drawLineHandler);
                bufferCanvas.removeEventListener('mouseup', stopLineHandler);
            },
            changeColor: (color) => {
                currentColor = color;
            }
        };
    },

    eyedrop: () => eyeDropper(canvas, 'url(/static/cursors/eye-dropper.png), auto')
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
