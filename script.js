const canvas = document.getElementById('whiteboard');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth * 0.9;
canvas.height = window.innerHeight * 0.7;

let drawingTool = true;
let drawing = false;
let selectingTool = false;
let selecting = false;
let selectionDone = false;
let lineHappening = false;
let movingSelection = false;
let startX, startY, currentX, currentY;
let selectedArea = null;
let shapes = []; // Store shapes drawn

const drawButton = document.getElementById('draw-tool');
const selectButton = document.getElementById('select-tool');

// Set up tool selection for both touch and click events
drawButton.addEventListener('touchstart', activateDrawMode); // Touch event for Apple Pencil
selectButton.addEventListener('touchstart', activateSelectMode); // Touch event for Apple Pencil

function activateDrawMode(event) {
	drawingTool = true;
	selectingTool = false;
	selectionDone = false;
	movingSelection = false;
	drawButton.classList.add('active');
	selectButton.classList.remove('active');
}

function activateSelectMode(event) {
	drawingTool = false;
	selectingTool = true;
	selectionDone = false;
	movingSelection = false;
	drawButton.classList.remove('active');
	selectButton.classList.add('active');
}

// Touch events for drawing and selecting
canvas.addEventListener('touchstart', handleStart);
canvas.addEventListener('touchmove', handleMove);
canvas.addEventListener('touchend', handleEnd);

function handleStart(event) {
	const rect = canvas.getBoundingClientRect();
	const x =
		(event.touches ? event.touches[0].clientX : event.clientX) - rect.left;
	const y =
		(event.touches ? event.touches[0].clientY : event.clientY) - rect.top;

	if (drawingTool && !lineHappening) {
		// Start drawing a line
		lineHappening = true;
		startX = x;
		startY = y;
		ctx.beginPath();
		ctx.moveTo(x, y);
	} else if (selectingTool && !selectionDone && !selecting) {
		// Start drawing a selection box
		selecting = true;
		startX = x;
		startY = y;
		currentX = x;
		currentY = y;
		selectedArea = null;
	}
}

function handleMove(event) {
	const rect = canvas.getBoundingClientRect();
	const x =
		(event.touches ? event.touches[0].clientX : event.clientX) - rect.left;
	const y =
		(event.touches ? event.touches[0].clientY : event.clientY) - rect.top;

	if (drawingTool && lineHappening) {
		// Continue drawing a line
		ctx.lineTo(x, y);
		ctx.strokeStyle = 'black'; // Black lines on whiteboard
		ctx.lineWidth = 2;
		ctx.stroke();
	} else if (selectingTool && selecting && !selectionDone) {
		// Update the selection box size
		currentX = x;
		currentY = y;
		redrawCanvas();
		drawSelectionBox(startX, startY, currentX, currentY);
	} else if (movingSelection && selectedArea) {
		// Move the selected area
		const dx = x - startX;
		const dy = y - startY;
		startX = x;
		startY = y;
		moveSelectedArea(dx, dy);
		redrawCanvas();
	}
}

function handleEnd(event) {
	if (drawingTool && lineHappening) {
		// Finish drawing the line
		ctx.closePath();
		lineHappening = false;
	} else if (selectingTool && selecting) {
		// Finish drawing the selection box
		selectionDone = true;
		selecting = false;
		selectedArea = { startX, startY, endX: currentX, endY: currentY };
	} else if (movingSelection) {
		// Finish moving the selected area
		movingSelection = false;
	}
}

// Helper function to draw the selection box
function drawSelectionBox(x1, y1, x2, y2) {
	ctx.strokeStyle = 'blue'; // Selection box outline
	ctx.lineWidth = 2;
	ctx.setLineDash([5, 5]); // Dashed line for selection box
	ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
	ctx.setLineDash([]); // Reset dash style
}

// Helper function to move the selected area
function moveSelectedArea(dx, dy) {
	// For simplicity, just move all shapes inside the selection box
	shapes.forEach((shape) => {
		if (
			shape.x >= selectedArea.startX &&
			shape.x <= selectedArea.endX &&
			shape.y >= selectedArea.startY &&
			shape.y <= selectedArea.endY
		) {
			shape.x += dx;
			shape.y += dy;
		}
	});
}

// Redraw the canvas (shapes and selection)
function redrawCanvas() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	// Redraw shapes
	shapes.forEach((shape) => {
		ctx.beginPath();
		ctx.moveTo(shape.startX, shape.startY);
		ctx.lineTo(shape.endX, shape.endY);
		ctx.strokeStyle = 'black';
		ctx.lineWidth = 2;
		ctx.stroke();
	});
	if (selectedArea) {
		drawSelectionBox(
			selectedArea.startX,
			selectedArea.startY,
			selectedArea.endX,
			selectedArea.endY
		);
	}
}

// Prevent canvas from moving by consuming touch events
canvas.addEventListener('touchstart', (event) => {
	event.preventDefault();
});

canvas.addEventListener('touchmove', (event) => {
	event.preventDefault();
});

canvas.addEventListener('touchend', (event) => {
	event.preventDefault();
});
