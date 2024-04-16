import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface UseThreeSceneOutput {
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    animateCallbacks: React.MutableRefObject<(() => void)[]>;
}

const useThreeScene = (): UseThreeSceneOutput => {
    const [scene] = useState(() => new THREE.Scene());
    const [camera] = useState(() => new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000));
    const [renderer] = useState(() => new THREE.WebGLRenderer());
    const animateCallbacks = useRef<(() => void)[]>([]);

    useEffect(() => {
        scene.background=new THREE.Color(0xabcdef);
        const light= new THREE.HemisphereLight( 0xffffbb, 0x080820, 1);
        scene.add(light);
        camera.position.set(590.9590759277344, 50, 619.5294952392578);
        renderer.setSize(window.innerWidth, window.innerHeight);

        const onAnimate = () => {
            animateCallbacks.current.forEach(cb => cb());
            renderer.render(scene, camera);
        };

        const animate = () => {
            requestAnimationFrame(animate);
            onAnimate();
        };
        animate();

        return () => {
            renderer.dispose();
        };
    }, [camera, renderer, scene]);

    return { scene, camera, renderer, animateCallbacks };
};

export default useThreeScene;
