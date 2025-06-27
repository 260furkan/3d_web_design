import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const container = document.getElementById('model-container');
const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.set(3, 2, 6);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
container.appendChild(renderer.domElement);

// Işıklar
scene.add(new THREE.AmbientLight(0x4444ff, 0.4)); // mavi ortam ışığı
const mainLight = new THREE.PointLight(0x00bfff, 2, 100);
mainLight.position.set(0, 5, 5);
mainLight.castShadow = true;
scene.add(mainLight);

const hemiLight = new THREE.HemisphereLight(0x0077ff, 0x000000, 1.5);
scene.add(hemiLight);
// 🔵 Arka tarafa mavi ışık
const backLight = new THREE.PointLight(0x0044ff, 1.5, 50);
backLight.position.set(-5, 2, -5);
scene.add(backLight);

// OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.maxPolarAngle = Math.PI / 2;

// Zemin (gizli gölge alıcı)
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(50, 50),
  new THREE.MeshStandardMaterial({ color: 0x000000, opacity: 0, transparent: true })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Model
const loader = new GLTFLoader();
loader.load(
  'models/blue_dragon.glb',
  (gltf) => {
    const model = gltf.scene;
    model.scale.set(6,6, 6);
    model.position.set(0, -1, 0);
   model.rotation.y = 145 * Math.PI / 180;
   model.rotation.x = -15 * Math.PI / 180;

    model.traverse((node) => {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });
    scene.add(model);
    document.getElementById('loading').style.display = 'none';
  },
  (xhr) => {
    document.getElementById('loading').textContent = `Model yükleniyor... %${(xhr.loaded / xhr.total * 100).toFixed(0)}`;
  },
  (err) => {
    console.error(err);
    document.getElementById('loading').textContent = "Model yüklenirken hata oluştu";
  }
);

// Resize
window.addEventListener('resize', () => {
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
});

// Loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}


animate();
