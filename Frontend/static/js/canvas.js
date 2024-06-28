window.addEventListener('load', () => {
    const canvas = document.getElementById('canvas');
    const container = document.getElementById('canvas-container');
    const bufferCanvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const bufferCtx = bufferCanvas.getContext('2d');
    const resizeHandles = document.querySelectorAll('.resize-handle');
    const dimen = document.getElementById('dimensions');
    

    let isResizing = false;
    let currentHandle = null;



    function resizeCanvas() {
        // Copy the current canvas content to the buffer canvas
        bufferCanvas.width = canvas.width;
        bufferCanvas.height = canvas.height;
        bufferCtx.drawImage(canvas, 0, 0);

        // Resize the main canvas
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;

        // Copy the content back from the buffer canvas to the main canvas
        ctx.drawImage(bufferCanvas, 0, 0);
    }

    resizeCanvas();

    resizeHandles.forEach(handle => {
        handle.addEventListener('mousedown', startResize);
    });

    function startResize(e) {
        isResizing = true;
        currentHandle = e.target;
        dimen.innerHTML = '';
        document.addEventListener('mousemove', resize);
        document.addEventListener('mouseup', stopResize);
    }

    function resize(e) {
        if (!isResizing) return;

        const containerRect = container.getBoundingClientRect();

        if (currentHandle.classList.contains('right')) {
            const newWidth = e.clientX - containerRect.left;
            container.style.width = `${newWidth}px`;
        } else if (currentHandle.classList.contains('bottom')) {
            const newHeight = e.clientY - containerRect.top;
            container.style.height = `${newHeight}px`;
        } else if (currentHandle.classList.contains('corner')) {
            const newWidth = e.clientX - containerRect.left;
            const newHeight = e.clientY - containerRect.top;
            container.style.width = `${newWidth}px`;
            container.style.height = `${newHeight}px`;
        }

        // Update dimensions display
        const computedStyle = window.getComputedStyle(container);
        const width = parseInt(computedStyle.width, 10);
        const height = parseInt(computedStyle.height, 10);
        dimen.innerHTML = `${width}x${height}`;

        resizeCanvas();
    }

    function stopResize() {
        isResizing = false;
        document.removeEventListener('mousemove', resize);
        document.removeEventListener('mouseup', stopResize);
        dimen.innerHTML = '';
    }


});