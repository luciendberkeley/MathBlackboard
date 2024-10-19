const canvas = document.getElementById('blackboard');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight - document.querySelector('.toolbar').offsetHeight;

let drawing = false;
let selecting = false;
let moving = false;
let lastX, lastY, startX, startY;
let scale = 1;
let pinchZoom = false;
let selectedArea = null;

// Adjust for pixel ratio for sharper drawings on high DPI displays
const scaleFactor = window.devicePixelRatio;
canvas.width = canvas.width * scaleFactor;
canvas.height = canvas.height * scaleFactor;
ctx.scale(scaleFactor, scaleFactor);

// Tool buttons
document.getElementById('draw').addEventListener('click', () => {
    drawing = true;
    selecting = false;
    moving = false;
});

document.getElementById('select').addEventListener('click', () => {
    drawing = false;
    selecting = true;
    moving = false;
});

document.getElementById('move').addEventListener('click', () => {
    drawing = false;
    selecting = false;
    moving = true;
});

document.getElementById('clear').addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});

// Drawing functionality
canvas.addEventListener('mousedown', (e) => {
    if (drawing) {
        drawing = true;
        [lastX, lastY] = [e.offsetX, e.offsetY];
    } else if (selecting) {
        startX = e.offsetX;
        startY = e.offsetY;
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (drawing && e.buttons === 1) {
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();

        [lastX, lastY] = [e.offsetX, e.offsetY];
    } else if (selecting && e.buttons === 1) {
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear for visualization
        ctx.strokeRect(startX, startY, e.offsetX - startX, e.offsetY - startY);
        ctx.setLineDash([]);
    }
});

// Pinch Zoom functionality for touch devices
canvas.addEventListener('touchmove', (e) => {
    if (e.touches.length == 2) {
        pinchZoom = true;

        const dist = Math.hypot(
            e.touches[0].pageX - e.touches[1].pageX,
            e.touches[0].pageY - e.touches[1].pageY
        );

        if (!scaleStartDistance) scaleStartDistance = dist;

        scale = dist / scaleStartDistance;
        ctx.setTransform(scale, 0, 0, scale, 0, 0); // Adjust canvas scale
    }
});

canvas.addEventListener('touchend', (e) => {
    if (e.touches.length < 2) {
        pinchZoom = false;
        scaleStartDistance = null;
    }
});
