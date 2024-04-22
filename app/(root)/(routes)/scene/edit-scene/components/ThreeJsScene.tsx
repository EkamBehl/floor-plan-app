// "use client"
// import React, { useRef, useEffect } from 'react';
// import * as THREE from 'three';
// import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// interface ThreeJsSceneProps {
//     data: THREE.Scene;
// }

// const ThreeJsScene = ({ data }:ThreeJsSceneProps) => {
    
//     const mountRef = useRef<HTMLCanvasElement>(null);
//     const cameraRef = useRef<THREE.PerspectiveCamera>(new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000));
//     const rendererRef = useRef<THREE.WebGLRenderer>();
//     const controlsRef = useRef<OrbitControls>();

//         useEffect(()=>{
//             var scene=new THREE.Scene()
//             scene=data
//             if (mountRef.current) {
//             const renderer = new THREE.WebGLRenderer({ canvas: mountRef.current });
//             renderer.setSize(window.innerWidth, window.innerHeight);
//             rendererRef.current = renderer;

//             cameraRef.current.position.set(590.9590759277344, 50, 619.5294952392578);
//             const light = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
//             scene.add(light);

//             controlsRef.current = new OrbitControls(cameraRef.current, renderer.domElement);
//             controlsRef.current.target.set(0, 0, 0);
//             controlsRef.current.update();
        
//             const animate = () => {
//                 requestAnimationFrame(animate);
//                 controlsRef.current?.update();
//                 renderer.render(scene, cameraRef.current);
//             };
//             animate();
        
//             return () => {
//                 controlsRef.current?.dispose();
//                 renderer.dispose();
//             };
//             }



//         },[])
        

//     return (
//         <canvas ref={mountRef} style={{ width: '100vw', height: '100vh' }}></canvas>
//     );
// };

// export default ThreeJsScene;
"use client"
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';


interface ThreeJsSceneProps {
    data: string;
}
function loadObject(sceneString: string){
    console.log("function called")
    const json= JSON.parse(sceneString)
    console.log("json parsed")
    const loader=new THREE.ObjectLoader()
    console.log("loader made")
    const scene=loader.parse(json) as THREE.Scene
    console.log("scene made")
    return scene
}
const logObjectPositions = (scene: { children: any[]; }) => {
    scene.children.forEach((obj, index) => {
      console.log(`Object ${index} (${obj.type}) position:`, obj.position.clone());
    });
  };
const ThreeJsScene: React.FC<ThreeJsSceneProps> = ({ data }) => {
   
    const mountRef = useRef<HTMLCanvasElement>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const controlsRef = useRef<OrbitControls | null>(null);
    
    useEffect(() => {
            var newScene=new THREE.Scene()
            
            
            newScene=loadObject(data)

            logObjectPositions(newScene)
            console.log("Scene after reconstructing: ",newScene )
            var numOfMeshes = 0;
            newScene.traverse( function( child ) {
                if( child instanceof THREE.Mesh )
                    numOfMeshes++;
            } );
            console.log(numOfMeshes);
        // Only instantiate the camera and renderer if we're on the client-side
        if (typeof window !== 'undefined' && mountRef.current) {
            newScene.traverse( function( child ) {
                if( child instanceof THREE.Mesh )
                    numOfMeshes++;
            } );
            console.log(numOfMeshes);
           
            const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
            camera.position.set(590.9590759277344, 50, 619.5294952392578);
            cameraRef.current = camera;

            const renderer = new THREE.WebGLRenderer({ canvas: mountRef.current });
            renderer.setSize(window.innerWidth, window.innerHeight);
            rendererRef.current = renderer;

            const controls = new OrbitControls(camera, renderer.domElement);
            controls.target.set(0, 0, 0);
            controls.update();
            controlsRef.current = controls;

            const light = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
            newScene.add(light);  // Use the provided scene

            const animate = () => {
                if (!rendererRef.current || !cameraRef.current || !controlsRef.current) return;
                requestAnimationFrame(animate);
                controlsRef.current.update();
                rendererRef.current.render(newScene, cameraRef.current);
            };
            animate();

            return () => {
                if (controlsRef.current) controlsRef.current.dispose();
                if (rendererRef.current) rendererRef.current.dispose();
            };
        }
    }, []);  // Depend on `data` to potentially recreate the scene if it changes

    return (
        <canvas ref={mountRef} style={{ width: '100vw', height: '100vh' }}></canvas>
    );
};

export default ThreeJsScene;
