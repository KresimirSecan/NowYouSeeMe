import * as THREE from 'three';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { labels,  testData } from './parse.js';
import { model } from './model.js';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x5072A);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(57.24, 49.87, 9.76);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
$('body').append(renderer.domElement);

// Variables
export let layerSizes = [];
let layerPositions = [];
let activationsArray = [];
const texts = [];
const moveState = { forward: false, backward: false, left: false, right: false, up: false, down: false };
let yaw = 1.274;
let pitch = -0.756;
const moveSpeed = 0.5;
const mouseSensitivity = 0.002;

// Event listeners
$('#render').on('click', getLayerValues);
$(document).on('keydown', handleKeyDown);
$(document).on('keyup', handleKeyUp);
$(renderer.domElement).on('click', () => renderer.domElement.requestPointerLock());
$(document).on('pointerlockchange', handlePointerLockChange);
$(window).on('resize', handleWindowResize);
$("#predict").on("click", predictAndHighlight);

function getLayerValues() {
    layerSizes = $('.layer-input').map((_, el) => parseInt($(el).val(), 10)).get().filter(Boolean);
    drawNeuralNetwork(10);
}

function handleKeyDown(event) {
    switch (event.code) {
        case 'KeyW': moveState.forward = true; break;
        case 'KeyS': moveState.backward = true; break;
        case 'KeyA': moveState.left = true; break;
        case 'KeyD': moveState.right = true; break;
        case 'KeyQ': moveState.up = true; break;
        case 'KeyE': moveState.down = true; break;
    }
}

function handleKeyUp(event) {
    switch (event.code) {
        case 'KeyW': moveState.forward = false; break;
        case 'KeyS': moveState.backward = false; break;
        case 'KeyA': moveState.left = false; break;
        case 'KeyD': moveState.right = false; break;
        case 'KeyQ': moveState.up = false; break;
        case 'KeyE': moveState.down = false; break;
    }
}

function handlePointerLockChange() {
    if (document.pointerLockElement === renderer.domElement) {
        $(document).on('mousemove', handleMouseMove);
    } else {
        $(document).off('mousemove', handleMouseMove);
    }
}

function handleMouseMove(event) {
    yaw -= event.originalEvent.movementX * mouseSensitivity;
    pitch -= event.originalEvent.movementY * mouseSensitivity;
    pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch)); // Clamp pitch to avoid flipping
}

function updateCameraPosition() {
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    const forward = direction.clone().normalize();
    const right = new THREE.Vector3().crossVectors(camera.up, forward).normalize();

    if (moveState.forward) camera.position.add(forward.clone().multiplyScalar(moveSpeed));
    if (moveState.backward) camera.position.add(forward.clone().multiplyScalar(-moveSpeed));
    if (moveState.left) camera.position.add(right.clone().multiplyScalar(moveSpeed));
    if (moveState.right) camera.position.add(right.clone().multiplyScalar(-moveSpeed));
    if (moveState.up) camera.position.y += moveSpeed;
    if (moveState.down) camera.position.y -= moveSpeed;

    const quaternion = new THREE.Quaternion();
    quaternion.setFromEuler(new THREE.Euler(pitch, yaw, 0, 'YXZ'));
    camera.quaternion.copy(quaternion);
    texts.forEach(textMesh => textMesh.quaternion.copy(quaternion));
}

function animate() {
    updateCameraPosition();
    renderer.render(scene, camera);
}

function handleWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function drawNeuralNetwork(layerDistance) {
    scene.clear(); // Clear the scene

    layerPositions = [];
    const totalNeurons = layerSizes.reduce((acc, size) => acc + size, 0);
    const instancedMesh = createNeuronsMesh(totalNeurons, layerDistance);

    scene.add(instancedMesh);
    addLabelsToLastLayer();
}

function createNeuronsMesh(totalNeurons, layerDistance) {
    const sphereGeometry = new THREE.SphereGeometry(0.5, 8, 8);
    const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0x444444 });
    const instancedMesh = new THREE.InstancedMesh(sphereGeometry, sphereMaterial, totalNeurons);

    let zPos = 0, instanceIndex = 0;

    layerSizes.forEach(layerSize => {
        const layerPosition = createLayerPositions(layerSize, zPos, 2);
        layerPositions.push(layerPosition);
        layerPosition.forEach(position => {
            const matrix = new THREE.Matrix4().setPosition(position);
            instancedMesh.setMatrixAt(instanceIndex++, matrix);
        });
        zPos -= layerDistance;
    });

    return instancedMesh;
}

function createLayerPositions(layerSize, zPos, distance) {
    const layerPosition = [];
    const a = Math.sqrt(layerSize);
    let xPos = -(a / 2) * distance;

    if (layerSize < 11) {
        let yPos = 0;
        xPos = -(layerSize / 2) * distance;
        for (let j = 0; j < layerSize; j++) {
            layerPosition.push(new THREE.Vector3(xPos, yPos, zPos));
            xPos += distance;
        }
    } else {
        let i = 0;
        let yPos = -xPos;
        while (i < layerSize) {
            for (let j = 0; j < a; j++) {
                if (i < layerSize) {
                    layerPosition.push(new THREE.Vector3(xPos, yPos, zPos));
                    xPos += distance;
                    i++;
                }
            }
            xPos = -(a / 2) * distance;
            yPos -= distance;
        }
    }

    return layerPosition;
}

function addLabelsToLastLayer() {
    const fontLoader = new FontLoader();
    const lastLayerPositions = layerPositions[layerPositions.length - 1];

    fontLoader.load('https://cdn.jsdelivr.net/npm/three@0.166.1/examples/fonts/helvetiker_regular.typeface.json', font => {
        lastLayerPositions.forEach((position, i) => {
            const textGeometry = new TextGeometry(labels[i].toString(), {
                font: font,
                size: 1,
                depth: 0.01
            });
            const textMesh = new THREE.Mesh(textGeometry, new THREE.MeshBasicMaterial({ color: 0xffffff }));
            textMesh.position.copy(new THREE.Vector3(position.x, position.y - 0.5, position.z - 2));
            texts.push(textMesh);
            scene.add(textMesh);
        });
    });
}

function highlightActivatedNeurons() {
    layerPositions.forEach((layerPosition, layerIndex) => {
        const layerActivation = activationsArray[layerIndex] || [];
        const threshold = 0.5;
        const highlightColor = 0xADD8E6;

        layerPosition.forEach((position, neuronIndex) => {
            const activation = layerActivation[neuronIndex];
            if (layerIndex === layerPositions.length - 1) { 
                const maxActivation = Math.max(...layerActivation);
                if (activation === maxActivation) addHighlightSphere(position, highlightColor);
            } else if (activation > threshold) {
                addHighlightSphere(position, highlightColor);
            }
        });
    });
}

function addHighlightSphere(position, color) {
    const geometry = new THREE.SphereGeometry(0.6, 8, 8);
    const material = new THREE.MeshBasicMaterial({ color });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.copy(position);
    scene.add(sphere);
}

async function predictAndHighlight() {
    const num = $("#test-select").val();
    activationsArray = await model.predictWithActivations(testData.pixels[num]);
    drawNeuralNetwork(10);
    highlightActivatedNeurons();
}

$(()=> {
    getLayerValues();
})