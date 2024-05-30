const canvas = document.getElementById('canvas');
const tools = document.querySelectorAll('.tools');
const ctx = canvas.getContext('2d');
const palleteColors = document.querySelectorAll('.pallete-color');
canvas.willReadFrequently = true;
let currentColor = 'black';
let isDrawing = false;
let activeTool = null;
let startPos = null;
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

function startLineDrawing(e){
    isDrawing = true;
    startPos = getMousePos(canvas, e);
}
function lineOnMove(e) {
    if (!isDrawing) return;
    drawLine(startPos.x, startPos.y, e.offsetX, e.offsetY);
}

function stopLineDrawing(e) {
    if (!isDrawing) return;
        drawLine(e.offsetX, e.offsetY, startPos.x, startPos.y);
        isDrawing = false;
}

function drawLine(X1, Y1, X2, Y2) {
    const cursor_imagepaddingX = 14;
    const cursor_imagepaddingY = 19;
    ctx.beginPath();
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = 1;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.moveTo(X1+cursor_imagepaddingX, Y1+cursor_imagepaddingY);
    ctx.lineTo(X2+cursor_imagepaddingX, Y2+cursor_imagepaddingY);
    ctx.closePath();
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
        const startLineHandler = (e) => startLineDrawing(e);
        const drawLineHandler = (e) => lineOnMove(canvas, e,);
        const stopLineHandler = (e) => stopLineDrawing(e);
        canvas.style.cursor = 'url(/static/cursors/precise.png), auto';
        canvas.addEventListener('mousedown', startLineDrawing);
        canvas.addEventListener('mousemove', drawLineHandler);
        canvas.addEventListener('mouseup', stopLineHandler);
        return {
            removeEvents: () => {
                canvas.removeEventListener('mousedown', startLineHandler);
                canvas.removeEventListener('mousemove', drawLineHandler);
                canvas.removeEventListener('mouseup', stopLineHandler);
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
