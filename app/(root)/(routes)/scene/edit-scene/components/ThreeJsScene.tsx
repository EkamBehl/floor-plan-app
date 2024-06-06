
// "use client"
// import React, { useRef, useEffect } from 'react';
// import * as THREE from 'three';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
// import { Canvas } from '@react-three/fiber';
// import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
// import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
// import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
// import { GUI } from 'dat.gui'
// interface ThreeJsSceneProps {
//     data: string;
// }

// function loadObject(sceneString: string) {
//     console.log("function called");
//     const json = JSON.parse(sceneString);
//     console.log("json parsed");
//     const loader = new THREE.ObjectLoader();
//     console.log("loader made");
//     const scene = loader.parse(json) as THREE.Scene;
//     console.log("scene made");
//     return scene;
// }
// // const windowLoader=(scene:THREE.Scene,location:any,position:any)=>{
// //     const loader= new GLTFLoader();
// //             const glassMaterial=new THREE.MeshPhysicalMaterial({
// //                 roughness:0,
// //                 metalness:0,
// //                 transmission:0.8
// //             })
// //             loader.load('/window.glb',(gltfScene)=>{
// //                 const mesh=gltfScene.scene;
// //                 mesh.position.set(100,200,100);
// //                 mesh.scale.set(50,50,50)
// //                 mesh.receiveShadow=true;
// //                 mesh.castShadow=true;
// //                 mesh.traverse(node=>{
// //                     if(node.type=="Mesh"){
// //                         node.castShadow=true;
// //                         node.receiveShadow=true
// //                         if(node.name=="window_pane"){
// //                             node.material=glassMaterial;
// //                         }
// //                     }git pull 
// const logObjectPositions = (scene: { children: any[]; }) => {
//     scene.children.forEach((obj, index) => {
//         console.log(`Object ${index} (${obj.type}) position:`, obj.position.clone());
//     });
// };

// function updateScale(scene:THREE.Scene,scaleSettings:any) {
//     scene.traverse((child) => {
//         if (child instanceof THREE.Mesh) {
//         child.scale.set(scaleSettings.scaleX, scaleSettings.scaleY, scaleSettings.scaleZ);
//         }
//     });
// }
// const ThreeJsScene: React.FC<ThreeJsSceneProps> = ({ data }) => {
//     const mountRef = useRef<HTMLCanvasElement>(null);
//     const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
//     const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
//     const controlsRef = useRef<OrbitControls | null>(null);

//     useEffect(() => {
//         var newScene = new THREE.Scene();
//         var TempScene=new THREE.Scene()
//         newScene = loadObject(data);
        

//         logObjectPositions(newScene);
//         console.log("Scene after reconstructing: ", newScene);
        

//         if (typeof window !== 'undefined' && mountRef.current) {
//             const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
//             camera.position.set(590.9590759277344, 50, 619.5294952392578);
//             cameraRef.current = camera;

//             const renderer = new THREE.WebGLRenderer({ canvas: mountRef.current });
//             renderer.setSize(window.innerWidth, window.innerHeight);
//             renderer.shadowMap.enabled = true;  // Enable shadow maps
//             renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Optional: PCFSoftShadowMap for softer shadows
//             console.log(renderer)
//             rendererRef.current = renderer;

//             const controls = new OrbitControls(camera, renderer.domElement);
//             controls.target.set(0, 0, 0);
//             controls.update();
//             controlsRef.current = controls;

//             const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
//             dirLight.position.set(300, 600, 300);
//             dirLight.castShadow = true;
//             dirLight.shadow.mapSize.width = 5120; // Adjust for better shadow resolution
//             dirLight.shadow.mapSize.height = 5120;
//             dirLight.shadow.camera.near = 0.5;
//             dirLight.shadow.camera.far = 1000;
//             dirLight.shadow.camera.left = -1000;
//             dirLight.shadow.camera.right = 1000;
//             dirLight.shadow.camera.top = 1000;
//             dirLight.shadow.camera.bottom = -1000
//             ;
//             newScene.add(dirLight);
          

//             const dirLightHelper = new THREE.CameraHelper(dirLight.shadow.camera);
//             newScene.add(dirLightHelper);
//             const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
//             newScene.add(ambientLight);
            
//             // windowLoader(newScene,1,1);
            
//             // const mtlLoader = new MTLLoader();
//             // mtlLoader.load('/windows1.mtl', (materials) => {
//             //     materials.preload();  // This ensures materials are ready before they are used by the OBJLoader.
//             //     loadObjWithMaterials(materials,newScene);
//             // });

           
//             // const hemiLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 0.2);
//             // newScene.add(hemiLight);


//             const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 2);
//             hemiLight.color.setHSL(0.6, 1, 0.6);
//             hemiLight.groundColor.setHSL(0.095, 1, 0.75);
//             hemiLight.position.set(0, 50, 0);
//             newScene.add(hemiLight);

//             // const hemiLightHelper = new THREE.HemisphereLightHelper(hemiLight, 10);
//             // newScene.add(hemiLightHelper);
//             const axesHelper = new THREE.AxesHelper(50);
//             newScene.add(axesHelper);

//             const uniforms = {
//                 'topColor': { value: new THREE.Color('hsl(174, 60%, 80%)') },
//                 'bottomColor': { value: new THREE.Color('hsl(174, 60%, 70%)') },
//                 'offset': { value: 33 },
//                 'exponent': { value: 0.6 }
//             };

//             const skyGeo = new THREE.SphereGeometry(4000, 32, 15);
//             const skyMat = new THREE.ShaderMaterial({
//                 uniforms: uniforms,
//                 vertexShader: `
//                     varying vec3 vWorldPosition;

//                     void main() {
//                         vec4 worldPosition = modelMatrix * vec4(position, 1.0);
//                         vWorldPosition = worldPosition.xyz;
//                         gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
//                     }
//                 `,
//                 fragmentShader: `
//                     uniform vec3 topColor;
//                     uniform vec3 bottomColor;
//                     uniform float offset;
//                     uniform float exponent;

//                     varying vec3 vWorldPosition;

//                     void main() {
//                         float h = normalize(vWorldPosition + offset).y;
//                         float intensity = pow(max(0.0, h), exponent);
//                         vec3 color = mix(bottomColor, topColor, intensity);
//                         gl_FragColor = vec4(color, 1.0);
//                     }
//                 `,
//                 side: THREE.BackSide
//             });
            
            
            
//             const sky = new THREE.Mesh(skyGeo, skyMat);
//             newScene.add(sky);
//             const gui = new GUI();
//             const scaleFolder = gui.addFolder('Scale');
//             const scaleSettings = {
//                 scaleX: 1,
//                 scaleY: 1,
//                 scaleZ: 1,
//               };
              
//             scaleFolder.add(scaleSettings, 'scaleX', 0.1, 10).onChange(updateScale(newScene,scaleSettings));
//             scaleFolder.add(scaleSettings, 'scaleY', 0.1, 10).onChange(updateScale);
//             scaleFolder.add(scaleSettings, 'scaleZ', 0.1, 10).onChange(updateScale);
//             scaleFolder.open();

//             const animate = () => {
//                 if (!rendererRef.current || !cameraRef.current || !controlsRef.current) return;
//                 requestAnimationFrame(animate);
//                 controlsRef.current.update();
//                 rendererRef.current.render(newScene, cameraRef.current);
//             };
//             animate();

//             return () => {
//                 if (controlsRef.current) controlsRef.current.dispose();
//                 if (rendererRef.current) rendererRef.current.dispose();
//             };
//         }
//     }, []);

//     return (
//         <canvas ref={mountRef} style={{ width: '100vw', height: '100vh' }}></canvas>
//     );
// };

// export default ThreeJsScene;
"use client";
import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GUI } from "dat.gui";

interface ThreeJsSceneProps {
  data: string;
}

function loadObject(sceneString: string) {
  console.log("function called");
  const json = JSON.parse(sceneString);
  console.log("json parsed");
  const loader = new THREE.ObjectLoader();
  console.log("loader made");
  const scene = loader.parse(json) as THREE.Scene;
  console.log("scene made");
  return scene;
}

const logObjectPositions = (scene: { children: any[] }) => {
  scene.children.forEach((obj, index) => {
    console.log(`Object ${index} (${obj.type}) position:`, obj.position.clone());
  });
};

function updateScale(scene: THREE.Scene, scaleSettings: any) {
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.scale.set(scaleSettings.scaleX, scaleSettings.scaleY, scaleSettings.scaleZ);
    }
  });
}



const ThreeJsScene: React.FC<ThreeJsSceneProps> = ({ data }) => {
  const mountRef = useRef<HTMLCanvasElement>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const guiRef = useRef<GUI | null>(null);

  useEffect(() => {
    var newScene = new THREE.Scene();
    newScene = loadObject(data);

    logObjectPositions(newScene);
    console.log("Scene after reconstructing: ", newScene);



    if (typeof window !== "undefined" && mountRef.current) {
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
      camera.position.set(590.9590759277344, 50, 619.5294952392578);
      cameraRef.current = camera;

      const renderer = new THREE.WebGLRenderer({ canvas: mountRef.current });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.shadowMap.enabled = true; // Enable shadow maps
      renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Optional: PCFSoftShadowMap for softer shadows
      console.log(renderer);
      rendererRef.current = renderer;

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.target.set(0, 0, 0);
      controls.update();
      controlsRef.current = controls;

      const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
      dirLight.position.set(300, 600, 300);
      dirLight.castShadow = true;
      dirLight.shadow.mapSize.width = 5120; // Adjust for better shadow resolution
      dirLight.shadow.mapSize.height = 5120;
      dirLight.shadow.camera.near = 0.5;
      dirLight.shadow.camera.far = 1000;
      dirLight.shadow.camera.left = -1000;
      dirLight.shadow.camera.right = 1000;
      dirLight.shadow.camera.top = 1000;
      dirLight.shadow.camera.bottom = -1000;
      newScene.add(dirLight);

      const dirLightHelper = new THREE.CameraHelper(dirLight.shadow.camera);
      newScene.add(dirLightHelper);
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
      newScene.add(ambientLight);

      const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 2);
      hemiLight.color.setHSL(0.6, 1, 0.6);
      hemiLight.groundColor.setHSL(0.095, 1, 0.75);
      hemiLight.position.set(0, 50, 0);
      newScene.add(hemiLight);

      const axesHelper = new THREE.AxesHelper(50);
      newScene.add(axesHelper);

      const uniforms = {
        topColor: { value: new THREE.Color("hsl(174, 60%, 80%)") },
        bottomColor: { value: new THREE.Color("hsl(174, 60%, 70%)") },
        offset: { value: 33 },
        exponent: { value: 0.6 },
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
        side: THREE.BackSide,
      });

      const sky = new THREE.Mesh(skyGeo, skyMat);
      newScene.add(sky);

      const gui = new GUI();
      gui.domElement.style.position = "absolute";
      gui.domElement.style.top = "40px"; // Add padding at the top
      gui.domElement.style.right = "20px"; // Add padding to the right
      guiRef.current = gui;

      const scaleSettings = {
        scaleX: 1,
        scaleY: 1,
        scaleZ: 1,
      };

      const scaleFolder = gui.addFolder("Scale");
      scaleFolder.add(scaleSettings, "scaleX", 0.1, 10).onChange(() => updateScale(newScene, scaleSettings));
      scaleFolder.add(scaleSettings, "scaleY", 0.1, 10).onChange(() => updateScale(newScene, scaleSettings));
      scaleFolder.add(scaleSettings, "scaleZ", 0.1, 10).onChange(() => updateScale(newScene, scaleSettings));
      scaleFolder.open();

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
        if (guiRef.current) guiRef.current.destroy();
      };
    }
  }, [data]);

  return <canvas ref={mountRef} style={{ width: "100vw", height: "100vh" }}></canvas>;
};

export default ThreeJsScene;
