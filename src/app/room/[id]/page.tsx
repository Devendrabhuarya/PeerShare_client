'use client';

import logo from '@/images/logo.png';
import LogoutIcon from '@mui/icons-material/Logout';
import VideocamIcon from '@mui/icons-material/Videocam';
import CallIcon from '@mui/icons-material/Call';
import { useState, useEffect, useCallback, useContext } from 'react';
import { useSocket } from '@/context/socketProvider';
import { ACTION } from '@/helper/action';
import peer from '@/helper/peer';
import ReactPlayer from "react-player";
import SendIcon from '@mui/icons-material/Send';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import toast from 'react-hot-toast';
import { usePathname, useRouter } from 'next/navigation';
import NavBar from '@/components/navbar';
import { LoaderContext } from '@/context/loaderProvider';



export default function RoomPage({ params }: any) {
    const { setLoader } = useContext(LoaderContext);
    const router = useRouter();
    const socket = useSocket();
    const [remoteSocketId, setremoteSocketId] = useState<String | null>(null);
    const [myStream, setmyStream] = useState<MediaStream | undefined>();
    const [remoteStream, setremoteStream] = useState<MediaStream | undefined>();
    const [remoteUserMuteOrNot, setRemoteUserMuteOrNot] = useState(false);
    const [sendStreamsButton, setsendStreamsButton] = useState(true);
    const [call, setCall] = useState(false);


    const removeStream = () => {
        if (myStream) {
            myStream.getTracks().forEach(track => track.stop());
        }
    };


    const handleUserJoin = useCallback(async ({ email, id }: any) => {
        console.log(`${email} has join the room her id is ${id}`);
        setremoteSocketId(id);
    }, []);

    const handleCallUser = useCallback(async () => {
        console.log('Handle Call User', remoteSocketId);
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true
        });
        setmyStream(stream);
        setCall(true);
        const offer = await peer.getOffer();
        socket?.emit(ACTION.USER_CALL, { to: remoteSocketId, offer });
    }, [socket, myStream, remoteSocketId, call]);

    const handleIncomingCall = useCallback(async ({ from, offer }: any) => {
        console.log(`offer from ${from} , ${offer}`);
        setremoteSocketId(from);
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true
        });
        setmyStream(stream);
        const ans = await peer.getAns(offer);
        socket?.emit(ACTION.CALL_ACCEPTED, { to: from, ans });
        setCall(true);
    }, [myStream, remoteSocketId]);

    const handleCallAccepted = useCallback(async ({ from, ans }: any) => {
        console.log(`Call Accepted from  ${from} , ${ans}`);
        await peer.setRemoteDescription(ans);
    }, [socket]);

    const handleNegoNeeded = useCallback(async () => {
        const offer = await peer.getOffer();
        socket?.emit("peer:nego:needed", { offer, to: remoteSocketId });
    }, [remoteSocketId, socket]);

    useEffect(() => {
        peer?.peer?.addEventListener("negotiationneeded", handleNegoNeeded);
        return () => {
            peer?.peer?.removeEventListener("negotiationneeded", handleNegoNeeded);
        };
    }, [handleNegoNeeded]);

    const handleNegoNeedIncomming = useCallback(
        async ({ from, offer }: any) => {
            const ans = await peer.getAns(offer);
            socket?.emit("peer:nego:done", { to: from, ans });
        },
        [socket]
    );

    const handleNegoNeedFinal = useCallback(async ({ ans }: any) => {
        await peer.setRemoteDescription(ans);
    }, []);

    const handleMuteInfo = useCallback(async ({ from, mute }: any) => {
        setRemoteUserMuteOrNot(mute);
    }, [remoteUserMuteOrNot]);

    const hanldleLeave = async ({ email }: any) => {
        removeStream();
        toast.success(`${email} has leave the chat`);
        socket?.off();
        myStream?.getTracks().forEach(track => track.stop())
        if (peer.peer)
            peer.peer.close();
        delete peer.peer;
        router.push('/home');

    }

    useEffect(() => {
        setLoader(false);
        socket?.on(ACTION.USER_JOIN, handleUserJoin);
        socket?.on(ACTION.INCOMING_CALL, handleIncomingCall);
        socket?.on(ACTION.CALL_ACCEPTED, handleCallAccepted);
        socket?.on("peer:nego:needed", handleNegoNeedIncomming);
        socket?.on("peer:nego:final", handleNegoNeedFinal);
        socket?.on(ACTION.HANLE_MUTE_INFO, handleMuteInfo);
        socket?.on(ACTION.LEAVE, hanldleLeave);
        return () => {
            socket?.off(ACTION.USER_JOIN, handleUserJoin);
            socket?.off(ACTION.INCOMING_CALL, handleIncomingCall);
            socket?.off(ACTION.CALL_ACCEPTED, handleCallAccepted);
            socket?.off("peer:nego:needed", handleNegoNeedIncomming);
            socket?.off("peer:nego:final", handleNegoNeedFinal);
            socket?.off(ACTION.HANLE_MUTE_INFO, handleMuteInfo);
            socket?.off(ACTION.LEAVE, hanldleLeave);
        };
    }, [socket, handleIncomingCall, handleUserJoin, handleCallAccepted, handleMuteInfo]);


    const sendStreams = useCallback(() => {
        if (myStream) {
            // Get the list of senders
            let senders = peer.peer.getSenders();
            for (const track of myStream.getTracks()) {

                // Check if the track already has a sender
                let sender = senders.find((s: { track: { id: string; }; }) => s.track?.id === track?.id);
                if (sender) {
                    // Remove the existing sender
                    peer.peer.removeTrack(sender);
                }
                // Add the track to the peer connection
                peer.peer.addTrack(track, myStream);
            }
            setsendStreamsButton(false);
            setCall(true);
        }
    }, [myStream, remoteStream]);



    const muteVideo = useCallback(async () => {
        if (myStream) {
            const videoTracks = await myStream.getVideoTracks();
            if (videoTracks.length > 0) {
                videoTracks[0].enabled = !videoTracks[0].enabled;
            }
            socket?.emit(ACTION.HANLE_MUTE_INFO, { to: remoteSocketId, mute: videoTracks[0].enabled });
        }
    }, [myStream]);

    useEffect(() => {
        peer?.peer?.addEventListener("track", async (ev: any) => {
            const remoteStream = ev.streams;
            console.log("GOT TRACKS!!", remoteStream);
            setremoteStream(remoteStream[0]);
            setRemoteUserMuteOrNot(remoteStream[0].getVideoTracks()[0].enabled);
        });
    }, [remoteStream, myStream, remoteUserMuteOrNot]);
    useEffect(() => {
        peer?.peer?.addEventListener("track", async (ev: any) => {
            const remoteStream = ev.streams;
            setRemoteUserMuteOrNot(remoteStream[0].getVideoTracks()[0].enabled);
        });
    }, [remoteUserMuteOrNot]);


    const handleEndCallUser = () => {
        socket?.emit(ACTION.LEAVE, { to: remoteSocketId, room: params.id });
        socket?.off();
        if (peer.peer)
            peer.peer.close();
        removeStream();
        delete peer.peer;
        router.push('/home');
    }

    const pathname = usePathname()
    useEffect(() => {
        const alertUser = (e: { returnValue: string; }) => {
            socket?.emit(ACTION.LEAVE, { to: remoteSocketId, room: params.id });
        };
        window.addEventListener("beforeunload", alertUser);
        return () => {
            if (myStream) {
                socket?.emit(ACTION.LEAVE, { to: remoteSocketId, room: params.id });
                window.removeEventListener("beforeunload", alertUser);
            }

        }
    }, [pathname, myStream]);
    return (

        <div className='h-screen bg-primary text-secendary relative'>
            <NavBar />

            <div className="room flex relative  pt-10 pb-6 px-20 border-b-2 border-secendary
            h-4/5 gap-6 md:px-2 md:pt-3 md:flex-col">
                <div className="video basis-8/12 relative">
                    <div className="remoteUserVideo h-96 bg-third relative overflow-hidde">
                        <ReactPlayer
                            playing
                            width='100%'
                            height='100%'
                            url={remoteStream}
                        />
                        <img src="https://3.bp.blogspot.com/-9YDmRdOQO5Y/W7ql9HZvhDI/AAAAAAAADJc/4WizmhdNBiArkst_o_3ArR2RmSyaYCCoACLcBGAs/s1600/-social%2Bmedia%2Bprofile%2Bpicture-3.jpg" alt=""
                            className={!remoteUserMuteOrNot ? 'w-full h-full absolute top-0' : 'hidden'} />

                        <div className="UserVideo absolute h-28 w-20  bg-secendary right-0 bottom-0">
                            {/* <ReactPlayer
                                playing
                                muted
                                url={myStream}
                                width='100%'
                                height='100%'
                            /> */}
                        </div>
                    </div>

                    <div className="handler flex text-center items-center justify-center">

                        {remoteSocketId && !call && <button onClick={handleCallUser}> <span className='p-3  m-2 flex justify-center item-center text-center bg-third rounded-full text-green-500'> <CallIcon className='cursor-pointer text-4xl bg-thirdrounded-full' /></span></button>}
                        {remoteSocketId && call && <button onClick={handleEndCallUser}> <span className='p-3  m-2 flex justify-center item-center text-center bg-third rounded-full text-red-500'> <CallIcon className='cursor-pointer text-4xl bg-thirdrounded-full' /></span></button>}
                        {remoteSocketId && sendStreamsButton && <button onClick={sendStreams}> <span className='p-3  m-2 flex justify-center item-center text-center bg-third rounded-full'> <VideocamIcon className='cursor-pointer text-4xl bg-thirdrounded-full' /></span></button>}
                        {remoteSocketId && <button onClick={muteVideo}> <span className='p-3  m-2 flex justify-center item-center text-center bg-third rounded-full'> <VideocamOffIcon className='cursor-pointer text-4xl bg-thirdrounded-full' /></span></button>}
                    </div>
                </div>
                <div className="text flex bg-third h-full w-full bg-red basis-4/12 hidden">
                    <div className="input h-14 flex mt-auto w-full px-1 bg-secendary overflow-hidden "
                    >
                        <input type="text"
                            placeholder='type something'
                            className='bg-secendary text-primary h-full w-full'
                        />
                        <button className=''><SendIcon className='text-primary' /></button>
                    </div>
                </div>
            </div>

        </div>
    )
}