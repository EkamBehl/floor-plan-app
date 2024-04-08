import React from 'react'
import MaxWidthWrapper from './MaxWidthWrapper'
import Link from 'next/link'
import { buttonVariants } from './ui/button'
import { ArrowRight, Ghost } from 'lucide-react'
import { LoginLink, RegisterLink } from '@kinde-oss/kinde-auth-nextjs/server'
const Navbar = () => {
  return (
    <nav className='sticky h-14 inset-x-0 top-0 z-30 w-full border-b border-gray-200 bg-white/75 backdrop-blur-lg transition-all'>
        <MaxWidthWrapper>
            <div className='flex h-14 items-center justify-between border-b border-zinc-200'>
                <Link href='/' className='flex z-40 font-semibold'>
                    <span>DepthCraft.</span>
                </Link>

                <div className='hidden items-center space-x-4 sm:flex'>
                    <>
                        <Link className={buttonVariants({
                            variant:'ghost',
                            size:'sm',
                        })}href='/pricing'>Pricing</Link>
                        <LoginLink className={buttonVariants({
                            variant:'ghost',
                            size:'sm',})}>Sign In</LoginLink>
                        <RegisterLink className={buttonVariants({
                            
                            size:'sm',})}>Get Started <ArrowRight className='ml-1.5'/></RegisterLink>
                    </>

                </div>
            </div>
        </MaxWidthWrapper>
    </nav>
  )
}

export default Navbar
