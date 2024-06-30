const canvas = document.getElementById('graph');
const ctx = canvas.getContext('2d');
const tooltip = document.getElementById('tooltip');

let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

const categories = ['Music', 'Gaming', 'Tech', 'Cooking', 'Travel'];
const colorMap = {
    'Music': '#FF0000',
    'Gaming': '#00FF00',
    'Tech': '#0000FF',
    'Cooking': '#FFFF00',
    'Travel': '#FF00FF'
};

// Generate mock data
const nodes = [];
const edges = [];

for (let i = 0; i < 50; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    nodes.push({
        id: i,
        title: `Video ${i + 1}`,
        views: Math.floor(Math.random() * 1000000),
        category: category,
        x: Math.random() * width,
        y: Math.random() * height,
        vx: 0,
        vy: 0
    });
}

// Create edges between nodes with similar categories
for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
        if (nodes[i].category === nodes[j].category && Math.random() < 0.3) {
            edges.push({ source: i, target: j });
        }
    }
}

let draggedNode = null;
let scale = 1;
let offsetX = 0;
let offsetY = 0;

function draw() {
    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);

    // Draw edges
    edges.forEach(edge => {
        const source = nodes[edge.source];
        const target = nodes[edge.target];
        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
        ctx.strokeStyle = 'rgba(200, 200, 200, 0.5)';
        ctx.stroke();
    });

    // Draw nodes
    nodes.forEach(node => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, Math.sqrt(node.views) / 100, 0, Math.PI * 2);
        ctx.fillStyle = colorMap[node.category];
        ctx.fill();
    });

    ctx.restore();
}

function simulateForces() {
    const k = 0.01; // Spring constant
    const repulsion = 500; // Repulsion constant

    nodes.forEach(node => {
        node.fx = 0;
        node.fy = 0;
    });

    // Apply repulsion forces
    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            const dx = nodes[i].x - nodes[j].x;
            const dy = nodes[i].y - nodes[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy) || 1;
            const force = repulsion / (distance * distance);
            nodes[i].fx += force * dx / distance;
            nodes[i].fy += force * dy / distance;
            nodes[j].fx -= force * dx / distance;
            nodes[j].fy -= force * dy / distance;
        }
    }

    // Apply spring forces for edges
    edges.forEach(edge => {
        const source = nodes[edge.source];
        const target = nodes[edge.target];
        const dx = source.x - target.x;
        const dy = source.y - target.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const force = k * (distance - 100);
        source.fx -= force * dx / distance;
        source.fy -= force * dy / distance;
        target.fx += force * dx / distance;
        target.fy += force * dy / distance;
    });

    // Update positions
    nodes.forEach(node => {
        if (node !== draggedNode) {
            node.vx = (node.vx + node.fx) * 0.5;
            node.vy = (node.vy + node.fy) * 0.5;
            node.x += node.vx;
            node.y += node.vy;
        }
    });
}

function animate() {
    simulateForces();
    draw();
    requestAnimationFrame(animate);
}

canvas.addEventListener('mousedown', e => {
    const mouseX = (e.clientX - offsetX) / scale;
    const mouseY = (e.clientY - offsetY) / scale;
    draggedNode = nodes.find(node => {
        const dx = node.x - mouseX;
        const dy = node.y - mouseY;
        return Math.sqrt(dx * dx + dy * dy) < Math.sqrt(node.views) / 100;
    });
});

canvas.addEventListener('mousemove', e => {
    const mouseX = (e.clientX - offsetX) / scale;
    const mouseY = (e.clientY - offsetY) / scale;
    
    if (draggedNode) {
        draggedNode.x = mouseX;
        draggedNode.y = mouseY;
        draggedNode.vx = 0;
        draggedNode.vy = 0;
    }

    const hoveredNode = nodes.find(node => {
        const dx = node.x - mouseX;
        const dy = node.y - mouseY;
        return Math.sqrt(dx * dx + dy * dy) < Math.sqrt(node.views) / 100;
    });

    if (hoveredNode) {
        tooltip.style.display = 'block';
        tooltip.style.left = e.clientX + 10 + 'px';
        tooltip.style.top = e.clientY + 10 + 'px';
        tooltip.textContent = `${hoveredNode.title} (${hoveredNode.category}) - ${hoveredNode.views} views`;
    } else {
        tooltip.style.display = 'none';
    }
});

canvas.addEventListener('mouseup', () => {
    draggedNode = null;
});

canvas.addEventListener('wheel', e => {
    e.preventDefault();
    const zoomIntensity = 0.1;
    const mouseX = e.clientX - offsetX;
    const mouseY = e.clientY - offsetY;
    const wheel = e.deltaY < 0 ? 1 : -1;
    const zoom = Math.exp(wheel * zoomIntensity);
    scale *= zoom;
    offsetX -= mouseX * (zoom - 1);
    offsetY -= mouseY * (zoom - 1);
});

window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
});

animate();