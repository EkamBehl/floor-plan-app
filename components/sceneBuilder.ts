
import * as THREE from 'three';
interface objectData {
  class: string;
  confidence?: number;
  coords: [number, number, number, number]; // Assuming coords are [x1, y1, x2, y2]
}
interface SceneBuilderProps{
    data:objectData[] 
}
const drawRectangle = (x1: number, y1: number, x2: number, y2: number, scene: THREE.Scene) => {
  const wallHeight = 70;
  const wallLength = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
  const angle = Math.atan2(y2 - y1, x2 - x1);

  const geometry = new THREE.BoxGeometry(wallLength, wallHeight, 10);
  const material = new THREE.MeshBasicMaterial({ color: 'green' });
  const wall = new THREE.Mesh(geometry, material);

  wall.position.x = (x1 + x2) / 2;
  wall.position.y = wallHeight / 2; // Positioned at half the height
  wall.position.z = (y1 + y2) / 2;
  if (Math.abs(angle) < Math.PI / 4 || Math.abs(angle) > 3 * Math.PI / 4) {
      wall.rotation.y = 0; // Make the wall horizontal
  } else {
      wall.rotation.y = Math.PI / 2; // Make the wall vertical
  }
  
  scene.add(wall);
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
    console.log("Wall",wall)
    const [x1, y1, x2, y2] = wall.coords;
    drawRectangle(x1, y1, x2, y2, scene);
  });
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
