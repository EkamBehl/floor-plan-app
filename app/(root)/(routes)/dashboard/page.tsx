import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { redirect } from 'next/navigation'
import React from 'react'
import prisma from '@/lib/db';
import { Button, buttonVariants } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import Link from 'next/link';
import SceneCard from '@/components/SceneCard';
import { cn } from '@/lib/utils';


async function getData({
  email,id,firstName, lastName
}:{
  email:string;
  id:string;
  firstName:string;
  lastName:string;
}){
  const user =await prisma.user.findUnique({
    where: {
      id:id
    },
  });
  if(!user){
    const name=`${firstName ?? ''} ${lastName ?? ''}`
    await prisma.user.create({
      data:{
        id:id,
        email:email,
        name:name
          
      }
    });
  }
}

const Page = async() => {
    const{getUser}= getKindeServerSession()
    const user=await getUser()
    
    //check if user is authenticated or not
    if(!user || !user.id) redirect('/')

    // Create a user if not already present in the database.
    await getData({email:user.email as string,id:user.id as string,firstName:user.given_name as string, lastName:user.family_name as string})


    const scenes=await prisma.scene.findMany({
      where:{
        userId:user.id
      }
    })
  
    return (
    <div className='flex items-center flex-col justify-center self-center'>
      {/* <ThreeD/> */}
      <h2 className=' items-center  text-lg p-4 flex justify-center'>Hello, {user.given_name}</h2>
      <Link className={cn(buttonVariants({ size: 'sm' }), 'w-fit flex items-center justify-center mb-4')} href='/scene/new'>
        Create a Scene <PlusIcon className='ml-1' />
      </Link>
      {
        scenes.map((scene)=>(
          <SceneCard scene={scene}/>
        ))
      }
    </div>
  )
}

export default Page
