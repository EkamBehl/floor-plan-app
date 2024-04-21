import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

interface SceneCanvasProps {
    scene: THREE.Scene;
    camera: THREE.Camera;
    renderer: THREE.WebGLRenderer;
    onAnimate: () => void;
}

const SceneCanvas: React.FC<SceneCanvasProps> = ({ scene, camera, renderer, onAnimate }) => {
    const mountRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (renderer && mountRef.current) {
            mountRef.current.appendChild(renderer.domElement);
            const controls = new OrbitControls(camera, renderer.domElement);
            controls.addEventListener('change', () => renderer.render(scene, camera));
            return () => {
                controls.dispose();
                mountRef.current?.removeChild(renderer.domElement);
            };
        }
    }, [renderer, camera, scene]);

    useEffect(() => {
        const animate = () => {
            requestAnimationFrame(animate);
            onAnimate();
        };
        animate();
    }, [onAnimate]);

    return <div ref={mountRef} style={{ width: '100vw', height: '100vh' }} />;
};

export default SceneCanvas;
