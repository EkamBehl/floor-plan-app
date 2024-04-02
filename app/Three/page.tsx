"use client"
import React, { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader, OBJLoader } from 'three/examples/jsm/Addons.js';

type Coordinates = [number, number, number, number]; // Represents [x1, y1, x2, y2]

interface WallData {
  nearestWall: Coordinates | null;
  doorRotationY: number;
}

const findNearestWallAndRotation = (doorCoords: Coordinates, walls: Coordinates[]): WallData => {
  let nearestWall: Coordinates | null = null;
  let nearestDistance = Infinity;
  let doorRotationY = 0;

  const doorCenter = {
    x: (doorCoords[0] + doorCoords[2]) / 2,
    z: (doorCoords[1] + doorCoords[3]) / 2,
  };

  walls.forEach((wallCoords) => {
    const wallStart = { x: wallCoords[0], z: wallCoords[1] };
    const wallEnd = { x: wallCoords[2], z: wallCoords[3] };

    const distanceToStart = Math.hypot(doorCenter.x - wallStart.x, doorCenter.z - wallStart.z);
    const distanceToEnd = Math.hypot(doorCenter.x - wallEnd.x, doorCenter.z - wallEnd.z);

    if (distanceToStart < nearestDistance) {
      nearestDistance = distanceToStart;
      nearestWall = wallCoords;
      doorRotationY = Math.atan2(wallStart.z - doorCenter.z, wallStart.x - doorCenter.x);
    }

    if (distanceToEnd < nearestDistance) {
      nearestDistance = distanceToEnd;
      nearestWall = wallCoords;
      doorRotationY = Math.atan2(wallEnd.z - doorCenter.z, wallEnd.x - doorCenter.x);
    }
  });

  return { nearestWall, doorRotationY };
};


const addDoor = (doorCoords: Coordinates, walls: Coordinates[], scene: THREE.Scene, providedRotation?: number) => {
    // For debugging: replace the OBJLoader with a simple box to represent the door
    const doorWidth = 10;
    const doorHeight = 30;
    const doorDepth = 2;
    const doorGeometry = new THREE.BoxGeometry(doorWidth, doorHeight, doorDepth);
    const doorMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const doorMesh = new THREE.Mesh(doorGeometry, doorMaterial);
  
    let doorRotationY = providedRotation !== undefined
      ? providedRotation
      : findNearestWallAndRotation(doorCoords, walls).doorRotationY;
  
    const doorCenterX = (doorCoords[0] + doorCoords[2]) / 2;
    const doorCenterZ = (doorCoords[1] + doorCoords[3]) / 2;
  
    doorMesh.position.set(doorCenterX, doorHeight / 2, doorCenterZ);
    doorMesh.rotation.y = doorRotationY;
  
    scene.add(doorMesh);
  };

const ThreeD = () => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const mountRef = useRef<HTMLCanvasElement>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const controlsRef = useRef<OrbitControls | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const [scene, setScene] = useState<THREE.Scene | null>(null);

    useEffect(() => {
        // Scene initialization
    const initScene = new THREE.Scene();
    setScene(initScene);

    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    initScene.add(ambientLight);

    // Directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 200, 100);
    directionalLight.target.position.set(0, 0, 0);
    initScene.add(directionalLight);

    // Camera setup
    const aspectRatio = window.innerWidth / window.innerHeight;
    const camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 10000);
    camera.position.set(590.9590759277344, 50, 619.5294952392578); // Adjusted for better initial view
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ canvas: mountRef.current!, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(new THREE.Color('black')); // Clear color set to black for visibility
    rendererRef.current = renderer;

    // Orbit controls setup
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0); // Set the center of rotation
    controls.update();
    controlsRef.current = controls;

        const animate = () => {
            if (controlsRef.current && rendererRef.current && scene && cameraRef.current) {
              requestAnimationFrame(animate);
              controlsRef.current.update();
              rendererRef.current.render(scene, cameraRef.current);
            }
          };
      

        // Animate the scene
        animate();

        // Cleanup on unmount
        return () => {
            if (controlsRef.current) {
                controlsRef.current.dispose();
            }
        };
    }, []);

    const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files?.length) {
            handleFileUpload(event.target.files[0]);
        }
    };    
        

    const handleFileUpload = async (file: File) => {
        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await fetch('http://127.0.0.1:8000/detect/', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            console.log(data);

            if (scene) {
                // Clear existing geometry
                while (scene.children.length > 0) {
                    scene.remove(scene.children[0]);
                }

                // Draw walls
                const walls = data.filter((item: { class: string }) => item.class === "wall");
                walls.forEach((wall: { coords: number[] }) => {
                    const [x1, y1, x2, y2] = wall.coords;
                    // console.log("x1", x1, " y1", y1)
                    drawRectangle(x1, y1, x2, y2, scene);
                });

                // After processing walls in your handleFileUpload function or similar

                // Draw doors
                const doors = data.filter((item: { class: string }) => item.class === "door");
doors.forEach((door: { coords: number[], rotation?: number }) => {
  const [x1, y1, x2, y2] = door.coords;
  const rotationY = door.rotation; // Use provided rotation if available
  addDoor([x1, y1, x2, y2], walls, scene, rotationY);
});


                // Trigger scene rendering
                renderScene();
            }
        } catch (error) {
            console.error('Error uploading image:', error);
        }
    };

    const getObjectPositions = (scene: THREE.Scene) => {
        const objectPositions: THREE.Vector3[] = [];

        scene.traverse((object) => {
            if (object instanceof THREE.Mesh) {
                object.updateMatrixWorld(); // Ensure the object's world matrix is up-to-date
                const position = new THREE.Vector3();
                position.setFromMatrixPosition(object.matrixWorld); // Get the object's position in world coordinates
                objectPositions.push(position);
            }
        });

        return objectPositions;
    };

    const drawRectangle = (x1: number, y1: number, x2: number, y2: number, scene: THREE.Scene) => {
        const wallHeight = 70;
        const wallLength = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
        const angle = Math.atan2(y2 - y1, x2 - x1);

        const geometry = new THREE.BoxGeometry(wallLength, wallHeight, 10);
        const material = new THREE.MeshBasicMaterial({ color: 0x8fbc8f });
        const wall = new THREE.Mesh(geometry, material);

        wall.position.x = (x1 + x2) / 2;
        wall.position.y = wallHeight / 2; // Positioned at half the height
        wall.position.z = (y1 + y2) / 2;
        if (Math.abs(angle) < Math.PI / 4 || Math.abs(angle) > 3 * Math.PI / 4) {
            wall.rotation.y = 0; // Make the wall horizontal
        } else {
            wall.rotation.y = Math.PI / 2; // Make the wall vertical
        }
     
        scene.add(wall);
    };

    const addDoor = (doorCoords: Coordinates, walls: Coordinates[], scene: THREE.Scene, providedRotation?: number) => {
        // For debugging: replace the OBJLoader with a simple box to represent the door
        const doorWidth = 10;
        const doorHeight = 30;
        const doorDepth = 2;
        const doorGeometry = new THREE.BoxGeometry(doorWidth, doorHeight, doorDepth);
        const doorMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const doorMesh = new THREE.Mesh(doorGeometry, doorMaterial);
    
        let doorRotationY = providedRotation !== undefined
          ? providedRotation
          : findNearestWallAndRotation(doorCoords, walls).doorRotationY;
    
        const doorCenterX = (doorCoords[0] + doorCoords[2]) / 2;
        const doorCenterZ = (doorCoords[1] + doorCoords[3]) / 2;
    
        doorMesh.position.set(doorCenterX, doorHeight / 2, doorCenterZ);
        doorMesh.rotation.y = doorRotationY;

        doorMesh.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
            }
        });
    
        scene.add(doorMesh);
      };
      

    function animate() {
      if (!controlsRef.current || !rendererRef.current || !scene || !cameraRef.current) {
        return;
      }

      requestAnimationFrame(animate);
      controlsRef.current.update();
      rendererRef.current.render(scene, cameraRef.current);
    }

    const renderScene = () => {
        if (scene && cameraRef.current && mountRef.current) {
            controlsRef.current && controlsRef.current.update();
            rendererRef.current && rendererRef.current.render(scene, cameraRef.current);
            console.log("scene rendered");
        }
        else {
            console.log("scene not rendering")
        }
    };

    useEffect(() => {
        animate()
    }, [scene]);

    return (
        <>
            <canvas ref={mountRef} style={{ width: '100vw', height: '100vh' }}></canvas>
            <input type="file" onChange={onFileChange} ref={fileInputRef} style={{ display: 'none' }} />
            <button onClick={() => fileInputRef.current?.click()}>Upload Image</button>
        </>
    );
};

export default ThreeD;
