import * as THREE from 'three';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.185.1/examples/jsm/controls/OrbitControls.js';

const mount = document.querySelector('#three-canvas');
const rotationButton = document.querySelector('#toggle-rotation');
const resetButton = document.querySelector('#reset-view');
const angleLabel = document.querySelector('#view-angle');

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;
mount.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x0b0e12, 0.065);

const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
camera.position.set(6.4, 3.6, 8.3);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0.1, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.055;
controls.minDistance = 5.5;
controls.maxDistance = 13;
controls.maxPolarAngle = Math.PI * 0.64;
controls.minPolarAngle = Math.PI * 0.25;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.75;

const chrome = new THREE.MeshPhysicalMaterial({ color: 0x8d949a, metalness: 0.96, roughness: 0.17, clearcoat: 0.65, clearcoatRoughness: 0.13 });
const darkMetal = new THREE.MeshPhysicalMaterial({ color: 0x20252b, metalness: 0.82, roughness: 0.26, clearcoat: 0.35 });
const carbon = new THREE.MeshStandardMaterial({ color: 0x171a1f, metalness: 0.25, roughness: 0.42 });
const lensMaterial = new THREE.MeshPhysicalMaterial({ color: 0x090d12, metalness: 0.72, roughness: 0.1, transmission: 0.05, clearcoat: 1, clearcoatRoughness: 0.04 });
const linerMaterial = new THREE.MeshPhysicalMaterial({ color: 0xc9a893, metalness: 0, roughness: 0.7, clearcoat: 0.08 });
const accent = new THREE.MeshStandardMaterial({ color: 0xff6b2c, metalness: 0.5, roughness: 0.34, emissive: 0x521800, emissiveIntensity: 0.3 });

function mesh(geometry, material, position, rotation, scale) {
  const result = new THREE.Mesh(geometry, material);
  if (position) result.position.set(...position);
  if (rotation) result.rotation.set(...rotation);
  if (scale) result.scale.set(...scale);
  result.castShadow = true;
  result.receiveShadow = true;
  return result;
}

function tube(points, radius, material, closed = false) {
  const curve = new THREE.CatmullRomCurve3(points.map(([x, y, z]) => new THREE.Vector3(x, y, z)), closed, 'centripetal');
  return mesh(new THREE.TubeGeometry(curve, 72, radius, 14, closed), material);
}

function roundedBox(width, height, depth, radius, material) {
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -height / 2;
  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + height - radius);
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  shape.lineTo(x + radius, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);
  return mesh(new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: 0.07, bevelSize: 0.07, bevelSegments: 3 }), material, [0, 0, -depth / 2]);
}

function lensShape() {
  const shape = new THREE.Shape();
  shape.moveTo(-1.62, 0.46);
  shape.quadraticCurveTo(-0.92, 0.78, 0, 0.62);
  shape.quadraticCurveTo(0.92, 0.78, 1.62, 0.46);
  shape.lineTo(1.5, -0.34);
  shape.quadraticCurveTo(0.86, -0.54, 0.15, -0.27);
  shape.quadraticCurveTo(0, -0.19, -0.15, -0.27);
  shape.quadraticCurveTo(-0.86, -0.54, -1.5, -0.34);
  shape.closePath();
  return shape;
}

const wearable = new THREE.Group();
wearable.rotation.y = -0.18;
scene.add(wearable);

const outerBand = tube([
  [-2.18, -0.1, -0.12], [-2.55, 0.34, -0.38], [-2.32, 1.17, -0.62], [-1.55, 1.79, -0.76],
  [0, 1.96, -0.8], [1.55, 1.79, -0.76], [2.32, 1.17, -0.62], [2.55, 0.34, -0.38], [2.18, -0.1, -0.12],
], 0.28, chrome);
wearable.add(outerBand);

const innerBand = tube([
  [-1.92, 0.02, -0.08], [-2.18, 0.41, -0.38], [-1.94, 1.02, -0.5], [-1.32, 1.46, -0.56],
  [0, 1.58, -0.6], [1.32, 1.46, -0.56], [1.94, 1.02, -0.5], [2.18, 0.41, -0.38], [1.92, 0.02, -0.08],
], 0.18, linerMaterial);
wearable.add(innerBand);

const rearModule = roundedBox(1.26, 0.74, 0.29, 0.16, darkMetal);
rearModule.position.set(0, 1.65, -0.82);
rearModule.rotation.x = -0.08;
wearable.add(rearModule);
const rearPlate = roundedBox(0.95, 0.47, 0.045, 0.1, chrome);
rearPlate.position.set(0, 1.65, -0.99);
rearPlate.rotation.x = -0.08;
wearable.add(rearPlate);

const visorHousing = mesh(new THREE.ExtrudeGeometry(lensShape(), { depth: 0.25, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.06, bevelSegments: 4 }), chrome, [0, 0.19, 1.03]);
visorHousing.rotation.x = 0.07;
wearable.add(visorHousing);
const visor = mesh(new THREE.ShapeGeometry(lensShape()), lensMaterial, [0, 0.19, 1.31]);
visor.scale.set(0.9, 0.83, 1);
visor.rotation.x = 0.07;
wearable.add(visor);

const visorOutline = tube([
  [-1.5, 0.58, 1.36], [-0.72, 0.84, 1.4], [0, 0.71, 1.43], [0.72, 0.84, 1.4], [1.5, 0.58, 1.36],
  [1.38, -0.34, 1.32], [0.7, -0.48, 1.35], [0, -0.21, 1.39], [-0.7, -0.48, 1.35], [-1.38, -0.34, 1.32], [-1.5, 0.58, 1.36],
], 0.07, darkMetal);
wearable.add(visorOutline);

const lowerSupport = tube([[-1.62, -0.3, 1.07], [-1.1, -0.72, 1.16], [0, -0.79, 1.23], [1.1, -0.72, 1.16], [1.62, -0.3, 1.07]], 0.11, chrome);
wearable.add(lowerSupport);

for (const side of [-1, 1]) {
  const hinge = new THREE.Group();
  hinge.position.set(side * 2.06, 0.2, 0.77);
  hinge.rotation.y = side * -0.34;
  wearable.add(hinge);

  hinge.add(mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.3, 36), darkMetal, [0, 0, 0], [Math.PI / 2, 0, 0]));
  hinge.add(mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.33, 36), chrome, [0, 0, 0.02], [Math.PI / 2, 0, 0]));
  hinge.add(mesh(new THREE.TorusGeometry(0.24, 0.04, 12, 42), chrome, [0, 0, 0.2], [Math.PI / 2, 0, 0]));
  hinge.add(mesh(new THREE.BoxGeometry(0.47, 0.38, 0.64), carbon, [side * 0.28, 0.18, -0.18], [0, side * 0.18, 0]));
  hinge.add(mesh(new THREE.BoxGeometry(0.24, 0.1, 0.47), chrome, [side * 0.34, -0.24, 0.04], [0, side * 0.14, 0]));

  for (let index = 0; index < 5; index += 1) {
    const sensor = mesh(new THREE.SphereGeometry(0.055, 14, 10), linerMaterial, [side * (0.21 + index * 0.07), -0.22 + (index % 2) * 0.09, -0.32 + Math.floor(index / 2) * 0.08]);
    hinge.add(sensor);
  }
}

for (const side of [-1, 1]) {
  const arm = mesh(new THREE.BoxGeometry(0.78, 0.22, 0.36), darkMetal, [side * 2.31, 0.46, 0.09], [0.02, side * -0.12, side * 0.1]);
  wearable.add(arm);
  const cap = mesh(new THREE.BoxGeometry(0.32, 0.16, 0.39), chrome, [side * 2.56, 0.43, -0.02], [0.02, side * -0.12, side * 0.1]);
  wearable.add(cap);
}

const contactPad = tube([[-1.55, -0.08, 0.93], [-0.96, -0.52, 0.97], [0, -0.63, 1.02], [0.96, -0.52, 0.97], [1.55, -0.08, 0.93]], 0.1, linerMaterial);
wearable.add(contactPad);

const pedestal = mesh(new THREE.CylinderGeometry(3.75, 4.2, 0.18, 80), new THREE.MeshStandardMaterial({ color: 0x11151a, metalness: 0.55, roughness: 0.34 }), [0, -1.4, 0]);
pedestal.receiveShadow = true;
scene.add(pedestal);
const pedestalRing = mesh(new THREE.TorusGeometry(3.75, 0.018, 8, 100), accent, [0, -1.3, 0], [Math.PI / 2, 0, 0]);
scene.add(pedestalRing);

scene.add(new THREE.HemisphereLight(0xc6d8e5, 0x0c0f14, 1.35));
const key = new THREE.DirectionalLight(0xf4f8ff, 3.2);
key.position.set(4.5, 7, 5.5);
key.castShadow = true;
scene.add(key);
const rim = new THREE.PointLight(0xff6b2c, 38, 12, 2);
rim.position.set(-4.2, 1.8, -3.4);
scene.add(rim);
const coolRim = new THREE.PointLight(0x8db7d5, 24, 10, 2);
coolRim.position.set(3.8, 1.8, -1.5);
scene.add(coolRim);

function resize() {
  const { width, height } = mount.getBoundingClientRect();
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

let paused = false;
let dragging = false;
controls.addEventListener('start', () => { dragging = true; });
controls.addEventListener('end', () => { dragging = false; });

rotationButton.addEventListener('click', () => {
  paused = !paused;
  controls.autoRotate = !paused;
  rotationButton.textContent = paused ? '继续转台' : '暂停转台';
  rotationButton.setAttribute('aria-pressed', String(!paused));
});

resetButton.addEventListener('click', () => {
  camera.position.set(6.4, 3.6, 8.3);
  controls.target.set(0, 0.1, 0);
  controls.update();
});

function render() {
  requestAnimationFrame(render);
  if (!paused && !dragging) controls.autoRotate = true;
  controls.update();
  const degrees = ((THREE.MathUtils.radToDeg(Math.atan2(camera.position.x, camera.position.z)) + 360) % 360).toFixed(0).padStart(3, '0');
  angleLabel.textContent = `ORBIT / ${degrees}\u00b0`;
  renderer.render(scene, camera);
}

window.addEventListener('resize', resize);
resize();
render();
