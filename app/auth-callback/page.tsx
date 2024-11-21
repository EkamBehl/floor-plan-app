"use client"
import { useRouter, useSearchParams } from 'next/navigation'
import React from 'react'
import {Suspense} from 'react'

const page = () => {
    const router=useRouter()
    const searchParams=useSearchParams()
    const origin=searchParams.get('origin')
    

    return (
        <Suspense>
            <div>
                
            </div>
        </Suspense>
    )
}

export default page
