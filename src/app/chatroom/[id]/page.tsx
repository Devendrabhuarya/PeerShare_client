'use client';
import NavBar from "@/components/navbar";
import { useSocket } from "@/context/socketProvider";
import SendIcon from '@mui/icons-material/Send';
import React, { useCallback, useEffect, useState, useRef, useContext } from "react";
import { ACTION } from '@/helper/action';
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import { useBeforeUnload, useToggle } from "react-use";
import toast from "react-hot-toast";
import { LoaderContext } from '@/context/loaderProvider';

export default function ({ params }: any) {
    const { setLoader } = useContext(LoaderContext);
    const socket = useSocket();
    const router = useRouter();
    const [allMessages, setAllMessages] = useState([{
        type: 'center',
        message: 'New Chat'
    }])
    const [remoteSocketId, setremoteSocketId] = useState<String | null>(null);
    const [message, setMessage] = useState<string>('');
    const [connectionTrueOrFalse, setConnectionTrueOrFalse] = useState(false);
    const divRef = useRef<HTMLDivElement | null>(null);
    const [call, setCall] = useState(false);

    const handleUserJoin = useCallback(async ({ email, id, room }: any) => {
        console.log('new user join the chat', email, id);
        setAllMessages([...allMessages, { type: "center", message: `${email} hash join the chat` }]);
        setremoteSocketId(id);
    }, [remoteSocketId]);

    const handleSendMessage = useCallback(async () => {
        socket?.emit(ACTION.SEND_TEXT_MESSAGE, { message, to: remoteSocketId });
        setMessage('');
    }, [message])

    const handleRecieveMessage = useCallback(async ({ message, from, me }: any) => {

        if (me) {
            setAllMessages([...allMessages, { type: "right", message: message }]);
        } else {
            setAllMessages([...allMessages, { type: "left", message: message }]);
        }
    }, [allMessages]);

    const handleUserId = useCallback(({ id, email }: any) => {
        setremoteSocketId(id);
        setConnectionTrueOrFalse(true);
        setAllMessages([...allMessages, { type: "center", message: `${email} hash join the chat` }]);
    }, [remoteSocketId]);

    const hanldleLeave = useCallback(({ email }: any) => {

        toast(`${email} has leave the Room`, {
            icon: '🤓',
        });
        router.push('/home');
    }, []);

    useEffect(() => {
        socket?.on(ACTION.USER_JOIN, handleUserJoin);
        socket?.on(ACTION.RECIEVE_USER_ID, handleUserId);
        socket?.on(ACTION.RECIEVE_TEXT_MESSAGE, handleRecieveMessage);
        socket?.on(ACTION.LEAVE, hanldleLeave);
        return () => {
            socket?.off(ACTION.USER_JOIN, handleUserJoin);
            socket?.off(ACTION.RECIEVE_USER_ID, handleUserId);
            socket?.off(ACTION.RECIEVE_TEXT_MESSAGE, handleRecieveMessage);
            socket?.off(ACTION.LEAVE, hanldleLeave);
        }
    }, [socket, handleUserJoin, handleRecieveMessage, handleUserId]);;

    const scrollToDiv = () => {
        // Check if the div reference is valid
        if (divRef.current) {
            // Scroll to the div element
            divRef.current.scrollIntoView();
            divRef.current.scrollTop = divRef.current.scrollHeight;
        }
    }

    useEffect(() => {
        scrollToDiv();
    }, [allMessages]);

    const handleConnect = () => {
        socket?.emit(ACTION.SEND_OWN_ID, { to: remoteSocketId });
        setConnectionTrueOrFalse(true)
    }

    const pathname = usePathname()
    useEffect(() => {
        setLoader(false);
        const alertUser = (e: { returnValue: string; }) => {
            socket?.emit(ACTION.LEAVE, { to: remoteSocketId, room: params.id });
        };
        window.addEventListener("beforeunload", alertUser);
        return () => {
            if (remoteSocketId) {
                socket?.emit(ACTION.LEAVE, { to: remoteSocketId, room: params.id });
                window.removeEventListener("beforeunload", alertUser);
            }
        }
    }, [pathname, remoteSocketId]);


    return (
        <div className='h-screen bg-primary text-secendary relative'>
            <NavBar />
            <div className="h-4/5  px-20  md:px-6 mt-5 ">
                {remoteSocketId && !connectionTrueOrFalse &&
                    <button onClick={handleConnect} className="bg-secendary font-primary px-2 py-1 rounded-sm text-primary text-xl">want to connect? click</button>
                }
                <div className="chat-Box  bg-third  h-full flex flex-col ">
                    <div className="messages pt-7 text-primary font-secondary md:text-sm overflow-y-scroll h-full"
                        ref={divRef}
                    >
                        <ul className="flex flex-col">
                            {
                                allMessages?.map(({ type, message }, val) => {
                                    return (
                                        <>
                                            {type === 'center' ?
                                                <li className="w-full text-center font-bold font-sans md:px-3 md:py-2"><span className="text-secendary px-8 py-3 rounded-3xl"><a href="#" >{message}</a></span></li>
                                                :
                                                <li className={type == 'right' ?
                                                    'w-full text-right mt-3 md:px-3 md:py-2'
                                                    :
                                                    'w-full text-left mt-3 md:px-3 md:py-2'
                                                }><span className="bg-secendary px-8 py-3 rounded-3xl"><a href="#" >{message}</a></span></li>}

                                        </>
                                    )
                                })
                            }
                        </ul>
                    </div>
                    <div className="input mt-auto flex bg-secendary w-full ">
                        <input type="text" className="bg-secendary w-full py-2 text-primary" placeholder="type something ..."
                            value={message}
                            onChange={(e) => {
                                setMessage(e.target.value);
                            }}
                        />
                        {
                            remoteSocketId && connectionTrueOrFalse && <button onClick={handleSendMessage}><SendIcon className="text-primary my-auto text-4xl" /></button>
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}