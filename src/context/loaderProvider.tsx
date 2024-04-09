'use client';
import React, { createContext, useState } from "react";

export const LoaderContext = createContext<any>(null);

export const LoaderProvider = (props: any) => {
    const [loader, setLoader] = useState<Boolean>(false)
    return (
        <LoaderContext.Provider value={{ loader, setLoader }}>
            {props.children}
        </LoaderContext.Provider>
    )
}


