"use client"
import { useRouter, useSearchParams } from 'next/navigation'
import React from 'react'
import {Suspense} from 'react'

const Temp=() =>{
    const searchParams=useSearchParams()
    const origin=searchParams.get('origin')
    return (
        <div>
        </div>
    )
}

const page = () => {
    const router=useRouter()
    

    return (
        <Suspense>
           <Temp/>
        </Suspense>
    )
}

export default page
