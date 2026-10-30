import React from 'react'
import {assets} from '../assets/assets'

const Footer = () => {
  return (
    <div className='container px-4 2xl:px-20 mx-auto flex items-center justify-between gap-4 py-3 mt-80'> 
        <img width={160} src={assets.logo} alt="" />
        <p className='flex-1  text-sm text-gray-500 max-sm:hidden'>Copyright @nik.dev | All right reserved</p>
        <div className='flex gap-2.6'>
            <img src={assets.facebook_icon} alt="" />
            <img src={assets.twitter_icon} alt="" />
            <img src={assets.instagram_icon} alt="" />
        </div>
    </div>
  )
}

export default Footer