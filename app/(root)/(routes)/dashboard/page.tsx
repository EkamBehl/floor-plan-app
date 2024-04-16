import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { redirect } from 'next/navigation'
import React from 'react'
import ThreeD from '../Three/page'
import prisma from '@/lib/db';
import { Button, buttonVariants } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import Link from 'next/link';

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
    console.log(user?.email);

    //check if user is authenticated or not
    if(!user || !user.id) redirect('/')

    // Create a user if not already present in the database.
    await getData({email:user.email as string,id:user.id as string,firstName:user.given_name as string, lastName:user.family_name as string})



  
    return (
    <div className='justify-center'>
      {/* <ThreeD/> */}
      <h2 className=' text-lg p-4 '>Hello, {user.given_name}</h2>
      <Link className={buttonVariants({size:'sm',}) } href='/scene/new'>Create a Scene <PlusIcon/></Link>
      
    </div>
  )
}

export default Page
