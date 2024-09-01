let isDragging = false;
let dragStartX, dragStartY;

export function updateDragAndDropState(enabled) {
    const container = document.querySelector('.sleek-chat-container');
    const dragHandle = container.querySelector('.drag-handle');

    if (enabled) {
        dragHandle.style.display = 'block';
        container.style.position = 'absolute';
        container.style.cursor = 'move';
        enableDragging(container, dragHandle);
    } else {
        dragHandle.style.display = 'none';
        container.style.position = 'fixed';
        container.style.cursor = 'default';
        resetPosition(container);
        disableDragging(container, dragHandle);
    }

}

function resetPosition(container) {
    container.style.top = 'auto';
    container.style.left = 'auto';
    container.style.bottom = '10px';
    container.style.right = '10px';
}

function enableDragging(container, dragHandle) {
    dragHandle.addEventListener('mousedown', startDragging);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDragging);
}

function disableDragging(container, dragHandle) {
    dragHandle.removeEventListener('mousedown', startDragging);
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('mouseup', stopDragging);
}

function startDragging(e) {
    isDragging = true;
    const container = document.querySelector('.sleek-chat-container');
    const rect = container.getBoundingClientRect();
    dragStartX = e.clientX - rect.left;
    dragStartY = e.clientY - rect.top;
}

function drag(e) {
    if (!isDragging) return;
    const container = document.querySelector('.sleek-chat-container');
    const newX = e.clientX - dragStartX;
    const newY = e.clientY - dragStartY;
    container.style.left = `${newX}px`;
    container.style.top = `${newY}px`;
    container.style.right = 'auto';
    container.style.bottom = 'auto';
}

function stopDragging() {
    isDragging = false;
}