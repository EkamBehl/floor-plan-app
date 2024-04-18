import { Scene } from '@prisma/client'
import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card'
import Image from 'next/image'
import { Button } from './ui/button'

interface sceneCardProps{
    scene: Scene
}
const SceneCard = ({scene}:sceneCardProps) => {
   
    
    return (
    <Card className='w-50% mt-5  bg-gray-200 w-2/4 flex flex-col justify-center self-center align-middle rounded-md shadow-md '>
        <CardHeader>
            <CardTitle>
            {scene.name}
            </CardTitle>
        </CardHeader>
        <CardContent>
            <Image alt="scene image" src={scene.imageString} width={200} height={200}/>
            <div>
                <p>
                    Created at: {String(scene.createdAt)}
                </p>
                <p>
                    Last updated: {String(scene.updatedAt)}
                </p>
            </div>
        </CardContent>
        <CardFooter>
            <Button>Edit</Button>
        </CardFooter>
        
        
    </Card>
  )
}

export default SceneCard
