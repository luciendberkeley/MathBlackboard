const canvas = document.getElementById('whiteboard');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth * 0.9;
canvas.height = window.innerHeight * 0.7;

let drawingTool = true;
let selectingTool = false;
let selecting = false;
let selectionDone = false;
let lineHappening = false;
let movingSelection = false;
let startX, startY, currentX, currentY;
let selectedArea = null;
let pixels = []; // Store shapes drawn
let selectedPixels = []; // Store pixels that are selected

const drawButton = document.getElementById('draw-tool');
const selectButton = document.getElementById('select-tool');

// Set up tool selection for both touch and click events
drawButton.addEventListener('touchstart', activateDrawMode);
selectButton.addEventListener('touchstart', activateSelectMode);
drawButton.addEventListener('click', activateDrawMode);
selectButton.addEventListener('click', activateSelectMode);

function activateDrawMode(event) {
	drawingTool = true;
	selectingTool = false;
	selectionDone = false;
	movingSelection = false;
	selectedArea = null; // Clear selection
	selectedPixels = []; // Clear selected pixels
	drawButton.classList.add('active');
	selectButton.classList.remove('active');
	redrawCanvas(); // Redraw to clear selection on canvas
}

function activateSelectMode(event) {
	drawingTool = false;
	selectingTool = true;
	selectionDone = false;
	movingSelection = false;
	selectedArea = null; // Clear selection
	selectedPixels = []; // Clear selected pixels
	drawButton.classList.remove('active');
	selectButton.classList.add('active');
	redrawCanvas(); // Redraw to clear selection on canvas
}

// Touch and mouse events for drawing and selecting
canvas.addEventListener('touchstart', handleStart);
canvas.addEventListener('touchmove', handleMove);
canvas.addEventListener('touchend', handleEnd);

canvas.addEventListener('mousedown', handleStart);
canvas.addEventListener('mousemove', handleMove);
canvas.addEventListener('mouseup', handleEnd);

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
		pixels.push([x, y]);
		ctx.beginPath();
		ctx.moveTo(x, y);
	} else if (selectingTool && !selectionDone && !selecting) {
		// Start drawing a selection box
		selecting = true;
		startX = x;
		startY = y;
		currentX = x;
		currentY = y;
	} else if (selectingTool && selectionDone) {
		// Start moving the selected area
		if (
			x >= selectedArea.startX &&
			x <= selectedArea.endX &&
			y >= selectedArea.startY &&
			y <= selectedArea.endY
		) {
			movingSelection = true;
			startX = x;
			startY = y; // Save current position for moving calculation
		}
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
		const newPixels = getLinePixels(startX, startY, x, y);
		newPixels.forEach((pixel) => {
			if (!pixels.some((p) => p[0] === pixel[0] && p[1] === pixel[1])) {
				pixels.push(pixel); // Avoid duplicates
			}
		});
		ctx.lineTo(x, y);
		ctx.strokeStyle = 'black'; // Black lines on whiteboard
		ctx.lineWidth = 2;
		ctx.stroke();
		startX = x; // Update startX and startY for the next segment
		startY = y;
		redrawCanvas();
	} else if (selectingTool && selecting && !selectionDone) {
		// Update the selection box size
		currentX = x;
		currentY = y;
		redrawCanvas();
		drawSelectionBox(startX, startY, currentX, currentY);
	} else if (movingSelection) {
		// Move the selected area
		const dx = x - startX;
		const dy = y - startY;
		startX = x;
		startY = y; // Update for next movement
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
		// Store selected pixels
		selectedPixels = pixels.filter(
			(pixel) =>
				pixel[0] >= selectedArea.startX &&
				pixel[0] <= selectedArea.endX &&
				pixel[1] >= selectedArea.startY &&
				pixel[1] <= selectedArea.endY
		);
	} else if (movingSelection) {
		// Finish moving the selected area
		movingSelection = false;
	}
}

// Helper function to get pixels between two points
function getLinePixels(x1, y1, x2, y2) {
	const pixels = [];
	const dx = Math.abs(x2 - x1);
	const dy = Math.abs(y2 - y1);
	const sx = x1 < x2 ? 1 : -1;
	const sy = y1 < y2 ? 1 : -1;
	let err = dx - dy;

	while (true) {
		pixels.push([x1, y1]);
		if (x1 === x2 && y1 === y2) break;
		const err2 = err * 2;
		if (err2 > -dy) {
			err -= dy;
			x1 += sx;
		}
		if (err2 < dx) {
			err += dx;
			y1 += sy;
		}
	}
	return pixels;
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
	// Clear the selected pixels from the original array only for visualization, not for the original data
	const newPixels = pixels.slice(); // Create a copy of the pixels
	selectedPixels.forEach((pixel) => {
		const index = newPixels.findIndex(
			(p) => p[0] === pixel[0] && p[1] === pixel[1]
		);
		if (index !== -1) {
			newPixels.splice(index, 1); // Remove from newPixels but don't modify the original pixels
		}
	});

	// Move the selected pixels
	selectedPixels.forEach((pixel) => {
		pixel[0] += dx;
		pixel[1] += dy;
	});

	// Combine moved pixels with the new pixel array
	selectedPixels.forEach((pixel) => {
		newPixels.push([pixel[0], pixel[1]]);
	});

	// Update the original pixel array with the newly combined one
	pixels = newPixels;

	// Update the selected area boundaries
	selectedArea.startX += dx;
	selectedArea.endX += dx;
	selectedArea.startY += dy;
	selectedArea.endY += dy;
}

// Redraw the canvas (shapes and selection)
function redrawCanvas() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	// Redraw pixels
	pixels.forEach((pixel) => {
		ctx.beginPath();
		ctx.rect(pixel[0], pixel[1], 1, 1);
		ctx.fillStyle = 'black';
		ctx.fill();
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
canvas.addEventListener(
	'touchmove',
	(event) => {
		event.preventDefault();
	},
	{ passive: false }
);
