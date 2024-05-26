const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const tools = document.querySelectorAll('.tools');
const selectedColor = document.querySelector('.selectedcolor');

let currentColor = selectedColor.style.backgroundColor;
let cursorType;
let isDrawing = false;

//have to find a way to put thr tool icon images back in the css background-image rule
 

tools.forEach((tool) => {
    tool.addEventListener(('click'), (e) => {
        tools.forEach((t) => {
            t.classList.remove('pressed');
        });
        e.target.classList.add('pressed');
    });
});

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
//canvas.addEventListener('mouseout', stopDrawing);


function getMousePos(canvas, e) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}

function draw(e) {
    if (!isDrawing) return;
    const pos = getMousePos(canvas, e);
    ctx.lineTo(pos.x,pos.y);
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = 1;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
}

function startDrawing(e) {
    isDrawing = true;
    ctx.beginPath();
    ctx.moveTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
}


function stopDrawing(e) {
    isDrawing = false;
    ctx.closePath();
}

function debounce(func, delay) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}