import sceneBuilder from "@/components/sceneBuilder";
import prisma from "@/lib/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextResponse } from "next/server"

export async function POST(req:Request){
    try{
        const body=await req.json();
        const{getUser}= getKindeServerSession()
        const user=await getUser()
        const {name,imageString}=body;
        console.log(user)
        if(!user){
            return new NextResponse("Unauthorised",{status:401})
        }
        if(!name || !imageString){
            return new NextResponse("Missing required fields",{status:400})
        }
        
        const formData = new FormData();
        formData.append('image', imageString);

        

        const response = await fetch('http://127.0.0.1:8000/detect/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({imageString})  // Send the image URL as part of the request body
        });
        const data=await response.json()
        // console.log("Responses.........................................................",data)
        
          
        const scene =await sceneBuilder({data})
        
        await prisma.scene.create({
            data:{
                name:name,
                imageString:imageString,
                userId:user.id,
                sceneString:scene
            }
        })
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return new NextResponse('Succesfull',{status:200})

    }
    
    catch(error){
        console.log('[SCENE_POST]',error)
        return new NextResponse('Internal Error',{status:500})
    }
}