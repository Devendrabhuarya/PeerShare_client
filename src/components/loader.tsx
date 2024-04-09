'use client';

import { LoaderContext } from "@/context/loaderProvider";
import { useContext } from "react";

export default function LoaderPage() {
    const { loader } = useContext(LoaderContext);
    return (
        loader &&
        <>
            <div className='fixed w-screen h-screen bg-black opacity-70 z-[9999] flex justify-center items-center'>
                <div className='h-10 w-10  border bottom-8 border-solid animate-spin rounded-full border-t-transparent'></div>
            </div>
        </>

    );
}