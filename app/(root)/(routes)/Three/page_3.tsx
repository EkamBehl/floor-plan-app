"use client"
import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Assuming your API response structure looks like this
interface ApiWall {
  class: string;
  confidence: number;
  coords: [number, number, number, number]; // [x1, y1, x2, y2]
}

const ThreeDScene = () => {
    const mountRef = useRef<HTMLDivElement>(null);
  const [wallsData, setWallsData] = useState<ApiWall[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
        
        const data: ApiWall[] = await response.json();
        const filteredWalls = data.filter(wall => wall.class === "wall");
        setWallsData(filteredWalls);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };


  useEffect(() => {
    if (wallsData.length === 0) {
      return;
    }

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    // Camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(150, 150, 150);
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current?.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0);
    controls.update();

    // Add walls to the scene based on the API response
    const wallHeight = 10; // Change this to the height of your walls
    wallsData.forEach((wall) => {
      const [x1, z1, x2, z2] = wall.coords;
      const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(z2 - z1, 2));
      const angle = Math.atan2(z2 - z1, x2 - x1);

      const wallGeometry = new THREE.PlaneGeometry(length, wallHeight);
      const wallMaterial = new THREE.MeshBasicMaterial({ color: 0x8fbc8f, side: THREE.DoubleSide });
      const wallMesh = new THREE.Mesh(wallGeometry, wallMaterial);
      
      wallMesh.position.x = (x1 + x2) / 2;
      wallMesh.position.z = (z1 + z2) / 2;
      wallMesh.rotation.y = -angle;
      wallMesh.position.y = wallHeight / 2;
      
      scene.add(wallMesh);
    });

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    
    animate();

    // Cleanup
    return () => {
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, [wallsData]); // Rerun effect when wallsData changes

  return (
    <>
      <div ref={mountRef} style={{ width: '100vw', height: '100vh' }}></div>
      <input type="file" accept="image/*" onChange={onFileChange} ref={fileInputRef} style={{ display: 'none' }} />
      <button onClick={() => fileInputRef.current?.click()}>Upload Image</button>
    </>
  );
};

export default ThreeDScene;
