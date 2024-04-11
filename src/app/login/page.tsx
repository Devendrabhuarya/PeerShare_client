'use client';

import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import illutration from '@/images/loginpage.png';
import Link from 'next/link';
import GoogleIcon from '@mui/icons-material/Google';
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { LoaderContext } from "@/context/loaderProvider";
import { useContext } from "react";
import { UserDataContext } from '@/context/userDataProvider';
import { GoogleLogin } from '@react-oauth/google';
import { googleLogout, useGoogleLogin } from '@react-oauth/google';

export default function LoginPage() {
    const router = useRouter();
    const googleButton = useRef();
    const { Loader, setLoader } = useContext(LoaderContext);
    const { setUser, user } = useContext(UserDataContext);
    const [googleUser, setGoogleUser] = useState<string | null>(null);
    const [inputData, setInputData] = useState({
        email: '',
        password: '',
    });
    const inputField = [
        {
            lable: 'E-mail address',
            id: 'email',
            placeholder: 'Enter your email'
        },
        {
            lable: 'Password',
            id: 'password',
            placeholder: 'Enter your password'
        }
    ];

    const handleOnChange = (e: any) => {
        setInputData({ ...inputData, [e.target.name]: e.target.value });
    }

    const handleOnSubmit = async () => {
        if (inputData.email === '' || inputData.password === '') {
            toast('Please fill the all field!', {
                icon: '🤓',
            });
            return false;
        }


        try {
            // check real email or not
            setLoader(true);
            const response = await axios.post('/api/users/login', inputData);
            toast.success(response.data.message)
            router.push('/home');
            setUser(response.data.user);
            localStorage.setItem('username', response.data.user.username);
            setLoader(false);
            setInputData({
                email: '',
                password: '',
            });
        } catch (error: any) {
            setLoader(false);
            toast.error(error.response.data.error);
            setInputData({
                email: '',
                password: '',
            });
        }
    }

    const onLogin = useGoogleLogin({
        onSuccess: (codeResponse) => setGoogleUser(codeResponse.access_token),
        onError: (error) => console.log('Login Failed:', error)
    });

    useEffect(() => {
        if (googleUser) {
            axios
                .get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${googleUser}`, {
                    headers: {
                        Authorization: `Bearer ${googleUser}`,
                        Accept: 'application/json'
                    }
                })
                .then(async (res) => {
                    setUser(res.data);
                })
                .catch((err) => console.log(err));
        }
    }, [googleUser]);

    const handleGoogleUser = async () => {
        try {
            localStorage.setItem('username', user.name);
            console.log(user);

            const response = await axios.post('/api/users/createtoken', user);
            router.push('/home')
        } catch (error) {
            console.log(error);
        }
    };
    useEffect(() => {
        if (user) {
            handleGoogleUser();
        }
    }, [user]);


    // const hanldeSendVerificationMail = async () => {
    //     try {
    //         await axios('/api/users/verification-code');
    //     } catch (error) {

    //     }
    // }

    const handleOnClickInputTag = () => {
        toast('Only Google Login Work!', {
            icon: '🤓',
        });
        googleButton.current.style.background = 'black';
        setTimeout(() => {
            googleButton.current.style.background = 'white';
        }, 1000);
    }
    return (
        <div className='flex bg-primary  text-black px-40 pb-9 md:flex-col md:px-0 '>
            <div className="illutration  basis-6/12 border-r-4  border-secendary md:border-b-2 md:border-r-0">
                <img src={illutration.src} alt=""
                    className='h-full m-6 md:m-auto hover:scale-105'
                    style={{ transition: "all 1s ease-in -out" }}
                />
            </div>
            <div className="signupfiled basis-6/12 flex flex-col items-center">
                <h1 className='text-7xl text-center font-tag font-bold mt-20'>Sign in</h1>
                <div className='mt-10'>
                    {inputField.map((val, ind) => (
                        <>
                            <div className="inputs flex flex-col mt-3" key={ind}>
                                <label htmlFor={val.id} className=' font-serif font-light'>{val.lable}</label>
                                <input type="text" id={val.id} placeholder={val.placeholder}
                                    value={val.id === 'email' ? inputData.email : inputData.password}
                                    name={val.id}
                                    title='Only Google Login Work. Google Login Bottom on Bottom'
                                    className='h-16  cursor-not-allowed bg-third  font-serif  border-2 focus:border-secendary  w-96 rounded-md md:w-60'
                                    onChange={handleOnChange}

                                    onClick={handleOnClickInputTag}
                                />
                            </div>
                        </>
                    ))

                    }
                </div>

                <button className='px-20 mt-10 cursor-not-allowed font-bold  py-2 rounded-3xl text-primary bg-secendary'
                    onClick={handleOnSubmit}
                    disabled
                >Log in</button>
                {/* <small className='cursor-pointer text-secendary mt-7'
                    onClick={hanldeSendVerificationMail}>
                    didnt recieve mail verificaion code? click
                </small> */}
                <div className="line w-full h-1 z-0 bg-secendary mt-10 flex justify-center ">
                    <span className='relative z-40 bottom-4  flex justify-center items-center m-auto  px-5 py-1 rounded-full bg-primary font-primary '>or</span>
                </div>
                <div className="sign-in-other-option mt-8 " ref={googleButton}>
                    <GoogleIcon
                        className='text-4xl cursor-pointer'
                        onClick={onLogin}
                    />
                </div>

                <Link href={'/signup'}>
                    <button disabled
                        className='px-3 text-2xl font-bold cursor-not-allowed  capitalize mt-8 py-2 rounded-md text-primary bg-secendary font-secondary sm:text-lg'>
                        Not have an account ? create
                        <ArrowForwardIcon className='ml-2 font-bold' />
                    </button>
                </Link>
            </div>
        </div>
    )
}
