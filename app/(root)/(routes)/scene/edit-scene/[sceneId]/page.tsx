// // File Path: app/(root)/(routes)/scene/edit-scene/[sceneId]/page.tsx

// import prisma from '@/lib/db';
// import React from 'react';
// import * as THREE from 'three';
// import ThreeJsScene from '../components/ThreeJsScene';

// interface SceneIdPageProps{
//     params:{
//         sceneId:string;
//     }
// }
// const sceneIdPage = async ({
//     params
// }:SceneIdPageProps) => {
//     var scene=new THREE.Scene();
//     const sceneObject=await prisma.scene.findUnique({
//         where:{
//             id:params.sceneId,
//         }
//     });
//     if (sceneObject) {
//         const json = JSON.parse(sceneObject.sceneString);
//         const loader = new THREE.ObjectLoader();
//         scene. = loader.parse(json);
//     }
    

//   return (
//     <ThreeJsScene data={scene}/>
      
    
//   )
// }

// export default sceneIdPage



// app/(root)/(routes)/scene/edit-scene/[sceneId]/page.tsx
// File: app/(root)/(routes)/scene/edit-scene/[sceneId].tsx

import * as THREE from 'three';
import ThreeJsScene from '../components/ThreeJsScene'; // Adjust the path as necessary
import prisma from '@/lib/db'; // Make sure this is the correct import path for your prisma client


interface SceneProps {
    params:{
        sceneId: string;
    }
}

var i=0
const SceneIdPage=async({ params }:SceneProps) => {

    console.log(i)
    i=i+1

    console.log("SceneID",params.sceneId)
   
        const sceneData = await prisma.scene.findUnique({
            where: {
                id: params.sceneId,
            },
        });
        
        
    if(sceneData){
        return (
            <ThreeJsScene data={sceneData.sceneString}/>
        );
    }else{
        return(
            <div>
                Scene is empty
            </div>
        )
    }
    
};
export default SceneIdPage






































// interface LoaderParams {
//     params: {
//         sceneId: string;
//     };
// }

// interface LoaderData {
//     scene: string; // JSON string representation of the THREE.Scene
// }

// export async function loader({ params }: LoaderParams) {
//     const { sceneId } = params;
//     const sceneData = await prisma.scene.findUnique({
//         where: {
//             id: sceneId,
//         },
//     });

//     if (!sceneData || !sceneData.sceneString) {
//         throw new Response("Not Found", { status: 404 });
//     }

//     // Ensure the object parsed is indeed a Scene
//     const json = JSON.parse(sceneData.sceneString);
//     const loader = new THREE.ObjectLoader();
//     const object = loader.parse(json);
    
//     if (!(object instanceof THREE.Scene)) {
//         throw new Error("Loaded object is not a Scene");
//     }

//     // Serialize the scene to avoid issues with passing complex objects
//     return { scene: JSON.stringify(object.toJSON()) };
// }

// interface SceneIdPageProps {
//     data: LoaderData;
// }

// export default function SceneIdPage({ data }: SceneIdPageProps) {
//     let scene = new THREE.Scene();
//     if(data){
//     const loader = new THREE.ObjectLoader();
//     const parsedObject = loader.parse(JSON.parse(data.scene));
//     if (parsedObject instanceof THREE.Scene) {
//         scene = parsedObject;
//     } else {
//         console.error("Parsed data is not a THREE.Scene");
//     }
// }

//     return (
//         <div>
//             <ThreeJsScene data={scene} />
//         </div>
//     );
// }