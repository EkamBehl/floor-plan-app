"use client"

import { useEffect, useState } from "react";
import {CldUploadButton} from 'next-cloudinary'
import Image from "next/image";
import { Button, buttonVariants } from "./ui/button";
import { PlusIcon } from "lucide-react";
interface ImageUploadProps{
    value:string;
    onChange:(src:string)=>void;
    disabled?: boolean;
};
export const ImageUpload=({
    value,
    onChange,
    disabled
}:ImageUploadProps)=>{
    const [isMounted,setIsMounted]=useState(false);

    useEffect(()=>{
        setIsMounted(true);
    },[])
    if(!isMounted){
        return null;
    }
    return(
        <div className="w-full flex">
            <CldUploadButton  
            onSuccess={(result:any)=> onChange(result.info.secure_url)}
            options={{
                maxFiles:1
            }}
            uploadPreset='mdlsjkql'
            >
            <div className='relative h-40 w-40'>
                <Image
                fill 
                alt="upload"
                src={value || 'placeholder.svg'}
                className='rounded-lg object-cover'
                />
            </div>
            </CldUploadButton>
            

        </div>
    )
}
