'use client'

import logo from '@/images/logo.png';
import LogoutIcon from '@mui/icons-material/Logout';
import axios from 'axios';
import toast from 'react-hot-toast';
import { LoaderContext } from "@/context/loaderProvider";
import { useContext } from "react";
import { useRouter } from 'next/navigation';
import { UserDataContext } from '@/context/userDataProvider';

export default function NavBar() {
    const router = useRouter();
    const { setLoader } = useContext(LoaderContext);
    const { user, setUser } = useContext(UserDataContext);
    const UserName = localStorage.getItem('username');
    const onHandleLogout = async () => {
        try {
            setUser(null);
            const response = await axios.post('/api/users/logout');
    
            localStorage.removeItem('user');
            toast.success(response.data.message);
            router.push('/login');
        } catch (error: any) {
            setLoader(false);
            toast.error(error.response.data.error);
        }
    }


    return (
        <div className="navbar flex justify-between pt-10 pb-6 px-20 border-b-2 border-secendary md:px-6">
            <div className="logo">
                <img src={logo.src} alt="" className='w-56 md:w-20' />
            </div>
            <div className="profile flex justify-center items-center text-center">
                <span className="username text-2xl font-bold font-secondary mr-3 md:text-sm">Welcome {UserName || user?.username || user?.name}</span>
                <div onClick={onHandleLogout}>
                    <LogoutIcon className='cursor-pointer text-4xl md:text-2xl' />
                </div>
            </div>
        </div>
    );
}