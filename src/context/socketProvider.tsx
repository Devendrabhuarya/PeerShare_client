'use client';
import React, { useContext, useState, useMemo, useEffect, useRef } from 'react';
import { io, Socket } from "socket.io-client";

const SocketContext = React.createContext<Socket | null>(null);

export const useSocket = () => {
    const socket = useContext(SocketContext);
    return socket;
};
export const SocketProvider = (props: any) => {
    // use useMemo to create the socket only once
    const socket = useMemo<Socket>(() => io("https://peershare-server.onrender.com"), []);
    // use useEffect to connect and disconnect the socket
    useEffect(() => {
        socket.connect();
        return () => {
            socket.disconnect();
        };
    }, [socket]);
    return (
        <SocketContext.Provider value={socket}>
            {props.children}
        </SocketContext.Provider>
    )
}