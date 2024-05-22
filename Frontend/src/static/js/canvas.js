window.addEventListener('load', () => {
    const canvas = document.getElementById('canvas');
    const container = document.getElementById('canvas-container');
    const ctx = canvas.getContext('2d');
    const resizeHandles = document.querySelectorAll('.resize-handle');

    let isResizing = false;
    let currentHandle = null;

    function resizeCanvas() {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        
    }

    resizeCanvas();
    
    resizeHandles.forEach(handle => {
        handle.addEventListener('mousedown', startResize); 
    });



function startResize(e) {
    isResizing = true;
    currentHandle = e.target;
    document.addEventListener('mousemove', resize);
    document.addEventListener('mouseup', stopResize);
}

function resize(e) {
    if (!isResizing) return;

    const containerRect = container.getBoundingClientRect();

    if (currentHandle.classList.contains('right')) {
        const newWidth = e.clientX -containerRect.left;
        container.style.width = `${newWidth}px`;
    }
    else if (currentHandle.classList.contains('bottom')) {
        const newHeight = e.clientY - containerRect.top;
        container.style.height = `${newHeight}px`;
    }
    else if (currentHandle.classList.contains('corner')) {
        const newWidth = e.clientX - containerRect.left;
        const newHeight = e.clientY - containerRect.top;
        container.style.width = `${newWidth}px`;
        container.style.height = `${newHeight}px`;
    }
    resizeCanvas();
}
   function stopResize() {
        isResizing = false;
        document.removeEventListener('mousemove', resize);
        document.removeEventListener('mouseup', stopResize);
    }
});