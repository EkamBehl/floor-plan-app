"use client"
import * as z from 'zod'
import { Scene } from "@prisma/client"
import { useForm } from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ImageUpload } from '@/components/image-upload';
import { Input } from '@/components/ui/input';
import { Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import axios from 'axios'

import { useRouter } from 'next/navigation';
import sceneBuilder from '@/components/sceneBuilder';
interface SceneFormProps{
    initialData: Scene | null;
}

const formSchema=z.object({
    
    name: z.string().min(1,{
        message:"Name is required."
    }),
    imageString:z.string().min(1,{
        message:'source is required'
    })
    
})
export const SceneForm=({
    initialData
}:SceneFormProps)=>{
    const router=useRouter()
    const form=useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name:initialData?.name || '',
            imageString:initialData?.imageString|| '',
         
        }
    })
    const isLoading=form.formState.isSubmitting;
    const onSubmit=async(values:z.infer<typeof formSchema>)=>{
        try{
            if(initialData){
                await axios.patch(`/api/scene/${initialData.id}`,values)
            }
            else{
                const img=values.imageString;
                const response = await fetch('http://127.0.0.1:8000/detect/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({imageString:img})  // Send the image URL as part of the request body
                });
                const data=await response.json()
                const scene=await sceneBuilder({data})
                const dataForDatabase={
                    name:values.name,
                    imageString:values.imageString,
                    sceneString:scene
                }
                await axios.post('/api/scene',dataForDatabase)
            }
            router.refresh()
            router.push("/dashboard")
            router.refresh()
        }
        catch(error){
            console.log("Something went wrong",error)
        }
        console.log(values)
    }
    return(
        <div className=' space-y-4 w-full flex flex-col justify-center items-center'>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8 pb-10'>
                
                        <FormField
                        name="name"
                        control={form.control}
                        render={({field})=>(
                            <FormItem className='col-span-2 md:col-span-1'>
                                <FormLabel>
                                    Name
                                </FormLabel>
                                <FormControl>
                                <Input
                                disabled={isLoading}
                                placeholder='scene name'
                                {...field}/>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                        
                        />

   
                    <div className='grid grid-col-1 md:grid-cols-2 gap-4'>
                    <FormField
                    name="imageString"
                    render={({field})=>(
                        <FormItem className='grid grid-col-1 md:grid-cols-2'>
                            <FormLabel >
                                Image
                            </FormLabel>
                            <FormControl>
                                <ImageUpload 
                                disabled={isLoading}
                                onChange={field.onChange}
                                value={field.value}/>
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                    />
                    </div>
                    <div className='w-full flex justify-center'>
                        <Button size="lg" disabled={isLoading}>
                            {
                                initialData? "Edit your scene" :"Create your scene "
                            }
                            <Wand2 className='ml-2 size-4'/>
                        </Button>
                    </div>
                    
                </form>
            </Form>

        </div>
       
            

    )
}