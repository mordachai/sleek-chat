// drag-pos.js

let isDragging = false;
let dragStartX, dragStartY;
let savedPosition = {
  top: -1,
  left: -1
};

export function makeDraggable(element, dragHandle, actorId) {
  if (!actorId || !element || !dragHandle) return;

  console.log("makeDraggable initialized");

  dragHandle.addEventListener('mousedown', dragMouseDown);
  document.addEventListener('mousemove', elementDrag);
  document.addEventListener('mouseup', closeDragElement);

  function dragMouseDown(e) {
    e.preventDefault(); // Prevent text selection
    isDragging = true;
    const rect = element.getBoundingClientRect();
    dragStartX = e.clientX - rect.left;
    dragStartY = e.clientY - rect.top;
  }

  function elementDrag(e) {
    if (!isDragging) return;
    e.preventDefault();
    const newX = e.clientX - dragStartX;
    const newY = e.clientY - dragStartY;
    element.style.left = `${newX}px`;
    element.style.top = `${newY}px`;
    element.style.right = 'auto';
    element.style.bottom = 'auto';
    savedPosition.left = newX;
    savedPosition.top = newY;
  }

  function closeDragElement() {
    isDragging = false;
    setDragPosition(actorId, savedPosition);
  }
}

export function getDragPosition(actorId) {
  const actor = game.actors.get(actorId);
  if (!actor) return {
    top: '100px',
    left: '100px'
  };

  const position = actor.getFlag("mist-hud", "hudPosition") || {
    top: '100px',
    left: '100px'
  };
  return position;
}

export function setDragPosition(actorId, position) {
  const actor = game.actors.get(actorId);
  if (!actor) return;
  actor.setFlag("mist-hud", "hudPosition", position);
}

export function updateDragAndDropState(enabled) {
  const container = document.querySelector('.sleek-chat-container');
  if (!container) {
    console.warn("Container element '.sleek-chat-container' not found.");
    return;
  }

  const dragHandle = container.querySelector('.drag-handle');
  if (!dragHandle) {
    console.warn("Drag handle element '.drag-handle' not found.");
    return;
  }

  const actorId = 'sleek-chat'; // Using a fixed actorId for simplicity

  if (enabled) {
    const savedPosition = getDragPosition(actorId);
    container.style.left = savedPosition.left;
    container.style.top = savedPosition.top;
    dragHandle.style.display = 'block';
    container.style.position = 'absolute';
    dragHandle.style.cursor = 'move';
    makeDraggable(container, dragHandle, actorId);
  } else {
    dragHandle.style.display = 'none';
    container.style.position = 'fixed';
    container.style.cursor = 'default';
    resetPosition(container);
  }
}

function resetPosition(container) {
  container.style.top = 'auto';
  container.style.left = 'auto';
  container.style.bottom = '10px';
  container.style.right = '10px';
}