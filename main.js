
import * as THREE from 'three';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';


const scene = new THREE.Scene();
scene.background = new THREE.Color(0x5072A);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

camera.position.set(25, 25, 25);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animation);


export let layerSizes = [];
const texts = [];

$('body').append(renderer.domElement);

$('#render').on('click', getLayerValues);

function getLayerValues() {
    let newLayers = [];
    console.log(camera.rotation)
    $('.layer-input').each(function() {
        let value = $(this).val();
        if (value) {
            newLayers.push(parseInt(value, 10)); // Parse as integer
        }
    });
    layerSizes = newLayers.slice();
    drawNeuralNet(newLayers,6);
}

// Variables to track the movement
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let moveUp = false;
let moveDown = false;
let moveSpeed = 0.25;
let yaw = 0;
let pitch = 0;
let mouseSensitivity = 0.002;

// Event listeners for keyboard input
$(document).on('keydown', onKeyDown);
$(document).on('keyup', onKeyUp);

// Request pointer lock on click
$(renderer.domElement).on('click', () => {
    renderer.domElement.requestPointerLock();
});

$(document).on('pointerlockchange', () => {
    if (document.pointerLockElement === renderer.domElement) {
        $(document).on('mousemove', onMouseMove);
    } else {
        $(document).off('mousemove', onMouseMove);
    }
});

function onKeyDown(event) {
    switch (event.code) {
        case 'KeyW':
            moveForward = true;
            break;
        case 'KeyS':
            moveBackward = true;
            break;
        case 'KeyA':
            moveLeft = true;
            break;
        case 'KeyD':
            moveRight = true;
            break;
        case 'KeyQ':
            moveUp = true;
            break;
        case 'KeyE':
            moveDown = true;
            break;
    }
}

function onKeyUp(event) {
    switch (event.code) {
        case 'KeyW':
            moveForward = false;
            break;
        case 'KeyS':
            moveBackward = false;
            break;
        case 'KeyA':
            moveLeft = false;
            break;
        case 'KeyD':
            moveRight = false;
            break;
        case 'KeyQ':
            moveUp = false;
            break;
        case 'KeyE':
            moveDown = false;
            break;
    }
}

function onMouseMove(event) {
    yaw -= event.originalEvent.movementX * mouseSensitivity;
    pitch -= event.originalEvent.movementY * mouseSensitivity;

    // Limit the pitch angle to avoid flipping the camera
    pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch));
}

function updateCameraPosition() {
    // Calculate the forward and right vectors based on camera rotation
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    const forward = direction.clone().normalize();
    const right = new THREE.Vector3().crossVectors(camera.up, forward).normalize();

    if (moveForward) {
        camera.position.add(forward.clone().multiplyScalar(moveSpeed));
    }
    if (moveBackward) {
        camera.position.add(forward.clone().multiplyScalar(-moveSpeed));
    }
    if (moveLeft) {
        camera.position.add(right.clone().multiplyScalar(moveSpeed));
    }
    if (moveRight) {
        camera.position.add(right.clone().multiplyScalar(-moveSpeed));
    }
    if (moveUp) {
        camera.position.y += moveSpeed;
    }
    if (moveDown) {
        camera.position.y -= moveSpeed;
    }

    // Set camera rotation using quaternions
    const quaternion = new THREE.Quaternion();
    quaternion.setFromEuler(new THREE.Euler(pitch, yaw, 0, 'YXZ'));
    camera.quaternion.copy(quaternion);
    if(texts.length > 0){
        for(let textMesh of texts) {
            textMesh.quaternion.copy(quaternion);
        }
    }

}

function animation() {
    updateCameraPosition();
    renderer.render(scene, camera);
}

$(window).on('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

function drawNeuralNet(layerSizes, layerDistance) {
    // Clear the scene
    scene.remove.apply(scene, scene.children);

    // Labels for neurons
    let labels = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

    // Sphere geometry and material for neurons
    const sphereGeometry = new THREE.SphereGeometry(0.5, 8, 8);
    const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0x444444 });

    // Distance between neurons
    const distance = 2;
    let zPos = 0;

    // Store positions of spheres for each layer
    const layerPositions = [];

    for (let layerSize of layerSizes) {
        const layerPosition = [];
        const a = Math.sqrt(layerSize);
        let xPos = -(a / 2) * distance;

        if (layerSize < 11) {
            let yPos = 0;
            xPos = -(layerSize / 2) * distance;

            for (let j = 0; j < layerSize; j++) {
                const position = new THREE.Vector3(xPos, yPos, zPos);
                layerPosition.push(position);

                // Create neuron sphere
                const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
                sphere.position.copy(position);
                scene.add(sphere);

                xPos += distance;
            }
        } else {
            let i = 0;
            let yPos = -xPos;

            while (i < layerSize) {
                for (let j = 0; j < a; j++) {
                    if (i < layerSize) {
                        const position = new THREE.Vector3(xPos, yPos, zPos);
                        layerPosition.push(position);

                        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
                        sphere.position.copy(position);
                        scene.add(sphere);
                        yPos -= distance;
                        i += 1;
                    }
                }
                xPos += distance;
                yPos = (a / 2) * distance;
            }
        }

        layerPositions.push(layerPosition);
        zPos -= layerDistance;
    }
    addLabelsToLastLayer(layerPositions,labels);
}

function addLabelsToLastLayer(layerPositions, labels) {
    const fontLoader = new FontLoader();
    let lastLayerPositions = layerPositions[layerPositions.length - 1];

    // Load font asynchronously
    fontLoader.load('https://cdn.jsdelivr.net/npm/three@0.166.1/examples/fonts/helvetiker_regular.typeface.json', function(font) {
        const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff }); // White color for text

        // Iterate over positions in the last layer
        for (let i = 0; i < lastLayerPositions.length; i++) {
            let position = lastLayerPositions[i];

            // Create label text geometry
            const textGeometry = new TextGeometry(labels[i].toString(), {
                font: font,
                size: 1, // Size of the text
                depth: 0.01 // Thickness of the text
            });

            // Create text mesh and position it behind neuron
            let textMesh = new THREE.Mesh(textGeometry, textMaterial);
            textMesh.position.copy(new THREE.Vector3(position.x, position.y - 0.5, position.z - 2)); // Adjust position behind neuron
            texts.push(textMesh);
            scene.add(textMesh);
        }
    });
}



$(() => {
    
    getLayerValues();
})