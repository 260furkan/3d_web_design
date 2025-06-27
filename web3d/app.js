import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Sahne, kamera ve renderer ayarları
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0f0f0); // Daha yumuşak arka plan

const container = document.getElementById('model-container');
const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.set(3, 1.5, 5);

const renderer = new THREE.WebGLRenderer({ 
    antialias: true, 
    powerPreference: "high-performance" 
});
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

// OrbitControls - yeni versiyonda farklı import edilir
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 2;
controls.maxDistance = 10;
controls.maxPolarAngle = Math.PI * 0.5;

// Geliştirilmiş ışıklandırma sistemi
// Ana ambient ışık
scene.add(new THREE.AmbientLight(0xffffff, 0.4));

// Ana directional ışık (güneş ışığı)
const mainLight = new THREE.DirectionalLight(0xffffff, 1.0);
mainLight.position.set(5, 10, 7);
mainLight.castShadow = true;
mainLight.shadow.mapSize.set(2048, 2048);
mainLight.shadow.camera.near = 0.5;
mainLight.shadow.camera.far = 50;
mainLight.shadow.camera.left = -10;
mainLight.shadow.camera.right = 10;
mainLight.shadow.camera.top = 10;
mainLight.shadow.camera.bottom = -10;
scene.add(mainLight);

// Dolgu ışığı (fill light)
const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
fillLight.position.set(-5, 5, 3);
scene.add(fillLight);

// Rim ışığı (arka vurgu)
const rimLight = new THREE.DirectionalLight(0xffffff, 0.4);
rimLight.position.set(-3, 5, -5);
scene.add(rimLight);

// Hemisphere ışığı (gökyüzü ve yer yansıması)
scene.add(new THREE.HemisphereLight(0x87ceeb, 0x404040, 0.6));

// Zemin (görünmez ama gölge için)
const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.8,
        metalness: 0.2,
        transparent: true,
        opacity: 0
    })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Model yükleme
const loader = new GLTFLoader();
let carModel;

loader.load(
    'models/porsche.glb',
    function(gltf) {
        carModel = gltf.scene;
        carModel.scale.set(0.8, 0.8, 0.8);
        carModel.position.y = 0;

        carModel.traverse(function(node) {
            if (node.isMesh) {
                node.castShadow = true;
                node.receiveShadow = true;

                if (node.material) {
                    // Material ayarlarını optimize et
                    node.material.needsUpdate = true;
                    
                    // Material adına göre özel ayarlar
                    const name = node.material.name.toLowerCase();
                    const materialName = node.material.name;

                    // Cam ve pencere materyalleri
                    if (name.includes('glass') || name.includes('window') || 
                        name.includes('pencere') || name.includes('cam')) {
                        node.material.transparent = true;
                        node.material.opacity = 0.3;
                        node.material.roughness = 0.1;
                        node.material.metalness = 0.9;
                        node.material.envMapIntensity = 1.5;
                    }
                    // Boya materyalleri
                    else if (name.includes('paint') || name.includes('boya') || 
                             name.includes('body') || name.includes('karoseri')) {
                        node.material.roughness = 0.2;
                        node.material.metalness = 0.7;
                        node.material.envMapIntensity = 1.0;
                    }
                    // Krom materyalleri
                    else if (name.includes('chrome') || name.includes('krom') || 
                             name.includes('metal') || name.includes('metalic')) {
                        node.material.roughness = 0.05;
                        node.material.metalness = 1.0;
                        node.material.envMapIntensity = 1.8;
                    }
                    // Lastik materyalleri
                    else if (name.includes('tire') || name.includes('lastik') || 
                             name.includes('wheel') || name.includes('tekerlek')) {
                        node.material.roughness = 0.9;
                        node.material.metalness = 0.1;
                        node.material.envMapIntensity = 0.3;
                    }
                    // Varsayılan ayarlar
                    else {
                        node.material.roughness = 0.5;
                        node.material.metalness = 0.5;
                        node.material.envMapIntensity = 1.0;
                    }
                }
            }
        });

        scene.add(carModel);
        document.getElementById('loading').style.display = 'none';
    },
    function(xhr) {
        const percentLoaded = (xhr.loaded / xhr.total * 100).toFixed(0);
        document.getElementById('loading').textContent = `Model yükleniyor... %${percentLoaded}`;
    },
    function(error) {
        console.error('Hata:', error);
        document.getElementById('loading').textContent = 'Model yüklenirken hata oluştu';
    }
);

// Yeniden boyutlandırma
window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
});

// Render döngüsü
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();
