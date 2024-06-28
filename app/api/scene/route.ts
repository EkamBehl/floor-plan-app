import sceneBuilder from "@/components/sceneBuilder";
import prisma from "@/lib/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextResponse } from "next/server"

export async function POST(req:Request){
    try{
        const body=await req.json();
        const{getUser}= getKindeServerSession()
        const user=await getUser()
        const {name,imageString,sceneString}=body;
        console.log(user)
        if(!user){
            return new NextResponse("Unauthorised",{status:401})
        }
        if(!name || !imageString || !sceneString){
            return new NextResponse("Missing required fields",{status:400})
        }
        
        
        
        await prisma.scene.create({
            data:{
                name:name,
                imageString:imageString,
                userId:user.id,
                sceneString:sceneString
            }
        })
        
        return new NextResponse('Succesfull',{status:200})

    }
    
    catch(error){
        console.log('[SCENE_POST]',error)
        return new NextResponse('Internal Error',{status:500})
    }
}