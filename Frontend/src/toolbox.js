const sidebarDrag = document.querySelector('.sidebar');
let Dragging = false;
let holdTimeout;
const initialTop = 0;
const initialLeft = 0;


let startPosX, startPosY, initialMouseX, initialMouseY;

sidebarDrag.addEventListener('mousedown', (e) => {
    e.preventDefault();
    initialMouseX = e.clientX;
    initialMouseY = e.clientY;
    startPosX = sidebarDrag.offsetLeft;
    startPosY = sidebarDrag.offsetTop;

    Dragging = true;

    sidebarDrag.style.cursor = 'grabbing';
    holdTimeout = setTimeout(() => { sidebarDrag.classList.add('holding'); }, 3000);
    sidebarDrag.classList.add('floating');
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
});

function onMouseMove(e) {
    if (Dragging) {
        const dx = e.clientX - initialMouseX;
        const dy = e.clientY - initialMouseY;
        sidebarDrag.style.left = `${startPosX + dx}px`;
        sidebarDrag.style.top = `${startPosY + dy}px`;
    }
}

function onMouseUp(e) {
    // if (backToPosition()) {
        
    // }
    Dragging = false;
    sidebarDrag.style.cursor = 'grab';

    clearTimeout(holdTimeout);
    sidebarDrag.classList.remove('holding');
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
}
