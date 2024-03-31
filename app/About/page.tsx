"use client"
import React, { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';

const ThreeD = () => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const mountRef = useRef<HTMLCanvasElement>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const [scene, setScene] = useState<THREE.Scene | null>(null);

    useEffect(() => {
        // Scene initialization
        const initScene = new THREE.Scene();
        setScene(initScene);
        
        // Camera setup
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(590.9590759277344, 50, 619.5294952392578); // Adjusted for better initial view
        cameraRef.current = camera;
    }, []);
    function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        if (event.target.files?.length) {
          handleFileUpload(event.target.files[0]);
        }
    }
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
           

            if (scene) {
                // Clear existing geometry
                while (scene.children.length > 0) {
                    scene.remove(scene.children[0]);
                }

                // Draw walls
                const walls = data.filter((item: { class: string }) => item.class === "wall");
                walls.forEach((wall: { coords: number[] }) => {
                    const [x1, y1, x2, y2] = wall.coords;
                  
                    drawRectangle(x1, y1, x2, y2, scene);
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
        const wallHeight=70;
        const wallLength=Math.sqrt((x2-x1)**2 +(y2-y1)**2)
        const angle = Math.atan2(y2 - y1, x2 - x1);

        const geometry = new THREE.BoxGeometry(wallLength,wallHeight,2);
        const material = new THREE.MeshBasicMaterial({color: 0x8fbc8f});
        const wall= new THREE.Mesh(geometry,material);

        wall.position.x=(x1+x2)/2;
        wall.position.y = wallHeight / 2; // Positioned at half the height
        wall.position.z = (y1 + y2) / 2;
        if (Math.abs(angle) < Math.PI / 4 || Math.abs(angle) > 3 * Math.PI / 4) {
            wall.rotation.y = 0; // Make the wall horizontal
        } else {
            wall.rotation.y = Math.PI / 2; // Make the wall vertical
        }
    
        
        console.log(angle," angle")
        scene.add(wall);

    };

    const renderScene = () => {
        if (scene && cameraRef.current && mountRef.current) {
            const renderer = new THREE.WebGLRenderer({ canvas: mountRef.current });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.render(scene, cameraRef.current);
            console.log("scene rendered");
           
           
            console.log("camera current",cameraRef.current)
        }
        else{
            console.log("scene not rendering")
        }
    };
    useEffect(()=>{
        renderScene()

    },[scene]);

    return (
        <>
            <canvas ref={mountRef} style={{ width: '100vw', height: '100vh' }}></canvas>
            <input type="file" onChange={onFileChange} ref={fileInputRef} style={{ display: 'none' }} />
            <button onClick={() => fileInputRef.current?.click()}>Upload Image</button>
        </>
    );
};

export default ThreeD;
