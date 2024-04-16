import prisma from '@/lib/db';
import React from 'react'
import { SceneForm } from './components/scene-form';
interface SceneIdPageProps{
    params:{
        sceneId:string;
    }
}
const sceneIdPage = async ({
    params
}:SceneIdPageProps) => {
    const scene=await prisma.scene.findUnique({
        where:{
            id:params.sceneId,
        }
    });
    

  return (
    <SceneForm initialData={scene}>
      
    </SceneForm>
  )
}

export default sceneIdPage
