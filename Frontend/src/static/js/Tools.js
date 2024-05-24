const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const tools = document.querySelectorAll('.tools');
const selectedColor = document.querySelector('.selectedcolor');

let currentColor = selectedColor.style.backgroundColor;
let cursorType;

//have to find a way to put thr tool icon images back in the css background-image rule
 

tools.forEach((tool) => {
    tool.addEventListener(('click'), (e) => {
        tools.forEach((t) => {
            t.classList.remove('pressed');
        });
        e.target.classList.add('pressed');
        console.log('Clicked element:', e.target);
        console.log('Clicked element ID:', e.target.id);
    });
});


class Tools{
    constructor(name,cursorType,size,currentColor) {
        this.name = name;
        this.cursorType = cursorType;
        this.size = size;
        this.selectedColor = selectedColor;
        this.isActive = false;
        this.undoStack = [];
        this.redoStack = [];
    }


}