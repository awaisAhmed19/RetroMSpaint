export default class colorPallete{
    constructor(currentColor, switchColorId, palleteColorClass){
        this.currentColor = document.getElementById(currentColor);
        this.switchColors = document.getElementById(switchColorId);
        this.palleteColors = document.querySelectorAll(palleteColorClass);
        this.temp = null;
        this.init();
    }
    
    init() {
        window.onload =  () => {
            this.currentColor.style.backgroundColor = 'black';
            this.switchColors.style.backgroundColor = 'white';
        };
        this.addEventListener();
    }

    addEventListener() {
        this.currentColor.addEventListener('click', () => { this.switchColor(); });
        this.palleteColors.forEach((color) => { color.addEventListener('click', () => this.selectColor(color)) });
    }

    switchColor() {
        this.temp = this.switchColors.style.backgroundColor;
        this.switchColors.style.backgroundColor = this.currentColor.style.backgroundColor;
        this.currentColor.style.backgroundColor = this.temp;
        return this.currentColor.backgroundColor;
    }

    selectColor(color) {
        this.currentColor.style.backgroundColor = color.style.backgroundColor;
    }
}


