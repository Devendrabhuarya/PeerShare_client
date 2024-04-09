'use client';
import logo from '@/images/logo.png';
import LogoutIcon from '@mui/icons-material/Logout';
import JoinConnectionModel from '@/components/joinConnectionModel';
import CreateConnectionModel from '@/components/createConnectionModel';
import { useEffect, useState } from 'react';
import NavBar from '@/components/navbar';

export default function HomePage() {
    const [showJoinModel, setShowJoinModel] = useState<boolean>(false);
    const [showCreateModel, setShowCreateModel] = useState<boolean>(false);
    const roomButton = 'px-7 py-3 font-secondary text-xl rounded-xl bg-third  hover:bg-slate-700 md:text-sm md:px-3';

    return (
        <div className='h-screen bg-primary text-secendary relative'>
            <NavBar />
            <div className="hall flex justify-between mx-20 mt-5 md:mx-6">
                <button className={roomButton} onClick={() => {
                    setShowJoinModel(true);
                }}>join connection</button>
                <button className={roomButton} onClick={() => {
                    setShowCreateModel(true);
                }}>create connection</button>
            </div>

            <div className="aboutme mx-20 py-20 pt-6 bg-third mt-28 px-80 text-xl font-secondary text-center md:mx-6 md:px-5 lg:px-10">
                <p className='pt-5 md:pt-2'> <span className='font-bold'>Welcome User_Name</span></p>
                <p className='mt-10 md:text-sm'>
                    Hello, my name is <span className='font-bold'>Devendra kumar bhuarya</span>, and I am a web developer .
                    I have a passion for building user-friendly, responsive, and modern
                    websites that meet the needs and expectations of my clients.
                </p>
            </div>
            {showJoinModel && <CreateConnectionModel setShowModel={() => {
                setShowJoinModel(false);
            }} />}
            {showCreateModel && <CreateConnectionModel setShowModel={() => {
                setShowCreateModel(false);
            }} />}
        </div>
    )
}