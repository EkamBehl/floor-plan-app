"use client"
import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

type Coordinates = [number, number, number, number];

interface DoorWindow {
  class: 'door' | 'window';
  confidence: number;
  coords: Coordinates;
}

interface Wall {
  class: 'wall';
  confidence: number;
  coords: Coordinates;
  associated_doors: DoorWindow[];
  associated_windows: DoorWindow[];
}

const ThreeDScene: React.FC = () => {
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const [scene, setScene] = useState<THREE.Scene>(new THREE.Scene());

  useEffect(() => {
    const initScene = new THREE.Scene();
    setScene(initScene);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
    camera.position.set(590.9590759277344, 50, 619.5294952392578);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current?.appendChild(renderer.domElement);

    const light = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
    initScene.add(light);

    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.addEventListener('change', () => renderer.render(initScene, camera));

    function animate() {
      requestAnimationFrame(animate);
      renderer.render(initScene, camera);
    }
    animate();

    return () => {
      mountRef.current?.removeChild(renderer.domElement);
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

      if (!response.ok) throw new Error('Network response was not ok');
      
      const data: Wall[] = await response.json();
      visualizeData(data, scene);
      adjustCameraAndControls(scene);
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const visualizeData = (data: Wall[], scene: THREE.Scene) => {
    while (scene.children.length > 0) {
      scene.remove(scene.children[0]);
    }
  
    data.forEach((wall) => {
      const wallWidth = Math.abs(wall.coords[2] - wall.coords[0]);
      const wallDepth = Math.abs(wall.coords[3] - wall.coords[1]);
      const wallHeight = 70; // Arbitrary wall height
      const wallGeometry = new THREE.BoxGeometry(wallWidth, wallHeight, wallDepth);
      const wallMaterial = new THREE.MeshBasicMaterial({ color: 0x888888 });
      const wallMesh = new THREE.Mesh(wallGeometry, wallMaterial);
      wallMesh.position.set(
        (wall.coords[0] + wall.coords[2]) / 2,
        wallHeight / 2, // Set it to half the wall's height
        (wall.coords[1] + wall.coords[3]) / 2
      );
      scene.add(wallMesh);
  
      wall.associated_doors.forEach(door => {
        // Calculate wall and door directions
      const wallDirection = new THREE.Vector2(
        wall.coords[2] - wall.coords[0],
        wall.coords[3] - wall.coords[1]
      ).normalize();

      const doorDirection = new THREE.Vector2(
        door.coords[2] - door.coords[0],
        door.coords[3] - door.coords[1]
      ).normalize();

      // Determine the door orientation based on its direction relative to the wall's direction
      let doorWidth, doorHeight, doorDepth;

      if (Math.abs(wallDirection.dot(doorDirection)) > 0.9) {
        // Door is parallel to the wall
        doorWidth = Math.abs(door.coords[2] - door.coords[0]);
        doorHeight = 65; // Height of the door
        doorDepth = 5; // Make the door thicker to stand out on the wall
      } else {
        // Door is perpendicular to the wall
        doorWidth = 5; // Thickness of the door
        doorHeight = 65; // Height of the door
        doorDepth = Math.abs(door.coords[3] - door.coords[1]); // Depth based on wall's depth
      }

      // Door geometry and material creation
      const doorGeometry = new THREE.BoxGeometry(doorWidth, doorHeight, doorDepth);
      const doorMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      const doorMesh = new THREE.Mesh(doorGeometry, doorMaterial);

      // Set door position
      doorMesh.position.set(
        (door.coords[0] + door.coords[2]) / 2,
        doorHeight / 2, // Centered vertically
        (door.coords[1] + door.coords[3]) / 2
      );
        scene.add(doorMesh);
      });
    });
  };
  

  const adjustCameraAndControls = (scene: THREE.Scene) => {
    const box = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = cameraRef.current!.fov * (Math.PI / 180);
    const cameraZ = Math.abs(maxDim / 4 * Math.tan(fov * 2));
    const cameraPosition = center.clone();
    cameraPosition.z += cameraZ;

    const minZ = box.min.z;
    const cameraToFarEdge = (minZ < 0) ? -minZ + cameraZ : cameraZ - minZ;

    cameraRef.current!.position.copy(cameraPosition);
    cameraRef.current!.lookAt(center);

    // Update the controls
    if (controlsRef.current) {
      controlsRef.current.target.copy(center);
      controlsRef.current.update();
    }
  };
  
  
  return (
    <>
      <div ref={mountRef} style={{ width: '100vw', height: '100vh' }}></div>
      <input type="file" accept="image/*" onChange={onFileChange} ref={fileInputRef} style={{ display: 'none' }} />
      <button onClick={() => fileInputRef.current?.click()}>Upload Image</button>
    </>
  );
};

export default ThreeDScene;
