'use client'

import { useSocket } from '@/context/socketProvider';
import MicOffIcon from '@mui/icons-material/MicOff';
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from 'next/navigation';
import Peer from '@/helper/voicePeer';
import ReactPlayer from "react-player";
import MicNoneIcon from '@mui/icons-material/MicNone';
import { useRouter } from 'next/navigation';
import ACTION from '@/helper/voiceAction';
import toast from 'react-hot-toast';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { LoaderContext } from '@/context/loaderProvider';
interface Client {
    negotiation: any;
    id: string;
    mute: boolean;
    email: string;
}

export default function VoiceRoom({ params }: any) {

    const socket = useSocket();
    const pathName = usePathname();
    const connections = useRef<{ [from: string]: Peer }>({});
    const localMediaStream = useRef<MediaStream | null>(null);
    const [count, setCount] = useState<number>(0);
    const [clients, setClients] = useState<Client[]>([]);
    const audioElements = useRef<{ [from: string]: MediaStream }>({});
    const [MicMuteOrNot, setMicMuteOrNot] = useState<boolean>(true);
    const clientsRef = useRef<Client[]>([]);
    const router = useRouter();
    const { setLoader } = useContext(LoaderContext);


    useEffect(() => {
        clientsRef.current = clients;
    }, [clients]);



    async function startCaptureMedia() {
        localMediaStream.current = await navigator.mediaDevices.getUserMedia(
            { audio: true }
        );
    }

    useEffect(() => {
        async function InitChat() {
            const roomId = pathName.split('/')[2];
            await startCaptureMedia();
            socket?.emit(ACTION.VOICE_SEND_OWN_ID, { room: roomId });
        }
        InitChat();
    }, []);

    const sendStreams = useCallback(async ({ from }: any) => {
        if (localMediaStream.current) {
            // Get the list of senders
            let senders = connections.current[from].peer.getSenders();
            for (const track of localMediaStream.current.getTracks()) {
                // Check if the track already has a sender
                let sender = senders.find((s: { track: { id: string; }; }) => s.track?.id === track?.id);
                if (sender) {
                    // Remove the existing sender
                    connections.current[from].peer.removeTrack(sender);
                }
                // Add the track to the peer connection
                connections.current[from].peer.addTrack(track, localMediaStream.current);
            }
        }
    }, [localMediaStream.current, connections.current]);

    const removeStream = useCallback(async ({ from }: any) => {
        if (localMediaStream.current && connections.current[from]) {
            let senders = await connections.current[from].peer.getSenders();
            for (const track of localMediaStream.current.getTracks()) {
                let sender = senders.find((s: { track: { id: string; }; }) => s.track?.id === track?.id);
                if (sender) {
                    connections.current[from].peer.removeTrack(sender);
                }
            }
        }
    }, [localMediaStream.current, connections.current]);

    const handleUserJoin = useCallback(async ({ from, email, room }: any) => {
        if (from in connections.current) {
            sendStreams({ from })
            return console.warn(
                `You are already connected with ${from} (${email})`
            );
        }
        connections.current[from] = new Peer();
        connections.current[from].peer.onicecandidate = (event: any) => {
            if (event.candidate !== null) {
                socket?.emit(ACTION.VOICE_RELAY_ICE, { to: from, candidate: event.candidate });
            }
        };
        setClients(prev => [...prev, { email: email, id: from, mute: false, negotiation: true }]);
        const offer = await connections.current[from].getOffer();
        sendStreams({ from });
        socket?.emit(ACTION.VOICE_USER_CALL, { to: from, offer, mute: !MicMuteOrNot });
    }, [MicMuteOrNot, sendStreams, setClients, setCount, connections.current]);

    const handleIncomingCall = useCallback(async ({ from, offer, email, mute }: any) => {
        if (!(from in connections.current)) {
            connections.current[from] = new Peer();
            connections.current[from].peer.onicecandidate = (event: any) => {
                if (event.candidate !== null) {
                    socket?.emit(ACTION.VOICE_RELAY_ICE, { to: from, candidate: event.candidate });
                }
            };
            sendStreams({ from });
            const ans = await connections.current[from].getAns(offer);
            socket?.emit(ACTION.VOICE_CALL_ACCEPTED, { to: from, ans });
        } else {
            connections.current[from].peer.onicecandidate = (event: any) => {
                if (event.candidate !== null) {
                    socket?.emit(ACTION.VOICE_RELAY_ICE, { to: from, candidate: event.candidate });
                }
            };
            sendStreams({ from });
            const ans = await connections.current[from].getAns(offer);
            socket?.emit(ACTION.VOICE_CALL_ACCEPTED, { to: from, ans });
        }
        setClients(prev => [...prev, { email: email, id: from, mute, negotiation: false }]);
    }, [connections.current, setClients, sendStreams]);

    const handleCallAccepted = useCallback(async ({ from, ans }: any) => {
        await connections.current[from].setRemoteDescription(ans);
    }, [connections]);

    const handleNegoNeeded = useCallback(async (peerId: string) => {
        const offer = await connections.current[peerId].getOffer();
        socket?.emit("peer:nego:needed", { offer, to: peerId });
    }, [socket, connections.current]);

    useEffect(() => {
        Object.keys(connections.current).forEach((peerId, ind) => {
            connections.current[peerId]?.peer?.addEventListener("negotiationneeded", () => {
                handleNegoNeeded(peerId);
            });
        });
    }, [connections.current, handleNegoNeeded, clients]);

    const handleNegoNeedIncomming = useCallback(async ({ from, offer }: any) => {
        const ans = await connections.current[from].getAns(offer);
        socket?.emit("peer:nego:done", { to: from, ans });
    }, [socket, connections.current]);

    const handleNegoNeedFinal = useCallback(async ({ from, ans }: any) => {
        if (connections.current[from].peer.signalingState !== 'stable')
            await connections.current[from].setRemoteDescription(ans);
    }, [socket, connections.current]);

    const handleIceCandidate = useCallback(({ from, candidate }: any) => {
        if (!(from in connections.current)) {
            connections.current[from] = new Peer();
            connections.current[from].AddIceCandidate(candidate);
        }
        else {
            connections.current[from].AddIceCandidate(candidate);
        }

    }, [connections.current, socket]);

    const handleRemoteUserMuteInfo = useCallback(async ({ from, status }: any) => {
        const clientIdx = clientsRef.current
            .map((client) => client.id)
            .indexOf(from);
        const allConnectedClients = JSON.parse(
            JSON.stringify(clientsRef.current)
        );
        if (clientIdx > -1) {
            allConnectedClients[clientIdx].mute = !status;
            setClients(allConnectedClients);
        }
    }, [setClients, clientsRef.current]);

    const handleRemovePeer = useCallback(async ({ from, email }: any) => {
        if (connections.current[from]) {
            connections.current[from].peer.close();
        }
        delete audioElements.current[from];
        delete connections.current[from];
        setClients((list) => {
            return list.filter((c) => c.id !== from);
        });
        toast(`${email} has left the room`, {
            icon: '🤓',
        });
    }, [connections.current, audioElements.current]);



    useEffect(() => {
        socket?.on(ACTION.VOICE_USER_JOIN, handleUserJoin);
        socket?.on(ACTION.VOICE_INCOMING_CALL, handleIncomingCall);
        socket?.on(ACTION.VOICE_CALL_ACCEPTED, handleCallAccepted);
        socket?.on(ACTION.VOICE_ICE_CANDIDATE, handleIceCandidate);
        socket?.on("peer:nego:needed", handleNegoNeedIncomming);
        socket?.on("peer:nego:final", handleNegoNeedFinal);
        socket?.on(ACTION.VOICE_MUTE_INFO, handleRemoteUserMuteInfo);
        socket?.on(ACTION.VOICE_REMOVE_PEER, handleRemovePeer);
        return () => {

            socket?.off(ACTION.VOICE_USER_JOIN, handleUserJoin);
            socket?.off(ACTION.VOICE_INCOMING_CALL, handleIncomingCall);
            socket?.off(ACTION.VOICE_CALL_ACCEPTED, handleCallAccepted);
            socket?.off(ACTION.VOICE_ICE_CANDIDATE, handleIceCandidate);
            socket?.off("peer:nego:needed", handleNegoNeedIncomming);
            socket?.off("peer:nego:final", handleNegoNeedFinal);
            socket?.off(ACTION.VOICE_MUTE_INFO, handleRemoteUserMuteInfo);
            socket?.off(ACTION.VOICE_REMOVE_PEER, handleRemovePeer);
        };
    },
        [socket, handleUserJoin, handleIncomingCall, handleCallAccepted,
            handleRemoteUserMuteInfo, handleNegoNeedFinal, handleNegoNeedIncomming,
            handleIceCandidate, handleRemovePeer
        ]
    );

    useEffect(() => {
        Object.keys(connections.current).forEach(peerId => {
            connections.current[peerId]?.peer?.addEventListener("track", async (ev: any) => {
                const remoteStream = ev.streams;
                audioElements.current[peerId] = remoteStream[0];
                setCount(count + 1);
                console.log("GOT TRACKS!!", peerId);
            });
        });
    }, [count, setCount, connections.current, clients, audioElements.current, handleRemovePeer]);

    const muteAudio = async () => {
        const roomId = pathName.split('/')[2];
        if (localMediaStream.current) {
            const audioTracks = localMediaStream.current.getAudioTracks();
            if (audioTracks.length > 0) {
                audioTracks[0].enabled = !audioTracks[0].enabled;
                setMicMuteOrNot(audioTracks[0].enabled);
                socket?.emit(ACTION.VOICE_MUTE_INFO, { room: roomId, status: audioTracks[0].enabled });
            }

        }
    };

    const handleLeaveRoom = async () => {

        socket?.emit(ACTION.VOICE_REMOVE_PEER, { room: params.id });
        socket?.off();
        router.push('/home');
    }





    // handle when user leave the page
    const pathname = usePathname()
    useEffect(() => {
        setLoader(false);
        const alertUser = (e: { returnValue: string; }) => {
            socket?.emit(ACTION.VOICE_REMOVE_PEER, { room: params.id });
        };
        window.addEventListener("beforeunload", alertUser);
        return () => {
            if (localMediaStream.current) {
                socket?.emit(ACTION.VOICE_REMOVE_PEER, { room: params.id });
                window.removeEventListener("beforeunload", alertUser);
            }
        }
    }, [pathname]);


    return (
        <>

            <div className='h-screen bg-primary text-secendary relative'>
                <div className='flex justify-between  px-20  md:px-6 mt-5'>
                    {
                        MicMuteOrNot ?
                            <button onClick={muteAudio}
                                className='bg-third text-black  rounded-full p-3'>
                                <MicNoneIcon className='text-4xl ' />
                            </button>
                            :
                            <button onClick={muteAudio}
                                className='bg-third text-black  rounded-full p-3'>
                                <MicOffIcon className='text-4xl' />
                            </button>
                    }
                    <button className='bg-third text-black  rounded-full p-3'
                        onClick={handleLeaveRoom}
                    ><ExitToAppIcon className='text-4xl ' /></button>
                </div>
                <div className="h-4/5  px-20  md:px-6 mt-5 ">
                    <div className="bg-third  h-full">
                        <div className="chat-Box   flex  justify-center gap-4 flex-wrap font-sans font-semibold">
                            {
                                connections.current && Object.keys(audioElements.current).length > 0 && clients && clients.map((val, ind) => {


                                    return (
                                        <div className="users w-72 h-20 bg-secendary py-3 px-4 mt-7 min-w-60 border-2 border-white"
                                            key={ind}>
                                            <div className="relative inner h-full w-full bg-third text-sebg-secendary  flex items-center justify-between">
                                                {
                                                    val.mute ?
                                                        <ReactPlayer
                                                            className='absolute'
                                                            playing
                                                            url={audioElements.current[val.id]}
                                                            width='100%'
                                                            height='100%'
                                                        />
                                                        :
                                                        <ReactPlayer
                                                            className='absolute'
                                                            playing
                                                            url={audioElements.current[val.id]}
                                                            width='100%'
                                                            height='100%'
                                                        />
                                                }

                                                <span>{val.email}</span>
                                                {
                                                    val.mute ?
                                                        <span><MicOffIcon /></span>
                                                        :
                                                        <span><MicNoneIcon /></span>
                                                }

                                            </div>
                                        </div>
                                    );
                                })
                            }
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};



// useEffect(() => {
//     const alertUser = (e: any) => {
//         console.log('leave the page')
//         e.returnValue = "Are you sure you want to leave? All your unsaved changes will be lost.";
//     };
//     window.addEventListener("beforeunload", alertUser);
//     return () => {
//         window.removeEventListener("beforeunload", alertUser);
//     };
// }, []);