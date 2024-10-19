const canvas = document.getElementById('whiteboard');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth * 0.9;
canvas.height = window.innerHeight * 0.7;

let isDrawing = true;
let lineHappening = false;
let startX, startY;
let shapes = [];

const drawButton = document.getElementById('draw-tool');

// Set up tool selection for both touch and click events
drawButton.addEventListener('touchstart', activateDrawMode); // Touch event for Apple Pencil
drawButton.addEventListener('click', activateDrawMode); // Click event for mouse

function activateDrawMode(event) {
	isDrawing = true;
	drawButton.classList.add('active');
}

// Touch events for drawing
canvas.addEventListener('touchstart', handleStart);
canvas.addEventListener('touchmove', handleMove);
canvas.addEventListener('touchend', handleEnd);

function handleStart(event) {
	const rect = canvas.getBoundingClientRect();
	const x =
		(event.touches ? event.touches[0].clientX : event.clientX) - rect.left;
	const y =
		(event.touches ? event.touches[0].clientY : event.clientY) - rect.top;

	if (isDrawing && !lineHappening) {
		lineHappening = true;
		startX = x;
		startY = y;
		ctx.beginPath();
		ctx.moveTo(x, y);
	}
}

function handleMove(event) {
	const rect = canvas.getBoundingClientRect();
	const x =
		(event.touches ? event.touches[0].clientX : event.clientX) - rect.left;
	const y =
		(event.touches ? event.touches[0].clientY : event.clientY) - rect.top;

	if (isDrawing && lineHappening) {
		ctx.lineTo(x, y);
		ctx.strokeStyle = 'black'; // Black lines on whiteboard
		ctx.lineWidth = 2;
		ctx.stroke();
	}
}

function handleEnd(event) {
	if (isDrawing && lineHappening) {
		ctx.closePath();
		lineHappening = false;
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
