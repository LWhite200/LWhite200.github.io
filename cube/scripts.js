const svg = document.getElementById('shape-container');
const lines = [];
const vertices = [
    { x: -1, y: -1, z: -1 }, // A
    { x: 1, y: -1, z: -1 },  // B
    { x: 1, y: 1, z: -1 },   // C
    { x: -1, y: 1, z: -1 },  // D
    { x: -1, y: -1, z: 1 },  // E
    { x: 1, y: -1, z: 1 },   // F
    { x: 1, y: 1, z: 1 },    // G
    { x: -1, y: 1, z: 1 }    // H
];

let rotationSpeedX = 0;
let rotationSpeedY = 0;
let scale = 100;
let dragging = false;
let dragStartX, dragStartY;
let offsetX = 0, offsetY = 0;

// Create lines for the cube
function createLines() {
    const edges = [
        [0, 1], [1, 2], [2, 3], [3, 0], // Front face
        [4, 5], [5, 6], [6, 7], [7, 4], // Back face
        [0, 4], [1, 5], [2, 6], [3, 7]  // Connecting edges
    ];

    edges.forEach(([start, end]) => {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('stroke', 'blue');
        line.setAttribute('stroke-width', '2');
        lines.push(line);
        svg.appendChild(line);
    });
}

// Project 3D coordinates to 2D
function project(vertex) {
    const perspective = 2;
    const x = (vertex.x * scale) / (perspective + vertex.z);
    const y = (vertex.y * scale) / (perspective + vertex.z);

    return {
        x: x + svg.clientWidth / 2 + offsetX,
        y: -y + svg.clientHeight / 2 + offsetY
    };
}

// Update line positions based on vertices
function updateLines() {
    const edges = [
        [0, 1], [1, 2], [2, 3], [3, 0], // Front face
        [4, 5], [5, 6], [6, 7], [7, 4], // Back face
        [0, 4], [1, 5], [2, 6], [3, 7]  // Connecting edges
    ];

    edges.forEach(([start, end], index) => {
        const startPos = project(vertices[start]);
        const endPos = project(vertices[end]);

        lines[index].setAttribute('x1', startPos.x);
        lines[index].setAttribute('y1', startPos.y);
        lines[index].setAttribute('x2', endPos.x);
        lines[index].setAttribute('y2', endPos.y);
    });
}

// Rotate the cube based on current rotation speeds
function rotateCube() {
    const angleX = (rotationSpeedX * Math.PI) / 180;
    const angleY = (rotationSpeedY * Math.PI) / 180;

    vertices.forEach(vertex => {
        // Rotate around Y-axis
        const x = vertex.x;
        const z = vertex.z;
        vertex.x = x * Math.cos(angleY) - z * Math.sin(angleY);
        vertex.z = x * Math.sin(angleY) + z * Math.cos(angleY);

        // Rotate around X-axis
        const y = vertex.y;
        const z2 = vertex.z;
        vertex.y = y * Math.cos(angleX) - z2 * Math.sin(angleX);
        vertex.z = y * Math.sin(angleX) + z2 * Math.cos(angleX);
    });

    updateLines();
}

// Handle dragging to move the cube
svg.addEventListener('mousedown', (e) => {
    dragging = true;
    dragStartX = e.clientX - offsetX;
    dragStartY = e.clientY - offsetY;
});

svg.addEventListener('mousemove', (e) => {
    if (dragging) {
        offsetX = e.clientX - dragStartX;
        offsetY = e.clientY - dragStartY;
        updateLines();
    }
});

svg.addEventListener('mouseup', () => {
    dragging = false;
});

// Handle sliders for rotation speed and scaling
document.getElementById('rotationX').addEventListener('input', (e) => {
    rotationSpeedX = parseFloat(e.target.value);
});

document.getElementById('rotationY').addEventListener('input', (e) => {
    rotationSpeedY = parseFloat(e.target.value);
});

document.getElementById('scale').addEventListener('input', (e) => {
    scale = parseFloat(e.target.value);
    updateLines();
});

// Initialize the cube
createLines();
setInterval(rotateCube, 10);
