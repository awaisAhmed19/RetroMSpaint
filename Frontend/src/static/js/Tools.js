const canvas = document.getElementById('canvas');
const tools = document.querySelectorAll('.tools');
const ctx = canvas.getContext('2d');
let currentColor = document.getElementById('selected-color').style.backgroundColor;
let activeTool = null;
class BaseTool {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.isDrawing = false;
        this.initEvents();
    }

    initEvents() {
        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', (e) => this.stopDrawing(e));
        //this.canvas.addEventListener('mouseout', (e) => this.stopDrawing(e));
    }

    
    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    startDrawing(e) {
        this.isDrawing = true;
        this.ctx.beginPath();
    }
    

    stopDrawing(e) {
        this.isDrawing = false;
        this.ctx.closePath();
    }

    debounce(func, delay) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    }

}

//pencil class

class pencilTool extends BaseTool{
    constructor(canvas,currentColor) {
        super(canvas);
        this.currentColor = currentColor;
        this.ctx.strokeStyle = this.currentColor;
        this.lineWidth = 6;
        this.lineCap = 'butt';
        this.lineJoin = 'bevel';
        this.canvas.style.cursor = 'url(/static/cursors/pencil.png),auto'; 
        this.isDrawing = false;
    }
    draw(e) {
        if (!this.isDrawing) return;
        const pos = this.getMousePos(e);
        this.ctx.strokeStyle=this.currentColor;
        this.ctx.lineWidth = this.lineWidth;
        this.ctx.lineCap = this.lineCap; 
        this.ctx.lineJoin = this.lineJoin;
        this.ctx.lineTo(pos.x+14, pos.y+24);
        this.ctx.stroke();
    }
}

class brushTool extends BaseTool{
    constructor(canvas,currentColor) {
        super(canvas);
        this.currentColor = currentColor;
        this.ctx.strokeStyle = this.currentColor;
        this.lineWidth = 1;
        this.lineCap = 'round';
        this.lineJoin = 'round';
        this.canvas.style.cursor = 'url(/static/cursors/precise-dotted.png),auto'; 
        this.isDrawing = false;
    }
    draw(e) {
        if (!this.isDrawing) return;
        const pos = this.getMousePos(e);
        this.ctx.strokeStyle=this.currentColor;
        this.ctx.lineWidth = this.lineWidth;
        this.ctx.lineCap = this.lineCap; 
        this.ctx.lineJoin = this.lineJoin;
        this.ctx.lineTo(pos.x+15, pos.y+22);
        this.ctx.stroke();
    }
}


document.getElementById('selected-color').addEventListener('change', (e) => {
    currentColor = e.target.style.backgroundColor;
    if (activeTool) {
        activeTool.ctx.strokeStyle = currentColor;
    }
});

 const ToolsInstance = {
//     polygonlasso: polygonlassofunc,
//     rectlasso: rectlassofunc,
//     eraser: eraserfunc,
//     fill: fillfunc,
//     eyedrop: eyedropfunc,
//     zoom: zoomfunc,
     pencil: new pencilTool(canvas),
     brush: new brushTool(canvas,currentColor),
//     airbrush: airbrushfunc,
//     text: textfunc,
//     line: linefunc,
//     curveline: curvelinefunc,
//     rectshape: rectshapefunc,
//     polygonshape: polyonshapefunc,
//     elipse: elipsefunc,
//     rectelipse: rectelipsefunc
 };

function changeTool(toolName) {
    if (!ToolsInstance.hasOwnProperty(toolName)) return;
    if (activeTool) {
        activeTool.isDrawing = false;
    }
    activeTool = ToolsInstance[toolName];
    activeTool.ctx.strokeStyle = currentColor;
}


tools.forEach((tool) => {
    tool.addEventListener(('click'), (e) => {
        tools.forEach((t) => {
            t.classList.remove('pressed');
        });
        e.target.classList.add('pressed');
        changeTool(e.target.id);

    });
});
