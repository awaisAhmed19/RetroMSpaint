const sidebarDrag = document.querySelector('.sidebar');
const toolbar = document.querySelector('.toolbar');
const sidebarTop = document.querySelector('.sidebar-floating-top');
const closeButton = document.querySelector('.sidebar-close-button');
const canvasContainer = document.getElementById('canvas-container');

let floating = false;
let holdTimeout;
const initialTop = 0;
const initialLeft = 0;

let startPosX, startPosY, initialMouseX, initialMouseY;

closeButton.addEventListener('click', () => {
    sidebarDrag.style.display = 'none';
});

sidebarDrag.addEventListener('mousedown', onMouseDown);

function onMouseDown(e) {
    if (e.target.closest('.toolbar') || e.target.closest('.tool')) return;

    e.preventDefault();
    initialMouseX = e.clientX;
    initialMouseY = e.clientY;
    startPosX = sidebarDrag.offsetLeft;
    startPosY = sidebarDrag.offsetTop;

    holdTimeout = setTimeout(() => {
        floating = true;
        sidebarDrag.style.height = '300px';
        sidebarDrag.classList.add('floating');
        sidebarTop.style.display = 'flex';
    }, 700); // 2-second hold

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
}

function onMouseMove(e) {
    if (!floating) return;

    const dx = e.clientX - initialMouseX;
    const dy = e.clientY - initialMouseY;

    sidebarDrag.style.left = `${startPosX + dx}px`;
    sidebarDrag.style.top = `${startPosY + dy}px`;
    //canvasContainer.style.marginLeft = `${sidebarDrag.offsetLeft + sidebarDrag.offsetWidth}px`;
}

function onMouseUp(e) {
    clearTimeout(holdTimeout);
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);

    if (floating) {
        const dx = e.clientX - initialMouseX;
        const dy = e.clientY - initialMouseY;

        if (shouldSnapBack(dx, dy)) {
            backToPosition();
        } else {
            sidebarDrag.style.cursor = 'grab';
        }
    }
}

function shouldSnapBack(dx, dy) {
    const snapThreshold = 50;
    return Math.abs(dx) <= snapThreshold && Math.abs(dy) <= snapThreshold;
}

function backToPosition() {
    sidebarDrag.style.left = `${initialLeft}px`;
    sidebarDrag.style.top = `${initialTop}px`;
    sidebarDrag.style.height = '85vh';
    sidebarTop.style.display = 'none';
    sidebarDrag.classList.remove('floating');
    sidebarDrag.style.cursor = 'default';
    floating = false;
}
