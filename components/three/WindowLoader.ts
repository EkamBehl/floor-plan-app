import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

export const loadWindows= async (points: any[], scene: THREE.Scene) => {

  
  console.log("function is hitting!!!!!!!!")
  const [x1, y1, x2, y2] = points;
  const width = Math.abs(x2 - x1) * 50;
  const height = 50; // Specified height for the rectangle
  const depth = Math.abs(y2 - y1) * 50;

  const loader = new OBJLoader();
  const glassMaterial = new THREE.MeshPhysicalMaterial({
    roughness: 0,
    metalness: 0,
    transmission: 0.8,
  });

  loader.load('/window.obj', mesh=>{
    mesh.position.set((x1 + x2) / 2, 50, (y1 + y2) / 2);
    mesh.scale.set(width, height, depth);
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    mesh.traverse(child=>{
      if(child instanceof THREE.Mesh){
        child.receiveShadow=true;
        child.castShadow=true;
      }
      if(child.name=="window_pane"){
        child.material=glassMaterial;
      }
    })
    scene.add(mesh);
  })
      
  
  

};
