
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const tools = document.querySelectorAll('.tools');
const defaultColor = black;
let name;
let cursorType;
let selectedColor=defaultColor;

class Tools{
    constructor(name,cursorType,size,selectedColor) {
        this.name = name;
        this.cursorType = cursorType;
        this.size = size;
        this.selectedColor = selectedColor;
        this.isActive = false;
        this.undoStack = [];
        this.redoStack = [];
    }
}