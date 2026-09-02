import * as THREE from "three";
import { GLTFLoader } from "./vendor/GLTFLoader.js";

const embedded = new URLSearchParams(window.location.search).get("embed") === "1";
const MESSAGE_SOURCE = "vacuum-viewer";
const PARENT_SOURCE = "owen-portfolio";
document.documentElement.classList.toggle("is-embedded", embedded);

const canvas = document.getElementById("viewer");
const loading = document.getElementById("loading");
const loadingBar = document.getElementById("loadingBar");
const status = document.querySelector(".status");
const statusText = document.getElementById("statusText");
const partsList = document.getElementById("partsList");
const selectedName = document.getElementById("selectedName");
const labelsRoot = document.getElementById("labels");
const topbar = document.querySelector(".topbar");
const scenesPanel = document.querySelector(".scenes-panel");
const scenesList = document.getElementById("scenesList");
const sceneCards = Array.from(document.querySelectorAll(".scene-card"));
const partsPanel = document.querySelector(".parts-panel");
const controlsPanel = document.querySelector(".controls");
const playButton = document.getElementById("playButton");
const playIcon = document.getElementById("playIcon");
const resetButton = document.getElementById("resetButton");
const progressSlider = document.getElementById("progressSlider");
const progressValue = document.getElementById("progressValue");
const shellToggle = document.getElementById("shellToggle");
const labelToggle = document.getElementById("labelToggle");
const rotateToggle = document.getElementById("rotateToggle");
const zoomInButton = document.getElementById("zoomInButton");
const zoomOutButton = document.getElementById("zoomOutButton");
const partsButton = document.getElementById("partsButton");
const partsCloseButton = document.getElementById("partsCloseButton");
const partsScrim = document.getElementById("partsScrim");
const fullscreenButton = document.getElementById("fullscreenButton");
const moreButton = document.getElementById("moreButton");
const sceneMotionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
const SCENE_CYCLE_INTERVAL = 4.5;

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.24;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.localClippingEnabled = true;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x090b0d);
scene.fog = new THREE.Fog(0x090b0d, 500, 900);

const camera = new THREE.PerspectiveCamera(27, 1, 0.1, 1000);
const cameraState = { yaw: -0.52, pitch: 0.23, radius: 280, target: new THREE.Vector3(0, 0, 1) };

scene.add(new THREE.HemisphereLight(0xffffff, 0x23292d, 2.9));
const keyLight = new THREE.DirectionalLight(0xffffff, 5.5);
keyLight.position.set(-110, -150, 220);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(2048, 2048);
keyLight.shadow.camera.left = -120;
keyLight.shadow.camera.right = 120;
keyLight.shadow.camera.top = 150;
keyLight.shadow.camera.bottom = -150;
keyLight.shadow.bias = -0.0003;
scene.add(keyLight);
const rimLight = new THREE.DirectionalLight(0xff6a5d, 2.2);
rimLight.position.set(150, 120, 130);
scene.add(rimLight);
const warmLight = new THREE.DirectionalLight(0xaedbe5, 1.4);
warmLight.position.set(-120, 90, 40);
scene.add(warmLight);

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(520, 520),
  new THREE.ShadowMaterial({ color: 0x000000, opacity: 0.3, transparent: true })
);
floor.position.z = -83;
floor.receiveShadow = true;
scene.add(floor);

const materials = {
  smoke_clear: new THREE.MeshPhysicalMaterial({
    color: 0x8c9ba5, metalness: 0.0, roughness: 0.13, transmission: 0.34,
    thickness: 1.8, transparent: true, opacity: 0.36, depthWrite: false,
    clearcoat: 0.9, clearcoatRoughness: 0.08, side: THREE.DoubleSide
  }),
  cool_silver: new THREE.MeshPhysicalMaterial({
    color: 0xd6dce0, metalness: 0.78, roughness: 0.23, clearcoat: 0.25, side: THREE.DoubleSide
  }),
  filter_paper: new THREE.MeshPhysicalMaterial({
    color: 0xefefeb, metalness: 0.0, roughness: 0.84, sheen: 0.18, side: THREE.DoubleSide
  }),
  graphite_seal: new THREE.MeshPhysicalMaterial({
    color: 0x22282d, metalness: 0.08, roughness: 0.49, clearcoat: 0.18, side: THREE.DoubleSide
  }),
  impeller_metal: new THREE.MeshPhysicalMaterial({
    color: 0x65717a, metalness: 0.84, roughness: 0.22, clearcoat: 0.22, side: THREE.DoubleSide
  }),
  motor_metal: new THREE.MeshPhysicalMaterial({
    color: 0x969da1, metalness: 0.76, roughness: 0.30, clearcoat: 0.18, side: THREE.DoubleSide
  }),
  pcb_green: new THREE.MeshPhysicalMaterial({
    color: 0x2f8664, metalness: 0.08, roughness: 0.43, clearcoat: 0.25, side: THREE.DoubleSide
  }),
  control_chrome: new THREE.MeshPhysicalMaterial({
    color: 0xd5dade, metalness: 0.95, roughness: 0.12, clearcoat: 0.8, side: THREE.DoubleSide
  }),
  battery_warm_gray: new THREE.MeshPhysicalMaterial({
    color: 0x77736e, metalness: 0.22, roughness: 0.52, side: THREE.DoubleSide
  }),
  pearl_white: new THREE.MeshPhysicalMaterial({
    color: 0xf4f3f0, metalness: 0.04, roughness: 0.28, clearcoat: 0.82,
    clearcoatRoughness: 0.14, side: THREE.DoubleSide
  })
};

const [manifest, gltf] = await Promise.all([
  fetch("./assets/assembly_manifest.json").then(response => {
    if (!response.ok) throw new Error("装配清单载入失败");
    return response.json();
  }),
  new GLTFLoader().loadAsync("./assets/vacuum_main.glb", event => {
    if (event.total) loadingBar.style.width = `${Math.max(12, event.loaded / event.total * 100)}%`;
  })
]);

const modelRoot = gltf.scene;
scene.add(modelRoot);

const componentSpecs = new Map(manifest.components.map(component => [component.id, component]));
const componentNodes = new Map();
const labelElements = new Map();
const labelStates = new Map();
const selectableMeshes = [];

function findComponentNode(id) {
  let exact = modelRoot.getObjectByName(id);
  if (exact) return exact;
  modelRoot.traverse(object => {
    if (!exact && object.name.toLowerCase().includes(id.toLowerCase())) exact = object;
  });
  return exact;
}

function decorateNode(node, componentId, materialId) {
  node.userData.componentId = componentId;
  node.traverse(object => {
    object.userData.componentId = componentId;
    if (!object.isMesh) return;
    object.geometry.computeVertexNormals();
    object.material = materials[materialId].clone();
    object.castShadow = true;
    object.receiveShadow = true;
    selectableMeshes.push(object);
  });
}

for (const component of manifest.components) {
  const node = findComponentNode(component.id);
  if (!node) throw new Error(`GLB 缺少组件 ${component.id}`);
  decorateNode(node, component.id, component.material);
  node.userData.basePosition = node.position.clone();
  componentNodes.set(component.id, node);
}

const bodyOriginal = componentNodes.get("body_shell");
bodyOriginal.visible = false;

function cloneShell(id, plane, direction) {
  const clone = bodyOriginal.clone(true);
  clone.name = id;
  clone.visible = true;
  clone.userData.componentId = "body_shell";
  clone.userData.basePosition = bodyOriginal.position.clone();
  clone.userData.shellDirection = direction;
  clone.traverse(object => {
    object.userData.componentId = "body_shell";
    if (!object.isMesh) return;
    object.material = materials.pearl_white.clone();
    object.material.clippingPlanes = [plane];
    object.material.clipShadows = true;
    object.castShadow = true;
    object.receiveShadow = true;
    selectableMeshes.push(object);
  });
  bodyOriginal.parent.add(clone);
  return clone;
}

const shellPositive = cloneShell("body_shell_left", new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), 1);
const shellNegative = cloneShell("body_shell_right", new THREE.Plane(new THREE.Vector3(0, -1, 0), 0), -1);
componentNodes.set("body_shell_left", shellPositive);
componentNodes.set("body_shell_right", shellNegative);

modelRoot.updateMatrixWorld(true);
const labelAnchorBox = new THREE.Box3();
const labelAnchorWorld = new THREE.Vector3();

for (const component of manifest.components) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "part-button";
  button.dataset.component = component.id;
  button.innerHTML = `<i></i><span>${component.name}</span><small>${String(component.sourceIndices.length).padStart(2, "0")}</small>`;
  button.addEventListener("click", () => {
    selectComponent(component.id);
    if (window.innerWidth <= 760) closePartsPanel();
  });
  partsList.appendChild(button);

  const label = document.createElement("div");
  label.className = "part-label";
  label.textContent = component.name;
  label.dataset.component = component.id;
  labelsRoot.appendChild(label);
  labelElements.set(component.id, label);

  const anchorNode = component.id === "body_shell" ? bodyOriginal : componentNodes.get(component.id);
  anchorNode.updateWorldMatrix(true, true);
  labelAnchorBox.setFromObject(anchorNode).getCenter(labelAnchorWorld);
  anchorNode.worldToLocal(labelAnchorWorld);
  labelStates.set(component.id, {
    anchorNode,
    anchorLocal: labelAnchorWorld.clone(),
    x: 0,
    y: 0,
    renderedX: null,
    renderedY: null,
    initialized: false,
    visible: false,
    progressEligible: false,
  });
}

document.getElementById("partCount").textContent = `${manifest.components.length} PARTS`;

const state = {
  progress: 0,
  playing: !embedded,
  speed: 1,
  cycleTime: 0,
  selected: null,
  labels: true,
  shellTransparent: false,
  autoRotate: false,
  activeSceneId: "keyboard",
  previewSceneId: null,
  scenePreviewLocked: false,
  scenesMuted: false,
  sceneAutoPlay: !sceneMotionPreference.matches,
  sceneCycleElapsed: 0,
  sceneCycleInterval: SCENE_CYCLE_INTERVAL,
  embedded,
  fullscreen: !embedded,
};
const framingCenter = new THREE.Vector3();

function clamp01(value) { return Math.min(1, Math.max(0, value)); }
function smoothstep(value) {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
}

function localProgress(globalProgress, range) {
  return smoothstep((globalProgress - range[0]) / (range[1] - range[0]));
}

function setScenesMuted(muted) {
  const nextMuted = Boolean(muted);
  if (state.scenesMuted === nextMuted) return;
  state.scenesMuted = nextMuted;
  document.body.classList.toggle("scenes-muted", nextMuted);
}

function setScene(sceneId, options = {}) {
  const selectedCard = sceneCards.find(card => card.dataset.scene === sceneId);
  if (!selectedCard) return false;
  state.activeSceneId = sceneId;
  if (options.resetCycle !== false) state.sceneCycleElapsed = 0;
  for (const card of sceneCards) {
    const active = card === selectedCard;
    card.classList.toggle("active", active);
    card.setAttribute("aria-pressed", String(active));
  }
  if (options.scroll !== false && window.innerWidth < 1180) {
    const targetLeft = selectedCard.offsetLeft - (scenesList.clientWidth - selectedCard.offsetWidth) * 0.5;
    scenesList.scrollTo({
      left: Math.max(0, targetLeft),
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  }
  return true;
}

function setScenePreview(sceneId, options = {}) {
  const previewCard = sceneCards.find(card => card.dataset.scene === sceneId);
  if (!previewCard) return false;
  const locked = Boolean(options.locked);
  state.previewSceneId = sceneId;
  state.scenePreviewLocked = locked;
  state.sceneCycleElapsed = 0;
  document.body.classList.add("scenes-engaged");
  document.body.classList.toggle("scene-preview-locked", locked);
  for (const card of sceneCards) {
    card.classList.toggle("preview", card === previewCard);
  }
  return true;
}

function clearScenePreview(options = {}) {
  if (state.scenePreviewLocked && !options.force) return false;
  state.previewSceneId = null;
  state.scenePreviewLocked = false;
  state.sceneCycleElapsed = 0;
  document.body.classList.remove("scenes-engaged", "scene-preview-locked");
  for (const card of sceneCards) card.classList.remove("preview");
  return true;
}

function advanceScene() {
  const currentIndex = sceneCards.findIndex(card => card.dataset.scene === state.activeSceneId);
  const nextCard = sceneCards[(currentIndex + 1 + sceneCards.length) % sceneCards.length];
  if (!nextCard) return false;
  state.sceneCycleElapsed = 0;
  return setScene(nextCard.dataset.scene, { resetCycle: false });
}

function sceneCycleCanRun() {
  return state.sceneAutoPlay
    && !state.previewSceneId
    && !state.scenePreviewLocked
    && !scenesPanel.matches(":hover")
    && !document.hidden;
}

sceneMotionPreference.addEventListener("change", event => {
  state.sceneAutoPlay = !event.matches;
  state.sceneCycleElapsed = 0;
});

let previousSceneCycleTime = performance.now();
window.setInterval(() => {
  const now = performance.now();
  const delta = Math.min(0.5, (now - previousSceneCycleTime) / 1000);
  previousSceneCycleTime = now;
  if (!sceneCycleCanRun()) return;
  state.sceneCycleElapsed += delta;
  if (state.sceneCycleElapsed >= state.sceneCycleInterval) advanceScene();
}, 200);

function updateExplosion(progress) {
  state.progress = clamp01(progress);
  const shouldMuteScenes = state.scenesMuted ? state.progress > 0.04 : state.progress > 0.08;
  setScenesMuted(shouldMuteScenes);
  const frameMin = new THREE.Vector3(Infinity, Infinity, Infinity);
  const frameMax = new THREE.Vector3(-Infinity, -Infinity, -Infinity);
  for (const component of manifest.components) {
    const amount = localProgress(state.progress, component.progressRange);
    const boundsMin = new THREE.Vector3(...component.boundsMm.min);
    const boundsMax = new THREE.Vector3(...component.boundsMm.max);
    if (component.id === "body_shell") {
      const distance = component.offsetMm[1] * amount;
      shellPositive.position.copy(shellPositive.userData.basePosition).add(new THREE.Vector3(0, distance, 0));
      shellNegative.position.copy(shellNegative.userData.basePosition).add(new THREE.Vector3(0, -distance, 0));
      frameMin.min(boundsMin.clone().add(new THREE.Vector3(0, -distance, 0)));
      frameMin.min(boundsMin.clone().add(new THREE.Vector3(0, distance, 0)));
      frameMax.max(boundsMax.clone().add(new THREE.Vector3(0, -distance, 0)));
      frameMax.max(boundsMax.clone().add(new THREE.Vector3(0, distance, 0)));
      continue;
    }
    const node = componentNodes.get(component.id);
    const currentOffset = new THREE.Vector3(...component.offsetMm).multiplyScalar(amount);
    node.position.copy(node.userData.basePosition).add(currentOffset);
    frameMin.min(boundsMin.add(currentOffset));
    frameMax.max(boundsMax.add(currentOffset));
  }
  framingCenter.copy(frameMin).add(frameMax).multiplyScalar(0.5);
  progressSlider.value = String(Math.round(state.progress * 1000));
  progressValue.value = `${Math.round(state.progress * 100)}%`;
}

function timelineProgress(seconds) {
  const t = ((seconds % 12) + 12) % 12;
  if (t < 1) return 0;
  if (t < 5) return (t - 1) / 4;
  if (t < 7) return 1;
  if (t < 11) return 1 - (t - 7) / 4;
  return 0;
}

function selectComponent(id) {
  state.selected = id;
  const spec = id ? componentSpecs.get(id) : null;
  selectedName.textContent = spec ? spec.name : "整机";
  document.querySelectorAll(".part-button").forEach(button => {
    button.classList.toggle("active", button.dataset.component === id);
  });
  const highlight = new THREE.Color(0x31b8df);
  const applyHighlight = (node, active) => node?.traverse(object => {
    if (!object.isMesh || !object.material) return;
    object.material.emissive?.copy(active ? highlight : new THREE.Color(0x000000));
    if (object.material.emissiveIntensity !== undefined) object.material.emissiveIntensity = active ? 0.22 : 0;
  });
  for (const [componentId, node] of componentNodes) {
    if (componentId === "body_shell") continue;
    const normalized = componentId.startsWith("body_shell_") ? "body_shell" : componentId;
    applyHighlight(node, normalized === id);
  }
}

function setShellTransparency(enabled) {
  state.shellTransparent = enabled;
  [shellPositive, shellNegative].forEach(node => node.traverse(object => {
    if (!object.isMesh) return;
    object.material.transparent = enabled;
    object.material.opacity = enabled ? 0.24 : 1;
    object.material.depthWrite = !enabled;
    object.material.needsUpdate = true;
  }));
}

function setPlaying(playing) {
  state.playing = Boolean(playing);
  playIcon.textContent = state.playing ? "Ⅱ" : "▶";
  playButton.setAttribute("aria-label", state.playing ? "暂停" : "播放");
}

function zoomBy(factor) {
  cameraState.radius = THREE.MathUtils.clamp(cameraState.radius * factor, 105, 360);
}

function notifyParent(type, payload = {}) {
  if (!embedded || window.parent === window) return;
  window.parent.postMessage({ source: MESSAGE_SOURCE, type, ...payload }, window.location.origin);
}

function openPartsPanel() {
  document.body.classList.add("parts-open");
  partsButton.setAttribute("aria-expanded", "true");
}

function closePartsPanel() {
  document.body.classList.remove("parts-open");
  partsButton.setAttribute("aria-expanded", "false");
}

function setMoreOpen(open) {
  document.body.classList.toggle("more-open", open);
  moreButton.setAttribute("aria-expanded", String(open));
  moreButton.textContent = open ? "收起" : "更多";
}

async function toggleStandaloneFullscreen() {
  if (embedded) {
    notifyParent("vacuum:request-fullscreen");
    return;
  }
  if (document.fullscreenElement) {
    await document.exitFullscreen();
  } else if (document.documentElement.requestFullscreen) {
    await document.documentElement.requestFullscreen();
  }
}

playButton.addEventListener("click", () => setPlaying(!state.playing));
resetButton.addEventListener("click", () => {
  state.cycleTime = 0;
  setPlaying(false);
  updateExplosion(0);
  selectComponent(null);
});

progressSlider.addEventListener("input", event => {
  const progress = Number(event.target.value) / 1000;
  state.cycleTime = 1 + progress * 4;
  setPlaying(false);
  updateExplosion(progress);
});

document.getElementById("speedControl").addEventListener("click", event => {
  const button = event.target.closest("button[data-speed]");
  if (!button) return;
  state.speed = Number(button.dataset.speed);
  document.querySelectorAll("#speedControl button").forEach(item => item.classList.toggle("active", item === button));
});

zoomInButton.addEventListener("click", () => zoomBy(0.86));
zoomOutButton.addEventListener("click", () => zoomBy(1.16));
partsButton.addEventListener("click", () => {
  if (document.body.classList.contains("parts-open")) closePartsPanel();
  else openPartsPanel();
});
partsCloseButton.addEventListener("click", closePartsPanel);
partsScrim.addEventListener("click", closePartsPanel);
moreButton.addEventListener("click", () => setMoreOpen(!document.body.classList.contains("more-open")));
fullscreenButton.addEventListener("click", toggleStandaloneFullscreen);
scenesList.addEventListener("click", event => {
  const card = event.target.closest(".scene-card");
  if (!card) return;
  setScene(card.dataset.scene);
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    setScenePreview(card.dataset.scene, { locked: true });
  }
});
scenesPanel.addEventListener("pointerenter", event => {
  if (event.pointerType === "mouse") setScenePreview(state.activeSceneId);
});
scenesPanel.addEventListener("pointermove", event => {
  if (event.pointerType !== "mouse") return;
  const card = event.target.closest(".scene-card");
  setScenePreview(card?.dataset.scene || state.activeSceneId);
});
scenesPanel.addEventListener("pointerleave", event => {
  if (event.pointerType !== "mouse") return;
  requestAnimationFrame(() => {
    if (!scenesPanel.matches(":hover")) clearScenePreview({ force: true });
  });
});
scenesPanel.addEventListener("focusin", event => {
  const card = event.target.closest(".scene-card");
  if (card) setScenePreview(card.dataset.scene);
});
scenesPanel.addEventListener("focusout", event => {
  if (!scenesPanel.contains(event.relatedTarget)) clearScenePreview({ force: true });
});
scenesList.addEventListener("keydown", event => {
  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
  const currentIndex = sceneCards.findIndex(card => card.dataset.scene === state.activeSceneId);
  const direction = event.key === "ArrowRight" ? 1 : -1;
  const nextCard = sceneCards[(currentIndex + direction + sceneCards.length) % sceneCards.length];
  event.preventDefault();
  setScene(nextCard.dataset.scene);
  setScenePreview(nextCard.dataset.scene);
  nextCard.focus();
});

document.addEventListener("fullscreenchange", () => {
  if (embedded) return;
  state.fullscreen = true;
  fullscreenButton.textContent = document.fullscreenElement ? "×" : "⛶";
  fullscreenButton.setAttribute("aria-label", document.fullscreenElement ? "退出全屏" : "全屏查看");
});

window.addEventListener("message", event => {
  if (
    !embedded
    || event.origin !== window.location.origin
    || event.source !== window.parent
    || event.data?.source !== PARENT_SOURCE
  ) return;
  if (event.data.type === "vacuum:play") setPlaying(true);
  if (event.data.type === "vacuum:pause") setPlaying(false);
  if (event.data.type === "vacuum:fullscreen-state") state.fullscreen = Boolean(event.data.active);
});

const viewPresets = {
  threeq: { yaw: -0.52, pitch: 0.23, radius: 280 },
  front: { yaw: 0, pitch: 0.06, radius: 275 },
  side: { yaw: Math.PI / 2, pitch: 0.06, radius: 280 },
  top: { yaw: 0, pitch: 1.38, radius: 265 },
};

function setView(name) {
  const preset = viewPresets[name];
  if (!preset) return;
  Object.assign(cameraState, preset);
  document.querySelectorAll("#viewControl button").forEach(button => button.classList.toggle("active", button.dataset.view === name));
}

document.getElementById("viewControl").addEventListener("click", event => {
  const button = event.target.closest("button[data-view]");
  if (button) setView(button.dataset.view);
});

shellToggle.addEventListener("change", event => setShellTransparency(event.target.checked));
labelToggle.addEventListener("change", event => { state.labels = event.target.checked; });
rotateToggle.addEventListener("change", event => { state.autoRotate = event.target.checked; });

const pointer = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
let pointerDown = null;
let pointerMoved = false;

canvas.addEventListener("pointerdown", event => {
  if (state.scenePreviewLocked && event.pointerType !== "mouse") {
    clearScenePreview({ force: true });
  }
  pointerDown = { x: event.clientX, y: event.clientY, yaw: cameraState.yaw, pitch: cameraState.pitch };
  pointerMoved = false;
  canvas.classList.add("dragging");
  canvas.setPointerCapture(event.pointerId);
});

canvas.addEventListener("pointermove", event => {
  if (!pointerDown) return;
  const dx = event.clientX - pointerDown.x;
  const dy = event.clientY - pointerDown.y;
  if (Math.abs(dx) + Math.abs(dy) > 4) pointerMoved = true;
  cameraState.yaw = pointerDown.yaw - dx * 0.008;
  cameraState.pitch = THREE.MathUtils.clamp(pointerDown.pitch + dy * 0.006, -0.65, 1.42);
});

function finishPointerInteraction(event, allowSelection) {
  canvas.classList.remove("dragging");
  if (allowSelection && pointerDown && !pointerMoved) {
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(selectableMeshes, false)[0];
    selectComponent(hit?.object?.userData?.componentId || null);
  }
  if (event?.pointerId !== undefined && canvas.hasPointerCapture(event.pointerId)) {
    canvas.releasePointerCapture(event.pointerId);
  }
  pointerDown = null;
  pointerMoved = false;
}

canvas.addEventListener("pointerup", event => finishPointerInteraction(event, true));
canvas.addEventListener("pointercancel", event => finishPointerInteraction(event, false));
canvas.addEventListener("lostpointercapture", event => {
  if (pointerDown) finishPointerInteraction(event, false);
});
window.addEventListener("blur", () => {
  if (pointerDown) finishPointerInteraction(null, false);
});

canvas.addEventListener("wheel", event => {
  event.preventDefault();
  if (embedded && !state.fullscreen) {
    notifyParent("vacuum:scroll", { deltaY: event.deltaY });
    return;
  }
  zoomBy(Math.exp(event.deltaY * 0.001));
}, { passive: false });

function readInterfaceLayout() {
  const viewport = canvas.getBoundingClientRect();
  const topRect = topbar.getBoundingClientRect();
  const controlsRect = controlsPanel.getBoundingClientRect();
  const scenesRect = scenesPanel.getBoundingClientRect();
  const verticalScenes = window.innerWidth >= 1180;
  const partsVisible = !embedded && (window.innerWidth > 760 || document.body.classList.contains("parts-open"));
  const partsRect = partsPanel.getBoundingClientRect();
  const leftEdge = verticalScenes
    ? Math.min(viewport.width, Math.max(0, scenesRect.right - viewport.left + 14))
    : 0;
  const rightEdge = partsVisible
    ? Math.min(viewport.width, Math.max(0, partsRect.left - viewport.left))
    : viewport.width;
  const topEdge = Math.min(viewport.height, Math.max(0, topRect.bottom - viewport.top));
  const contentBottom = verticalScenes ? controlsRect.top : Math.min(controlsRect.top, scenesRect.top);
  const bottomEdge = Math.min(viewport.height, Math.max(topEdge, contentBottom - viewport.top));
  return { viewport, leftEdge, rightEdge, topEdge, bottomEdge, verticalScenes };
}

function updateCamera(interfaceLayout) {
  const cp = Math.cos(cameraState.pitch);
  camera.up.set(0, 0, 1);
  if (Math.abs(Math.sin(cameraState.pitch)) > 0.92) camera.up.set(0, 1, 0);
  const safeWidth = Math.max(1, interfaceLayout.rightEdge - interfaceLayout.leftEdge);
  const safeHeight = Math.max(1, interfaceLayout.bottomEdge - interfaceLayout.topEdge);
  const safeAspect = safeWidth / safeHeight;
  const narrowScreenFactor = 1 + Math.max(0, 0.90 - safeAspect) * 1.05;
  const explodedFactor = 1 + state.progress * 0.70;
  const interfaceFramingFactor = window.innerWidth <= 760 ? 1.42 : window.innerWidth < 1180 ? 1.25 : 1.12;
  const effectiveRadius = cameraState.radius * narrowScreenFactor * explodedFactor * interfaceFramingFactor;
  const viewVector = new THREE.Vector3(
    Math.sin(cameraState.yaw) * cp * effectiveRadius,
    -Math.cos(cameraState.yaw) * cp * effectiveRadius,
    Math.sin(cameraState.pitch) * effectiveRadius
  );
  const viewTarget = framingCenter.clone().add(cameraState.target);
  const forward = viewVector.clone().normalize().multiplyScalar(-1);
  const right = new THREE.Vector3().crossVectors(forward, camera.up).normalize();
  const worldUnitsPerPixel = 2 * effectiveRadius * Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5))
    / Math.max(1, interfaceLayout.viewport.height);
  const safeCenterX = (interfaceLayout.leftEdge + interfaceLayout.rightEdge) * 0.5;
  const safeCenterY = (interfaceLayout.topEdge + interfaceLayout.bottomEdge) * 0.5;
  const screenCenterX = interfaceLayout.viewport.width * 0.5;
  const screenCenterY = interfaceLayout.viewport.height * 0.5;
  viewTarget.addScaledVector(right, -(safeCenterX - screenCenterX) * worldUnitsPerPixel);
  viewTarget.addScaledVector(camera.up, (safeCenterY - screenCenterY) * worldUnitsPerPixel);
  camera.position.copy(viewVector).add(viewTarget);
  camera.lookAt(viewTarget);
}

const labelPosition = new THREE.Vector3();

function updateLabels(deltaSeconds, interfaceLayout) {
  const { viewport, topEdge, bottomEdge, leftEdge, rightEdge } = interfaceLayout;
  const followAlpha = 1 - Math.exp(-Math.max(0, deltaSeconds) / 0.07);
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  const selectedOnly = window.innerWidth <= 760;

  modelRoot.updateMatrixWorld(true);
  camera.updateMatrixWorld(true);

  for (const component of manifest.components) {
    const label = labelElements.get(component.id);
    const labelState = labelStates.get(component.id);

    if (labelState.progressEligible) {
      if (state.progress <= 0.05) labelState.progressEligible = false;
    } else if (state.progress >= 0.10) {
      labelState.progressEligible = true;
    }

    labelPosition.copy(labelState.anchorLocal);
    labelState.anchorNode.localToWorld(labelPosition);
    labelPosition.project(camera);
    const targetX = (labelPosition.x * 0.5 + 0.5) * viewport.width;
    const targetY = (-labelPosition.y * 0.5 + 0.5) * viewport.height;
    const halfWidth = label.offsetWidth * 0.5;
    const halfHeight = label.offsetHeight * 0.5;

    const insideEnter = labelPosition.z > -1 && labelPosition.z < 1
      && targetX > leftEdge + 18 + halfWidth
      && targetX < rightEdge - 18 - halfWidth
      && targetY > topEdge + 14 + halfHeight
      && targetY < bottomEdge - 14 - halfHeight;
    const insideStay = labelPosition.z > -1 && labelPosition.z < 1
      && targetX > leftEdge + 2 + halfWidth
      && targetX < rightEdge - 2 - halfWidth
      && targetY > topEdge + 2 + halfHeight
      && targetY < bottomEdge - 2 - halfHeight;
    const mobileSelectionEligible = !selectedOnly || (state.selected && component.id === state.selected);
    const shouldShow = state.labels && mobileSelectionEligible && labelState.progressEligible
      && (labelState.visible ? insideStay : insideEnter);

    if (!labelState.initialized || (!labelState.visible && shouldShow)) {
      labelState.x = targetX;
      labelState.y = targetY;
      labelState.initialized = true;
    } else {
      const deltaX = targetX - labelState.x;
      const deltaY = targetY - labelState.y;
      const distance = Math.hypot(deltaX, deltaY);
      const followScale = distance > 0 ? Math.min(followAlpha, 56 / distance) : 0;
      labelState.x += deltaX * followScale;
      labelState.y += deltaY * followScale;
    }

    const renderedX = Math.round(labelState.x * pixelRatio) / pixelRatio;
    const renderedY = Math.round(labelState.y * pixelRatio) / pixelRatio;
    if (renderedX !== labelState.renderedX || renderedY !== labelState.renderedY) {
      label.style.transform = `translate3d(${renderedX}px, ${renderedY}px, 0) translate(-50%, -50%)`;
      labelState.renderedX = renderedX;
      labelState.renderedY = renderedY;
    }
    if (shouldShow !== labelState.visible) {
      labelState.visible = shouldShow;
      label.classList.toggle("visible", shouldShow);
    }
  }
}

function resize() {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  renderer.setSize(width, height, false);
  camera.aspect = width / Math.max(1, height);
  camera.updateProjectionMatrix();
}

window.addEventListener("resize", resize);
resize();
updateExplosion(0);
setScene("keyboard", { scroll: false });
updateCamera(readInterfaceLayout());
setPlaying(!embedded);

status.classList.add("ready");
statusText.textContent = "装配模型已就绪";
loadingBar.style.width = "100%";
setTimeout(() => loading.classList.add("hidden"), 220);

let previousTime = performance.now();
function animate(now) {
  const delta = Math.min(0.05, (now - previousTime) / 1000);
  previousTime = now;
  if (state.playing) {
    state.cycleTime = (state.cycleTime + delta * state.speed) % 12;
    updateExplosion(timelineProgress(state.cycleTime));
  }
  if (state.autoRotate && !pointerDown) cameraState.yaw += delta * 0.18;
  const interfaceLayout = readInterfaceLayout();
  updateCamera(interfaceLayout);
  updateLabels(delta, interfaceLayout);
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

window.__VACUUM_APP__ = {
  manifest,
  setProgress(value) {
    setPlaying(false);
    state.cycleTime = 1 + clamp01(value) * 4;
    updateExplosion(value);
  },
  setView,
  setPlaying,
  zoomBy,
  setShellTransparency,
  selectComponent,
  setScene,
  getState() {
    const matrices = {};
    for (const component of manifest.components) {
      if (component.id === "body_shell") {
        matrices.body_shell_left = shellPositive.matrixWorld.toArray();
        matrices.body_shell_right = shellNegative.matrixWorld.toArray();
      } else {
        matrices[component.id] = componentNodes.get(component.id).matrixWorld.toArray();
      }
    }
    return {
      ...state,
      cameraRadius: cameraState.radius,
      matrices,
      canvas: { width: renderer.domElement.width, height: renderer.domElement.height },
    };
  }
};
window.__APP_READY__ = true;
notifyParent("vacuum:ready", { componentCount: manifest.components.length });
