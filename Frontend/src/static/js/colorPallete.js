let currentColor = document.getElementById('selected-color');
const switchColor = document.getElementById('switch-color');
const paletteColors = document.querySelectorAll('.pallete-color');

window.onload = () => {
    currentColor.style.backgroundColor = 'black';
    switchColor.style.backgroundColor = 'white';
};

currentColor.addEventListener('click',()=> switchColorHandler( currentColor, switchColor));
paletteColors.forEach((color) => {
    color.addEventListener('click', () => {
        currentColor.style.backgroundColor = color.style.backgroundColor;
    });
});

function switchColorHandler(currentColor, switchColor) {
    let temp = switchColor.style.backgroundColor;
    switchColor.style.backgroundColor = currentColor.style.backgroundColor;
    currentColor.style.backgroundColor = temp;
}


