"use client"
import React, { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

const ThreeD = () => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const mountRef = useRef<HTMLCanvasElement>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const controlsRef = useRef<OrbitControls | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const [scene, setScene] = useState<THREE.Scene | null>(null);
    const [wallObjects,setWallObjects]=useState()
    const [doorObjects,setDoorObjects]=useState()
    const materialss=["blue","black","cyan","grey","green","orange","magenta","salmon","violet","teal"]
    let i=0;
    let m=0;
    useEffect(() => {
        // Scene initialization
        const initScene = new THREE.Scene();
        setScene(initScene);
        
        initScene.background=new THREE.Color(0xabcdef)
        const light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
        
            initScene.add( light );
           

    // Camera setup
    const aspectRatio = window.innerWidth / window.innerHeight;
    const camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 10000);
    camera.position.set(590.9590759277344, 50, 619.5294952392578); // Adjusted for better initial view
    cameraRef.current = camera;

        // Renderer setup
        const renderer = new THREE.WebGLRenderer({ canvas: mountRef.current! });
        renderer.setSize(window.innerWidth, window.innerHeight);
        rendererRef.current = renderer;

       

        // Orbit controls setup
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.target.set(0, 0, 0); // Set the center of rotation
        controls.update();
        controlsRef.current = controls;
        
        


        // Animate the scene
        animate();

        // Cleanup on unmount
        return () => {
            if (controlsRef.current) {
                controlsRef.current.dispose();
            }
        };
    }, []);

    const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files?.length) {
            handleFileUpload(event.target.files[0]);
        }
    };

    // const handleFileUpload = async (file: File) => {
    //     const formData = new FormData();
    //     formData.append('image', file);

    //     try {
    //         const response = await fetch('http://127.0.0.1:8000/detect/', {
    //             method: 'POST',
    //             body: formData,
    //         });

    //         if (!response.ok) {
    //             throw new Error('Network response was not ok');
    //         }

    //         const data = await response.json();
         

    //         if (scene) {
    //             // Clear existing geometry
    //             while (scene.children.length > 0) {
    //                 scene.remove(scene.children[0]);
    //             }
    //             const floorGeometry = new THREE.PlaneGeometry(2000, 2000, 32, 32);
    //             const floorMaterial = new THREE.MeshBasicMaterial({ color: 0x9e9e9e, side: THREE.DoubleSide });
    //             const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    //             floor.rotation.x = -Math.PI / 2; // Rotate the floor 90 degrees
    //             floor.position.y = -0.5; // Adjust the floor position as needed
    //             scene.add(floor);
                    
    //             // Draw walls
    //             const walls = data.filter((item: { class: string }) => item.class === "wall");
    //             walls.forEach((wall: { coords: number[] }) => {
    //                 const [x1, y1, x2, y2] = wall.coords;
            
    //                 drawRectangle(x1, y1, x2, y2, scene);
    //             });
    //             setWallObjects(walls);
    //             const doors = data.filter((item: { class: string; confidence: number; }) => item.class === "door" && item.confidence > 0.5);

                
    //             console.log("doors",doors)
            
                
    //             let closestPointList=[]
                

        
                
    //             doors.forEach((door: { coords: [any, any, any, any]; }) => {
    //                 const [x1, y1, x2, y2] = door.coords;
                  
    //                 const position = new THREE.Vector3((x1 + x2) / 2, 0, (y1 + y2) / 2); // Example, adjust Y as necessary
    //                 const rotation = Math.atan2(y2 - y1, x2 - x1); // Orient the door properly

    //                 loadDoorModel(position, rotation, scene);
    //                 const [a1,b1,a2,b2]= door.coords;
                
    //                 const corners=[[a1,b1],[a1,b2],[a2,b1],[a2,b2]]
                    
    //                 const closestPoints=getDoorCoords(walls,corners)
    //                 closestPointList.push(closestPoints)
    //             });
                
    //             console.log("LIST_____________",closestPointList)

    //             // Trigger scene rendering
    //             renderScene();
    //         }
    //     } catch (error) {
    //         console.error('Error uploading image:', error);
    //     }
    // };
    const handleFileUpload = async (file) => {
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
            console.log("data",data);
            if (scene) {
                // Clear existing geometry
                while (scene.children.length > 0) {
                    scene.remove(scene.children[0]);
                }
                // Re-add static objects like the floor here, if needed
                const floorGeometry = new THREE.PlaneGeometry(2000, 2000, 32, 32);
                const floorMaterial = new THREE.MeshBasicMaterial({ color: 0x9e9e9e, side: THREE.DoubleSide });
                const floor = new THREE.Mesh(floorGeometry, floorMaterial);
                floor.rotation.x = -Math.PI / 2; // Rotate the floor 90 degrees
                floor.position.y = -0.5; // Adjust the floor position as needed
                scene.add(floor);
                
                const walls = data.filter((item) => item.class === "wall");
                const doors = data.filter((item) => item.class === "door" && item.confidence > 0.4);
    
                // Process walls
                walls.forEach((wall) => {
                    
                    const [x1, y1, x2, y2] = wall.coords;
                    drawRectangle(x1, y1, x2, y2, scene,materialss[m]);
                    m=m+1;
                    if(m===materialss.length-1){
                        m=0;
                    }
                });
    
                // Process doors
                doors.forEach((door) => {
                    const [x1, y1, x2, y2] = door.coords;
                    const doorPosition = new THREE.Vector3((x1 + x2) / 2, 0, (y1 + y2) / 2); // Midpoint for the door
                    const doorRotation = Math.atan2(y2 - y1, x2 - x1); // Calculate rotation
    
                    // Find the closest points on walls for each door
                    const closestPoints = getDoorCoords(walls, [[x1, y1], [x2, y2]]);
                    console.log("Material: " ,materialss[i], "closest points: ",closestPoints )
                    if (closestPoints.length === 2) {
                        const cp1 = closestPoints[0];
                        const cp2 = closestPoints[1];
                        const precisePosition = new THREE.Vector3((cp1[0] + cp2[0]) / 2, 0, (cp1[1] + cp2[1]) / 2);
                        const xDistance = Math.abs(cp1[0] - cp2[0]);
                        const zDistance = Math.abs(cp1[1] - cp2[1]);
                        const alignAlongXAxis = xDistance > zDistance;
                
                        loadDoorModel(precisePosition, alignAlongXAxis, scene,materialss[i]);
                    }
                    i=i+1;
                });
    
                // Trigger scene rendering
                renderScene();
            }
        } catch (error) {
            console.error('Error uploading image:', error);
        }
    };
    const getDoorCoords = (walls, doorCorners) => {
        let closestPts = [];
    
        doorCorners.forEach((corner) => {
            let minDistance = Infinity;
            let closestPoint = null;
    
            walls.forEach((wall) => {
                const [x1, y1, x2, y2] = wall.coords;
                const wallPoints = [[x1, y1], [x2, y2]];
    
                wallPoints.forEach((wallPoint) => {
                    const distance = Math.sqrt((wallPoint[0] - corner[0]) ** 2 + (wallPoint[1] - corner[1]) ** 2);
                    if (distance < minDistance) {
                        closestPoint = wallPoint;
                        minDistance = distance;
                    }
                });
            });
    
            if (closestPoint) {
                closestPts.push(closestPoint);
            }
        });
    
        return closestPts;
    };
    
    
    // const getDoorCoords = (wallCoords, doorCorners) => {
    //     let closestPts = [];
    
    //     console.log(doorCorners.length);
    
    //     // Using traditional for loop for doorCorners.array
    //     for (let i = 0; i < doorCorners.length; i++) {
    //         let corner = doorCorners[i];
    //         let minDistance = Infinity;
    //         let closestPoint = null;
    
    //         // Using traditional for loop for wallCoords.array
    //         for (let j = 0; j < wallCoords.length; j++) {
    //             let wall = wallCoords[j];
    //             const [x1, y1, x2, y2] = wall.coords;
    //             const wallPoints = [[x1, y1], [x2, y2]];
    
    //             // Using another for loop for wallPoints
    //             for (let k = 0; k < wallPoints.length; k++) {
    //                 let wallPoint = wallPoints[k];
    //                 const distance = Math.sqrt((wallPoint[0] - corner[0]) ** 2 + (wallPoint[1] - corner[1]) ** 2);
    //                 if (distance < minDistance) {
    //                     closestPoint = wallPoint;
    //                     minDistance = distance;
    //                 }
    //             }
    //         }
    
    //         if (closestPoint) {
    //             closestPts.push(closestPoint);
    //         }
    //     }
    
    //     return closestPts;
    // };
    
    
    

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
    // const loadDoorModel = (position: THREE.Vector3Like, rotation: number, scene: THREE.Scene) => {
    //     const loader = new OBJLoader();
    //     loader.load(
    //         '/door.obj', // Make sure this path is correct
    //         (obj) => {
    //             let doorHeight = 0; // Variable to store the calculated door height
    //             obj.traverse((child) => {
    //                 if (child instanceof THREE.Mesh) {
    //                     // Apply material or any transformations specific to the door's mesh
    //                     const material = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Example: red door
    //                     child.material = material;
    
    //                     // Calculate the bounding box to determine the door's height
    //                     if (!child.geometry.boundingBox) {
    //                         child.geometry.computeBoundingBox();
    //                     }
    //                     doorHeight = child.geometry.boundingBox.max.y - child.geometry.boundingBox.min.y;
    //                 }
    //             });
    
    //             // Adjust the object's scale, position, and rotation as needed
    //             obj.scale.set(4, 4, 4); // Adjust the scale if necessary
    
    //             // Here, we assume the door's pivot is at its base. Adjust `y` so the door sits on the floor.
    //             // Adjust the 0.5 value if the floor's y position is different.
    //             obj.position.set(position.x, position.y+35 , position.z);
                
    //             // Uncomment these if needed for orientation adjustments
    //             // obj.rotation.x = Math.PI / 2; // Rotates the door 90 degrees around the x-axis
    //             // obj.rotation.y = rotation; // Adjust rotation to properly orient the door
    
    //             scene.add(obj);
    //         },
    //         (xhr) => {
    //             console.log(`${(xhr.loaded / xhr.total * 100)}% loaded`);
    //         },
    //         (error) => {
    //             console.error('An error happened', error);
    //         }
    //     );
    // };
    const loadDoorModel = (position, alignAlongXAxis, scene,materials) => {
        const loader = new OBJLoader();
        loader.load(
            '/door.obj', // Adjust the path to your .obj file
            (obj) => {
                obj.traverse((child) => {
                    if (child instanceof THREE.Mesh) {
                        const material = new THREE.MeshBasicMaterial({ color: materials}); // Red color for the door
                        child.material = material;
                    }
                });
    
                // Adjust position and rotation based on the calculated values
                obj.position.set(position.x, position.y+35, position.z);
                
                console.log("Position of the door: ",position.x, position.y+35, position.z, "material: ",materials)

                obj.rotation.y = alignAlongXAxis ? 0 : Math.PI / 2;
                // Adjust scale if necessary
                obj.scale.set(4, 4, 4);
    
                scene.add(obj);
            },
            (xhr) => {
                console.log(`${(xhr.loaded / xhr.total * 100)}% loaded`);
            },
            (error) => {
                console.error('An error happened', error);
            }
        );
    };
    
    

    const drawRectangle = (x1: number, y1: number, x2: number, y2: number, scene: THREE.Scene,materials) => {
        const wallHeight = 70;
        const wallLength = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
        const angle = Math.atan2(y2 - y1, x2 - x1);

        const geometry = new THREE.BoxGeometry(wallLength, wallHeight, 10);
        const material = new THREE.MeshBasicMaterial({ color: materials });
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

    const addDoor = (doorCoords: Coordinates, walls: Coordinates[], scene: THREE.Scene, providedRotation?: number) => {
        // For debugging: replace the OBJLoader with a simple box to represent the door
        const doorWidth = 10;
        const doorHeight = 30;
        const doorDepth = 2;
        const doorGeometry = new THREE.BoxGeometry(doorWidth, doorHeight, doorDepth);
        const doorMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const doorMesh = new THREE.Mesh(doorGeometry, doorMaterial);
    
        let doorRotationY = providedRotation !== undefined
          ? providedRotation
          : findNearestWallAndRotation(doorCoords, walls).doorRotationY;
    
        const doorCenterX = (doorCoords[0] + doorCoords[2]) / 2;
        const doorCenterZ = (doorCoords[1] + doorCoords[3]) / 2;
    
        doorMesh.position.set(doorCenterX, doorHeight / 2, doorCenterZ);
        doorMesh.rotation.y = doorRotationY;

        doorMesh.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
            }
        });
    
        scene.add(doorMesh);
      };
      

    function animate() {
      if (!controlsRef.current || !rendererRef.current || !scene || !cameraRef.current) {
        return;
      }

      requestAnimationFrame(animate);
      controlsRef.current.update();
      rendererRef.current.render(scene, cameraRef.current);
    }

    const renderScene = () => {
        if (scene && cameraRef.current && mountRef.current) {
            
            controlsRef.current && controlsRef.current.update();
            rendererRef.current && rendererRef.current.render(scene, cameraRef.current);
            console.log("scene rendered");
        }
        else {
            console.log("scene not rendering")
        }
    };

    useEffect(() => {
        animate()
    }, [scene]);

    return (
        <>
            <canvas ref={mountRef} style={{ width: '100vw', height: '100vh' }}></canvas>
            <input type="file" onChange={onFileChange} ref={fileInputRef} style={{ display: 'none' }} />
            <button onClick={() => fileInputRef.current?.click()}>Upload Image</button>
        </>
    );
};

export default ThreeD;

