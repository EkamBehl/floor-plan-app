
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';


// Define the global objects only if they are not already defined
interface ObjectData {
  class: string;
  confidence?: number;
  coords: [number, number][];
}

const materialss=["blue","black","cyan","grey","green","orange","magenta","salmon","violet","teal","brown",'red','lightblue']
interface objectData {
  class: string;
  confidence?: number;
  coords: [number, number][]; // Assuming coords are [x1, y1, x2, y2]
}
interface SceneBuilderProps{
    data:objectData[] 
}
var counter=0;
const loadWindows = (points: any[], scene: THREE.Scene) => {
  return new Promise<void>((resolve, reject) => {
    console.log("Function is hitting!!!!!!!!");

    const [x1, y1, x2, y2] = points;
    const width = Math.abs(x2 - x1);
    const height = 50; // Specified height for the rectangle
    const depth = Math.abs(y2 - y1);

    const loader = new GLTFLoader();
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      roughness: 0,
      metalness: 0,
      transmission: 0.8
    });

    loader.load(
      '/window.glb',
      (gltf) => {
        const mesh = gltf.scene;

        if (!mesh) {
          console.error("GLTF loaded but mesh is undefined");
          reject(new Error("GLTF loaded but mesh is undefined"));
          return;
        }

        mesh.position.set((x1 + x2) / 2, 50, (y1 + y2) / 2);
        if (width < depth) {
          mesh.rotation.y = Math.PI / 2;
          mesh.scale.set(depth,height,width) // Rotate 90 degrees if width is greater
        }else{
        mesh.scale.set(width,height,depth);
        }
        mesh.receiveShadow = true;
        mesh.castShadow = true;

        mesh.traverse((node) => {
          if (node.type === "Mesh") {
            node.castShadow = true;
            node.receiveShadow = true;
            if (node.name === "window_pane") {
              node.material = glassMaterial;
            }
          }
        });

        scene.add(mesh);
        console.log("Window added to scene: ", mesh);
        resolve();
      },
      undefined,
      (error) => {
        console.error("An error happened while loading the window model: ", error);
        reject(error);
      }
    );
  });
};
var i=0;
const loadDoorModel = (points: [number, number][], scene: THREE.Scene, materials: string) => {
  // Convert 2D points to 3D vectors, mapping 2D y to 3D z, and setting 3D y to a fixed value
  const point1 = new THREE.Vector3(points[0][0], 0, points[0][1]);
  const point2 = new THREE.Vector3(points[1][0], 0, points[1][1]);

  // Calculate the actual x-difference as length
  const xLength = point1.distanceTo(point2); // Distance between the two points
  const height = 70; // Arbitrary height, adjust as needed
  const thickness = 10; // Thickness of the door

  // Cube geometry with x-difference as length
  const geometry = new THREE.BoxGeometry(xLength, height, thickness);
  geometry.computeVertexNormals();

  // const cube = new THREE.Mesh(geometry, material);

  // Calculate the midpoint between point1 and point2 for positioning the cube
  const midpoint = new THREE.Vector3().addVectors(point1, point2).multiplyScalar(0.5);
  midpoint.y = height / 2; // Set the midpoint's y to half the height of the cube

  // Calculate the rotation angle
  const direction = new THREE.Vector3().subVectors(point2, point1).normalize();
  const angle = Math.atan2(direction.z, direction.x);

  const loader=new GLTFLoader();
  loader.load(
    '/door.glb',
    (gltf) => {

      const cube=gltf.scene
      cube.position.set(midpoint.x, midpoint.y, midpoint.z);
      cube.rotation.y = angle;
      cube.castShadow = true;
      cube.receiveShadow = true;
      cube.scale.set(xLength,height,thickness)
      scene.add(cube);
    })
    
  // Set the cube's position and rotation
  
  // Add cube to the scene
  
};




const drawRectangle = (points: [number, number][], scene: THREE.Scene) => {
  // Triangulate the 2D points using Delaunator
  const shape=new THREE.Shape()
  points.forEach((point,index)=>{
    if(index===0){
      shape.moveTo(point[0],point[1])
    }else{
      shape.lineTo(point[0],point[1])
    }
  })
  const extrudeSettings={
    steps:2,
    depth:100,
    bevelEnabled:false,
  }

  const geometry= new THREE.ExtrudeGeometry(shape,extrudeSettings)
  const material = new THREE.MeshPhongMaterial({ color: 0xffffff }); 
  geometry.computeVertexNormals();
  const mesh=new THREE.Mesh(geometry,material)
  mesh.rotation.x = Math.PI / 2;
  mesh.position.y=mesh.position.y+100;
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  scene.add(mesh)
  
 
};
const logObjectPositions = (scene: { children: any[]; }) => {
  scene.children.forEach((obj, index) => {
    console.log(`Object ${index} (${obj.type}) position:`, obj.position.clone());
  });
};

const sceneBuilder = async({
    data
}:SceneBuilderProps) => {
  
  const scene= new THREE.Scene();

  if(data){
    const floorGeometry = new THREE.PlaneGeometry(2500, 2500, 32, 32);
    floorGeometry.computeVertexNormals()
    const floorMaterial = new THREE.MeshPhongMaterial({ color: 0x9e9e9e, side: THREE.DoubleSide });
    
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.receiveShadow = true;
    floor.rotation.x = -Math.PI / 2; // Rotate the floor 90 degrees
    floor.position.y = -0.5; // Adjust the floor position as needed
    scene.add(floor);
  
  const walls = data.filter(item => item.class === "wall");
  // const doors = data.filter((item: { class: string; confidence: number; }) => item.class === "door" && item.confidence > 0.4);
  walls.forEach(wall => {
    
    const coords = wall.coords;
    drawRectangle(coords, scene);
  });
  
  const doors = data.filter(item => item.class === "door");
  doors.forEach(door=>{
    const coords=door.coords;
    loadDoorModel(coords,scene,materialss[i])
    i=i+1
  })
  const windows = data.filter(item => item.class === "window");
  // const doors = data.filter((item: { class: string; confidence: number; }) => item.class === "door" && item.confidence > 0.4);
    for (const window of windows) {
      const coords = window.coords;
      await loadWindows(coords, scene);
    }
}
else{
  console.log("Data is null!!!!!!!!!!");
}
scene.traverse( function( child ) {
  if(child instanceof THREE.Group){
    counter=counter+1;

    console.log("IS A WINDOW from the before the update !!!!")
  }
} );




  scene.updateMatrix();
  scene.updateMatrixWorld(true);
  scene.traverse( function( child ) {
    if(child instanceof THREE.Group){
     
  
      console.log("IS A WINDOW from the after the update !!!!")
    }
  } );
  logObjectPositions(scene)
  
  const sceneJson = scene.toJSON();
  const stringifiedScene = JSON.stringify(sceneJson);
  return stringifiedScene
}

export default sceneBuilder;