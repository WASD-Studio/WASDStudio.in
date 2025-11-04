const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');
let particles = [];
let mouse = { x: null, y: null, isMoving: false };
let lastMoveTime = 0;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const NUM_PARTICLES = 80;
const BASE_DRIFT = 0.002;
const MASS_MIN = 0.5;
const MASS_MAX = 3; // ⬅️ increased upper bound for more size variety
const MOUSE_RADIUS = 80;
const MAX_REPULSION = 2.5;
const DRIFT_DAMPING = 0.995;

class Particle {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.mass = Math.random() * (MASS_MAX - MASS_MIN) + MASS_MIN;
    this.radius = this.mass * 1.5; // ⬅️ larger and varied size
    this.dx = 0;
    this.dy = 0;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fill();
  }

  update() {
    // Always drift in idle
    const idleForce = 0.02 / this.mass;
    this.dx += (Math.random() - 0.5) * idleForce;
    this.dy += (Math.random() - 0.5) * idleForce;

    // Cursor repulsion if moving
    if (mouse.isMoving) {
      const dxm = this.x - mouse.x;
      const dym = this.y - mouse.y;
      const dist = Math.sqrt(dxm * dxm + dym * dym);

      if (dist < MOUSE_RADIUS) {
        const angle = Math.atan2(dym, dxm);
        const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
        const repel = (force * MAX_REPULSION) / this.mass;
        this.dx = Math.cos(angle) * repel;
        this.dy = Math.sin(angle) * repel;
      }
    }

    // Apply friction (space resistance)
    this.dx *= DRIFT_DAMPING;
    this.dy *= DRIFT_DAMPING;

    this.x += this.dx;
    this.y += this.dy;

    // Bounce off edges
    if (this.x <= 0 || this.x >= canvas.width) this.dx *= -0.7;
    if (this.y <= 0 || this.y >= canvas.height) this.dy *= -0.7;

    // Respawn if far out of bounds
    if (this.x < -200 || this.x > canvas.width + 200 || this.y < -200 || this.y > canvas.height + 200) {
      this.reset();
    }

    this.draw();
  }
}

function connectParticles() {
  ctx.beginPath();
  for (let a = 0; a < particles.length; a++) {
    for (let b = a + 1; b < particles.length; b++) {
      const dx = particles[a].x - particles[b].x;
      const dy = particles[a].y - particles[b].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 100) {
        ctx.moveTo(particles[a].x, particles[a].y);
        ctx.lineTo(particles[b].x, particles[b].y);
      }
    }
  }

  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1.5; // ⬅️ Increased line thickness
  ctx.stroke();
}

function init() {
  particles = [];
  for (let i = 0; i < NUM_PARTICLES; i++) {
    particles.push(new Particle());
  }
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => p.update());
  connectParticles();
  requestAnimationFrame(animate);

  // Reset mouse movement
  if (mouse.isMoving && Date.now() - lastMoveTime > 100) {
    mouse.isMoving = false;
    mouse.x = null;
    mouse.y = null;
  }
}

window.addEventListener('mousemove', e => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
  mouse.isMoving = true;
  lastMoveTime = Date.now();
});

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  init();
});

// ✨ Click to add a dot near cursor and remove one elsewhere
window.addEventListener('click', () => {
  if (particles.length === 0) return;

  // Remove random one
  const removeIndex = Math.floor(Math.random() * particles.length);
  particles.splice(removeIndex, 1);

  // Spawn new near cursor
  const spawnX = mouse.x || canvas.width / 2;
  const spawnY = mouse.y || canvas.height / 2;

  const newParticle = new Particle();
  newParticle.x = spawnX + (Math.random() - 0.5) * 30;
  newParticle.y = spawnY + (Math.random() - 0.5) * 30;
  newParticle.mass = Math.random() * (MASS_MAX - MASS_MIN) + MASS_MIN;
  newParticle.radius = newParticle.mass * 1.5; // ⬅️ Consistent with other dots
  newParticle.dx = 0;
  newParticle.dy = 0;

  particles.push(newParticle);
});

init();
animate();
