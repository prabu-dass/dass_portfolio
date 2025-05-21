const container = document.querySelector('.home');
const canvas = document.getElementById('home-particles');

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 1, 1000);
camera.position.z = 100;

const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// Particles
const count = 250;
const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(count * 3);
const velocities = new Float32Array(count);
const angles = new Float32Array(count);
const radii = new Float32Array(count);

for (let i = 0; i < count; i++) {
  const i3 = i * 3;
  radii[i] = Math.random() * 80 + 40;
  angles[i] = Math.random() * Math.PI * 2;
  positions[i3] = Math.cos(angles[i]) * radii[i];
  positions[i3 + 1] = (Math.random() - 0.5) * 150;
  positions[i3 + 2] = Math.sin(angles[i]) * radii[i];
  velocities[i] = 0.02 + Math.random() * 0.02;
}

geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

const texture = new THREE.TextureLoader().load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/sprites/circle.png');
const material = new THREE.PointsMaterial({
  size: 0.7,
  map: texture,
  transparent: true,
  opacity: 0.4,
  depthWrite: false
});

const points = new THREE.Points(geometry, material);
scene.add(points);

// Mouse interaction
let mouse = { x: 0, y: 0 };
container.addEventListener('mousemove', e => {
  const rect = container.getBoundingClientRect();
  mouse.x = ((e.clientX - rect.left) / container.clientWidth - 0.5) * 2;
  mouse.y = -((e.clientY - rect.top) / container.clientHeight - 0.5) * 2;
});

function animate() {
  requestAnimationFrame(animate);
  const pos = geometry.attributes.position.array;

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const speed = velocities[i];
    angles[i] += 0.004 + mouse.x * 0.005;

    pos[i3] = Math.cos(angles[i]) * radii[i];
    pos[i3 + 2] = Math.sin(angles[i]) * radii[i];
    pos[i3 + 1] += speed;

    if (pos[i3 + 1] > 100) {
      pos[i3 + 1] = -100;
      radii[i] = Math.random() * 80 + 40;
      angles[i] = Math.random() * Math.PI * 2;
      pos[i3] = Math.cos(angles[i]) * radii[i];
      pos[i3 + 2] = Math.sin(angles[i]) * radii[i];
    }
  }

  geometry.attributes.position.needsUpdate = true;
  renderer.render(scene, camera);
}

animate();

// Resize handler
window.addEventListener('resize', () => {
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
});