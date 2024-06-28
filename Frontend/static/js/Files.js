const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const canvas_container=document.getElementById('canvas-container');

// Function to save canvas as a PNG file
function saveCanvas() {
    canvas.toBlob(function(blob) {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'canvas-image.png';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(link.href);
    }, 'image/png');
}

// Function to handle New File action (clear or save current canvas)
function handleNewFile() {
    function isCanvasEmpty() {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < imageData.data.length; i++) {
            if (imageData.data[i] !== 0) {
                return false;
            }
        }
        return true;
    }

    if (isCanvasEmpty()) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    } else {
        if (confirm('Do you want to save the current canvas?')) {
            saveCanvas();
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }
}

async function handleOpenFile() {
    try {
        if (window.showOpenFilePicker) {
            const fileHandle = await window.showOpenFilePicker();
            const file = await fileHandle[0].getFile();
            const fileReader = new FileReader();

            fileReader.onload = function() {
                const img = new Image();
                img.onload = function() {
                    // Calculate new dimensions based on canvas size
                    const aspectRatio = img.width / img.height;
                    const maxWidth = canvas.width;
                    const maxHeight = canvas.height;

                    let newWidth = img.width;
                    let newHeight = img.height;

                    // Adjust dimensions to fit within canvas bounds
                    if (newWidth > maxWidth) {
                        newWidth = maxWidth;
                        newHeight = newWidth / aspectRatio;
                    }
                    if (newHeight > maxHeight) {
                        newHeight = maxHeight;
                        newWidth = newHeight * aspectRatio;
                    }

                    canvas.height = newHeight;
                    ctx.drawImage(img, 0, 0, newWidth, newHeight);
                };
                img.src = fileReader.result;
            };

            fileReader.readAsDataURL(file);
        } else {
            // Fallback for older browsers
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';

            input.onchange = function(e) {
                const file = e.target.files[0];
                const fileReader = new FileReader();

                fileReader.onload = function() {
                    const img = new Image();
                    img.onload = function() {
                        // Calculate new dimensions based on canvas size
                        const aspectRatio = img.width / img.height;
                        const maxWidth = canvas.width;
                        const maxHeight = canvas.height;

                        let newWidth = img.width;
                        let newHeight = img.height;

                        // Adjust dimensions to fit within canvas bounds
                        if (newWidth > maxWidth) {
                            newWidth = maxWidth;
                            newHeight = newWidth / aspectRatio;
                        }
                        if (newHeight > maxHeight) {
                            newHeight = maxHeight;
                            newWidth = newHeight * aspectRatio;
                        }
                        canvas_container.width = newWidth;
                        canvas.height = newHeight;
                        ctx.drawImage(img, 0, 0, newWidth, newHeight);
                    };
                    img.src = fileReader.result;
                };

                fileReader.readAsDataURL(file);
            };

            input.click();
        }
    } catch (err) {
        console.error('Error opening file:', err);
    }
}


// Function to handle Save File action (not using File System API due to browser limitations)
function handleSaveFile() {
    saveCanvas();
}

// Function to handle Save As action (uses saveCanvas function)
function handleSaveAsFile() {
    saveCanvas();
}

// Function to handle Load from URL action (placeholder for future implementation)
function handleLoadFromURL() {
    
}

// Function to handle Upload to Imgur action (placeholder for future implementation)
function handleUploadToImgur() {
    console.log('Upload to Imgur clicked');
    // Add your logic here for handling 'Upload to Imgur' action
}

// Function to handle Manage Storage action (placeholder for future implementation)
function handleManageStorage() {
    console.log('Manage Storage clicked');
    // Add your logic here for handling 'Manage Storage' action
}

// Function to handle Set as Wallpaper (Tiled) action (placeholder for future implementation)
function handleSetAsWallpaperTiled() {
    console.log('Set as Wallpaper (Tiled) clicked');
    // Add your logic here for handling 'Set as Wallpaper (Tiled)' action
}

// Function to handle Set as Wallpaper (Centered) action (placeholder for future implementation)
function handleSetAsWallpaperCentered() {
    console.log('Set as Wallpaper (Centered) clicked');
    // Add your logic here for handling 'Set as Wallpaper (Centered)' action
}

// Function to handle Recent Files action (placeholder for future implementation)
function handleRecentFiles() {
    console.log('Recent Files clicked');
    // Add your logic here for handling 'Recent Files' action
}

// Function to handle Exit action (placeholder for future implementation)
function handleExit() {
    window.close();
}

// Lookup table for event listeners based on ID
const eventHandlers = {
    'New_file': handleNewFile,
    'Open_file': handleOpenFile,
    'Save_file': handleSaveFile,
    'Saveas_file': handleSaveAsFile,
    'Load_from_URL': handleLoadFromURL,
    'Upload_to_Imgur': handleUploadToImgur,
    'Manage_storage': handleManageStorage,
    'Set_as_WallpaperT': handleSetAsWallpaperTiled,
    'Set_as_WallpaperC': handleSetAsWallpaperCentered,
    'Recent_files': handleRecentFiles,
    'Exit': handleExit
};

document.addEventListener('DOMContentLoaded', function() {
    Object.keys(eventHandlers).forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('click', () => {
                eventHandlers[id](); 
            });
        }
    });
});

