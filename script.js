const canvas = document.getElementById('blackboard');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height =
	window.innerHeight - document.querySelector('.toolbar').offsetHeight;

let drawing = false;
let selecting = false;
let moving = false;
let lastX, lastY, startX, startY, selectedArea;
let scale = 1;
let objects = []; // Stores drawn objects
let currentTool = 'draw';

// Handle pixel density for sharp drawing
const scaleFactor = window.devicePixelRatio;
canvas.width = canvas.width * scaleFactor;
canvas.height = canvas.height * scaleFactor;
ctx.scale(scaleFactor, scaleFactor);

// Tool buttons
document.getElementById('draw').addEventListener('click', () => {
	currentTool = 'draw';
});

document.getElementById('clear').addEventListener('click', () => {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	objects = [];
});

// Drawing and moving with mouse/touch/pen
canvas.addEventListener('pointerdown', (e) => {
	const pos = getCanvasCoordinates(e);

	if (currentTool === 'draw') {
		drawing = true;
		[lastX, lastY] = [pos.x, pos.y];
	} else if (currentTool === 'select') {
		selecting = true;
		startX = pos.x;
		startY = pos.y;
	}
});

canvas.addEventListener('pointermove', (e) => {
	const pos = getCanvasCoordinates(e);

	if (drawing && e.buttons === 1) {
		ctx.strokeStyle = 'white';
		ctx.lineWidth = 2;
		ctx.lineCap = 'round';
		ctx.beginPath();
		ctx.moveTo(lastX, lastY);
		ctx.lineTo(pos.x, pos.y);
		ctx.stroke();
		[lastX, lastY] = [pos.x, pos.y];
		objects.push({
			type: 'line',
			startX: lastX,
			startY: lastY,
			endX: pos.x,
			endY: pos.y,
		});
	} else if (selecting && e.buttons === 1) {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		drawAllObjects();
		ctx.strokeStyle = 'blue';
		ctx.lineWidth = 1;
		ctx.setLineDash([5, 5]);
		ctx.strokeRect(startX, startY, pos.x - startX, pos.y - startY);
		ctx.setLineDash([]);
	}
});

canvas.addEventListener('pointerup', (e) => {
	const pos = getCanvasCoordinates(e);

	if (drawing) {
		drawing = false;
	} else if (selecting) {
		selecting = false;
		selectedArea = { x1: startX, y1: startY, x2: pos.x, y2: pos.y };
		currentTool = 'move'; // Automatically switch to move after selecting
	} else if (moving && selectedArea) {
		moveSelectedArea(pos.x - selectedArea.x1, pos.y - selectedArea.y1);
		selectedArea = null; // Clear selection after moving
		currentTool = 'select'; // Switch back to selection mode after move
	}
});

// Utility functions
function getCanvasCoordinates(e) {
	const rect = canvas.getBoundingClientRect();
	return {
		x: (e.clientX - rect.left) / scaleFactor,
		y: (e.clientY - rect.top) / scaleFactor,
	};
}

function drawAllObjects() {
	objects.forEach((obj) => {
		if (obj.type === 'line') {
			ctx.beginPath();
			ctx.moveTo(obj.startX, obj.startY);
			ctx.lineTo(obj.endX, obj.endY);
			ctx.stroke();
		}
	});
}

function moveSelectedArea(dx, dy) {
	// Adjust all objects inside selected area by dx, dy
	objects = objects.map((obj) => {
		if (isInsideSelection(obj)) {
			return {
				...obj,
				startX: obj.startX + dx,
				startY: obj.startY + dy,
				endX: obj.endX + dx,
				endY: obj.endY + dy,
			};
		}
		return obj;
	});
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	drawAllObjects();
}

function isInsideSelection(obj) {
	if (selectedArea) {
		const { x1, y1, x2, y2 } = selectedArea;
		const minX = Math.min(x1, x2);
		const maxX = Math.max(x1, x2);
		const minY = Math.min(y1, y2);
		const maxY = Math.max(y1, y2);
		return (
			obj.startX >= minX &&
			obj.endX <= maxX &&
			obj.startY >= minY &&
			obj.endY <= maxY
		);
	}
	return false;
}

// Add touch action handling for zoom and better performance on tablets
canvas.addEventListener('touchstart', (e) => e.preventDefault());
canvas.addEventListener('touchmove', (e) => e.preventDefault());
