const canvas = document.getElementById('whiteboard');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth * 0.9;
canvas.height = window.innerHeight * 0.7;

let isDrawing = false;
let isSelecting = false;
let startX, startY;
let selectedShape = null;
let shapes = [];

const drawButton = document.getElementById('draw-tool');
const selectButton = document.getElementById('select-tool');

// Set up tool selection (add touch events for iPad)
drawButton.addEventListener('click', activateDrawMode);
drawButton.addEventListener('touchstart', activateDrawMode); // Touch event for Apple Pencil

selectButton.addEventListener('click', activateSelectMode);
selectButton.addEventListener('touchstart', activateSelectMode); // Touch event for Apple Pencil

function activateDrawMode(event) {
	event.preventDefault(); // Prevent accidental scrolling/zooming
	isDrawing = true;
	isSelecting = false;
	drawButton.classList.add('active');
	selectButton.classList.remove('active');
}

function activateSelectMode(event) {
	event.preventDefault(); // Prevent accidental scrolling/zooming
	isDrawing = false;
	isSelecting = true;
	drawButton.classList.remove('active');
	selectButton.classList.add('active');
}

// Prevent scrolling on touch devices
document.body.addEventListener(
	'touchmove',
	function (e) {
		e.preventDefault();
	},
	{ passive: false }
);

// Touch events for drawing
canvas.addEventListener('touchstart', handleStart);
canvas.addEventListener('touchmove', handleMove);
canvas.addEventListener('touchend', handleEnd);

// Mouse events for drawing
canvas.addEventListener('mousedown', handleStart);
canvas.addEventListener('mousemove', handleMove);
canvas.addEventListener('mouseup', handleEnd);

function handleStart(event) {
	const rect = canvas.getBoundingClientRect();
	const x =
		(event.touches ? event.touches[0].clientX : event.clientX) - rect.left;
	const y =
		(event.touches ? event.touches[0].clientY : event.clientY) - rect.top;

	if (isDrawing) {
		startX = x;
		startY = y;
		ctx.beginPath();
		ctx.moveTo(x, y);
	} else if (isSelecting) {
		selectedShape = getShapeAt(x, y);
		if (selectedShape) {
			startX = x;
			startY = y;
		}
	}
}

function handleMove(event) {
	const rect = canvas.getBoundingClientRect();
	const x =
		(event.touches ? event.touches[0].clientX : event.clientX) - rect.left;
	const y =
		(event.touches ? event.touches[0].clientY : event.clientY) - rect.top;

	if (isDrawing) {
		ctx.lineTo(x, y);
		ctx.strokeStyle = 'black'; // Black lines on whiteboard
		ctx.lineWidth = 2;
		ctx.stroke();
	} else if (isSelecting && selectedShape) {
		const dx = x - startX;
		const dy = y - startY;
		selectedShape.x += dx;
		selectedShape.y += dy;
		startX = x;
		startY = y;
		redrawShapes();
	}
}

function handleEnd(event) {
	if (isDrawing) {
		// Keep drawing mode active after ending the line
		shapes.push({
			type: 'line',
			startX,
			startY,
			endX: event.clientX,
			endY: event.clientY,
		});
	}
	selectedShape = null;
}

function redrawShapes() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	shapes.forEach((shape) => {
		ctx.beginPath();
		ctx.moveTo(shape.startX, shape.startY);
		ctx.lineTo(shape.endX, shape.endY);
		ctx.stroke();
	});
}

function getShapeAt(x, y) {
	// Simplified selection logic (you can improve it)
	return shapes.find(
		(shape) =>
			Math.abs(shape.startX - x) < 5 && Math.abs(shape.startY - y) < 5
	);
}
