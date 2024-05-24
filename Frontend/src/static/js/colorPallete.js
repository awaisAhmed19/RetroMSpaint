const currentColor = document.getElementById('selected-color');
const switchColor = document.getElementById('switch-color');
const palleteColors = document.querySelectorAll('.pallete-color');
let temp;

window.onload = function () {
    currentColor.style.backgroundColor = 'black';
    switchColor.style.backgroundColor = 'white';
};

currentColor.addEventListener('click', () => {
    temp = switchColor.style.backgroundColor;
    switchColor.style.backgroundColor = currentColor.style.backgroundColor;
    currentColor.style.backgroundColor = temp;
    return currentColor.backgroundColor;
});

palleteColors.forEach((color) => {
    color.addEventListener('click', () => {
        currentColor.style.backgroundColor = color.style.backgroundColor;
    });
});