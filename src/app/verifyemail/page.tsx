'use client';
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";


export default function VerifyEmailPage() {
    const router = useRouter();
    const handleVerify = async () => {
        const urlToken = await window.location.search.split('=')[1];
        try {
            if (urlToken.length > 0) {
                const response = await axios.post('/api/users/verifyemail', { token: urlToken });
                console.log(response);
                router.push('/login');
            }
            else
                toast.error('Verify failed')
        } catch (error: any) {
            toast.error(error.response.data.error);
            console.log(error);
        }
    }
    return (
        <>
            <h1 onClick={handleVerify} className="text-3xl px-10 cursor-pointer bg-primary flex justify-center text-secendary hover:bg-third">Click to Verify Your Email</h1>
        </>
    )
}