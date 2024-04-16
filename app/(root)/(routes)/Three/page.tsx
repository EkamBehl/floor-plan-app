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
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
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

    const handleFileUpload = async (file: string | Blob) => {
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
                
                const walls = data.filter((item: { class: string; }) => item.class === "wall");
                const doors = data.filter((item: { class: string; confidence: number; }) => item.class === "door" && item.confidence > 0.4);
    
                // Process walls
                walls.forEach((wall: { coords: [any, any, any, any]; }) => {
                    
                    const [x1, y1, x2, y2] = wall.coords;
                    drawRectangle(x1, y1, x2, y2, scene);
                    m=m+1;
                    if(m===materialss.length-1){
                        m=0;
                    }
                });
    
                // Process doors
                doors.forEach((door: { coords: [any, any, any, any]; }) => {
                    const [x1, y1, x2, y2] = door.coords;
                    const doorPosition = new THREE.Vector3((x1 + x2) / 2, 0, (y1 + y2) / 2); // Midpoint for the door
                    const doorRotation = Math.atan2(y2 - y1, x2 - x1); // Calculate rotation
    
                    // Find the closest points on walls for each door
                    const closestPoints = getDoorCoords(walls, [[x1, y1], [x2, y2]]);

                    console.log(" closest points :" ,closestPoints)
                   
                 
                       
                        if (closestPoints.length === 2) {
                        const cp1 = closestPoints[0];
                        const cp2 = closestPoints[1];
                        const precisePosition = new THREE.Vector3((cp1[0] + cp2[0]) / 2, 0, (cp1[1] + cp2[1]) / 2);
                        const xDistance = Math.abs(cp1[0] - cp2[0]);
                        const zDistance = Math.abs(cp1[1] - cp2[1]);
                        const alignAlongXAxis = xDistance > zDistance;
                
                        loadDoorModel(precisePosition, alignAlongXAxis, scene,materialss[i]);
                    
                   
                    }
                    // console.log("Material: " ,materialss[i], "closest points: ",closestPoints )
                    // if (closestPoints.length === 2) {
                    //     const cp1 = closestPoints[0];
                    //     const cp2 = closestPoints[1];
                    //     const precisePosition = new THREE.Vector3((cp1[0] + cp2[0]) / 2, 0, (cp1[1] + cp2[1]) / 2);
                    //     const xDistance = Math.abs(cp1[0] - cp2[0]);
                    //     const zDistance = Math.abs(cp1[1] - cp2[1]);
                    //     const alignAlongXAxis = xDistance > zDistance;
                
                    //     loadDoorModel(precisePosition, alignAlongXAxis, scene,materialss[i]);
                    // }
                    i=i+1;
                });
    
                // Trigger scene rendering
                renderScene();
            }
        } catch (error) {
            console.error('Error uploading image:', error);
        }
    };
    const getDoorCoords = (walls: { coords: [number, number, number, number]; }[], doorCorners: [number, number][]) => {
        let closestPts: [number, number][] = [];
    
        doorCorners.forEach((corner) => {
            let minDistance = Infinity;
            let closestPoint: [number, number] | null = null;
    
            walls.forEach((wall) => {
                const [x1, y1, x2, y2] = wall.coords;
                const wallPoints: [number, number][] = [[x1, y1], [x2, y2]];
    
                wallPoints.forEach((wallPoint) => {
                    const distance = Math.sqrt(Math.pow(wallPoint[0] - corner[0], 2) + Math.pow(wallPoint[1] - corner[1], 2));
                    if (distance < minDistance) {
                        closestPoint = wallPoint;
                        minDistance = distance;
                    }
                });
            });
    
            // Avoid adding duplicate points
            if (closestPoint && !closestPts.some(point => point[0] === closestPoint![0] && point[1] === closestPoint![1])) {
                closestPts.push(closestPoint);
    
                // Check for another point within a range of 10 units and total distance not more than 50 units
                walls.forEach((wall) => {
                    const [x1, y1, x2, y2] = wall.coords;
                    const additionalPoints = [[x1, y1], [x2, y2]].filter(point =>
                        (Math.abs(point[0] - closestPoint![0]) <= 10 || Math.abs(point[1] - closestPoint![1]) <= 10) &&
                        Math.sqrt(Math.pow(point[0] - closestPoint![0], 2) + Math.pow(point[1] - closestPoint![1], 2)) <= 100 &&
                        !(point[0] === closestPoint![0] && point[1] === closestPoint![1]) // Exclude the closestPoint itself
                    );
    
                    // Add these points if they aren't already in closestPts to avoid duplicates
                    additionalPoints.forEach(point => {
                        if (!closestPts.some(closestPoint => closestPoint[0] === point[0] && closestPoint[1] === point[1])) {
                            closestPts.push(point);
                        }
                    });
                });
            }
        });
    
        return closestPts;
    };
    
    
    
    
   
    
    
    

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
    
    const loadDoorModel = (position: THREE.Vector3, alignAlongXAxis: boolean, scene: THREE.Scene,materials: string) => {
        const loader = new OBJLoader();
        loader.load(
            '/door.obj', // Adjust the path to your .obj file
            (obj) => {
                obj.traverse((child) => {
                    if (child instanceof THREE.Mesh) {
                        const material = new THREE.MeshBasicMaterial({ color:materials}); // Red color for the door
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
    const checkForParallelPoints = (closestPoints: string | any[]) => {
                // Assuming closestPoints is an array of four [x, z] pairs
                let parallelPairs: any[][] = [];
                let slopes = [];
                for (let i = 0; i < closestPoints.length; i++) {
                    for (let j = i + 1; j < closestPoints.length; j++) {
                        const pointA = closestPoints[i];
                        const pointB = closestPoints[j];
                        // Calculate slope
                        const slope = (pointB[1] - pointA[1]) / (pointB[0] - pointA[0]);
                        slopes.push({ i, j, slope });
                    }
                }
        
                // Compare slopes to find parallel lines (with a tolerance for floating point precision)
                const tolerance = 0.01;
                slopes.forEach((slopeA, index) => {
                    for (let k = index + 1; k < slopes.length; k++) {
                        const slopeB = slopes[k];
                        if (Math.abs(slopeA.slope - slopeB.slope) < tolerance) {
                            parallelPairs.push([closestPoints[slopeA.i], closestPoints[slopeA.j]]);
                            parallelPairs.push([closestPoints[slopeB.i], closestPoints[slopeB.j]]);
                            return;
                        }
                    }
                });
        
                return parallelPairs.length > 0 ? { parallelPoints: parallelPairs, isParallel: true } : { isParallel: false };
            };
    

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

// import React, { useRef, useState, useEffect } from 'react';
// import * as THREE from 'three';
// import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

// const ThreeD = () => {
//     const fileInputRef = useRef(null);
//     const mountRef = useRef(null);
//     const cameraRef = useRef(null);
//     const controlsRef = useRef(null);
//     const rendererRef = useRef(null);
//     const [scene, setScene] = useState(null);

//     useEffect(() => {
//         // Scene initialization
//         const initScene = new THREE.Scene();
//         setScene(initScene);
        
//         initScene.background = new THREE.Color(0xabcdef);
//         const light = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
//         initScene.add(light);

//         // Camera setup
//         const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
//         camera.position.set(590.9590759277344, 50, 619.5294952392578);
//         cameraRef.current = camera;

//         // Renderer setup
//         const renderer = new THREE.WebGLRenderer({ canvas: mountRef.current });
//         renderer.setSize(window.innerWidth, window.innerHeight);
//         rendererRef.current = renderer;

//         // Orbit controls setup
//         const controls = new OrbitControls(camera, renderer.domElement);
//         controls.target.set(0, 0, 0);
//         controls.update();
//         controlsRef.current = controls;

//         // Animate the scene
//         const animate = () => {
//             if (!controlsRef.current || !rendererRef.current || !scene || !cameraRef.current) {
//                 return;
//             }

//             requestAnimationFrame(animate);
//             controlsRef.current.update();
//             rendererRef.current.render(scene, cameraRef.current);
//         };

//         animate();

//         // Cleanup on unmount
//         return () => {
//             if (controlsRef.current) {
//                 controlsRef.current.dispose();
//             }
//         };
//     }, []);

//     const onFileChange = (event) => {
//         if (event.target.files?.length) {
//             handleFileUpload(event.target.files[0]);
//         }
//     };

//     const handleFileUpload = async (file) => {
//         // Placeholder for file upload logic
//     };

//     const getDoorCoords = (walls, doorCorners) => {
//         // Placeholder for getting closest points logic
//     };

//     const checkForParallelPoints = (closestPoints) => {
//         // Assuming closestPoints is an array of four [x, z] pairs
//         let parallelPairs = [];
//         let slopes = [];
//         for (let i = 0; i < closestPoints.length; i++) {
//             for (let j = i + 1; j < closestPoints.length; j++) {
//                 const pointA = closestPoints[i];
//                 const pointB = closestPoints[j];
//                 // Calculate slope
//                 const slope = (pointB[1] - pointA[1]) / (pointB[0] - pointA[0]);
//                 slopes.push({ i, j, slope });
//             }
//         }

//         // Compare slopes to find parallel lines (with a tolerance for floating point precision)
//         const tolerance = 0.01;
//         slopes.forEach((slopeA, index) => {
//             for (let k = index + 1; k < slopes.length; k++) {
//                 const slopeB = slopes[k];
//                 if (Math.abs(slopeA.slope - slopeB.slope) < tolerance) {
//                     parallelPairs.push([closestPoints[slopeA.i], closestPoints[slopeA.j]]);
//                     parallelPairs.push([closestPoints[slopeB.i], closestPoints[slopeB.j]]);
//                     return;
//                 }
//             }
//         });

//         return parallelPairs.length > 0 ? { parallelPoints: parallelPairs, isParallel: true } : { isParallel: false };
//     };

//     return (
//         <>
//             <canvas ref={mountRef} style={{ width: '100vw', height: '100vh' }}></canvas>
//             <input type="file" onChange={onFileChange} ref={fileInputRef} style={{ display: 'none' }} />
//             <button onClick={() => fileInputRef.current.click()}>Upload Image</button>
//         </>
//     );
// };

// export default ThreeD;
