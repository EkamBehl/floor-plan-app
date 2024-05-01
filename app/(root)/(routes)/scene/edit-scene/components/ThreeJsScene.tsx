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

            const hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 2 );
            hemiLight.color.setHSL( 0.6, 1, 0.6 );
            hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
            hemiLight.position.set( 0, 50, 0 );
            newScene.add( hemiLight );

            const hemiLightHelper = new THREE.HemisphereLightHelper( hemiLight, 10 );
            newScene.add( hemiLightHelper );
            const axesHelper = new THREE.AxesHelper(50);
            newScene.add(axesHelper);
            

            const uniforms = {
                'topColor': { value: new THREE.Color('hsl(174, 60%, 80%)') }, // pale turquoise top
                'bottomColor': { value: new THREE.Color('hsl(174, 60%, 70%)') }, // slightly darker at the bottom
                'offset': { value: 33 },
                'exponent': { value: 0.6 }
            };
            
            const skyGeo = new THREE.SphereGeometry(4000, 32, 15);
const skyMat = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: `
            varying vec3 vWorldPosition;

            void main() {
                vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                vWorldPosition = worldPosition.xyz;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform vec3 topColor;
            uniform vec3 bottomColor;
            uniform float offset;
            uniform float exponent;

            varying vec3 vWorldPosition;

            void main() {
                float h = normalize(vWorldPosition + offset).y;
                float intensity = pow(max(0.0, h), exponent);
                vec3 color = mix(bottomColor, topColor, intensity);
                gl_FragColor = vec4(color, 1.0);
            }
        `,
        side: THREE.BackSide
    });

    const sky = new THREE.Mesh(skyGeo, skyMat);
    newScene.add(sky);

            
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
