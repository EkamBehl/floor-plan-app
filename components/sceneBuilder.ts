
import * as THREE from 'three';

const materialss=["blue","black","cyan","grey","green","orange","magenta","salmon","violet","teal","brown",'red','lightblue']
interface objectData {
  class: string;
  confidence?: number;
  coords: [number, number][]; // Assuming coords are [x1, y1, x2, y2]
}
interface SceneBuilderProps{
    data:objectData[] 
}
var i=0;
const loadDoorModel = (points: [number, number][], scene: THREE.Scene, materials: string) => {
  // Convert 2D points to 3D vectors, mapping 2D y to 3D z, and setting 3D y to a fixed value
  const point1 = new THREE.Vector3(points[1][0], 0, points[0][1]);
  const point2 = new THREE.Vector3(points[0][0], 0, points[1][1]);

  // Calculate the actual x-difference as length
  const xLength = Math.abs(point2.x - point1.x); // Length based on x-difference
  const height = 100; // Arbitrary height, adjust as needed
  const thickness = 4; // Thickness of the door

  // Cube geometry with x-difference as length
  const geometry = new THREE.BoxGeometry(xLength, height, thickness);
  const material = new THREE.MeshBasicMaterial({ color: materials });
  const cube = new THREE.Mesh(geometry, material);

  // Calculate the vector from point2 to point1
  const direction = new THREE.Vector3().subVectors(point1, point2).normalize();
  const angle = Math.atan2(direction.z, direction.x);

  // Calculate adjustment vector for centering the cube based on half the x-length
  const halfLengthX = (xLength / 2) * Math.cos(angle); // Project x-length onto direction
  const halfLengthZ = (xLength / 2) * Math.sin(angle); // Project x-length onto direction

  // Set the starting edge of the cube exactly at point2 by adjusting the center
  const startPosition = new THREE.Vector3(
    point2.x +2*halfLengthX, // Subtract half the x-length to align with point2
    height / 2,
    point2.z + halfLengthZ  // Subtract half the x-length to align with point2
  );

  // Adjust cube position and rotation
  cube.position.set(startPosition.x, startPosition.y, startPosition.z);
  cube.rotation.y = angle;

  // Add cube to the scene
  scene.add(cube);
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
  const material=new THREE.MeshBasicMaterial({color:0x00ff00})
  const mesh=new THREE.Mesh(geometry,material)
  mesh.rotation.x = Math.PI / 2;
  mesh.position.y=mesh.position.y+100;
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
  console.log("data from the builder",data)
  const scene= new THREE.Scene();

  if(data){
    const floorGeometry = new THREE.PlaneGeometry(2000, 2000, 32, 32);
    const floorMaterial = new THREE.MeshBasicMaterial({ color: 0x9e9e9e, side: THREE.DoubleSide });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
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
}
else{
  console.log("Data is null!!!!!!!!!!");
}
  



  scene.updateMatrix();
  scene.updateMatrixWorld(true);
  logObjectPositions(scene)
  var numOfMeshes = 0;
  scene.traverse( function( child ) {
      if( child instanceof THREE.Mesh )
          numOfMeshes++;
  } );
  console.log(numOfMeshes);
  const sceneJson = scene.toJSON();
  const stringifiedScene = JSON.stringify(sceneJson);
  return stringifiedScene
}

export default sceneBuilder
