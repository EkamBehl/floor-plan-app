import { Scene } from '@prisma/client'
import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card'
import Image from 'next/image'
import { Button, buttonVariants } from './ui/button'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { PlusIcon } from 'lucide-react'

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
        <Link className={cn(buttonVariants({size:'sm',}) ,' w-fit flex justify-center items-center')}  href={`/scene/edit-scene/${scene.id}`}>Edit Scene</Link>
        </CardFooter>
        
        
    </Card>
  )
}

export default SceneCard
